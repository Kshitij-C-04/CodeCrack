import express from "express";
import Problem from "../models/Problem.js";

const router = express.Router();

// TEST
router.get("/", (req, res) => {
    res.send("PROBLEM ROUTES WORKING ✅");
});

// RANDOM ALL
router.get("/random/all", async (req, res) => {
    try {
        const problems = await Problem.find();

        if (!problems.length) return res.json(null);

        const random = problems[Math.floor(Math.random() * problems.length)];
        res.json(random);
    } catch (err) {
        console.error(err);
        res.json(null);
    }
});

// RANDOM BY MODE
router.get("/random/:mode", async (req, res) => {
    try {
        const { mode } = req.params;

        const problems = await Problem.find({
            mode: { $regex: new RegExp(`^${mode}$`, "i") }
        });

        if (!problems.length) return res.json(null);

        const random = problems[Math.floor(Math.random() * problems.length)];
        res.json(random);
    } catch (err) {
        console.error(err);
        res.json(null);
    }
});

// 🔥 FIXED GET SINGLE (NO BREAKS)
router.get("/:mode/:id", async (req, res) => {
    try {
        const { id, mode } = req.params;

        let problem = null;

        // Try Mongo ID first
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            problem = await Problem.findById(id);
        }

        // Fallback to index
        if (!problem) {
            problem = await Problem.findOne({
                index: Number(id),
                mode: { $regex: new RegExp(`^${mode}$`, "i") }
            });
        }

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // 🔥 IMPORTANT FIX — inject code if missing
        if (problem.mode === "output") {
            if (!problem.code || problem.code.trim() === "") {
                problem.code = `function solution(){ return ${JSON.stringify(problem.answer)}; }`;
            }
        }

        res.json(problem);

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET ALL BY MODE
router.get("/:mode", async (req, res) => {
    try {
        const { mode } = req.params;

        const problems = await Problem.find({
            mode: { $regex: new RegExp(`^${mode}$`, "i") }
        });

        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

export default router;