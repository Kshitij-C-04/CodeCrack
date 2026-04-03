import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import submissionRoutes from "./routes/submission.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import userRoutes from "./routes/user.js";
import problemRoutes from "./routes/problemRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 SERVER RUNNING");

// ✅ CORRECT ROUTE MOUNT
app.use("/api/problems", problemRoutes);

app.use("/api/submission", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);


// TEST
app.get("/", (req, res) => {
    res.send("API WORKING");
});

// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

mongoose.connection.once("open", () => {
    console.log("📦 DB NAME:", mongoose.connection.name);
});

// SERVER
app.listen(5000, () => console.log("🔥 Server running on port 5000"));