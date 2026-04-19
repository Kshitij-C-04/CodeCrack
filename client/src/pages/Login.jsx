import { SignIn } from "@clerk/clerk-react";

function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <SignIn routing="path" path="/login" />
        </div>
    );
}

export default Login;