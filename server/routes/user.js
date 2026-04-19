import express from "express";
import User from "../models/User.js";

const router = express.Router();


// 🔁 SYNC USER (FINAL FIX)
router.post("/sync", async (req, res) => {
    try {
        // ✅ CORRECT AUTH
        const { userId } = req.auth();
        const clerkId = userId;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        console.log("🔥 clerkId:", clerkId);
        console.log("🔥 BODY:", req.body);

        const { username, firstName, lastName, email } = req.body || {};

        // ✅ FINAL SAFE USERNAME (BULLETPROOF)
        let computedUsername = "";

        if (typeof username === "string" && username.trim() !== "") {
            computedUsername = username.trim();
        } else if (firstName || lastName) {
            computedUsername = `${firstName || ""} ${lastName || ""}`.trim();
        } else if (email && email.includes("@")) {
            computedUsername = email.split("@")[0];
        } else {
            computedUsername = `User_${clerkId.slice(-5)}`;
        }

        // 🔥 FORCE FINAL SAFETY (CRITICAL)
        if (!computedUsername || computedUsername === "undefined") {
            computedUsername = `User_${clerkId.slice(-5)}`;
        }

        console.log("🔥 FINAL USERNAME:", computedUsername);

        let user = await User.findOne({ clerkId });

        // 🆕 CREATE USER
        if (!user) {
            user = await User.create({
                clerkId,
                username: computedUsername,
                xp: 0,
                problemsSolved: [],
                rank: "Bronze I",
                highestScore: 0
            });

            console.log("✅ CREATED:", computedUsername);
        }
        // 🔁 UPDATE USER (ALWAYS ENSURE CORRECT NAME)
        else {
            if (!user.username || user.username !== computedUsername) {
                user.username = computedUsername;
                await user.save();

                console.log("♻️ UPDATED:", computedUsername);
            }
        }

        res.json(user);

    } catch (err) {
        console.error("🔥 ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});


// 🏆 LEADERBOARD (UNCHANGED)
router.get("/leaderboard", async (req, res) => {
    try {
        const users = await User.find()
            .sort({ xp: -1 })
            .limit(50)
            .select("username xp rank clerkId");

        res.json(users);
    } catch (err) {
        console.error("LEADERBOARD ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// 👤 GET USER (UNCHANGED)
router.get("/:clerkId", async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });

        if (!user) {
            return res.json({
                clerkId: req.params.clerkId,
                username: "Coder",
                xp: 0,
                problemsSolved: [],
                rank: "Bronze I",
                highestScore: 0
            });
        }

        res.json(user);

    } catch (err) {
        console.error("GET USER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;