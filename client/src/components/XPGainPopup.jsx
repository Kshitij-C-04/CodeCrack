import { useEffect, useState } from "react";

function XPGainPopup({ xp, rankUp }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (xp > 0) {
            setShow(true);

            const timer = setTimeout(() => {
                setShow(false);
            }, 2800);

            return () => clearTimeout(timer);
        }
    }, [xp]);

    if (!show) return null;

    return (
        <div className="fixed top-20 right-6 z-50 pointer-events-none">
            <div
                className={`
                transform transition-all duration-500 ease-out
                ${show ? "translate-x-0 opacity-100 scale-100" : "translate-x-10 opacity-0 scale-95"}
                animate-slideIn
                bg-gradient-to-r from-cyan-500 to-blue-600 
                text-white px-6 py-4 rounded-xl shadow-2xl 
                border border-cyan-300 backdrop-blur-md
            `}
            >
                {/* ✅ TITLE */}
                <div className="text-lg font-bold tracking-wide">
                    ✅ Correct Answer
                </div>

                {/* ✅ XP */}
                <div className="text-xl font-semibold text-yellow-300 mt-1 animate-xpPop">
                    +{xp} XP
                </div>

                {/* ✅ RANK UP */}
                {rankUp && (
                    <div className="mt-2 text-green-200 font-semibold flex items-center gap-2 animate-rankPulse">
                        🔥 Rank Up!
                    </div>
                )}
            </div>
        </div>
    );
}

export default XPGainPopup;