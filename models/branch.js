import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


const BranchModal = mongoose.model("Branch", BranchSchema);
export default BranchModal;