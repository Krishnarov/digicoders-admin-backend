import mongoose from "mongoose";

const hrSchama = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: {
    type: Boolean,
    default: true,
  },
},{timestamps:true});
export default mongoose.model("Hr",hrSchama)
