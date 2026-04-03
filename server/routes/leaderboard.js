import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await User.find()
            .sort({ xp: -1 })
            .limit(50);

        const rankedUsers = users.map((user, index) => ({
            ...user.toObject(),
            rank: index + 1,
        }));

        res.json(rankedUsers);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Leaderboard error" });
    }
});

export default router;