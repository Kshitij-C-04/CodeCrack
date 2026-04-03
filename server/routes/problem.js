import express from "express";
import Problem from "../models/Problem.js";

const router = express.Router();


// ✅ GET ALL PROBLEMS BY MODE
router.get("/mode/:mode", async (req, res) => {
    try {
        const { mode } = req.params;

        const problems = await Problem.find({ mode });

        // ✅ always return array (avoid frontend crash)
        res.json(problems || []);

    } catch (err) {
        console.error("MODE FETCH ERROR:", err);
        res.status(500).json({ message: "Error fetching problems" });
    }
});


// ✅ GET SINGLE PROBLEM BY MODE + ID
router.get("/:mode/:id", async (req, res) => {
    try {
        const { mode, id } = req.params;

        const problem = await Problem.findOne({ _id: id, mode });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const data = problem.toObject();

        // ✅ IMPORTANT: normalize ALL possible code fields
        data.displayCode =
            data.code ||
            data.buggyCode ||
            data.functionSignature ||
            "";

        // ✅ also ensure frontend still gets original fields
        res.json(data);

    } catch (err) {
        console.error("FETCH ONE ERROR:", err);
        res.status(500).json({ message: "Error fetching problem" });
    }
});


// ✅ RANDOM PROBLEM (UNCHANGED LOGIC)
router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find();

        if (!problems.length) {
            return res.status(404).json({ message: "No problems found" });
        }

        const random =
            problems[Math.floor(Math.random() * problems.length)];

        res.json(random);

    } catch (err) {
        console.error("RANDOM ERROR:", err);
        res.status(500).json({ message: "Error fetching problem" });
    }
});

export default router;