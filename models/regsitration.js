import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const registrationSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },
    whatshapp: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
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
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    alternateMobile: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Please enter a valid alternate mobile number"],
    },
    hrName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hr",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    totalFee: { type: Number, required: true },
    discount: { type: Number, required: true },
    finalFee: { type: Number, required: true },
    amount: { type: Number, min: 500 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentType: {
      type: String,
      enum: ["registration", "full", "installment"],
      default: "registration",
      required: true,
    },
    paymentMethod: { type: String, enum: ["cash", "online"] },
    password: {
      type: String,
      // required: true,
      minlength: 6,
    },
    qrcode: { type: mongoose.Schema.Types.ObjectId, ref: "QrCode" },
    remark: {
      type: String,
    },

    txnId: {
      type: String,
      sparse: true,
    },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referenceId: {
      type: String,
      sparse: true,
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    trainingFeeStatus: {
      type: String,
      enum: ["pending", "partial","full paid"],
      default: "pending",
    },
    tnxStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    txnDateTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["new", "accepted", "rejected"],
      default: "new",
    },
    // acceptStatus: {
    //   type: String,
    //   enum: ["pending", "accepted", "rejected"],
    //   default: "pending",
    // },

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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// // Pre-save middleware to hash password
// registrationSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Method to compare password
// registrationSchema.methods.comparePassword = async function (
//   candidatePassword
// ) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Method to generate userid if not provided
registrationSchema.pre("save", function (next) {
  if (!this.userid) {
    this.userid =`DCT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` ;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
