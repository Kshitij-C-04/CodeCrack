import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { clerkMiddleware } from "@clerk/express";

import problemRoutes from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submission.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();


// ✅ FIXED CORS (VERY IMPORTANT)
app.use(cors({
    origin: "http://localhost:3000", // ⚠️ change if your frontend port is different
    credentials: true
}));

// ✅ ALLOW AUTH HEADER (IMPORTANT)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
});

// ✅ BODY PARSER
app.use(express.json());

// ✅ CLERK AUTH (DO NOT MOVE ABOVE CORS)
app.use(clerkMiddleware());


// ✅ GLOBAL DEBUG LOGGER
app.use((req, res, next) => {
    console.log("📡", req.method, req.url);
    next();
});


// ✅ TEST ROUTE
app.get("/test", (req, res) => {
    res.send("BACKEND WORKING ✅");
});


// ✅ ROUTES (UNCHANGED)
app.use("/api/problems", problemRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/users", userRoutes);


// ✅ DB CONNECT
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        console.log("📦 DB NAME:", mongoose.connection.name);
    })
    .catch(err => {
        console.error("❌ DB ERROR:", err);
    });


// 🔥 DEBUG ROUTE (UNCHANGED)
app.get("/debug/problems", async (req, res) => {
    try {
        const Problem = (await import("./models/Problem.js")).default;
        const problems = await Problem.find();

        res.json({
            count: problems.length,
            sample: problems[0] || null
        });
    } catch (err) {
        res.json({ error: err.message });
    }
});


// ✅ START SERVER
app.listen(5000, () => {
    console.log("🔥 Server running on http://localhost:5000");
});