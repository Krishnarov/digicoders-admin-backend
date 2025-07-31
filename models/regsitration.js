import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const registrationSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      unique: true,
    },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tranning",
      required: true,
    },
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technology",
      required: true,
    },
    education: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Education",
      required: true,
    },
    eduYear: {
      type: String,
      // required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },
    alternateMobile: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Please enter a valid alternate mobile number"],
    },
    password: {
      type: String,
      // required: true,
      minlength: 6,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ["registration", "full", "installment"],
      default: "registration",
      required: true,
    },
    totalFee: { type: Number, required: true }, // Set during registration
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    amount: {
      type: Number,
      min: 0,
    },
    orderId: {
      type: String,
      // unique: true,
      // sparse: true
    },
    referenceId: {
      type: String,
      sparse: true,
    },
    txnId: {
      type: String,
      sparse: true,
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["cash", "online"] },
    txnDateTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["new", "accepted", "rejected"],
      default: "new",
    },
    acceptStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    couponCode: {
      type: String,
      trim: true,
    },
    couponDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    remark: {
      type: String,
    },
    image: {
      type: String, // URL or file path
      default: null,
    },
    isStatus: {
      type: Boolean,
      default: true,
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    loginAt: {
      type: Date,
      default: null,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save middleware to hash password
registrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
registrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate userid if not provided
registrationSchema.pre("save", function (next) {
  if (!this.userid) {
    this.userid = "DCT" + Math.floor(Math.random() * 1000);
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
