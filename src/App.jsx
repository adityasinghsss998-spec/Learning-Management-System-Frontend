import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Dashboard from "./pages/Dashboard";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="flex items-center justify-between bg-white p-4 shadow-sm">
            <div className="flex gap-6">
                <Link to="/" className="text-slate-700 hover:text-indigo-600">
                    Home
                </Link>
                <Link to="/catalog" className="text-slate-700 hover:text-indigo-600">
                    Catalog
                </Link>
                {isAuthenticated && (
                    <Link to="/dashboard" className="text-slate-700 hover:text-indigo-600">
                        Dashboard
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <span className="text-sm text-slate-500">
                            Hi, {user.name}
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-slate-700 hover:text-indigo-600">
                            Login
                        </Link>
                        <Link to="/register" className="text-slate-700 hover:text-indigo-600">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;