import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, useNavigate } from "react-router-dom";

// ✅ Ignore cancellation errors
window.addEventListener("unhandledrejection", function (event) {
    if (
        event?.reason?.message === "canceled" ||
        event?.reason?.msg === "operation is manually canceled"
    ) {
        event.preventDefault();
    }
});

// ✅ FIX: use REACT_APP (CRA)
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// 🔥 Debug (important)
console.log("CLERK KEY 👉", PUBLISHABLE_KEY);

// 🔥 Wrapper
function ClerkWithRouter() {
    const navigate = useNavigate();

    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            navigate={(to) => navigate(to)}
        >
            <App />
        </ClerkProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
        <ClerkWithRouter />
    </BrowserRouter>
);