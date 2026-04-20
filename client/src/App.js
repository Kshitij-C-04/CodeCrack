import { Routes, Route } from "react-router-dom";
import {
    SignedIn,
    SignedOut,
    RedirectToSignIn,
    SignUp,
    SignIn,
    useUser,
    useAuth
} from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import RankModal from "./components/RankModal";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Problem from "./pages/Problem";
import BugMode from "./pages/BugMode";
import ProblemsList from "./pages/ProblemsList";
import TimedMode from "./pages/TimedMode";
import Leaderboard from "./pages/Leaderboard";

function App() {
    const [showRank, setShowRank] = useState(false);
    const [userData, setUserData] = useState(null);

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (!isLoaded || !user?.id) return;

        const run = async () => {
            try {
                const token = await getToken();

                // 🔁 STEP 1: SYNC USER (ENSURE DB ENTRY EXISTS)
                await axios.post(
                    `${API}/api/users/sync`,
                    {
                        username: user?.username,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.primaryEmailAddress?.emailAddress
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // 🔁 STEP 2: FETCH USER (AFTER SYNC COMPLETES)
                const res = await axios.get(
                    `${API}/api/users/${user.id}`
                );

                setUserData(res.data);

                console.log("✅ User synced & fetched");

            } catch (err) {
                console.error("USER INIT ERROR:", err);
            }
        };

        run();

        const handleXPUpdate = async () => {
            try {
                const res = await axios.get(`${API}/api/users/${user.id}`);
                setUserData(res.data);
            } catch (err) {
                console.error("XP UPDATE ERROR:", err);
            }
        };

        window.addEventListener("xpUpdated", handleXPUpdate);

        return () => {
            window.removeEventListener("xpUpdated", handleXPUpdate);
        };

    }, [user?.id, isLoaded, getToken, API]);

    return (
        <div className="relative min-h-screen text-slate-200 bg-[#020617]">

            <Navbar onRankClick={() => setShowRank(true)} />

            <div className="px-6 py-6">
                <Routes>

                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />

                    <Route
                        path="/sign-up/*"
                        element={
                            <div className="flex items-center justify-center min-h-[80vh]">
                                <SignUp routing="path" path="/sign-up" />
                            </div>
                        }
                    />

                    <Route
                        path="/sign-in/*"
                        element={
                            <div className="flex items-center justify-center min-h-[80vh]">
                                <SignIn routing="path" path="/sign-in" />
                            </div>
                        }
                    />

                    <Route path="/problems/:mode" element={<ProblemsList />} />
                    <Route path="/bug" element={<ProblemsList />} />
                    <Route path="/puzzle" element={<ProblemsList />} />
                    <Route path="/output" element={<ProblemsList />} />
                    <Route path="/timed" element={<TimedMode />} />

                    <Route
                        path="/bug/:id"
                        element={
                            <>
                                <SignedIn><BugMode /></SignedIn>
                                <SignedOut><RedirectToSignIn /></SignedOut>
                            </>
                        }
                    />

                    <Route
                        path="/problem/:mode/:id"
                        element={
                            <>
                                <SignedIn><Problem /></SignedIn>
                                <SignedOut><RedirectToSignIn /></SignedOut>
                            </>
                        }
                    />

                    {/* 🔥 fallback */}
                    <Route path="*" element={<Home />} />

                </Routes>
            </div>

            <RankModal
                isOpen={showRank}
                onClose={() => setShowRank(false)}
                xp={userData?.xp || 0}
                rank={userData?.rank || "Bronze I"}
            />
        </div>
    );
}

export default App;