import express from "express";
import Problem from "../models/Problem.js";

const router = express.Router();

// ✅ RANDOM
router.get("/random/:mode", async (req, res) => {
    try {
        const problems = await Problem.find({});

        if (!problems.length) {
            return res.status(404).json({ message: "No problems found" });
        }

        const random = problems[Math.floor(Math.random() * problems.length)];
        res.json(random);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching problem" });
    }
});

// ✅ MODE LIST (KEEP FILTER)
router.get("/mode/:mode", async (req, res) => {
    try {
        const problems = await Problem.find({
            mode: new RegExp(`^${req.params.mode}$`, "i")
        }).sort({ createdAt: 1 });

        res.json(problems);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching problems" });
    }
});

// ✅ SINGLE PROBLEM (🔥 FIXED)
router.get("/:mode/:id", async (req, res) => {
    try {
        // 💣 FIX: IGNORE MODE COMPLETELY
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.json(problem);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching problem" });
    }
});

export default router;