import mongoose from "mongoose";
import { type } from "os";

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Duration",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for better performance
technologySchema.index({ trainingType: 1 });

const TechnologyModal = mongoose.model("Technology", technologySchema);
export default TechnologyModal;
