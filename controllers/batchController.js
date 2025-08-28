import Batch from "../models/batchs.js";
import Teacher from "../models/teachers.js";
import Registration from "../models/regsitration.js"; // Student Model

// ➤ Create Batch
export const createBatch = async (req, res) => {
  try {
    const {batchName,trainingType,startDate,teacher,branch}=req.body
    const batch = new Batch({batchName,trainingType,startDate,teacher,addBy:req.user._id,branch});
    await batch.save();
    res.status(201).json({ success: true, batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ➤ Get All Batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("teacher", "name email")
      .populate("trainingType", "name duration")
      .populate("branch", "name")
      .populate("students", "studentName email mobile fatherName technology status").sort({ createdAt: -1 });
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
      .populate("students", "studentName email mobile technology fatherName status");
    if (!batch)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });

    res.json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Update Batch
export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("teacher", "name email")
      .populate("students", "studentName email mobile technology  status");

    if (!batch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.json({ success: true, batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
    const batch= await Batch.findById(req.params.id)
    if(!batch) return res.status(404).json({message:"batch not found",success:false})
      batch.isActive=!batch.isActive
     await batch.save()
     return res.status(200).json({message:"status change",success:true,batch})
  } catch (error) {

    return res.status(500).json({ message: error.message, success: false });
  }
};
