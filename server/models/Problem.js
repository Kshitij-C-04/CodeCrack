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
}, { _id: false });

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    // 🔥 MODE
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

    // ✅ 🔥 ADD THIS (CRITICAL FIX)
    language: {
        type: String,
        enum: ["javascript", "python", "sql"],
        default: "javascript"
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

    // 🧠 OUTPUT MODE
    code: {
        type: String,
        default: ""
    },
    answer: {
        type: String,
        default: ""
    },

    // 🧩 PUZZLE MODE
    functionSignature: {
        type: String,
        default: ""
    },

    // ✅ SQL + EXTRA FIELDS
    schema: {
        type: String,
        default: ""
    },
    exampleInput: {
        type: String,
        default: ""
    },
    exampleOutput: {
        type: String,
        default: ""
    },
    hint: {
        type: String,
        default: ""
    },

    // 🎮 XP LOGIC
    xp: {
        type: Number,
        default: function () {
            if (this.difficulty === "easy") return 10;
            if (this.difficulty === "medium") return 20;
            return 30;
        }
    },

    // 🧪 TEST CASES
    testCases: {
        type: [testCaseSchema],
        default: []
    },
    hiddenTestCases: {
        type: [testCaseSchema],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Problem", problemSchema);