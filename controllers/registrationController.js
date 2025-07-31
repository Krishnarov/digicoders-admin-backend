import Registration from "../models/regsitration.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import College from "../models/college.js";
import TechnologyModal from "../models/technology.js";
import Fee from "../models/fee.js";

// Add new registration
export const addRegistration = async (req, res) => {
  try {
    const {
      training,
      technology,
      education,
      eduYear,
      studentName,
      fatherName,
      email,
      mobile,
      alternateMobile,
      password,
      collegeName,
      paymentType,
      remark,
      amount,
      totalFee,
      tnxId,
      orderId,
      couponCode,
      registeredBy,
      couponDiscount,
      paymentMethod,
    } = req.body;

    // Check if user already exists
    const existingUser = await Registration.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or mobile number",
      });
    }
    // Get technology price if amount not provided
    let finalAmount = totalFee;
    if (!totalFee) {
      const tech = await TechnologyModal.findById(technology).select("price");
      finalAmount = tech.price;
    }
    // Validate payment type
    if (!["registration", "full"].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Use 'registration' or 'full'",
      });
    }
    // Check if college exists, if not create it
    let college = await College.findOne({ name: collegeName });
    if (!college) {
      college = new College({ name: collegeName });
      await college.save();
    }

    // Create new registration
    const newRegistration = new Registration({
      training,
      technology,
      education,
      eduYear,
      studentName,
      fatherName,
      email,
      mobile,
      alternateMobile,
      password,
      collegeName,
      paymentType,
      totalFee: finalAmount,
      paidAmount: paymentType === "full" ? finalAmount : amount,
      dueAmount: paymentType === "full" ? 0 : finalAmount - amount,
      // amount: paymentType === "full" ? finalAmount : amount,
      remark,
      orderId,
      couponCode,
      tnxId,
      registeredBy: registeredBy || null,
      couponDiscount: couponDiscount || 0,
    });

    const savedRegistration = await newRegistration.save();
    if (amount > 0) {
      const feePayment = new Fee({
        registrationId: savedRegistration._id,
        totalFee: finalAmount,
        paidAmount: paymentType === "full" ? finalAmount : amount,
        dueAmount: paymentType === "full" ? 0 : finalAmount - amount,
        amount: paymentType === "full" ? finalAmount : amount,
        paymentType: paymentType === "full" ? "full" : "registration",
        mode:paymentMethod,
        tnxId,
        status: "new", // Assuming payment is successful
      });

      await feePayment.save();
    }
    // Remove password from response
    const { password: _, ...userResponse } = savedRegistration.toObject();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};
//get singal user by email or mobile or id
export const getOneRegistrations = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please provide username",
      });
    }


    const registration = await Registration.findOne({ $or: [{ email: username }, { mobile: username }, { userid: username }] })
      .select("studentName email mobile _id dueAmount userid training technology education eduYear fatherName alternateMobile collegeName paymentType  totalFee paymentMethod remark couponCode ")

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registration",
      error: error.message,
    });
  }
};

// Get single registration by ID or email
export const getRegistration = async (req, res) => {
  try {
    const { id, email, userid } = req.query;

    let query = {};
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }
      query._id = id;
    } else if (email) {
      query.email = email;
    } else if (userid) {
      query.userid = userid;
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide id, email, or userid",
      });
    }

    const registration = await Registration.findOne(query)
      .select("-password")
      .populate("training", "name duration")
      .populate("technology", "name duration")
      .populate("education", "name")
      .populate("registeredBy", "name email")
      .populate("verifiedBy", "name email");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registration",
      error: error.message,
    });
  }
};

// Get all registrations with pagination and filters
export const getAllRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      training,
      technology,
      status,
      acceptStatus,
      paymentStatus,
    } = req.query;

    // Build filter object
    const filter = {};
    if (training) filter.training = training;
    if (technology) filter.technology = technology;
    if (status) filter.status = status;
    if (acceptStatus) filter.acceptStatus = acceptStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const registrations = await Registration.find(filter)
      .select("-password")
      .populate("training", "name duration")
      .populate("technology", "name duration")
      .populate("education", "name")
      .populate("registeredBy", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Registration.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};

// Update registration
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Remove password from update data for security
    delete updateData.password;

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("training", "name duration")
      .populate("technology", "name duration")
      .populate("education", "name")
      .populate("registeredBy", "name email")
      .populate("verifiedBy", "name email");

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating registration",
      error: error.message,
    });
  }
};

// Update registration status
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, acceptStatus } = req.body;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Validate status values
    const validStatuses = ["new", "accepted", "rejected"];
    const validAcceptStatuses = ["pending", "accepted", "rejected"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: new, accepted, rejected",
      });
    }

    if (acceptStatus && !validAcceptStatuses.includes(acceptStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid accept status. Must be one of: pending, accepted, rejected",
      });
    }

    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (acceptStatus) updateData.acceptStatus = acceptStatus;
    // if (remark) updateData.remark = remark;

    // Set verifiedBy to current user
    updateData.verifiedBy = user._id;

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("training", "name duration")
      .populate("technology", "name duration")
      .populate("education", "name")
      .populate("registeredBy", "name email")
      .populate("verifiedBy", "name email");

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration status updated successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating registration status",
      error: error.message,
    });
  }
};

// Delete registration
export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const deletedRegistration = await Registration.findByIdAndDelete(id);

    if (!deletedRegistration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting registration",
      error: error.message,
    });
  }
};
