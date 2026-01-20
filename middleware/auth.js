// // import jwt from "jsonwebtoken";
// // import User from "../models/User.js";
// // import Registration from "../models/regsitration.js";
// // import EmployeePermission from "../models/EmployeePermission.js";

// // export const auth = async (req, res, next) => {
// //   try {
// //     const token = req.header("Authorization")?.replace("Bearer ", "");
// //     if (!token) {
// //       return res.status(401).json({ message: "No token provided, access denied" });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //     // Find User or Student
// //     let user = await User.findById(decoded.id).select("-password");
// //     let student = null;

// //     if (!user) {
// //       student = await Registration.findById(decoded.id).select("-password").populate("technology","name").populate("training")
// //     }

// //     if (!user && !student) {
// //       return res.status(401).json({ message: "Account not found" });
// //     }

// //     if (user && !user.isActive) {
// //       return res.status(401).json({ message: "Account inactive" });
// //     }

// //     req.user = user;
// //     req.student = student;
// //     next();
// //   } catch (error) {
// //     if (error.name === "TokenExpiredError") {
// //       return res.status(401).json({ message: "Token expired" });
// //     }
// //     return res.status(401).json({ message: "Invalid token", error: error.message });
// //   }
// // };

// // // export const authorize = (...roles) => {
// // //   return (req, res, next) => {
// // //     if (!roles.includes(req.user.role)) {
// // //       return res.status(403).json({ message: 'Access denied' });
// // //     }
// // //     next();
// // //   };
// // // };


// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import Registration from "../models/regsitration.js";
// import EmployeePermission from "../models/EmployeePermission.js";

// export const auth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "No token provided, access denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find User or Student
//     let user = await User.findById(decoded.id).select("-password");
//     let student = null;

//     if (!user) {
//       student = await Registration.findById(decoded.id).select("-password").populate("technology","name").populate("training");
//     }

//     if (!user && !student) {
//       return res.status(401).json({ message: "Account not found" });
//     }

//     if (user && !user.isActive) {
//       return res.status(401).json({ message: "Account inactive" });
//     }

//     // For employees, get their permissions
//     if (user && user.role === "Employee" && user.branch) {
//       const employeePerm = await EmployeePermission.findOne({
//         employee: user._id,
//         branch: user.branch
//       }).populate('permissions', 'name');

//       user.permissions = employeePerm ? employeePerm.permissions.map(p => p.name) : [];
//     }

//     req.user = user;
//     req.student = student;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Token expired" });
//     }
//     return res.status(401).json({ message: "Invalid token", error: error.message });
//   }
// };

// // Enhanced authorize middleware
// export const authorize = (requiredPermission = null) => {
//   return async (req, res, next) => {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     // Super Admin has all access
//     if (user.isSuperAdmin) {
//       return next();
//     }

//     // Admin has all access to their branch
//     if (user.role === "Admin") {
//       // Check if trying to access another branch's data
//       if (req.params.branchId && req.params.branchId !== user.branch.toString()) {
//         return res.status(403).json({ message: 'Access denied to other branch' });
//       }
//       return next();
//     }

//     // Employee needs specific permissions
//     if (user.role === "Employee") {
//       if (!requiredPermission) {
//         return next(); // If no specific permission required
//       }

//       // Check if employee has the required permission
//       if (!user.permissions || !user.permissions.includes(requiredPermission)) {
//         return res.status(403).json({ 
//           message: `Access denied. Required permission: ${requiredPermission}` 
//         });
//       }

//       // Check branch access for employees
//       if (req.params.branchId && req.params.branchId !== user.branch.toString()) {
//         return res.status(403).json({ message: 'Access denied to other branch' });
//       }

//       return next();
//     }

//     return res.status(403).json({ message: 'Access denied' });
//   };
// };

// // Branch filter middleware
// export const filterByBranch = (model) => {
//   return async (req, res, next) => {
//     const user = req.user;

//     if (!user) return next();

//     if (user.isSuperAdmin) {
//       return next(); // Super Admin sees all
//     }

//     // For Admin and Employee, filter by their branch
//     if (user.branch) {
//       req.branchFilter = { branch: user.branch };
//     }

//     next();
//   };
// };
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import EmployeePermission from "../models/EmployeePermission.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user without password field
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("branch", "name address");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // For Employee role, fetch permissions
    if (user.role === "Employee" && user.branch) {
      const employeePerm = await EmployeePermission.findOne({
        employee: user._id,
        branch: user.branch
      }).populate("permissions", "name description category");

      // Add permissions to user object
      user.permissions = employeePerm ?
        employeePerm.permissions.map(p => p.name) : [];
    }

    // Add isSuperAdmin flag
    user.isSuperAdmin = user.role === "Super Admin";

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Permission checking middleware
export const authorize = (roles = [], requiredPermission = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check role
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient role.",
      });
    }

    // Check permissions for Employee
    if (req.user.role === "Employee" && requiredPermission) {
      if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }
    }

    next();
  };
};

// Branch filter middleware
export const filterByBranch = (model) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) return next();

    if (user.isSuperAdmin) {
      return next(); // Super Admin sees all
    }

    // For Admin and Employee, filter by their branch
    if (user.branch) {
      // For mongoose queries, we can attach this to the request
      req.branchFilter = { branch: user.branch?._id || user.branch };
    }

    next();
  };
};