import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                                <span className="text-xs font-bold text-white">N</span>
                            </div>
                            <span className="font-semibold text-white">Nexus</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500">
                            A production-grade LMS built with a polyrepo microservices
                            architecture. Seven independent services, one seamless experience.
                        </p>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Learn
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link to="/catalog" className="text-sm hover:text-white transition-colors">Browse Catalog</Link>
                            <Link to="/dashboard" className="text-sm hover:text-white transition-colors">My Dashboard</Link>
                            <Link to="/register" className="text-sm hover:text-white transition-colors">Get Started Free</Link>
                        </div>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Teach
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link to="/register" className="text-sm hover:text-white transition-colors">Become an Instructor</Link>
                            <Link to="/instructor" className="text-sm hover:text-white transition-colors">Instructor Dashboard</Link>
                        </div>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Built With
                        </p>
                        <div className="flex flex-col gap-2 text-sm">
                            <span>Node.js + Express</span>
                            <span>React + Vite + Tailwind</span>
                            <span>MongoDB + Redis</span>
                            <span>RabbitMQ + Socket.io</span>
                            <span>AWS S3 + Razorpay</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-slate-600">
                        © 2025 Nexus. Built by Aditya Kumar — IIIT Ranchi.
                    </p>
                    <p className="text-xs text-slate-600">
                        7 microservices · AWS S3 · RabbitMQ · Socket.io · Razorpay
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;