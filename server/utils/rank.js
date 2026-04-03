export const getRank = (xp) => {
    if (xp >= 3000) return "Diamond";
    if (xp >= 1800) return "Platinum";
    if (xp >= 900) return "Gold";
    if (xp >= 300) return "Silver";
    return "Bronze";
};