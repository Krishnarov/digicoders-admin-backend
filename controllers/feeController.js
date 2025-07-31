// controllers/feeController.js
import Registration from "../models/regsitration.js";
import Fee from "../models/fee.js";

// Record a payment
export const recordPayment = async (req, res) => {
  try {
    const {
      registrationId,
      amount,
      paymentType,
      mode,
      txnId,
      remark,
      couponCode,
    } = req.body;

    // Validate payment
    if (!registrationId || !amount || !mode) {
      return res.status(400).json({
        success: false,
        message: "Registration ID, amount and payment mode are required",
      });
    }

    // Find registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const admin = req.user;
    const paidAmount = Number(registration.paidAmount) + Number(amount);
    const fee = new Fee({
      registrationId,
      amount,
      totalFee: registration.totalFee,
      paidAmount: paidAmount,
      dueAmount: registration.dueAmount - amount,
      paymentType,
      mode,
      txnId,
      remark,
      couponCode,
      paidBy: admin._id,
    });

    await fee.save();

    // Update registration payment status
    registration.paidAmount = paidAmount;
    registration.dueAmount = Number(registration.dueAmount) - Number(amount);
    if (registration.paidAmount >= registration.totalFee) {
      registration.paymentStatus = "paid";
    } else if (registration.paidAmount > 0) {
      registration.paymentStatus = "partial";
    }

    await registration.save();

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: fee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error recording payment",
      error: error.message,
    });
  }
};
//get all payments
export const getallPayments = async (req, res) => {
  try {
    const payments = await Fee.find()
      .populate(
        "registrationId",
        "studentName email mobile userid fatherName collegeName"
      )
      .sort({ paymentDate: -1 });
    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};
// Get payment history for a registration
export const getPaymentHistory = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const payments = await Fee.find({ registration: registrationId }).sort({
      paymentDate: -1,
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// Check dues for a registration
export const checkDues = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalFee: registration.totalFee,
        paidAmount: registration.paidAmount,
        remainingFee: registration.dueAmount,
        paymentStatus: registration.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking dues",
      error: error.message,
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["accepted", "rejected", "new"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find fee
    const FeeData = await Fee.findById(id);
    if (!FeeData) {
      return res.status(404).json({
        success: false,
        message: "Fee Data not found",
      });
    }
    
    const Student = await Registration.findById({ _id: FeeData.registrationId });
    if (!Student)
      return res
        .status(404)
        .json({ message: "registration data is not found" });

    // Update status
    FeeData.status = status;
    FeeData.verifiedBy = req.user.id;
    FeeData.paymentStatus =
      status === "accepted"
        ? "success"
        : status === "rejected"
        ? "failed"
        : "pending";
    if (status === "rejected") {
      Student.paidAmount = Student.paidAmount - FeeData.amount;
      Student.dueAmount = Student.dueAmount + FeeData.amount;
      await Student.save();
    }
    await FeeData.save();

    res.status(200).json({
      success: true,
      message: "FeeData status updated successfully",
      data: FeeData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating FeeData status",
      error: error.message,
    });
  }
};
export const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedata = await Fee.findOne({$or:[{_id:id},{registrationId:id,paymentType:"registration"}]}).populate({
      path: "registrationId",
      select:
        "collegeName fatherName email mobile paymentStatus studentName training technology education userid eduYear",
      populate: [
        { path: "training", select: "name" },
        { path: "technology", select: "name" },
        { path: "education", select: "name" },
      ],
    });
    if (!feedata)
      return res
        .status(404)
        .json({ success: false, message: "fee data not found" });
    return res
      .status(200)
      .json({ success: true, message: "feaching successfull", data: feedata });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error featching fee data",
      error: error.message,
    });
  }
};
