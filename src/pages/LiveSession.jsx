import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

function LiveSession() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const socket = io("http://localhost:3006");
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("join:room", { room: courseId, userId: user.id });
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("presence", (members) => {
            setOnlineUsers(members);
        });

        return () => {
            socket.disconnect();
        };
    }, [courseId, user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        socketRef.current.emit("send:message", {
            room: courseId,
            message: messageInput,
            userId: user.name,
        });

        setMessageInput("");
    };

    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
                <button
                    onClick={() => navigate(`/learn/${courseId}`)}
                    className="text-sm text-slate-400 hover:text-slate-600"
                >
                    ← Back to course
                </button>

                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isConnected ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                    />
                    <span className="text-sm text-slate-500">
                        {isConnected ? "Connected" : "Connecting..."}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {messages.length === 0 && (
                            <p className="text-center text-sm text-slate-400">
                                No messages yet. Say hello 👋
                            </p>
                        )}

                        <div className="flex flex-col gap-2">
                            {messages.map((msg, index) => {
                                const isMe = msg.userId === user.name;
                                return (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            isMe ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs rounded-xl px-4 py-2 text-sm ${
                                                isMe
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-white text-slate-700 shadow-sm"
                                            }`}
                                        >
                                            {!isMe && (
                                                <p className="mb-1 text-xs font-medium text-indigo-500">
                                                    {msg.userId}
                                                </p>
                                            )}
                                            <p>{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form
                        onSubmit={handleSend}
                        className="flex gap-3 border-t border-slate-200 bg-white p-4"
                    >
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Send
                        </button>
                    </form>
                </div>

                <div className="w-56 flex-shrink-0 border-l border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Online ({onlineUsers.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {onlineUsers.map((userId) => (
                            <div
                                key={userId}
                                className="flex items-center gap-2 text-sm text-slate-600"
                            >
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {userId}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveSession;