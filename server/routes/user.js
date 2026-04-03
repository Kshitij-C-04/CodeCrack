import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Sync Clerk user
router.post("/sync", async (req, res) => {
    try {
        const clerkId = req.auth?.userId;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let user = await User.findOne({ clerkId });

        if (!user) {
            user = await User.create({
                clerkId,
                username: "Coder"
            });
        }

        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;