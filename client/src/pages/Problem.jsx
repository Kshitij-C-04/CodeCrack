import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import CodeEditor from "../components/CodeEditor";
import XPGainPopup from "../components/XPGainPopup";

function Problem() {
    const { mode, id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    const [xpGained, setXpGained] = useState(0);
    const [rankUp, setRankUp] = useState(false);

    const { user } = useUser();
    const key = user ? `solvedProblems_${user.id}` : null;

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/problems/${mode}/${id}`
                );

                const data = res.data;
                console.log("PROBLEM:", data);

                setProblem(data);

                if (mode === "bug") {
                    setAnswer(data.buggyCode || "");
                } else if (mode === "puzzle") {
                    setAnswer(data.functionSignature || "");
                } else if (mode === "output") {
                    setAnswer("");
                } else {
                    setAnswer(data.code || "");
                }

                setResult(null);
                setXpGained(0);
                setRankUp(false);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [mode, id]);

    const handleAnswerSubmit = async () => {
        if (!problem?._id || !user?.id) return;

        try {
            const res = await axios.post(
                "http://localhost:5000/api/submission",
                {
                    code: answer,
                    problemId: problem._id,
                    mode: "output",
                    clerkId: user.id
                }
            );

            const data = res.data;

            if (data.success) {
                setResult({ output: "🎉 Correct! Well done!" });

                const gained =
                    data.message === "Already solved"
                        ? 0
                        : (data.xpGained ?? 0);

                setXpGained(gained);
                setRankUp(data.rankUp || false);

                // 🔥 FIX: ensure instant update everywhere
                window.dispatchEvent(new Event("xpUpdated"));

                if (key) {
                    const solved = JSON.parse(localStorage.getItem(key) || "[]");
                    if (!solved.includes(problem._id)) {
                        solved.push(problem._id);
                        localStorage.setItem(key, JSON.stringify(solved));
                    }
                }

            } else {
                setResult({
                    output: "😬 Not quite right...",
                    details: `Expected: ${data.expected}, Got: ${data.got}`
                });
            }

        } catch (err) {
            console.error(err);
            setResult({ output: "⚠️ Submission error" });
        }
    };

    const runCode = async () => {
        if (!problem?._id || !user?.id) return;

        try {
            const res = await axios.post(
                "http://localhost:5000/api/submission",
                {
                    code: answer,
                    problemId: problem._id,
                    clerkId: user.id,
                    mode: mode
                }
            );

            const data = res.data;

            if (data.success) {
                setResult({ output: "🎉 Correct! Well done!" });

                const gained =
                    data.message === "Already solved"
                        ? 0
                        : (data.xpGained ?? 0);

                setXpGained(gained);
                setRankUp(data.rankUp || false);

                // 🔥 FIX HERE ALSO
                window.dispatchEvent(new Event("xpUpdated"));

            } else if (data.expected) {
                setResult({
                    output: "😬 Not quite right...",
                    details: `Expected: ${data.expected}, Got: ${data.got}`
                });
            } else if (data.error) {
                setResult({
                    output: "💥 Runtime Error",
                    details: data.error
                });
            }

        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-white p-6">Loading...</div>;
    if (!problem) return <div className="text-white p-6">Error</div>;

    let displayCode = "⚠️ No code";

    if (mode === "output") {
        displayCode = problem.code || "⚠️ Missing output code";
    } else if (mode === "bug") {
        displayCode = problem.buggyCode || "⚠️ Missing buggy code";
    } else if (mode === "puzzle") {
        displayCode = problem.functionSignature || "⚠️ Missing function signature";
    }

    // ================= OUTPUT MODE =================
    if (mode === "output") {
        return (
            <div className="h-screen flex bg-[#0f172a] text-white">

                {/* ✅ POPUP ADDED HERE */}
                <XPGainPopup xp={xpGained} rankUp={rankUp} />

                <div className="w-1/2 p-8 border-r border-slate-700 overflow-y-auto">
                    <button onClick={() => navigate(`/problems/${mode}`)} className="mb-4 bg-slate-700 px-3 py-1 rounded">
                        Back
                    </button>

                    <h2 className="text-3xl font-bold mb-3">{problem.title}</h2>

                    <p className="whitespace-pre-line text-gray-300 mb-6">
                        {problem.description}
                    </p>

                    <pre className="bg-black p-4 rounded text-green-400">
                        {displayCode}
                    </pre>

                    <div className="mt-6">
                        <button
                            onClick={async () => {
                                const res = await axios.get(`http://localhost:5000/api/problems/${mode}`);
                                const list = res.data || [];
                                const i = list.findIndex(p => p._id === problem._id);
                                const next = list[i + 1] || list[0];
                                if (next?._id) navigate(`/problem/${mode}/${next._id}`);
                            }}
                            className="bg-slate-700 px-4 py-2 rounded-lg"
                        >
                            Next Problem
                        </button>
                    </div>
                </div>

                <div className="w-1/2 flex items-center justify-center">
                    <div className="space-y-4 w-[300px]">
                        <input
                            className="w-full p-3 rounded text-black"
                            value={answer}
                            placeholder="Predict output"
                            onChange={(e) => setAnswer(e.target.value)}
                        />

                        <button
                            onClick={handleAnswerSubmit}
                            className="w-full bg-green-600 py-2 rounded"
                        >
                            Submit
                        </button>

                        <p>{result?.output}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ================= BUG + PUZZLE =================
    return (
        <div className="h-screen flex gap-4 p-4 bg-[#0f172a] text-white">

            <XPGainPopup xp={xpGained} rankUp={rankUp} />

            <div className="w-1/2 bg-[#1e293b] rounded-xl p-6 overflow-y-auto">
                <button onClick={() => navigate(`/problems/${mode}`)} className="mb-4 bg-slate-700 px-3 py-1 rounded">
                    Back
                </button>

                <h2 className="text-2xl font-bold">{problem.title}</h2>

                <p className="text-slate-300 mt-3 whitespace-pre-line">
                    {problem.description}
                </p>

                {mode === "puzzle" && (
                    <div className="mt-6 space-y-4 text-sm">

                        {problem.schema && (
                            <div>
                                <h3 className="font-semibold">Schema</h3>
                                <pre className="bg-black p-3 rounded mt-1 text-green-400">
                                    {problem.schema}
                                </pre>
                            </div>
                        )}

                        {problem.exampleInput && (
                            <div>
                                <h3 className="font-semibold">Example Input</h3>
                                <pre className="bg-black p-3 rounded mt-1">
                                    {problem.exampleInput}
                                </pre>
                            </div>
                        )}

                        {problem.exampleOutput && (
                            <div>
                                <h3 className="font-semibold">Example Output</h3>
                                <pre className="bg-black p-3 rounded mt-1">
                                    {problem.exampleOutput}
                                </pre>
                            </div>
                        )}

                        {problem.hint && (
                            <div>
                                <h3 className="font-semibold">Hint</h3>
                                <p>{problem.hint}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={async () => {
                            const res = await axios.get(`http://localhost:5000/api/problems/${mode}`);
                            const list = res.data || [];
                            const i = list.findIndex(p => p._id === problem._id);
                            const next = list[i + 1] || list[0];
                            if (next?._id) navigate(`/problem/${mode}/${next._id}`);
                        }}
                        className="bg-slate-700 px-4 py-2 rounded-lg"
                    >
                        Next Problem
                    </button>
                </div>
            </div>

            <div className="w-1/2 flex flex-col gap-4">
                <CodeEditor
                    code={answer}
                    setCode={setAnswer}
                    language={problem.language || "javascript"}
                    height="100%"
                />

                <div className="flex gap-4">
                    <button onClick={runCode} className="bg-slate-700 px-5 py-2 rounded-lg">
                        Run
                    </button>

                    <button onClick={runCode} className="bg-cyan-500 px-5 py-2 rounded-lg">
                        Submit
                    </button>
                </div>

                <div className="bg-black border border-slate-700 rounded-xl p-4 min-h-[120px] font-mono text-green-400">
                    {result?.output || "Output will appear here..."}
                </div>
            </div>
        </div>
    );
}

export default Problem;