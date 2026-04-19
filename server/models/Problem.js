import mongoose from "mongoose";

// ✅ TEST CASE SCHEMA
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

// ✅ MAIN PROBLEM SCHEMA
const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },

    mode: {
        type: String,
        required: true,
        enum: ["bug", "output", "puzzle"]
    },

    difficulty: {
        type: String,
        default: "easy"
    },

    // 🔥 LANGUAGE SUPPORT (IMPORTANT)
    language: {
        type: String,
        default: "javascript",
        enum: ["javascript", "python", "sql"]
    },

    // 🔧 BUG MODE
    buggyCode: {
        type: String,
        default: ""
    },
    correctCode: {
        type: String,
        default: ""
    },

    // 🔥 OUTPUT MODE
    code: {
        type: String,
        default: ""
    },
    answer: {
        type: String,
        default: ""
    },

    // 🔥 PUZZLE MODE
    functionSignature: {
        type: String,
        default: ""
    },

    // 🔧 OPTIONAL FIELDS
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

    xp: {
        type: Number,
        default: 10
    },

    // ✅ TEST CASES
    testCases: {
        type: [testCaseSchema],
        default: []
    },

    hiddenTestCases: {
        type: [testCaseSchema],
        default: []
    }

}, {
    timestamps: true // ✅ useful for future (no breaking)
});

// ✅ FORCE COLLECTION NAME = "problems"
const Problem = mongoose.model("Problem", problemSchema, "problems");

export default Problem;