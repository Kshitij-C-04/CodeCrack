import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

function Leaderboard() {
    const [users, setUsers] = useState([]);
    const { user } = useUser();

    const fetchUsers = async () => {
        try {
            const res = await axios.get("`${API}/api/users/leaderboard`");
            setUsers(res.data);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        }
    };

    useEffect(() => {
        fetchUsers();

        const handleXPUpdate = () => fetchUsers();
        window.addEventListener("xpUpdated", handleXPUpdate);

        return () => {
            window.removeEventListener("xpUpdated", handleXPUpdate);
        };
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-white">

            {/* TITLE */}
            <h1 className="text-3xl font-bold mb-8 text-center">
                🏆 Leaderboard
            </h1>

            {/* EMPTY STATE */}
            {users.length === 0 && (
                <p className="text-center text-slate-400">
                    No users yet
                </p>
            )}

            {/* LIST */}
            <div className="space-y-4">

                {users.map((u, index) => {
                    const isCurrentUser = u.clerkId === user?.id;

                    return (
                        <div
                            key={u._id}
                            className={`flex items-center justify-between px-6 py-4 rounded-xl border transition
                            ${
                                isCurrentUser
                                    ? "bg-cyan-500/10 border-cyan-400"
                                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                            }`}
                        >

                            {/* LEFT */}
                            <div className="flex items-center gap-4">

                                {/* RANK */}
                                <span className="text-lg font-semibold text-cyan-400">
                                    #{index + 1}
                                </span>

                                {/* USER INFO */}
                                <div>
                                    <p className="font-medium">
                                        {u.username || "Coder"}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-cyan-400">
                                                (You)
                                            </span>
                                        )}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {u.rank}
                                    </p>
                                </div>
                            </div>

                            {/* XP */}
                            <span className="text-yellow-400 font-semibold">
                                {u.xp} XP
                            </span>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default Leaderboard;