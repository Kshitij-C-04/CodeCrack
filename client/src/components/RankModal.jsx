import { useEffect, useState } from "react";

function RankModal({ isOpen, onClose, xp, rank }) {
    const [progress, setProgress] = useState(0);

    // Rank thresholds (same as backend)
    const ranks = [
        { name: "Bronze I", xp: 0 },
        { name: "Bronze II", xp: 75 },
        { name: "Bronze III", xp: 150 },
        { name: "Silver I", xp: 250 },
        { name: "Silver II", xp: 400 },
        { name: "Silver III", xp: 550 },
        { name: "Gold I", xp: 700 },
        { name: "Gold II", xp: 850 },
        { name: "Gold III", xp: 1000 },
        { name: "Platinum", xp: 1200 },
        { name: "Diamond", xp: 1500 },
    ];

    const currentIndex = ranks.findIndex(r => r.name === rank);
    const current = ranks[currentIndex] || ranks[0];
    const next = ranks[currentIndex + 1] || current;

    const range = next.xp - current.xp || 1;
    const currentProgress = Math.min(((xp - current.xp) / range) * 100, 100);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setProgress(currentProgress), 100);
        }
    }, [isOpen, currentProgress]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

            <div className="bg-slate-900 rounded-2xl p-8 w-[400px] text-center border border-slate-700 shadow-2xl">

                {/* TITLE */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Your Rank
                </h2>

                {/* RANK */}
                <div className="text-3xl font-bold text-yellow-400 mb-4 animate-pulse">
                    {rank}
                </div>

                {/* XP */}
                <div className="text-sm text-slate-400 mb-2">
                    {xp} XP
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-cyan-400 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* NEXT RANK */}
                <div className="text-xs text-slate-400 mb-6">
                    {xp} / {next.xp} XP → {next.name}
                </div>

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-400"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default RankModal;