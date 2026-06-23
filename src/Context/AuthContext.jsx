import { createContext, useState, useEffect } from "react";
import api from '../api/axios';
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = (userData, token, refreshToken) => {
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async() => {
        try {
            await api.post("/auth/logout", { id: user?.id });
        } catch (e) {
            console.log("Logout request failed, clearing local session anyway");
        }
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    };

    const value = {
        user,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}