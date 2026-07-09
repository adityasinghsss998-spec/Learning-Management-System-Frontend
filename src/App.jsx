
import { useAuth } from "./hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetail from "./pages/Coursedetail";
import LessonPlayer from "./pages/LessonPlayer";
import ManageCourse from "./pages/ManageCourse";
import InstructorDashboard from "./pages/InstructorDashboard";
import LiveSession from "./pages/LiveSession";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 flex-shrink-0"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
                            <span className="text-sm font-bold text-white">N</span>
                        </div>
                        <span className="text-base font-bold text-slate-800">Nexus</span>
                    </button>

                    <div className="flex items-center gap-1">
                        <Link
                            to="/catalog"
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                isActive("/catalog")
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            }`}
                        >
                            Catalog
                        </Link>
                        {isAuthenticated && user?.role === "instructor" && (
                            <Link
                                to="/instructor"
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    isActive("/instructor")
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                            >
                                Teach
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to={user?.role === "instructor" ? "/instructor" : "/dashboard"}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    isActive("/dashboard") || isActive("/instructor")
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                            >
                                Dashboard
                            </Link>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-200 ring-2 transition-all ${
                                        showDropdown ? "ring-indigo-400" : "ring-transparent hover:ring-indigo-300"
                                    }`}
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-1 shadow-xl shadow-slate-200/60">
                                        <div className="border-b border-slate-100 px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                                            <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role} account</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    navigate(user?.role === "instructor" ? "/instructor" : "/dashboard");
                                                    setShowDropdown(false);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="text-base">📊</span>
                                                <span>Dashboard</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/catalog");
                                                    setShowDropdown(false);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="text-base">📚</span>
                                                <span>Browse Catalog</span>
                                            </button>
                                        </div>
                                        <div className="border-t border-slate-100 py-1">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowDropdown(false);
                                                    navigate("/");
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <span className="text-base">🚪</span>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/learn/:courseId"
                            element={
                                <ProtectedRoute>
                                    <LessonPlayer />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/live/:courseId"
                            element={
                                <ProtectedRoute>
                                    <LiveSession />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/instructor"
                            element={
                                <ProtectedRoute allowedRoles={["instructor"]}>
                                    <InstructorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/instructor/courses/:id"
                            element={
                                <ProtectedRoute allowedRoles={["instructor"]}>
                                    <ManageCourse />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;