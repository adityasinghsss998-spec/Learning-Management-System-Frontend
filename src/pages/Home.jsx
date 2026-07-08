import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../api/axios";

function HeroBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let W, H, nodes, raf;
        const NODE_COUNT = 38;
        const MAX_DIST = 160;
        const COLORS = ["#4f46e5", "#0d9488", "#6366f1", "#14b8a6"];

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };

        const makeNode = () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2.5 + 1.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            pulse: Math.random() * Math.PI * 2,
        });

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            const t = performance.now() / 1000;
            nodes.forEach((n) => {
                const pulse = Math.sin(t * 0.8 + n.pulse) * 0.4 + 0.6;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
                ctx.fillStyle = n.color;
                ctx.globalAlpha = 0.55 * pulse;
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * pulse + 3, 0, Math.PI * 2);
                ctx.fillStyle = n.color;
                ctx.globalAlpha = 0.08;
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        };

        const update = () => {
            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -20) n.x = W + 20;
                if (n.x > W + 20) n.x = -20;
                if (n.y < -20) n.y = H + 20;
                if (n.y > H + 20) n.y = -20;
            });
        };

        const loop = () => {
            update();
            draw();
            raf = requestAnimationFrame(loop);
        };

        resize();
        nodes = Array.from({ length: NODE_COUNT }, makeNode);
        loop();

        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
        />
    );
}

function Home() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true }); 
        }
    }, [isAuthenticated, navigate]);
    const { data: courses } = useQuery({
        queryKey: ["courses", "", "", "", "popular"],
        queryFn: async () => {
            const res = await api.get("/courses", {
                params: { sort: "popular" },
            });
            return res.data.data || res.data || [];
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative overflow-hidden bg-white">
                <HeroBackground />

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-100 opacity-30 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-100 opacity-25 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-600">
                            Built for serious learners
                        </span>

                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900">
                            Learn without limits on{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                                Nexus
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
                            Structured courses from real instructors. Track your progress,
                            join live sessions, and earn certificates that mean something.
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-4">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate("/catalog")}
                                    className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
                                >
                                    Browse Catalog
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                                    >
                                        Start Learning Free
                                    </Link>
                                    <Link
                                        to="/catalog"
                                        className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-3 font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        Browse Catalog
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-16 grid grid-cols-3 gap-6 text-left"
                    >
                        {[
                            {
                                icon: "▶",
                                title: "Video + PDF lessons",
                                desc: "High quality content uploaded directly by instructors",
                            },
                            {
                                icon: "🎯",
                                title: "Track your progress",
                                desc: "Mark lessons complete and watch your progress grow",
                            },
                            {
                                icon: "💬",
                                title: "Live doubt sessions",
                                desc: "Real-time chat with instructors when you're stuck",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border border-slate-100 bg-white/70 backdrop-blur-sm p-5"
                            >
                                <span className="text-2xl">{feature.icon}</span>
                                <p className="mt-3 font-semibold text-slate-800">
                                    {feature.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {courses && courses.length > 0 && (
                <div className="mx-auto max-w-5xl px-6 py-16">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Popular courses
                        </h2>
                        <Link
                            to="/catalog"
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.slice(0, 3).map((course, index) => (
                            <motion.div
                                key={course._id || course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/courses/${course._id || course.id}`}
                                    className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700">
                                        <span className="text-4xl">
                                            {course.category === "development" ? "💻" :
                                             course.category === "design" ? "🎨" :
                                             course.category === "business" ? "📊" : "📚"}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-slate-800 group-hover:text-indigo-600">
                                                {course.title}
                                            </p>
                                            <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                                                {course.level}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-400">
                                            by {course.instructorName}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-semibold text-indigo-600">
                                                {course.price === 0 ? "Free" : `₹${course.price}`}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {course.totalLessons} lessons
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                            <span className="text-xs font-bold text-white">N</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Nexus</span>
                    </div>
                    <p className="text-sm text-slate-400">
                        Built with Node.js microservices + React
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Home;