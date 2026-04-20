import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../utils/api";

function BugMode() {
    const { id } = useParams();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    const { user } = useUser();
    const userId = user?.id;
    const key = userId ? `solvedProblems_${userId}` : null;

    // ✅ FETCH PROBLEM
    const fetchProblem = useCallback(async () => {
        try {
            setError("");

            if (!id) return;

            const res = await axios.get(
                `${API}/api/problems/bug/${id}`
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

    // ✅ RUN CODE
    const runCode = async () => {
        if (!problem) return;

        try {
            setRunning(true);
            setOutput("Running...");

            const res = await axios.post(
                `${API}/api/submission`,
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

            // 🔥 UPDATED (REAL ERROR)
            setOutput(
                err.response?.data?.error ||
                err.response?.data?.message ||
                JSON.stringify(err.response?.data) ||
                "Error running code"
            );
        } finally {
            setRunning(false);
        }
    };

    // ✅ SUBMIT CODE
    const submitCode = async () => {
        if (!problem) return;

        try {
            const res = await axios.post(
                `${API}/api/submission`,
                {
                    code,
                    problemId: problem._id,
                    language_id: 63,
                    mode: "bug"
                }
            );

            setResult(res.data);

            if (res.data.success) {
                let solved = key
                    ? JSON.parse(localStorage.getItem(key) || "[]")
                    : [];

                const alreadySolved = solved.includes(problem._id);

                if (!alreadySolved) {
                    solved.push(problem._id);

                    if (key) {
                        localStorage.setItem(key, JSON.stringify(solved));
                    }

                    setOutput("🎉 All test cases passed!");
                } else {
                    setOutput("✅ Already solved (no XP)");
                    res.data.xp = 0;
                }

            } else {
                setOutput(
                    `❌ Expected: ${res.data.expected} | Got: ${res.data.got}`
                );
            }

        } catch (err) {
            console.error("SUBMIT ERROR:", err.response?.data || err.message);

            // 🔥 UPDATED (REAL ERROR)
            setOutput(
                err.response?.data?.error ||
                err.response?.data?.message ||
                JSON.stringify(err.response?.data) ||
                "Submission error"
            );
        }
    };

    // ✅ HIGHLIGHT BUG LINE
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

    // ❌ ERROR STATE
    if (error) {
        return <p className="text-red-400 p-6">{error}</p>;
    }

    // ⏳ LOADING
    if (!problem) {
        return <p className="text-slate-400 p-6">Loading...</p>;
    }

    return (
        <div className="min-h-screen grid grid-cols-2 gap-4 p-6 pb-20 overflow-auto">

            {/* LEFT PANEL */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-auto">
                <h2 className="text-2xl font-bold mb-3">{problem.title}</h2>

                <p
                    className={`mb-3 font-semibold ${
                        problem.difficulty === "easy"
                            ? "text-green-400"
                            : problem.difficulty === "medium"
                                ? "text-yellow-400"
                                : "text-red-400"
                    }`}
                >
                    {problem.difficulty?.toUpperCase()}
                </p>

                <p className="text-slate-400 whitespace-pre-line">
                    {problem.description}
                </p>

                {/* NEXT BUTTON */}
                <div className="mt-6">
                    <button
                        onClick={async () => {
                            try {
                                const res = await axios.get(
                                    `${API}/api/problems/bug`
                                );

                                const list = res.data;
                                const i = list.findIndex(
                                    p => p._id === problem._id
                                );
                                const next = list[i + 1] || list[0];

                                window.location.href = `/bug/${next._id}`;
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

            {/* RIGHT PANEL */}
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

                {/* BUTTONS */}
                <div className="mt-4 flex gap-4">
                    <button
                        onClick={runCode}
                        className="bg-slate-700 px-5 py-2 rounded-lg hover:bg-slate-600"
                    >
                        {running ? "Running..." : "Run"}
                    </button>

                    <button
                        onClick={submitCode}
                        className="bg-cyan-500 px-5 py-2 rounded-lg hover:bg-cyan-600"
                    >
                        Submit
                    </button>
                </div>

                {/* OUTPUT */}
                <div className="mt-4 bg-black rounded-lg p-4 text-sm font-mono text-green-400 min-h-[80px]">
                    {output || "Output will appear here..."}
                </div>

                {/* RESULT */}
                {result && (
                    <div className="mt-2">
                        <p className="font-semibold text-lg">
                            {result.success ? "✅ Correct Submission" : "❌ Wrong Answer"}
                        </p>

                        {result.success && result.xp && (
                            <p className="text-green-400 font-semibold">
                                +{result.xp} XP 🚀
                            </p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default BugMode;