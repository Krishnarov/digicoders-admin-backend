import Attendance from "../models/attendance.js";
import Batch from "../models/batchs.js";

// ✅ Create attendance for a batch (new date)
export const createAttendance = async (req, res) => {
  try {
    const { batchId, date, records ,absents,presents,total} = req.body;

    // ensure batch exists
    const batch = await Batch.findById(batchId).populate("students");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found",success:false });
    }

    const attendance = new Attendance({
      batchId,
      date,
      records,
      presents,
      absents,
      total,
      attendBy:req.user._id
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance created", attendance,success:true });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Attendance already exists for this date & batch", });
    }
    res.status(500).json({ message: error.message ,success:false});
  }
};

// ✅ Mark attendance (update specific student’s status)
export const markAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { studentId, status } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    // update record
    const record = attendance.records.find(
      (r) => r.student.toString() === studentId
    );
    if (record) {
      record.status = status;
    } else {
      attendance.records.push({ student: studentId, status });
    }

    await attendance.save();
    res.json({ message: "Attendance updated", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get attendance by batch (all dates)
export const getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const attendance = await Attendance.find({ batchId })
      .populate("records.studentId", "studentName fatherName").populate("attendBy","name")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get attendance of single student in a batch
export const getStudentAttendance = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    const records = await Attendance.find({ batch: batchId, "records.student": studentId })
      .select("date records")
      .sort({ date: -1 });

    // filter student only
    const studentRecords = records.map((a) => ({
      date: a.date,
      status: a.records.find(
        (r) => r.student.toString() === studentId
      )?.status,
    }));

    res.json(studentRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
