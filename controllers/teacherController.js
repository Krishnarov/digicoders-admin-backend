import Teacher from "../models/teachers.js";
import Batch from "../models/batchs.js";

// ➤ Create Teacher
export const createTeacher = async (req, res) => {
  try {
    const {name,phone,expertise} = req.body  
    const teacher = new Teacher({name,phone,expertise,addBy:req.user._id});
    await teacher.save();
    res.status(201).json({ success: true, teacher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ➤ Get All Teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("assignedBatches");
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Get Teacher By Id
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("assignedBatches", "batchName trainingType startDate");
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Assign Batch to Teacher
export const assignBatchToTeacher = async (req, res) => {
  try {
    const { teacherId, batchId } = req.body;

    const teacher = await Teacher.findById(teacherId);
    const batch = await Batch.findById(batchId);

    if (!teacher || !batch) {
      return res.status(404).json({ success: false, message: "Teacher or Batch not found" });
    }

    // Avoid duplicate batch assignment
    if (!teacher.assignedBatches.includes(batchId)) {
      teacher.assignedBatches.push(batchId);
      await teacher.save();
    }

    // Update teacher in batch
    batch.teacher = teacherId;
    await batch.save();

    res.json({ success: true, message: "Batch assigned to teacher", teacher, batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ➤ Delete Teacher
export const deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Teacher deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
