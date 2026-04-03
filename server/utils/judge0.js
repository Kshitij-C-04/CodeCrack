export const runCode = async (code, language_id, input) => {
    try {
        let parsedInput = input;

        // ✅ Try parsing JSON (for arrays, objects, numbers)
        try {
            parsedInput = JSON.parse(input);
        } catch {
            parsedInput = input;
        }

        // ✅ FORCE NUMBER if it's numeric string (CRITICAL FIX)
        if (
            typeof parsedInput === "string" &&
            parsedInput.trim() !== "" &&
            !isNaN(parsedInput)
        ) {
            parsedInput = Number(parsedInput);
        }

        // ✅ EXECUTE USER CODE
        const func = new Function("input", `
            ${code}

            if (typeof solution !== "function") {
                throw new Error("solution() not defined");
            }

            return solution(input);
        `);

        const result = func(parsedInput);

        // ✅ HANDLE undefined/null safely
        return {
            stdout: result !== undefined && result !== null
                ? String(result)
                : ""
        };

    } catch (err) {
        return {
            stderr: err.message || "Runtime Error"
        };
    }
};