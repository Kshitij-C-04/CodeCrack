import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CodeEditor from "../components/CodeEditor";
import API from "../utils/api";

function TimedMode() {
    const [started, setStarted] = useState(false);
    const [time, setTime] = useState(120);
    const [score, setScore] = useState(0);
    const [problem, setProblem] = useState(null);
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const endGame = useCallback(() => {
        alert(`⏱ Test Ended! Score: ${score}`);
        setStarted(false);
        setProblem(null);
    }, [score]);

    useEffect(() => {
        if (!started) return;

        if (time <= 0) {
            endGame();
            return;
        }

        const timer = setInterval(() => {
            setTime((t) => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [time, started, endGame]);

    const fetchProblem = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(`${API}/api/problems/random/all`);
            const data = res.data;

            setProblem(data);

            setAnswer(
                data.buggyCode ||
                data.functionSignature ||
                ""
            );

        } catch {
            setError("Backend not responding");
            setProblem(null);
        } finally {
            setLoading(false);
        }
    };

    const startGame = () => {
        setStarted(true);
        setTime(120);
        setScore(0);
        fetchProblem();
    };

    const executeJS = () => {
        try {
            if (problem?.language && problem.language !== "javascript") {
                throw new Error("Non-JS code");
            }

            let input =
                problem?.testInput ??
                problem?.input ??
                problem?.examples?.[0]?.input ??
                [];

            if (input === undefined || input === null) {
                input = [];
            }

            const fn = new Function("input", `
                ${answer}

                if (Array.isArray(input)) {
                    try {
                        return solution(input);
                    } catch {
                        return solution(...input);
                    }
                } else {
                    return solution(input);
                }
            `);

            let result = fn(input);

            if (result === undefined) return null;

            return result;

        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const runCode = () => {
        try {
            if (problem?.language === "sql") {
                alert("⚠️ SQL execution not supported");
                return;
            }

            if (problem?.language && problem.language !== "javascript") {
                alert("⚠️ This problem is not JavaScript");
                return;
            }

            const result = executeJS();
            alert("Output: " + JSON.stringify(result));

        } catch {
            alert("💥 Error in code");
        }
    };

    const submit = () => {
        if (!problem) return;

        try {
            const isOutputMode = !problem?.buggyCode && !problem?.functionSignature;

            if (isOutputMode) {
                if (String(answer).trim() === String(problem.answer).trim()) {
                    setScore((s) => s + 1);
                    fetchProblem();
                } else {
                    alert(`Wrong ❌\nExpected: ${problem.answer}`);
                }
                return;
            }

            if (problem?.language && problem.language !== "javascript") {
                alert("⚠️ Cannot run non-JS problem");
                return;
            }

            let result = executeJS();

            if (Array.isArray(result) && result.length === 0) result = "";
            if (result === null) result = "";

            if (String(result) === String(problem.answer)) {
                setScore((s) => s + 1);
                fetchProblem();
            } else {
                alert(
                    `Wrong ❌\nExpected: ${problem.answer}\nGot: ${result}`
                );
            }

        } catch {
            alert("💥 Error in code");
        }
    };

    if (!started) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl px-12 py-10 text-center shadow-2xl">

                    <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                        <span className="text-6xl">⏱</span>
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Timed Mode
                        </span>
                    </h1>

                    <p className="text-gray-400 mb-8 text-lg">
                        Solve as many problems as you can in <span className="text-white font-semibold">120 seconds</span> 🚀
                    </p>

                    <div className="flex justify-center gap-6 mb-8 text-sm text-gray-400">
                        <div>⚡ Fast-paced</div>
                        <div>🎯 Score-based</div>
                        <div>🔥 Mixed Mode</div>
                    </div>

                    <button
                        onClick={startGame}
                        className="bg-green-600 hover:bg-green-500 transition-all duration-200 px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-green-500/30"
                    >
                        🚀 Start Challenge
                    </button>

                </div>
            </div>
        );
    }

    const isOutputMode = !problem?.buggyCode && !problem?.functionSignature;

    return (
        <div className="h-screen flex flex-col bg-[#020617] text-white p-4">

            <div className="flex justify-between mb-4">
                <div className="text-green-400">🔥 Score: {score}</div>
                <div className="text-cyan-400">⏱ {time}s</div>
                <button onClick={endGame} className="bg-red-600 px-4 py-2 rounded">
                    End Test ❌
                </button>
            </div>

            {error && (
                <div className="bg-red-700 p-3 mb-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex-1 flex flex-col gap-4">

                <div className="bg-slate-800 p-4 rounded">
                    <div className="text-xs text-cyan-400 mb-2 uppercase">
                        {problem?.buggyCode
                            ? "Bug Fix"
                            : problem?.functionSignature
                                ? "Puzzle"
                                : "Output Prediction"}
                    </div>

                    <h2 className="text-xl font-bold mb-2">{problem?.title}</h2>
                    <p className="text-gray-300">{problem?.description}</p>
                </div>

                {/* ✅ FIXED SCHEMA DISPLAY */}
                {(problem?.tableSchema || problem?.schema) && (
                    <pre className="bg-black p-3 rounded text-green-400 whitespace-pre-wrap">
        {problem.tableSchema || problem.schema}
    </pre>
                )}
                {problem?.exampleInput && (
                    <pre className="bg-black p-3 rounded text-blue-400 whitespace-pre-wrap">
        {problem.exampleInput}
    </pre>
                )}

                {problem?.exampleOutput && (
                    <pre className="bg-black p-3 rounded text-yellow-400 whitespace-pre-wrap">
        {problem.exampleOutput}
    </pre>
                )}

                {problem?.code && (
                    <pre className="bg-black p-3 rounded text-green-400">
                        {problem.code}
                    </pre>
                )}

                {!isOutputMode && (
                    <div className="flex-1 bg-[#1e293b] rounded-xl overflow-hidden border border-slate-700">
                        <CodeEditor
                            code={answer}
                            setCode={setAnswer}
                            language="javascript"
                            height="100%"
                        />
                    </div>
                )}

                {isOutputMode && (
                    <input
                        className="w-full p-3 text-black rounded"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter output..."
                    />
                )}

                <div className="mt-auto pt-3 flex gap-3">
                    <button onClick={runCode} className="bg-slate-600 px-4 py-2 rounded">
                        Run
                    </button>

                    <button onClick={submit} className="bg-green-600 px-5 py-2 rounded">
                        Submit
                    </button>
                </div>

            </div>
        </div>
    );
}

export default TimedMode;