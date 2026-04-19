import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },

    // 🔥 ADD THIS (MAIN FIX)
    username: {
        type: String,
        required: true,
        default: "Coder"
    },

    xp: {
        type: Number,
        default: 0
    },

    problemsSolved: {
        type: [String],
        default: []
    },

    streak: {
        type: Number,
        default: 0
    },

    rank: {
        type: String,
        default: "Beginner"
    },

    highestScore: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);