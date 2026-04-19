function RankBadge({ rank }) {
    if (!rank) return null;

    const getTier = () => {
        if (rank.includes("Bronze")) return "bronze";
        if (rank.includes("Silver")) return "silver";
        if (rank.includes("Gold")) return "gold";
        if (rank.includes("Platinum")) return "platinum";
        if (rank.includes("Diamond")) return "diamond";
        return "default";
    };

    const getLevel = () => {
        if (rank.includes("III")) return 3;
        if (rank.includes("II")) return 2;
        return 1;
    };

    const tier = getTier();
    const level = getLevel();

    const baseStyles = {
        bronze: "from-amber-700 to-amber-500 border-amber-800",
        silver: "from-gray-300 to-gray-500 border-gray-400 text-black",
        gold: "from-yellow-400 to-yellow-600 border-yellow-500 text-black",
        platinum: "from-cyan-300 to-cyan-500 border-cyan-400 text-black",
        diamond: "from-blue-500 to-indigo-600 border-blue-400",
        default: "from-gray-600 to-gray-500 border-gray-400"
    };

    const glow = {
        1: "",
        2: "shadow-lg",
        3: "shadow-xl scale-105"
    };

    return (
        <div
            className={`
                px-4 py-1.5
                rounded-full
                text-sm font-bold
                border
                bg-gradient-to-r
                tracking-wide
                flex items-center gap-2
                ${baseStyles[tier]}
                ${glow[level]}
            `}
        >
            {/* Badge Core */}
            <div className="w-3 h-3 rounded-full bg-white/80"></div>

            {/* Rank */}
            <span>{rank}</span>
        </div>
    );
}

export default RankBadge;