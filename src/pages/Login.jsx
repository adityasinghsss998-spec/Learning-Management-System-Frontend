import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data.user, data.accessToken, data.refreshToken);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-bold text-slate-800">
                    Welcome back
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;