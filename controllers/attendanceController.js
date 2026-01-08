import mongoose from "mongoose";
import Attendance from "../models/attendance.js";
import Batch from "../models/batchs.js";

// ✅ Create attendance for a batch (new date)
// export const createAttendance = async (req, res) => {
//   try {
//     const { batchId, date, records ,absents,presents,total} = req.body;

//     // ensure batch exists
//     const batch = await Batch.findById(batchId).populate("students");
//     if (!batch) {
//       return res.status(404).json({ message: "Batch not found",success:false });
//     }

//     const attendance = new Attendance({
//       batchId,
//       date,
//       records,
//       presents,
//       absents,
//       total,
//       attendBy:req.user._id
//     });

//     await attendance.save();
//     res.status(201).json({ message: "Attendance created", attendance,success:true });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .json({ message: "Attendance already exists for this date & batch", });
//     }
//     res.status(500).json({ message: error.message ,success:false});
//   }
// };
// ✅ Create or Update attendance for a batch on a specific date
// ✅ Create or Update attendance for a batch on a specific date
export const createAttendance = async (req, res) => {
  try {
    const { batchId, date, records, absents, presents, total } = req.body;

    // Validate required fields
    if (!batchId || !date) {
      return res.status(400).json({ 
        success: false,
        message: "Batch ID and date are required" 
      });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ 
        success: false,
        message: "Batch not found" 
      });
    }

    // Parse the date to start and end of day
    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    // Check if attendance already exists for this batch on this date
    const existingAttendance = await Attendance.findOne({
      batchId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    let attendance;

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      existingAttendance.presents = presents;
      existingAttendance.absents = absents;
      existingAttendance.total = total;
      existingAttendance.attendBy = req.user?._id;
      existingAttendance.updatedAt = Date.now();

      attendance = await existingAttendance.save();

      return res.status(200).json({ 
        success: true, 
        message: "Attendance updated successfully", 
        data: attendance 
      });
    } else {
      // Create new attendance
      attendance = new Attendance({
        batchId,
        date,
        records,
        presents,
        absents,
        total,
        attendBy: req.user?._id
      });

      await attendance.save();
      
      return res.status(201).json({ 
        success: true, 
        message: "Attendance created successfully", 
        data: attendance 
      });
    }
  } catch (error) {
    console.error("Error creating/updating attendance:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance already exists for this date & batch"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// ✅ Update existing attendance (for PUT route)
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { records, presents, absents, total } = req.body;

    // Find attendance
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ 
        success: false,
        message: "Attendance not found" 
      });
    }

    // Update records
    if (records) {
      attendance.records = records;
    }

    // Update counts
    if (presents !== undefined) attendance.presents = presents;
    if (absents !== undefined) attendance.absents = absents;
    if (total !== undefined) attendance.total = total;
    
    attendance.updatedAt = Date.now();
    attendance.attendBy = req.user?._id;

    await attendance.save();
    
    res.status(200).json({ 
      success: true,
      message: "Attendance updated successfully", 
      data: attendance 
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ Check if attendance exists for batch on current date

export const checkTodayAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendance = await Attendance.findOne({
      batchId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate({
      path: 'records.studentId',
      select: '_id studentName'
    })
    .populate("attendBy", "name");

    if (attendance) {
      // Format the data properly for frontend
      const formattedData = {
        ...attendance.toObject(),
        records: attendance.records.map(record => ({
          studentId: record.studentId?._id || record.studentId,
          status: record.status
        }))
      };

      return res.status(200).json({
        success: true,
        exists: true,
        data: formattedData,
        message: "Attendance already exists for today"
      });
    }

    res.status(200).json({
      success: true,
      exists: false,
      message: "No attendance found for today"
    });
  } catch (error) {
    console.error("Error checking today's attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ Get attendance by batch (all dates)
// Updated getBatchAttendance controller
export const getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      sortBy = "date", 
      sortOrder = "desc" 
    } = req.query;

    // Build query
    const query = { batchId };
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get total count and attendance records
    const [total, attendance] = await Promise.all([
      Attendance.countDocuments(query),
      Attendance.find(query)
        .populate({
          path: 'records.studentId',
          select: 'studentName fatherName'
        })
        .populate("attendBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

    res.status(200).json({
      success: true,
      data: attendance,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Error fetching batch attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ Mark attendance for specific student (PATCH route)
export const markAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { studentId, status } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ 
        success: false,
        message: "Attendance not found" 
      });
    }

    // Update or add record
    const recordIndex = attendance.records.findIndex(
      (r) => r.studentId.toString() === studentId
    );

    if (recordIndex !== -1) {
      attendance.records[recordIndex].status = status;
    } else {
      attendance.records.push({ 
        studentId: studentId, 
        status: status 
      });
    }

    // Recalculate counts
    attendance.presents = attendance.records.filter(r => r.status === "Present").length;
    attendance.absents = attendance.records.filter(r => r.status === "Absent").length;
    attendance.updatedAt = Date.now();

    await attendance.save();
    res.status(200).json({ 
      success: true,
      message: "Attendance updated", 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getoverallData =async (req, res)=>{
  try {
    // Aggregate attendance data for all batches
    const overallData = await Attendance.aggregate([
      {
        $lookup: {
          from: 'batches',
          localField: 'batchId',
          foreignField: '_id',
          as: 'batch'
        }
      },
      {
        $unwind: '$batch'
      },
      {
        $group: {
          _id: '$batchId',
          batchName: { $first: '$batch.batchName' },
          totalRecords: { $sum: 1 },
          avgAttendance: { 
            $avg: { 
              $multiply: [
                { $divide: ['$presents', '$total'] },
                100
              ]
            }
          },
          totalStudents: { $first: '$total' }
        }
      },
      {
        $project: {
          name: '$batchName',
          attendance: { $round: ['$avgAttendance', 2] },
          students: '$totalStudents',
          present: { 
            $round: [
              { 
                $multiply: [
                  { $divide: ['$avgAttendance', 100] },
                  '$students'
                ]
              }
            ]
          },
          absent: {
            $round: [
              { 
                $subtract: [
                  '$students',
                  { 
                    $multiply: [
                      { $divide: ['$avgAttendance', 100] },
                      '$students'
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { attendance: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: overallData
    });
  } catch (error) {
    console.error('Error fetching overall chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// export const createAttendance = async (req, res) => {
//   try {
//     const { batchId, date, records, absents, presents, total } = req.body;

//     // Validate required fields
//     if (!batchId || !date) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Batch ID and date are required" 
//       });
//     }

//     // Check if batch exists
//     const batch = await Batch.findById(batchId).populate("students");
//     if (!batch) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Batch not found" 
//       });
//     }

//     // Check if attendance already exists for this batch on this date
//     const existingAttendance = await Attendance.findOne({
//       batchId,
//       date: {
//         $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of day
//         $lt: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of day
//       }
//     });

//     let attendance;

//     if (existingAttendance) {
//       // Update existing attendance
//       existingAttendance.records = records;
//       existingAttendance.presents = presents;
//       existingAttendance.absents = absents;
//       existingAttendance.total = total;
//       existingAttendance.attendBy = req.user?._id || req.body.attendBy;
//       existingAttendance.updatedAt = Date.now();

//       attendance = await existingAttendance.save();

//       return res.status(200).json({ 
//         success: true, 
//         message: "Attendance updated successfully", 
//         attendance 
//       });
//     } else {
//       // Create new attendance
//       attendance = new Attendance({
//         batchId,
//         date,
//         records,
//         presents,
//         absents,
//         total,
//         attendBy: req.user?._id || req.body.attendBy
//       });

//       await attendance.save();
      
//       return res.status(201).json({ 
//         success: true, 
//         message: "Attendance created successfully", 
//         attendance 
//       });
//     }
//   } catch (error) {
//     console.error("Error creating/updating attendance:", error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Attendance already exists for this date & batch"
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };

// ✅ Mark attendance (update specific student’s status)
// export const markAttendance = async (req, res) => {
//   try {
//     const { attendanceId } = req.params;
//     const { studentId, status } = req.body;

//     const attendance = await Attendance.findById(attendanceId);
//     if (!attendance) {
//       return res.status(404).json({ message: "Attendance not found" });
//     }

//     // update record
//     const record = attendance.records.find(
//       (r) => r.student.toString() === studentId
//     );
//     if (record) {
//       record.status = status;
//     } else {
//       attendance.records.push({ student: studentId, status });
//     }

//     await attendance.save();
//     res.json({ message: "Attendance updated", attendance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ✅ Get attendance by batch (all dates)
// export const getBatchAttendance = async (req, res) => {
//   try {
//     const { batchId } = req.params;
//     const attendance = await Attendance.find({ batchId })
//       .populate("records.studentId", "studentName fatherName").populate("attendBy","name")
//       .sort({ date: -1 });

//     res.json(attendance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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


// Get student attendance
export const getStuAttendance = async (req, res) => {
  try {
    const  studentId  = req.student.id;

    
    const { month, year } = req.query;
    
    // Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }
    
    // Calculate start and end dates for the selected month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Find attendance records for the student in the specified month/year
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      "records.studentId": studentId
    })
    .populate("batchId", "batchName")
    .populate("attendBy", "name")
    .sort({ date: 1 });
    
    // Process the data to extract student-specific information
    const studentAttendance = [];
    let presentCount = 0;
    let totalClasses = 0;
    
    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(
        r => r.studentId.toString() === studentId
      );
      
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === "Present") {
          presentCount++;
        }
        
        studentAttendance.push({
          date: record.date,
          subject: record.batchId.batchName, // Assuming batchName represents the subject
          status: studentRecord.status.toLowerCase(),
          remarks: "", // You can add remarks field to your schema if needed
          takenBy: record.attendBy.name
        });
      }
    });
    
    // Calculate attendance percentage
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        records: studentAttendance,
        totalClasses,
        present: presentCount,
        absent: totalClasses - presentCount,
        percentage
      }
    });
    
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
// ✅ Check if attendance exists for batch on current date
// export const checkTodayAttendance = async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     const today = new Date();
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//     const attendance = await Attendance.findOne({
//       batchId,
//       date: {
//         $gte: startOfDay,
//         $lte: endOfDay
//       }
//     })
//     .populate("attendBy", "name")
//     .populate("records.studentId", "studentName");

//     if (attendance) {
//       return res.status(200).json({
//         success: true,
//         exists: true,
//         data: attendance,
//         message: "Attendance already exists for today"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       exists: false,
//       message: "No attendance found for today"
//     });
//   } catch (error) {
//     console.error("Error checking today's attendance:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// Get student attendance summary (for dashboard)
// export const getStudentAttendanceSummary = async (req, res) => {
//   try {
//     const { studentId } = req.params;
    
//     // Validate studentId
//     if (!mongoose.Types.ObjectId.isValid(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid student ID format"
//       });
//     }
    
//     // Get current month and year
//     const currentDate = new Date();
//     const currentMonth = currentDate.getMonth() + 1;
//     const currentYear = currentDate.getFullYear();
    
//     // Calculate start and end dates for current month
//     const startDate = new Date(currentYear, currentMonth - 1, 1);
//     const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
//     // Find attendance records for the student in current month
//     const attendanceRecords = await Attendance.find({
//       date: { $gte: startDate, $lte: endDate },
//       "records.studentId": studentId
//     });
    
//     // Calculate statistics
//     let presentCount = 0;
//     let totalClasses = 0;
    
//     attendanceRecords.forEach(record => {
//       const studentRecord = record.records.find(
//         r => r.studentId.toString() === studentId
//       );
      
//       if (studentRecord) {
//         totalClasses++;
//         if (studentRecord.status === "Present") {
//           presentCount++;
//         }
//       }
//     });
    
//     // Calculate attendance percentage
//     const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
//     res.status(200).json({
//       success: true,
//       data: {
//         totalClasses,
//         present: presentCount,
//         absent: totalClasses - presentCount,
//         percentage
//       }
//     });
    
//   } catch (error) {
//     console.error("Error fetching student attendance summary:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// Get student attendance by date range
// export const getStudentAttendanceByDateRange = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const { startDate, endDate } = req.query;
    
//     // Validate studentId
//     if (!mongoose.Types.ObjectId.isValid(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid student ID format"
//       });
//     }
    
//     // Validate dates
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Start date and end date are required"
//       });
//     }
    
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999); // Set to end of day
    
//     // Find attendance records for the student in the date range
//     const attendanceRecords = await Attendance.find({
//       date: { $gte: start, $lte: end },
//       "records.studentId": studentId
//     })
//     .populate("batchId", "batchName")
//     .populate("attendBy", "name")
//     .sort({ date: 1 });
    
//     // Process the data
//     const studentAttendance = [];
//     let presentCount = 0;
//     let totalClasses = 0;
    
//     attendanceRecords.forEach(record => {
//       const studentRecord = record.records.find(
//         r => r.studentId.toString() === studentId
//       );
      
//       if (studentRecord) {
//         totalClasses++;
//         if (studentRecord.status === "Present") {
//           presentCount++;
//         }
        
//         studentAttendance.push({
//           date: record.date,
//           subject: record.batchId.batchName,
//           status: studentRecord.status.toLowerCase(),
//           takenBy: record.attendBy.name
//         });
//       }
//     });
    
//     // Calculate attendance percentage
//     const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
//     res.status(200).json({
//       success: true,
//       data: {
//         records: studentAttendance,
//         totalClasses,
//         present: presentCount,
//         absent: totalClasses - presentCount,
//         percentage,
//         dateRange: {
//           start: start.toISOString().split('T')[0],
//           end: end.toISOString().split('T')[0]
//         }
//       }
//     });
    
//   } catch (error) {
//     console.error("Error fetching student attendance by date range:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };