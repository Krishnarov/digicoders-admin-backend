// models/Fee.js
import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    registrationId: {
      // Link to Registration (not User)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    totalFee: { type: Number, required: true }, // Set during registration
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["registration", "installment", "full"],
      required: true,
    },
    installmentNo: {
      // For tracking installments (e.g., 1, 2, 3)
      type: Number,
      default: 0,
    },
    receiptNo: {
      type: String,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    mode: {
      type: String,
      enum: ["cash", "online", "cheque"],
      required: true,
    },
    tnxId: {
      // For online payments
      type: String,
      sparse: true,
    },
    verifiedBy: {
      // Admin who verified payment
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paidBy:{
         type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remark:{
      type: String,
      default: "",
    },
    couponCode:{
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "new"],
      default: "new",
    },
  },
  { timestamps: true }
);
// Auto-generate receiptNo
feeSchema.pre("save", function (next) {
  if (!this.receiptNo) {
    this.receiptNo = `DCTREC-${new Date().getFullYear()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }
  next();
});

const Fee = mongoose.model("Fee", feeSchema);
export default Fee;
