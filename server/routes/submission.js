import express from "express";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { getRank } from "../utils/rank.js";
import { runCode } from "../utils/judge0.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("🔥 HIT /api/submission");

        const clerkId = req.auth?.userId;
        const { code, language_id, problemId } = req.body;

        // ✅ VALIDATION
        if (!code || !problemId) {
            return res.status(400).json({
                success: false,
                message: "Missing code or problemId"
            });
        }

        // ✅ FETCH PROBLEM
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(500).json({
                success: false,
                message: "No test cases found"
            });
        }

        let lastOutput = "";
        let expectedOutput = "";

        // ✅ 🔥 USE BOTH VISIBLE + HIDDEN TEST CASES
        const allTests = [
            ...(problem.testCases || []),
            ...(problem.hiddenTestCases || [])
        ];

        // 🧠 RUN ALL TEST CASES
        for (let test of allTests) {
            console.log("➡️ Running test:", test);

            let result;

            try {
                result = await runCode(
                    code,
                    language_id || 63,
                    test.input
                );
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    type: "execution_error",
                    message: "Execution crashed",
                    error: err.message
                });
            }

            if (!result) {
                return res.status(500).json({
                    success: false,
                    type: "execution_error",
                    message: "No result returned"
                });
            }

            // ❌ RUNTIME ERROR
            if (result.stderr) {
                return res.json({
                    success: false,
                    type: "runtime_error",
                    error: result.stderr
                });
            }

            // ✅ COMPARE OUTPUT
            lastOutput = (result.stdout || "").trim();
            expectedOutput = String(test.output).trim();

            console.log("EXPECTED:", expectedOutput);
            console.log("GOT:", lastOutput);

            if (lastOutput !== expectedOutput) {
                return res.json({
                    success: false,
                    type: "wrong_answer",
                    expected: expectedOutput,
                    got: lastOutput
                });
            }
        }

        // ✅ ALL TEST CASES PASSED
        let xpGain = 0;

        // 🧪 TEST MODE (NO LOGIN)
        if (!clerkId) {
            return res.json({
                success: true,
                type: "accepted",
                message: "✅ Correct Answer",
                xp: 10
            });
        }

        // 👤 USER LOGIC
        let user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (problem.difficulty === "easy") xpGain = 10;
        if (problem.difficulty === "medium") xpGain = 25;
        if (problem.difficulty === "hard") xpGain = 50;

        user.xp += xpGain;
        user.problemsSolved += 1;
        user.streak += 1;

        user.rank = getRank(user.xp);
        await user.save();

        return res.json({
            success: true,
            type: "accepted",
            message: "✅ Correct Answer",
            xpGain,
            totalXP: user.xp,
            rank: user.rank
        });

    } catch (err) {
        console.error("❌ FINAL ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Submission error",
            error: err.message
        });
    }
});

export default router;