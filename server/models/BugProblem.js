import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        default: ""
    },
    output: {
        type: String,
        required: true
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // 🔥 KEY FIELD (VERY IMPORTANT)
    mode: {
        type: String,
        enum: ["bug", "output", "puzzle"],
        required: true
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },

    // 🐞 BUG MODE
    buggyCode: {
        type: String,
        default: ""
    },

    correctCode: {
        type: String,
        default: ""
    },

    // 🧩 OUTPUT / PUZZLE
    code: {
        type: String,
        default: ""
    },

    answer: {
        type: String,
        default: ""
    },

    // 🎮 XP SYSTEM
    xp: {
        type: Number,
        default: function () {
            if (this.difficulty === "easy") return 10;
            if (this.difficulty === "medium") return 20;
            return 30;
        }
    },

    // 🧪 TESTING
    testCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Problem", problemSchema);