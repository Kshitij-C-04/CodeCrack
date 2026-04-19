import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import RankBadge from "./RankBadge";

function Navbar({ onRankClick }) {
    const location = useLocation();
    const { user } = useUser();

    const [userData, setUserData] = useState(null);

    const linkStyle = (path) =>
        `relative transition ${
            location.pathname === path
                ? "text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
        }`;

    const fetchUser = useCallback(async () => {
        if (!user?.id) return;

        try {
            const res = await axios.get(
                `http://localhost:5000/api/users/${user.id}`
            );

            setUserData(res.data);
            console.log("✅ Navbar XP Updated:", res.data.xp);

        } catch (err) {
            console.error("USER FETCH ERROR:", err);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const handleXPUpdate = () => {
            console.log("🔥 xpUpdated event received");
            fetchUser();
        };

        window.addEventListener("xpUpdated", handleXPUpdate);

        return () => {
            window.removeEventListener("xpUpdated", handleXPUpdate);
        };
    }, [fetchUser]);

    return (
        <div className="bg-slate-900 border-b border-slate-800 shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-cyan-400 tracking-wide hover:scale-105 transition"
                >
                    ⚡ CodeCrack
                </Link>

                <div className="flex items-center gap-8 text-sm font-medium">

                    {/* ✅ WHEN USER IS SIGNED IN */}
                    <SignedIn>
                        {userData && (
                            <div
                                onClick={onRankClick}
                                className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-all duration-300 cursor-pointer hover:bg-slate-700"
                            >
                                <RankBadge rank={userData.rank} />

                                <span className="text-yellow-400 font-semibold">
                                    {userData.xp || 0} XP
                                </span>
                            </div>
                        )}

                        <div className="ml-2">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>

                    {/* ❌ WHEN USER IS SIGNED OUT */}
                    <SignedOut>
                        {/* 🔥 FIXED ROUTES */}
                        <Link to="/sign-in" className="hover:text-cyan-400 text-slate-300">
                            Login
                        </Link>

                        <Link
                            to="/sign-up"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-md transition"
                        >
                            Signup
                        </Link>
                    </SignedOut>

                </div>
            </div>
        </div>
    );
}

export default Navbar;