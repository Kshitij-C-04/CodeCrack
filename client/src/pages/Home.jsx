import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const modes = [
        {
            title: "Bug Fixing",
            desc: "Fix real-world broken code",
            icon: "🐞",
            path: "/bug",
            accent: "bg-cyan-500",
        },
        {
            title: "Output Guess",
            desc: "Think like a compiler",
            icon: "🔍",
            path: "/problems/output",
            accent: "bg-purple-500",
        },
        {
            title: "Code Puzzle",
            desc: "Rebuild logic from chaos",
            icon: "🧩",
            path: "/problems/puzzle",
            accent: "bg-emerald-500",
        },
        {
            title: "Timed Mode",
            desc: "Speed = XP multiplier",
            icon: "⏱",
            path: "/problems/timed",
            accent: "bg-orange-500",
        },
    ];

    return (
        <div className="min-h-screen text-white">

            {/* HERO */}
            <div className="text-center pt-28 px-4">

                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                        CodeCrack
                    </span>
                </h1>

                <p className="mt-4 text-xl text-cyan-300 font-medium">
                    Where coders compete ⚔️
                </p>

                <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                    Real bugs. Real logic. Real competition.
                </p>

                {/* 🔥 BUTTONS */}
                <div className="mt-10 flex justify-center gap-4 flex-wrap">

                    {/* PRIMARY CTA */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-3 rounded-xl font-semibold
                        bg-gradient-to-r from-cyan-500 to-blue-600
                        hover:scale-105 transition transform
                        shadow-lg hover:shadow-cyan-500/40"
                    >
                        Start Coding 🚀
                    </button>

                    {/* 🏆 LEADERBOARD BUTTON */}
                    <button
                        onClick={() => navigate("/leaderboard")}
                        className="px-6 py-3 rounded-xl font-medium
                        bg-white/5 backdrop-blur-md
                        border border-white/10
                        hover:border-cyan-400 hover:bg-white/10
                        transition-all duration-300
                        flex items-center gap-2 group"
                    >
                        <span className="text-yellow-400 text-lg group-hover:scale-110 transition">
                            🏆
                        </span>
                        <span className="group-hover:text-cyan-400 transition">
                            Leaderboard
                        </span>
                    </button>

                </div>
            </div>

            {/* MODES */}
            <div className="mt-20 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">

                {modes.map((mode, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(mode.path)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    >

                        {/* 🎨 TOP ACCENT BAR */}
                        <div className={`h-1 w-full ${mode.accent}`}></div>

                        <div className="p-8 flex items-start gap-5">

                            {/* 🎮 ICON BOX */}
                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${mode.accent}/20 text-2xl`}>
                                {mode.icon}
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1">

                                <h2 className="text-xl font-semibold mb-1 group-hover:text-white">
                                    {mode.title}
                                </h2>

                                <p className="text-sm text-slate-400">
                                    {mode.desc}
                                </p>

                                {/* CTA */}
                                <div className="mt-4 text-sm text-slate-500 group-hover:text-cyan-400 transition">
                                    Start →
                                </div>

                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* FOOTER */}
            <div className="mt-24 text-center text-slate-500 text-sm pb-10">
                Built for developers who hate easy problems.
            </div>
        </div>
    );
}

export default Home;