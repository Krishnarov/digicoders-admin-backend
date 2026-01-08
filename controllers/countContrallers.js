import Registration from "../models/regsitration.js";
import Fee from "../models/fee.js";
import Batch from "../models/batchs.js";
import Teachers from "../models/teachers.js";
import College from "../models/college.js";
import BranchModal from "../models/branch.js";
import manageHr from "../models/manageHr.js";
import TechnologyModal from "../models/technology.js";
import TranningModal from "../models/tranning.js";
export const getAll = async (req, res) => {
  try {
    const logdInUser = req.user;
      const loggedInUser = req.user;

    // 🔐 Branch filter logic
    const isAdmin = loggedInUser.role === "Admin";

    const branchFilter = isAdmin
      ? {} // admin → all data
      : { branch: loggedInUser.branch }; // employee/trainer/hr → own branch only

    // Students (Registrations)
    const studentsNew = await Registration.countDocuments({ status: "new", ...branchFilter });
    const studentsAccepted = await Registration.countDocuments({
      status: "accepted",
       ...branchFilter
    });
    const studentsRejected = await Registration.countDocuments({
      status: "rejected",
       ...branchFilter
    });
    const studentsAll = await Registration.countDocuments({ ...branchFilter});

    // Fees (Payments)
    const feesNew = await Fee.countDocuments({ status: "new", ...branchFilter });
    const feesAccepted = await Fee.countDocuments({ status: "accepted" , ...branchFilter});
    const feesRejected = await Fee.countDocuments({ status: "rejected" , ...branchFilter});
    const feesAll = await Fee.countDocuments({ ...branchFilter});

    //  Batch find
    const batchCount = await Batch.countDocuments({ isActive: true, ...branchFilter });
    //  Teachers find
    const teachersCount = await Teachers.countDocuments({ isActive: true , ...branchFilter});
    const collegeCount = await College.countDocuments({ isActive: true });
    const branchCount = await BranchModal.countDocuments({ isActive: true });
    const manageHrCount = await manageHr.countDocuments({ isActive: true , ...branchFilter});
    const technologyCount = await TechnologyModal.countDocuments({
      isActive: true,
    });
    const tranningCount = await TranningModal.countDocuments({
      isActive: true,
    });

    // Final response object
    const counts = {
      students: {
        new: studentsNew,
        accepted: studentsAccepted,
        rejected: studentsRejected,
        all: studentsAll,
      },
      fees: {
        new: feesNew,
        accepted: feesAccepted,
        rejected: feesRejected,
        all: feesAll,
      },
      batchCount,
      teachersCount,
      collegeCount,
      branchCount,
      manageHrCount,
      technologyCount,
      tranningCount,
    };

    res.status(200).json(counts);
  } catch (error) {
    console.error("Error in getAll controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
