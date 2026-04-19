import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

function ProblemsList() {
    const params = useParams();

    const mode = params.mode || "bug";

    const [problems, setProblems] = useState([]);
    const [userData, setUserData] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "timed") {
            navigate("/timed");
        }
    }, [mode, navigate]);

    const { user } = useUser();
    const userId = user?.id;
    const key = userId ? `solvedProblems_${userId}` : null;

    useEffect(() => {
        fetchProblems();
    }, [mode]);

    const fetchProblems = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/problems/${mode}`
            );
            setProblems(res.data || []);
        } catch (err) {
            console.error("FETCH ERROR:", err);
            setProblems([]);
        }
    };

    const fetchUser = async () => {
        if (!user?.id) return;

        try {
            const res = await axios.get(
                `http://localhost:5000/api/users/${user.id}`
            );
            setUserData(res.data);
        } catch (err) {
            console.error("USER FETCH ERROR:", err);
        }
    };

    useEffect(() => {
        fetchUser();

        window.addEventListener("xpUpdated", fetchUser);

        return () => {
            window.removeEventListener("xpUpdated", fetchUser);
        };
    }, [user]);

    let solvedLocal = [];
    try {
        solvedLocal = key
            ? JSON.parse(localStorage.getItem(key) || "[]")
            : [];
    } catch {
        solvedLocal = [];
    }

    const solved = Array.isArray(userData?.problemsSolved)
        ? userData.problemsSolved
        : solvedLocal;

    const solvedCount = problems.filter(p =>
        solved.includes(p._id.toString())
    ).length;

    const total = problems.length;
    const percent = total ? Math.round((solvedCount / total) * 100) : 0;

    return (
        <div className="text-white">

            {/* ✅ BACK BUTTON ADDED (ONLY CHANGE) */}
            <button
                onClick={() => navigate("/")}
                className="mb-4 bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
            >
                Back
            </button>

            <h2 className="text-2xl font-bold mb-4 capitalize">
                {mode} Mode Problems
            </h2>

            {/* PROGRESS */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-1 text-slate-400">
                    <span>Progress</span>
                    <span>{solvedCount} / {total}</span>
                </div>

                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {problems.length === 0 ? (
                <p>No problems found</p>
            ) : (
                <div className="space-y-3">
                    {problems.map((p, index) => {
                        const isSolved = solved.includes(p._id.toString());

                        return (
                            <div
                                key={p._id}
                                onClick={() => {
                                    if (mode === "bug") {
                                        navigate(`/bug/${p._id}`);
                                    } else {
                                        navigate(`/problem/${mode}/${p._id}`);
                                    }
                                }}
                                className={`p-4 rounded-lg cursor-pointer flex justify-between items-center transition-all
                                ${
                                    isSolved
                                        ? "bg-slate-800 border-l-4 border-green-500"
                                        : "bg-slate-800 hover:bg-slate-700"
                                }`}
                            >
                                <div className={`${!isSolved ? "opacity-70" : ""}`}>
                                    {index + 1}. {p.title}
                                </div>

                                <span
                                    className={`text-sm font-semibold ${
                                        p.difficulty === "easy"
                                            ? "text-green-400"
                                            : p.difficulty === "medium"
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                    }`}
                                >
                                    {p.difficulty?.toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ProblemsList;