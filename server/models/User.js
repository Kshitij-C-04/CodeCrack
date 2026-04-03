import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: { type: String, unique: true },

    username: String,
    email: String,

    xp: { type: Number, default: 0 },
    rank: { type: String, default: "Bronze" },

    problemsSolved: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);