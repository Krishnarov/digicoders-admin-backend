import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);

export default College;