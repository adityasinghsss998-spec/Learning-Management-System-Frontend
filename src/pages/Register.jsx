import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword,setShowPassword]=useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", { name, email, password, role });

            const { data } = await api.post("/auth/login", { email, password });
            login(data.user, data.accessToken, data.refreshToken);
            if(data.user.role==="instructor"){
                navigate("/instructor");
            }
            else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-bold text-slate-800">
                    Create your account
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-600">
                            Full name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="Aditya Kumar"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600">
                            Password
                        </label>
                        
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="mt-1 text-sm text-indigo-600 hover:underline"
                        >
                            {showPassword ? "Hide" : "Show"} Password
                        </button>
                
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-600">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    role === "student"
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                        : "border-slate-200 text-slate-500"
                                }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("instructor")}
                                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    role === "instructor"
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                        : "border-slate-200 text-slate-500"
                                }`}
                            >
                                Instructor
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;