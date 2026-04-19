import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

function CodeEditor({ code, setCode, language = "javascript", height = "220px" }) {
    const monaco = useMonaco();
    const editorRef = useRef(null);

    // Disable JS errors (unchanged)
    useEffect(() => {
        if (monaco && language === "javascript") {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true,
            });
        }
    }, [monaco, language]);

    // Resize fix (unchanged but slightly improved timing)
    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        setTimeout(() => {
            editor.layout();
        }, 150);
    };

    return (
        <div
            style={{ height: "100%" }}
            className="h-full w-full"
        >
            <Editor
                onMount={handleEditorDidMount}
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                    fontSize: 15, // 🔥 slightly better readability
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    padding: { top: 12, bottom: 8 }, // 🔥 cleaner spacing
                    cursorSmoothCaretAnimation: true,
                    smoothScrolling: true,
                    tabSize: 2,
                }}
            />
        </div>
    );
}

export default CodeEditor;