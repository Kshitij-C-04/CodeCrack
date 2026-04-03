// controllers/submissionController.js

import User from "../models/User.js";
import { getRank } from "../utils/rank.js";

export const submitSolution = async (req, res) => {
    const { userId, isCorrect, difficulty } = req.body;

    let xpGain = 0;

    if (isCorrect) {
        if (difficulty === "easy") xpGain = 10;
        if (difficulty === "medium") xpGain = 25;
        if (difficulty === "hard") xpGain = 50;
    }

    const user = await User.findById(userId);

    if (isCorrect) {
        user.xp += xpGain;
        user.problemsSolved += 1;
        user.streak += 1;
    } else {
        user.streak = 0;
    }

    user.rank = getRank(user.xp);

    await user.save();

    res.json({
        message: isCorrect ? "Correct!" : "Wrong!",
        xpGain,
        totalXP: user.xp,
        rank: user.rank
    });
};