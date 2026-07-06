import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
import { useNavigate } from "react-router-dom";
import LiveSession from "./pages/LiveSession";
function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
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

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                            <span className="text-xs font-bold text-white">N</span>
                        </div>
                        <span className="text-base font-semibold text-slate-800">Nexus</span>
                    </button>

                    <div className="flex items-center gap-6">
                        <Link to="/catalog" className="text-sm text-slate-500 transition-colors hover:text-slate-800">
                            Catalog
                        </Link>
                        {isAuthenticated && user?.role === "instructor" && (
                            <Link to="/instructor" className="text-sm text-slate-500 transition-colors hover:text-slate-800">
                                Teach
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to={user?.role === "instructor" ? "/instructor" : "/dashboard"}
                                className="text-sm text-slate-500 transition-colors hover:text-slate-800"
                            >
                                Dashboard
                            </Link>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 ring-2 ring-transparent transition-all hover:ring-indigo-300"
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-slate-200/60">
                                        <div className="border-b border-slate-100 px-4 py-3">
                                            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                                            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                                        </div>

                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    navigate(user?.role === "instructor" ? "/instructor" : "/dashboard");
                                                    setShowDropdown(false);
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                            >
                                                <span>📊</span> Dashboard
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/catalog");
                                                    setShowDropdown(false);
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                            >
                                                <span>📚</span> Browse Catalog
                                            </button>
                                        </div>

                                        <div className="border-t border-slate-100 py-1">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowDropdown(false);
                                                    navigate("/");
                                                }}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                                            >
                                                <span>🚪</span> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm text-slate-500 transition-colors hover:text-slate-800">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
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