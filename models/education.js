import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
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


const TechnologyModal = mongoose.model("Education", educationSchema);
export default TechnologyModal;