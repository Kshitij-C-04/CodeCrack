import express from "express";
import User from "../models/User.js";

const router = express.Router();


// 🔁 SYNC USER (FETCH FROM CLERK TOKEN)
router.post("/sync", async (req, res) => {
    try {
        const authData = req.auth?.();
        const clerkId = authData?.userId;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {
            username,
            firstName,
            lastName,
            email
        } = req.body || {};

        // ✅ PRIORITY: Clerk username → name → email → fallback
        let computedUsername =
            username ||
            `${firstName || ""} ${lastName || ""}`.trim() ||
            (email ? email.split("@")[0] : "") ||
            `User_${clerkId.slice(-5)}`;

        if (!computedUsername) {
            computedUsername = `User_${clerkId.slice(-5)}`;
        }

        let user = await User.findOne({ clerkId });

        if (!user) {
            user = await User.create({
                clerkId,
                username: computedUsername,
                xp: 0,
                problemsSolved: [],
                rank: "Bronze I",
                highestScore: 0
            });
        } else {
            // ✅ Always keep username updated from Clerk
            if (computedUsername && user.username !== computedUsername) {
                user.username = computedUsername;
                await user.save();
            }
        }

        res.json(user);

    } catch (err) {
        console.error("SYNC ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});


// 🏆 LEADERBOARD (ALWAYS RETURNS REAL USERS)
router.get("/leaderboard", async (req, res) => {
    try {
        const users = await User.find()
            .sort({ xp: -1 })
            .limit(50)
            .select("username xp rank clerkId");

        res.json(users || []);
    } catch (err) {
        console.error("LEADERBOARD ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// 👤 GET USER (AUTO CREATE IF MISSING)
router.get("/:clerkId", async (req, res) => {
    try {
        let user = await User.findOne({ clerkId: req.params.clerkId });

        // 🔥 FIX: auto-create instead of returning "Coder"
        if (!user) {
            user = await User.create({
                clerkId: req.params.clerkId,
                username: `User_${req.params.clerkId.slice(-5)}`,
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