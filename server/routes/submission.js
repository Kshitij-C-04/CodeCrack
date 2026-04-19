import express from "express";
import Problem from "../models/Problem.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const router = express.Router();

// Rank function
const getRank = (xp) => {
    if (xp >= 1500) return "Diamond";
    if (xp >= 1200) return "Platinum";
    if (xp >= 1000) return "Gold III";
    if (xp >= 850) return "Gold II";
    if (xp >= 700) return "Gold I";
    if (xp >= 550) return "Silver III";
    if (xp >= 400) return "Silver II";
    if (xp >= 250) return "Silver I";
    if (xp >= 150) return "Bronze III";
    if (xp >= 75) return "Bronze II";
    return "Bronze I";
};

// normalize (UNCHANGED)
const normalize = (val) => {
    if (Array.isArray(val)) return val.join("");
    return String(val).replace(/[\s,]+/g, "");
};

// ✅ FINAL PYTHON RUNNER (FIXED PROPERLY)
const runPython = (code, input) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(process.cwd(), "temp.py");

        const wrappedCode = `
import sys
import json

${code}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())

    if isinstance(data, list):
        result = solution(*data)
    else:
        result = solution(data)

    if result is None:
        print("null")
    else:
        print(result)
`;

        fs.writeFileSync(filePath, wrappedCode);

        const process = exec(`python ${filePath}`, (err, stdout, stderr) => {
            fs.unlinkSync(filePath);

            if (err) return reject(stderr || err.message);

            resolve(stdout.trim());
        });

        // ✅ PASS INPUT SAFELY
        try {
            let parsed;

            if (typeof input === "string") {
                if (input.includes(",")) {
                    parsed = input.split(",").map(i => JSON.parse(i));
                } else {
                    parsed = JSON.parse(input);
                }
            } else {
                parsed = input;
            }

            process.stdin.write(JSON.stringify(parsed));
            process.stdin.end();

        } catch (e) {
            process.stdin.write(JSON.stringify(input));
            process.stdin.end();
        }
    });
};

router.post("/", async (req, res) => {
    try {
        const { code, problemId, clerkId, score, mode } = req.body;

        if (!code || !problemId) {
            return res.status(400).json({
                success: false,
                message: "Missing code or problemId"
            });
        }

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // ================= OUTPUT MODE =================
        if (mode === "output") {
            let output;

            try {
                const func = new Function(`
                    ${problem.code}

                    if (typeof solution === "function") return solution();
                    if (typeof main === "function") return main();

                    throw new Error("No function found");
                `);

                output = await func();
            } catch (err) {
                return res.json({
                    success: false,
                    error: err.message
                });
            }

            const clean = (val) =>
                String(val).trim().replace(/[\n\r]+/g, "");

            if (clean(String(code)) !== clean(String(output))) {
                return res.json({
                    success: false,
                    expected: output,
                    got: code
                });
            }

            let user = null;
            let xpGain = 0;

            if (clerkId) {
                user = await User.findOne({ clerkId });

                if (!user) {
                    user = new User({
                        clerkId,
                        xp: 0,
                        problemsSolved: [],
                        highestScore: 0,
                        rank: "Bronze I"
                    });
                }

                const solvedIds = user.problemsSolved.map(id => id.toString());

                if (!solvedIds.includes(problemId.toString())) {
                    const difficulty = problem.difficulty?.toLowerCase();

                    if (difficulty === "easy") xpGain = 10;
                    else if (difficulty === "medium") xpGain = 25;
                    else if (difficulty === "hard") xpGain = 50;

                    user.xp += xpGain;
                    user.problemsSolved.push(problemId.toString());
                    user.rank = getRank(user.xp);

                    await user.save();
                }
            }

            return res.json({
                success: true,
                message: "Accepted",
                xp: user?.xp,
                xpGained: xpGain,
                rank: user?.rank
            });
        }

        // ================= BUG MODE =================
        const allTests = [
            ...(problem.testCases || []),
            ...(problem.hiddenTestCases || [])
        ];

        for (let test of allTests) {
            let parsedInput = test.input;

            try {
                parsedInput = JSON.parse(test.input);
            } catch {
                if (!isNaN(test.input)) parsedInput = Number(test.input);
            }

            let output;

            try {
                if ((problem.language || "").toLowerCase() === "python") {
                    output = await runPython(code, parsedInput);

                    try {
                        output = JSON.parse(output);
                    } catch {}
                } else {
                    const func = new Function(
                        "input",
                        `
                        ${code}

                        if (typeof solution === "function") return solution(input);
                        if (typeof main === "function") return main(input);

                        throw new Error("No function found");
                        `
                    );

                    output = await func(parsedInput);
                }

            } catch (err) {
                return res.json({
                    success: false,
                    error: err.message
                });
            }

            let expected = test.output;

            try {
                expected = JSON.parse(expected);
            } catch {}

            if (output === undefined || output === null) output = "null";
            if (expected === undefined || expected === null) expected = "null";

            if (normalize(output) !== normalize(expected)) {
                return res.json({
                    success: false,
                    expected,
                    got: output
                });
            }
        }

        let user = null;
        let xpGain = 0;

        if (clerkId) {
            user = await User.findOne({ clerkId });

            if (!user) {
                user = new User({
                    clerkId,
                    xp: 0,
                    problemsSolved: [],
                    highestScore: 0,
                    rank: "Bronze I"
                });
            }

            const solvedIds = user.problemsSolved.map(id => id.toString());

            if (!solvedIds.includes(problemId.toString())) {
                const difficulty = problem.difficulty?.toLowerCase();

                if (difficulty === "easy") xpGain = 10;
                else if (difficulty === "medium") xpGain = 25;
                else if (difficulty === "hard") xpGain = 50;

                user.xp += xpGain;
                user.problemsSolved.push(problemId.toString());
                user.rank = getRank(user.xp);

                await user.save();
            }
        }

        return res.json({
            success: true,
            message: "Accepted",
            xp: user?.xp,
            xpGained: xpGain,
            rank: user?.rank
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Submission error",
            error: err.message
        });
    }
});

export default router;