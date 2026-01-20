// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";
// import cloudinary from "../config/cloudinary.js";
// import { sendEmail } from "../utils/sendEmail.js";
// dotenv.config();
// // import emailService from '../utils/emailService.js';
// // Updated register function
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, role, branch } = req.body;
//     const file = req.file;
//     const loggedInUser = req.user;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ 
//         message: "Credentials missing!", 
//         success: false 
//       });
//     }

//     // Role validation
//     const allowedRoles = ["Super Admin", "Admin", "Employee"];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ 
//         message: "Invalid role", 
//         success: false 
//       });
//     }

//     // Check who can create which role
//     if (role === "Super Admin") {
//       // Only existing Super Admin can create another Super Admin
//       if (!loggedInUser.isSuperAdmin) {
//         return res.status(403).json({ 
//           message: "Only Super Admin can create another Super Admin", 
//           success: false 
//         });
//       }
//     } else if (role === "Admin") {
//       // Only Super Admin can create Admin
//       if (!loggedInUser.isSuperAdmin) {
//         return res.status(403).json({ 
//           message: "Only Super Admin can create Admin", 
//           success: false 
//         });
//       }
//       if (!branch) {
//         return res.status(400).json({ 
//           message: "Branch is required for Admin", 
//           success: false 
//         });
//       }
//     } else if (role === "Employee") {
//       // Super Admin or Admin (of same branch) can create Employee
//       if (!loggedInUser.isSuperAdmin && loggedInUser.role !== "Admin") {
//         return res.status(403).json({ 
//           message: "Only Super Admin or Admin can create Employee", 
//           success: false 
//         });
//       }
//       if (!branch) {
//         return res.status(400).json({ 
//           message: "Branch is required for Employee", 
//           success: false 
//         });
//       }
//       // Admin can only create employees for their own branch
//       if (loggedInUser.role === "Admin" && branch !== loggedInUser.branch.toString()) {
//         return res.status(403).json({ 
//           message: "Admin can only create employees for their own branch", 
//           success: false 
//         });
//       }
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: "User already exists", 
//         success: false 
//       });
//     }

//     // Format image object
//     let imageObject = null;
//     if (file) {
//       imageObject = {
//         url: `/uploads/${file.filename}`,
//         public_id: file.filename,
//         originalname: file.originalname,
//         mimetype: file.mimetype,
//         size: file.size,
//         uploadedAt: new Date(),
//       };
//     }

//     // Create user
//     const user = new User({
//       name,
//       email,
//       password,
//       role,
//       branch: role !== "Super Admin" ? branch : undefined,
//       registeredBy: loggedInUser._id,
//       image: imageObject,
//     });

//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: `${role} registered successfully`,
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         branch: user.branch
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: "Server error", 
//       error: error.message,
//       success: false 
//     });
//   }
// };
// // export const register = async (req, res) => {
// //   try {
// //     const { name, email, password, role, branch } = req.body;
// //     const file = req.file;
// //     console.log(branch);

// //     if (!name || !email || !password || !role)
// //       return res
// //         .status(400)
// //         .json({ message: " credentials  missing!", success: false });
// //     const allowedRoles = ["Admin", "Employee", "Intern"];
// //     if (role && !allowedRoles.includes(role)) {
// //       return res.status(400).json({ message: "Invalid role", success: false });
// //     }
// //     const registeredBy = req.user;
// //     if (registeredBy.role !== "Admin")
// //       return res
// //         .status(404)
// //         .json({ message: "add Empolyee only Admin", success: false });
// //     // Check if user already exists
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       return res
// //         .status(400)
// //         .json({ message: "User already exists", success: false });
// //     }
// //     // Format image object for local storage
// //     let imageObject = null;
// //     if (file) {
// //       imageObject = {
// //         url: `/uploads/${file.filename}`, // URL for accessing the file
// //         public_id: file.filename, // filename as public_id for local storage
// //         originalname: file.originalname,
// //         mimetype: file.mimetype,
// //         size: file.size,
// //         uploadedAt: new Date(),
// //       };
// //     }
// //     // Create user
// //     const user = new User({
// //       name,
// //       email,
// //       password,
// //       role,
// //       branch,
// //       registeredBy: registeredBy._id,
// //       image: imageObject,
// //     });
// //     await user.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "User registered successfully. Please verify your email.",
// //       // user: {
// //       //   id: user._id,
// //       //   name: user.name,
// //       //   email: user.email,
// //       // },
// //     });
// //   } catch (error) {
// //     // If there's an error and file was uploaded, delete it

// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// export const login = async (req, res) => {
//   try {
//     const { email, password, otp } = req.body;

//     // Find user and include password
//     const user = await User.findOne({ email }).select("+password");

//     if (!user || !user.isActive) {
//       return res.status(404).json({
//         message: "Invalid credentials or account locked",
//         success: false,
//       });
//     }
//     // If account is locked
//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       return res.status(403).json({
//         message: "Account temporarily locked. Try again later.",
//         success: false,
//       });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       await user.incLoginAttempts();
//       return res
//         .status(400)
//         .json({ message: "Invalid credentials", success: false });
//     }

//     // Reset attempts
//     if (user.loginAttempts > 0) {
//       user.loginAttempts = 0;
//       user.lockUntil = null;
//       user.lastLogin = new Date();
//       await user.save();
//     }

//     if (user.isTwoFactor && !otp) {
//       const newotp = Math.floor(1000 + Math.random() * 9000); // always 4-digit
//       user.otp = newotp;
//       await user.save();

//       sendEmail(user.email, `Your OTP is: ${newotp}`).catch(console.error);
//       return res.status(200).json({
//         message: "OTP sent to email",
//         success: true,
//         isTwoFactor: user.isTwoFactor,
//       });
//     } else if (user.isTwoFactor && otp) {
//       if (user.otp.toString() !== otp.toString()) {
//         return res.status(400).json({ message: "Invalid OTP", success: false });
//       }
//     }

//     // Generate tokens
//     const accessToken = await user.generateToken(); // short lived
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None",
//       maxAge: parseInt(process.env.COOKIE_EXPIRE),
//     });

//     return res.json({
//       accessToken,
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       success: true,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error", error: error.message, success: false });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     // const user = await User.findById(req.user.id);
//     res.clearCookie("accessToken");
//     res.json({ message: "Logged out successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // export const getAll = async (req, res) => {
// //   try {
// //     const user = await User.find().select("-password");
// //     return res.status(200).json({ data: user });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// export const getAll = async (req, res) => {
//   try {
//     const {
//       search,
//       role,
//       isActive,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {};

//     // Search filter
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { role: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Role filter
//     if (role && role !== "All") {
//       filter.role = role;
//     }

//     // Active status filter
//     if (isActive !== undefined && isActive !== "All") {
//       filter.isActive = isActive === "true";
//     }

//     // Sorting
//     const sortOptions = {};
//     const allowedSortFields = [
//       "name",
//       "email",
//       "role",
//       "branch",
//       "isActive",
//       "createdAt",
//       "updatedAt",
//     ];

//     // Validate sort field
//     const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
//     sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

//     // Calculate pagination
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     // Get total count for pagination
//     const totalCount = await User.countDocuments(filter);

//     // Query with pagination
//     const user = await User.find(filter)
//       .populate("branch", "name")
//       .select("-password")
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limitNumber);

//     return res.status(200).json({
//       success: true,
//       message: "Successfully fetched employees",
//       count: user.length,
//       total: totalCount,
//       page: pageNumber,
//       pages: Math.ceil(totalCount / limitNumber),
//       data: user,
//     });
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
// export const getMe = async (req, res) => {
//   try {
//     const student = req.student;
//     const user = req.user;

//     if (!student && !user) {
//       return res.status(404).json({
//         success: false,
//         message: "Student or User not found",
//       });
//     }
//     const userdata = await User.findById(user._id || student._id).populate(
//       "branch",
//       "name"
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Fetched successfully",
//       data: student || user,
//       userdata,
//     });
//   } catch (error) {
//     console.error("Error in getme:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// export const verifyToken = async (req, res) => {
//   try {
//     res.json({
//       message: "Token is valid",
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const updateUser = async (req, res) => {
//   try {
//     const {
//       name,
//       newpassword,
//       oldpassword,
//       isActive,
//       isTwoFactor,
//       phone,
//       post,
//       address,
//       branch,
//     } = req.body;
//     const user = await User.findById(req.params.id);
//     const file = req?.file;

//     if (!user)
//       return res
//         .status(404)
//         .json({ message: "user not found", success: false });

//     if (name) user.name = name;
//     if (phone) user.phone = phone;
//     if (post) user.post = post;
//     if (branch) user.branch = branch;
//     if (address) user.address = address;
//     if (oldpassword && newpassword) {
//       const isMatch = await bcrypt.compare(oldpassword, user.password);
//       if (!isMatch) {
//         return res
//           .status(400)
//           .json({ message: "Old password is incorrect", success: false });
//       }
//       user.password = newpassword; // ye pre-save hook me hash ho jayega
//     }
//     if (file) {
//       if (user.image?.public_id) {
//         await cloudinary.uploader.destroy(user.image.public_id);
//       }

//       user.image = {
//         url: `/uploads/${file.filename}`,
//         public_id: file.filename,
//       };
//     }

//     if (typeof isTwoFactor !== "undefined") user.isTwoFactor = isTwoFactor;
//     if (typeof isActive !== "undefined" && req.user.role !== "Admin") {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to change status", success: false });
//     } else {
//       user.isActive = isActive;
//     }
//     await user.save();
//     return res
//       .status(200)
//       .json({ message: "User updated successfully", success: true });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ message: "Server error", error, success: false });
//   }
// };
// export const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const logdInUser = req.user;


//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }
//     if (logdInUser.id.toString() === user._id.toString()) {
//       return res.status(403).json({
//         message: "You cannot delete yourself",
//         success: false,
//       });
//     }

//     // Cloudinary image delete
//     if (user.image?.public_id) {
//       try {
//         await cloudinary.uploader.destroy(user.image.public_id);
//       } catch (err) {
//         console.error("Cloudinary delete error:", err.message);
//       }
//     }

//     await user.deleteOne();

//     res.status(200).json({
//       message: "User deleted successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.error("Delete user error:", error.message);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//       success: false,
//     });
//   }
// };

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import EmployeePermission from "../models/EmployeePermission.js";
import Permission from "../models/Permission.js";

dotenv.config();

// Login Function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact administrator.",
        success: false,
      });
    }

    // Check if account is locked
    if (user.isAccountLocked) {
      return res.status(403).json({
        message: "Account is temporarily locked. Try again later.",
        success: false,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      const attemptsLeft = 5 - user.loginAttempts;

      return res.status(400).json({
        message: `Invalid password. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left' : 'Account locked for 2 hours'}`,
        success: false
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateToken();

    // Get employee permissions if employee
    let permissions = [];
    if (user.role === "Employee" && user.branch) {
      const employeePerm = await EmployeePermission.findOne({
        employee: user._id,
        branch: user.branch
      }).populate('permissions', 'name description category');

      permissions = employeePerm
        ? employeePerm.permissions.map(p => p.name)
        : [];
    }

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        permissions,
        isSuperAdmin: user.role === "Super Admin"
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      success: false,
    });
  }
};

// Register User with Role-Based Access Control
export const register = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;
    const file = req.file;
    const loggedInUser = req.user;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required!",
        success: false
      });
    }

    // Check permissions based on who is creating
    if (role === "Super Admin") {
      // Only Super Admin can create another Super Admin
      if (!loggedInUser || loggedInUser.role !== "Super Admin") {
        return res.status(403).json({
          message: "Only Super Admin can create another Super Admin",
          success: false
        });
      }
    } else if (role === "Admin") {
      // Only Super Admin can create Admin
      if (!loggedInUser || loggedInUser.role !== "Super Admin") {
        return res.status(403).json({
          message: "Only Super Admin can create Admin",
          success: false
        });
      }
      if (!branch) {
        return res.status(400).json({
          message: "Branch is required for Admin",
          success: false
        });
      }
    } else if (role === "Employee") {
      // Super Admin or Admin can create Employee
      if (!loggedInUser || (loggedInUser.role !== "Admin" && loggedInUser.role !== "Super Admin")) {
        return res.status(403).json({
          message: "Only Super Admin or Admin can create Employee",
          success: false
        });
      }
      if (!branch) {
        return res.status(400).json({
          message: "Branch is required for Employee",
          success: false
        });
      }
      // Admin can only create employees for their own branch
      if (loggedInUser.role === "Admin" && branch !== loggedInUser.branch?._id?.toString()) {
        return res.status(403).json({
          message: "Admin can only create employees for their own branch",
          success: false
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        success: false
      });
    }

    // Final role and branch determination
    const finalRole = loggedInUser.role === "Admin" ? "Employee" : role;
    const finalBranch = loggedInUser.role === "Admin" ? loggedInUser.branch : branch;

    // Format image object
    let imageObject = null;
    if (file) {
      imageObject = {
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
      };
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: finalRole,
      branch: finalRole !== "Super Admin" ? finalBranch : undefined,
      registeredBy: loggedInUser?._id || null,
      image: imageObject,
      isVerified: finalRole === "Super Admin" || finalRole === "Admin" ? true : false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      success: false
    });
  }
};

// Get current user with permissions
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get employee permissions if employee
    let userWithPermissions = user.toObject();
    if (user.role === "Employee" && user.branch) {
      const employeePerm = await EmployeePermission.findOne({
        employee: user._id,
        branch: user.branch
      }).populate('permissions', 'name description category');

      userWithPermissions.permissions = employeePerm ?
        employeePerm.permissions.map(p => p.name) : [];
    }

    // Add isSuperAdmin flag
    userWithPermissions.isSuperAdmin = user.role === "Super Admin";

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: userWithPermissions
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all users with role-based filtering
export const getAll = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const {
      search,
      role,
      isActive,
      branch,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Apply role-based filtering
    if (loggedInUser.role === "Admin") {
      // Admin can only see users from their branch
      filter.branch = loggedInUser.branch;
      filter.role = { $ne: "Super Admin" }; // Admin cannot see Super Admin
    } else if (loggedInUser.role === "Employee") {
      // Employee can only see themselves
      return res.status(200).json({
        success: true,
        message: "Successfully fetched user",
        data: [loggedInUser],
        total: 1,
        page: 1,
        pages: 1
      });
    }

    // Apply filters
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      filter.role = role;
    }

    if (isActive !== undefined && isActive !== "All") {
      filter.isActive = isActive === "true";
    }

    if (branch && branch !== "All" && loggedInUser.role === "Super Admin") {
      filter.branch = branch;
    }

    // Exclude Super Admin from non-Super Admin users
    if (loggedInUser.role !== "Super Admin") {
      filter.role = { $ne: "Super Admin" };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .populate("branch", "name address")
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get permissions for employees
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === "Employee" && user.branch) {
          const employeePerm = await EmployeePermission.findOne({
            employee: user._id,
            branch: user.branch
          }).populate('permissions', 'name');

          userObj.permissions = employeePerm ?
            employeePerm.permissions.map(p => p.name) : [];
        }
        userObj.isSuperAdmin = user.role === "Super Admin";
        return userObj;
      })
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: usersWithPermissions.length,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      data: usersWithPermissions,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      branch,
      isActive,
      isTwoFactor
    } = req.body;

    const file = req.file;
    const loggedInUser = req.user;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check permissions
    if (loggedInUser.role === "Admin") {
      // Admin can only update users in their branch
      if (user.branch?.toString() !== loggedInUser.branch?.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update users in your branch",
        });
      }
      // Admin cannot update role
      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({
          success: false,
          message: "Admin cannot change user roles",
        });
      }
    } else if (loggedInUser.role === "Employee") {
      // Employee can only update their own profile
      if (user._id.toString() !== loggedInUser._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Branch can only be changed by Super Admin
    if (branch && loggedInUser.role === "Super Admin") {
      user.branch = branch;
    }

    // Image update
    if (file) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }
      user.image = {
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
      };
    }

    // Only Super Admin/Admin can update these fields
    if (loggedInUser.role === "Super Admin" || loggedInUser.role === "Admin") {
      if (isActive !== undefined) user.isActive = isActive;
    }

    if (isTwoFactor !== undefined) user.isTwoFactor = isTwoFactor;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check permissions
    if (user._id.toString() === loggedInUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    if (loggedInUser.role === "Admin") {
      // Admin can only delete users from their branch
      if (user.branch?.toString() !== loggedInUser.branch?.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only delete users from your branch",
        });
      }
      // Admin cannot delete other Admins
      if (user.role === "Admin") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot delete another Admin",
        });
      }
    } else if (loggedInUser.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: "Employees cannot delete users",
      });
    }

    // Delete image from Cloudinary if exists
    if (user.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.image.public_id);
      } catch (error) {
        console.error("Error deleting image:", error.message);
      }
    }

    // Delete employee permissions if exists
    if (user.role === "Employee" && user.branch) {
      await EmployeePermission.deleteOne({
        employee: user._id,
        branch: user.branch
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify token
export const verifyToken = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Get employee permissions if employee
    let userWithPermissions = user.toObject();
    if (user.role === "Employee" && user.branch) {
      const employeePerm = await EmployeePermission.findOne({
        employee: user._id,
        branch: user.branch
      }).populate('permissions', 'name');

      userWithPermissions.permissions = employeePerm ?
        employeePerm.permissions.map(p => p.name) : [];
    }

    // Add isSuperAdmin flag
    userWithPermissions.isSuperAdmin = user.role === "Super Admin";

    res.status(200).json({
      success: true,
      message: "Token is valid",
      user: userWithPermissions
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};