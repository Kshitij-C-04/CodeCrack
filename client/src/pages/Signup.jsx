import { SignUp } from "@clerk/clerk-react";

function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <SignUp routing="path" path="/signup" />
        </div>
    );
}

export default Signup;