import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import XPGainPopup from "../components/XPGainPopup"; // ✅ ADDED

function BugMode() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);

    // ✅ ADDED STATES
    const [xpGained, setXpGained] = useState(0);
    const [rankUp, setRankUp] = useState(false);

    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (user?.id) {
            axios
                .get(`http://localhost:5000/api/users/${user.id}`)
                .then(res => setUserData(res.data))
                .catch(err => console.error("USER FETCH ERROR:", err));
        }
    }, [user]);

    useEffect(() => {
        const refetch = () => {
            if (user?.id) {
                axios
                    .get(`http://localhost:5000/api/users/${user.id}`)
                    .then(res => setUserData(res.data));
            }
        };

        window.addEventListener("xpUpdated", refetch);
        return () => window.removeEventListener("xpUpdated", refetch);
    }, [user]);

    const fetchProblem = useCallback(async () => {
        try {
            setError("");

            if (!id) return;

            const res = await axios.get(
                `http://localhost:5000/api/problems/bug/${id}`
            );

            if (!res.data) {
                setError("Problem not found");
                return;
            }

            setProblem(res.data);
            setCode(res.data.buggyCode || res.data.code || "");
            setResult(null);
            setOutput("");

        } catch (err) {
            console.error("FETCH ERROR:", err.response?.data || err.message);
            setError("Failed to load problem");
        }
    }, [id]);

    useEffect(() => {
        if (!id) {
            window.location.href = "/problems/bug";
        } else {
            fetchProblem();
        }
    }, [id, fetchProblem]);

    const runCode = async () => {
        if (!problem) return;

        try {
            setRunning(true);
            setOutput("Running...");

            const res = await axios.post(
                "http://localhost:5000/api/submission",
                {
                    code,
                    problemId: problem._id,
                    language_id: 63,
                    mode: "bug"
                }
            );

            if (res.data.success) {
                setOutput("✅ Passed sample test");
            } else {
                setOutput(
                    `❌ Expected: ${res.data.expected} | Got: ${res.data.got}`
                );
            }

        } catch (err) {
            console.error("RUN ERROR:", err.response?.data || err.message);
            setOutput("⚠️ Error running code");
        } finally {
            setRunning(false);
        }
    };

    const submitCode = async () => {
        if (!problem) return;

        if (!user?.id) {
            setOutput("⚠️ User not loaded. Please wait.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:5000/api/submission",
                {
                    code,
                    problemId: problem._id,
                    language_id: 63,
                    mode: "bug",
                    clerkId: user.id
                }
            );

            setResult(res.data);

            if (res.data.success) {
                if (res.data.message === "Already solved") {
                    setOutput("✅ Already solved (no XP)");
                    setXpGained(0);
                } else {
                    setOutput("🎉 All test cases passed! XP: " + (res.data.xp || 0));

                    // ✅ POPUP VALUES
                    setXpGained(res.data.xpGained || 0);
                    setRankUp(res.data.rankUp || false);
                }

                window.dispatchEvent(new Event("xpUpdated"));

            } else {
                setOutput(
                    `❌ Expected: ${res.data.expected} | Got: ${res.data.got}`
                );
            }

        } catch (err) {
            console.error("❌ SUBMIT ERROR:", err.response?.data || err.message);
            setOutput("⚠️ Submission error");
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
        editor.focus();

        const model = editor.getModel();
        const lines = model.getLinesContent();

        lines.forEach((line, index) => {
            if (line.includes("-")) {
                editor.deltaDecorations([], [
                    {
                        range: new monaco.Range(index + 1, 1, index + 1, 1),
                        options: {
                            isWholeLine: true,
                            className: "bg-red-500/20",
                        },
                    },
                ]);
            }
        });
    };

    if (!isLoaded) {
        return <p className="text-slate-400 p-6">Loading user...</p>;
    }

    if (error) {
        return <p className="text-red-400 p-6">{error}</p>;
    }

    if (!problem) {
        return <p className="text-slate-400 p-6">Loading...</p>;
    }

    return (
        <div className="min-h-screen grid grid-cols-2 gap-4 p-6 pb-20 overflow-auto">

            {/* ✅ POPUP ADDED */}
            <XPGainPopup xp={xpGained} rankUp={rankUp} />

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-auto">

                <button
                    onClick={() => navigate("/problems/bug")}
                    className="mb-4 bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
                >
                    Back
                </button>

                <h2 className="text-2xl font-bold mb-3">{problem.title}</h2>

                <p className="mb-3 font-semibold text-green-400">
                    {problem.difficulty?.toUpperCase()}
                </p>

                <p className="text-slate-400 whitespace-pre-line">
                    {problem.description}
                </p>

                <div className="mt-6">
                    <button
                        onClick={async () => {
                            try {
                                const res = await axios.get(
                                    "http://localhost:5000/api/problems/bug"
                                );

                                const list = res.data;
                                const i = list.findIndex(
                                    p => p._id === problem._id
                                );

                                const next = list[i + 1] || list[0];

                                if (next?._id) {
                                    navigate(`/bug/${next._id}`);
                                }

                            } catch (err) {
                                console.error("NEXT ERROR:", err);
                            }
                        }}
                        className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
                    >
                        Next Problem
                    </button>
                </div>
            </div>

            <div className="flex flex-col pb-10">
                <div className="flex-1 border border-slate-700 rounded-lg overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            automaticLayout: true,
                            wordWrap: "on",
                        }}
                    />
                </div>

                <div className="mt-4 flex gap-4">
                    <button onClick={runCode} className="bg-slate-700 px-5 py-2 rounded-lg">
                        {running ? "Running..." : "Run"}
                    </button>

                    <button onClick={submitCode} className="bg-cyan-500 px-5 py-2 rounded-lg">
                        Submit
                    </button>
                </div>

                <div className="mt-4 bg-black rounded-lg p-4 text-green-400 min-h-[80px]">
                    {output || "Output will appear here..."}
                </div>
            </div>
        </div>
    );
}

export default BugMode;