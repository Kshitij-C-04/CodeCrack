import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Problem from "./models/Problem.js";

dotenv.config();

console.log("MONGO URI:", process.env.MONGO_URI);

async function seedDB() {
        try {
                await mongoose.connect(process.env.MONGO_URI);
                console.log("✅ MongoDB Connected");

                // 📦 READ JSON FILE
                const rawData = JSON.parse(
                    fs.readFileSync(new URL("./data/problems.json", import.meta.url))
                );

                console.log("Problems loaded:", rawData.length);

                // 🧹 CLEAR OLD DATA
                await Problem.deleteMany();
                console.log("Old data cleared");

                // ✅ 🔥 CLEAN DATA (CRITICAL FIX)
                const cleanedData = rawData.map((p) => ({
                        title: p.title,
                        description: p.description,
                        mode: p.mode,
                        difficulty: p.difficulty,

                        buggyCode: p.buggyCode || "",
                        correctCode: p.correctCode || "",

                        code: p.code || "",
                        answer: p.answer || "",

                        functionSignature: p.functionSignature || "",

                        schema: p.schema || "",
                        exampleInput: p.exampleInput || "",
                        exampleOutput: p.exampleOutput || "",
                        hint: p.hint || "",

                        xp: p.xp,

                        // ✅ SAFE TEST CASE HANDLING
                        testCases: Array.isArray(p.testCases)
                            ? p.testCases
                                .filter(tc => tc && tc.output !== undefined)
                                .map(tc => ({
                                        input: tc.input || "",
                                        output: String(tc.output)
                                }))
                            : [],

                        hiddenTestCases: Array.isArray(p.hiddenTestCases)
                            ? p.hiddenTestCases
                                .filter(tc => tc && tc.output !== undefined)
                                .map(tc => ({
                                        input: tc.input || "",
                                        output: String(tc.output)
                                }))
                            : []
                }));

                // 🚀 INSERT CLEAN DATA
                await Problem.insertMany(cleanedData);

                const count = await Problem.countDocuments();
                console.log("Inserted:", count);

                console.log("🚀 Seeding complete!");
                process.exit();

        } catch (err) {
                console.error("❌ ERROR:", err);
                process.exit(1);
        }
}

seedDB();