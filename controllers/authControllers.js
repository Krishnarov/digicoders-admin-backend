import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
dotenv.config();
// import emailService from '../utils/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;
    const file = req.file;
    console.log(branch);

    if (!name || !email || !password || !role)
      return res
        .status(400)
        .json({ message: " credentials  missing!", success: false });
    const allowedRoles = ["Admin", "Employee", "Intern"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role", success: false });
    }
    const registeredBy = req.user;
    if (registeredBy.role !== "Admin")
      return res
        .status(404)
        .json({ message: "add Empolyee only Admin", success: false });
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    // Format image object for local storage
    let imageObject = null;
    if (file) {
      imageObject = {
        url: `/uploads/${file.filename}`, // URL for accessing the file
        public_id: file.filename, // filename as public_id for local storage
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      };
    }
    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      branch,
      registeredBy: registeredBy._id,
      image: imageObject,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      // user: {
      //   id: user._id,
      //   name: user.name,
      //   email: user.email,
      // },
    });
  } catch (error) {
    // If there's an error and file was uploaded, delete it

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: "Invalid credentials or account locked",
        success: false,
      });
    }
    // If account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account temporarily locked. Try again later.",
        success: false,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Reset attempts
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLogin = new Date();
      await user.save();
    }

    if (user.isTwoFactor && !otp) {
      const newotp = Math.floor(1000 + Math.random() * 9000); // always 4-digit
      user.otp = newotp;
      await user.save();

      sendEmail(user.email, `Your OTP is: ${newotp}`).catch(console.error);
      return res.status(200).json({
        message: "OTP sent to email",
        success: true,
        isTwoFactor: user.isTwoFactor,
      });
    } else if (user.isTwoFactor && otp) {
      if (user.otp.toString() !== otp.toString()) {
        return res.status(400).json({ message: "Invalid OTP", success: false });
      }
    }

    // Generate tokens
    const accessToken = await user.generateToken(); // short lived
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: parseInt(process.env.COOKIE_EXPIRE),
    });

    return res.json({
      accessToken,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message, success: false });
  }
};

export const logout = async (req, res) => {
  try {
    // const user = await User.findById(req.user.id);
    res.clearCookie("accessToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// export const getAll = async (req, res) => {
//   try {
//     const user = await User.find().select("-password");
//     return res.status(200).json({ data: user });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getAll = async (req, res) => {
  try {
    const {
      search,
      role,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role && role !== "All") {
      filter.role = role;
    }

    // Active status filter
    if (isActive !== undefined && isActive !== "All") {
      filter.isActive = isActive === "true";
    }

    // Sorting
    const sortOptions = {};
    const allowedSortFields = [
      "name",
      "email",
      "role",
      "branch",
      "isActive",
      "createdAt",
      "updatedAt",
    ];

    // Validate sort field
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);

    // Query with pagination
    const user = await User.find(filter)
      .populate("branch", "name")
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      message: "Successfully fetched employees",
      count: user.length,
      total: totalCount,
      page: pageNumber,
      pages: Math.ceil(totalCount / limitNumber),
      data: user,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export const getMe = async (req, res) => {
  try {
    const student = req.student;
    const user = req.user;

    if (!student && !user) {
      return res.status(404).json({
        success: false,
        message: "Student or User not found",
      });
    }
    const userdata = await User.findById(user._id || student._id).populate(
      "branch",
      "name"
    );

    return res.status(200).json({
      success: true,
      message: "Fetched successfully",
      data: student || user,
      userdata,
    });
  } catch (error) {
    console.error("Error in getme:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({
      message: "Token is valid",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const {
      name,
      newpassword,
      oldpassword,
      isActive,
      isTwoFactor,
      phone,
      post,
      address,
      branch,
    } = req.body;
    const user = await User.findById(req.params.id);
    const file = req?.file;

    if (!user)
      return res
        .status(404)
        .json({ message: "user not found", success: false });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (post) user.post = post;
    if (branch) user.branch = branch;
    if (address) user.address = address;
    if (oldpassword && newpassword) {
      const isMatch = await bcrypt.compare(oldpassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Old password is incorrect", success: false });
      }
      user.password = newpassword; // ye pre-save hook me hash ho jayega
    }
    if (file) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      user.image = {
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
      };
    }

    if (typeof isTwoFactor !== "undefined") user.isTwoFactor = isTwoFactor;
    if (typeof isActive !== "undefined" && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to change status", success: false });
    } else {
      user.isActive = isActive;
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error, success: false });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const logdInUser = req.user;


    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (logdInUser.id.toString() === user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete yourself",
        success: false,
      });
    }
    
    // Cloudinary image delete
    if (user.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.image.public_id);
      } catch (err) {
        console.error("Cloudinary delete error:", err.message);
      }
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete user error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};
