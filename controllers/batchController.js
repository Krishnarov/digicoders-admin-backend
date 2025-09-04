import Batch from "../models/batchs.js";
import Teacher from "../models/teachers.js";
import Registration from "../models/regsitration.js"; // Student Model

// ➤ Create Batch
export const createBatch = async (req, res) => {
  try {
    const { batchName,  startDate, teacher, branch } = req.body;

    // Validation
    if (!batchName  || !startDate || !teacher || !branch) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (batchName, trainingType, startDate, teacher, branch) are required",
      });
    }

    // (Optional) Check for duplicate batch name in the same branch
    const existingBatch = await Batch.findOne({ batchName, branch });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "A batch with this name already exists in this branch",
      });
    }

    const batch = new Batch({
      batchName,
      startDate,
      teacher,
      branch,
      addBy: req.user._id,
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating batch",
      error: error.message,
    });
  }
};

// ➤ Get All Batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("teacher", "name email")
      .populate("trainingType", "name duration")
      .populate("branch", "name")
      .populate({
        path: "students",
        select:
          "studentName email mobile fatherName technology status dueAmount",
        populate: {
          path: "technology",
          select: "name", // sirf name chahiye to ye
        },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Get Single Batch
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("teacher", "name email")
      .populate(
        "students",
        "studentName email mobile technology fatherName status"
      );
    if (!batch)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });

    res.json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ➤ Get Batch by student Id
export const getBatchByStudentId = async (req, res) => {
  try {
    const batch = await Batch.find({ students: req.params.id }).select(
      "batchName startDate"
    );

    if (!batch || batch.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Update Batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if batch exists
    let batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Update batch
    batch = await Batch.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating batch",
      error: error.message,
    });
  }
};

// ➤ Assign Teacher to Batch
export const assignTeacher = async (req, res) => {
  try {
    const { batchId, teacherId } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher)
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });

    const batch = await Batch.findByIdAndUpdate(
      batchId,
      { teacher: teacherId },
      { new: true }
    ).populate("teacher", "name email");

    res.json({ success: true, message: "Teacher assigned", batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Update Students in Batch (Add/Remove Multiple)
export const updateBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentIds } = req.body;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds array is required",
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if all students exist
    const students = await Registration.find({
      _id: { $in: studentIds },
      status: "accepted", // Only allow accepted students
    });

    if (students.length !== studentIds.length) {
      const foundIds = students.map((s) => s._id.toString());
      const missingIds = studentIds.filter((id) => !foundIds.includes(id));

      return res.status(404).json({
        success: false,
        message: "Some students not found or not accepted",
        missingStudents: missingIds,
      });
    }

    // Replace the students array with the new selection
    batch.students = studentIds;
    await batch.save();

    // Populate the updated batch with student details
    const updatedBatch = await Batch.findById(batchId)
      .populate("teacher", "name email")
      .populate("students", "studentName email mobile technology status");

    res.json({
      success: true,
      message: "Batch students updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating batch students:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error while updating batch students",
    });
  }
};

// ➤ Remove Student from Batch (Single)
export const removeStudentFromBatch = async (req, res) => {
  try {
    const { batchId, studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if student exists in batch
    if (!batch.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student not in this batch",
      });
    }

    // Remove student from batch
    batch.students = batch.students.filter((id) => id.toString() !== studentId);
    await batch.save();

    res.json({
      success: true,
      message: "Student removed from batch",
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ➤ Delete Batch
export const deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Batch deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const updateStatus = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch)
      return res
        .status(404)
        .json({ message: "batch not found", success: false });
    batch.isActive = !batch.isActive;
    await batch.save();
    return res
      .status(200)
      .json({ message: "status change", success: true, batch });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
