import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Problem from "./models/Problem.js";

dotenv.config();

async function seedDB() {
        try {
                // 🔥 VERY IMPORTANT (to debug DB mismatch)
                console.log("SEED DB:", process.env.MONGO_URI);

                await mongoose.connect(process.env.MONGO_URI);
                console.log("✅ MongoDB Connected");

                // 📦 READ JSON FILE
                const rawData = JSON.parse(
                    fs.readFileSync(new URL("./data/problems.json", import.meta.url))
                );

                console.log("Problems loaded:", rawData.length);

                // 🧹 CLEAR OLD DATA
                await Problem.deleteMany({});
                console.log("Old data cleared");

                // ✅ DIRECT CLEAN INSERT (NO MODIFICATION LOGIC)
                const cleanedData = rawData.map((p) => ({
                        title: p.title || "",
                        description: p.description || "",
                        mode: p.mode || "",
                        difficulty: p.difficulty || "easy",

                        buggyCode: p.buggyCode || "",
                        correctCode: p.correctCode || "",

                        // 🔥 IMPORTANT: take code EXACTLY from JSON
                        code: p.code || "",

                        answer: p.answer || "",
                        functionSignature: p.functionSignature || "",

                        schema: p.schema || "",
                        exampleInput: p.exampleInput || "",
                        exampleOutput: p.exampleOutput || "",
                        hint: p.hint || "",

                        xp: p.xp || 10,

                        testCases: Array.isArray(p.testCases)
                            ? p.testCases.map(tc => ({
                                    input: tc.input || "",
                                    output: String(tc.output)
                            }))
                            : [],

                        hiddenTestCases: Array.isArray(p.hiddenTestCases)
                            ? p.hiddenTestCases.map(tc => ({
                                    input: tc.input || "",
                                    output: String(tc.output)
                            }))
                            : []
                }));

                // 🧪 DEBUG: check one output problem BEFORE insert
                const sampleOutput = cleanedData.find(p => p.mode === "output");
                console.log("CHECK OUTPUT BEFORE INSERT:", sampleOutput);

                await Problem.insertMany(cleanedData);

                const count = await Problem.countDocuments();
                console.log("Inserted:", count);

                // 🧪 DEBUG AFTER INSERT
                const checkDB = await Problem.findOne({ mode: "output" });
                console.log("CHECK OUTPUT IN DB:", checkDB);

                console.log("🚀 Seeding complete!");
                process.exit();

        } catch (err) {
                console.error("❌ ERROR:", err);
                process.exit(1);
        }
}

seedDB();