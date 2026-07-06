import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

const CATEGORY_ICONS = {
    development: "💻",
    design: "🎨",
    business: "📊",
    marketing: "📣",
    other: "📚",
};

const CATEGORY_GRADIENTS = {
    development: "from-indigo-500 to-indigo-700",
    design: "from-pink-500 to-rose-600",
    business: "from-amber-500 to-orange-600",
    marketing: "from-teal-500 to-emerald-600",
    other: "from-slate-500 to-slate-700",
};

function Catalog() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState("");
    const [sort, setSort] = useState("");

    const { data: courses, isLoading, error } = useQuery({
        queryKey: ["courses", search, category, level, sort],
        queryFn: async () => {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            if (level) params.level = level;
            if (sort) params.sort = sort;
            const res = await api.get("/courses", { params });
            return res.data.data || res.data || [];
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
                    <p className="mt-2 text-slate-500">
                        {courses?.length
                            ? `${courses.length} course${courses.length === 1 ? "" : "s"} available`
                            : "Discover something new"}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-48">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search courses..."
                                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="">All categories</option>
                            <option value="development">💻 Development</option>
                            <option value="design">🎨 Design</option>
                            <option value="business">📊 Business</option>
                            <option value="marketing">📣 Marketing</option>
                            <option value="other">📚 Other</option>
                        </select>

                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="">All levels</option>
                            <option value="beginner">🟢 Beginner</option>
                            <option value="intermediate">🟡 Intermediate</option>
                            <option value="advanced">🔴 Advanced</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="">Sort: Newest</option>
                            <option value="popular">Most Popular</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8">
                {isLoading && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse rounded-xl bg-white shadow-sm">
                                <div className="h-40 rounded-t-xl bg-slate-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                                    <div className="h-3 w-1/4 rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center">
                        <p className="text-red-600 font-medium">Failed to load courses</p>
                        <p className="text-sm text-red-400 mt-1">Make sure the backend is running</p>
                    </div>
                )}

                {!isLoading && courses?.length === 0 && (
                    <div className="rounded-xl bg-white border border-slate-100 p-12 text-center">
                        <span className="text-4xl">🔍</span>
                        <p className="mt-4 font-medium text-slate-700">No courses found</p>
                        <p className="text-sm text-slate-400 mt-1">Try different filters or search terms</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses?.map((course, index) => (
                        <motion.div
                            key={course._id || course.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                to={`/courses/${course._id || course.id}`}
                                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.other}`}>
                                    <span className="text-5xl drop-shadow">
                                        {CATEGORY_ICONS[course.category] || CATEGORY_ICONS.other}
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                                            {course.title}
                                        </p>
                                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                            course.level === "beginner" ? "bg-emerald-50 text-emerald-700" :
                                            course.level === "intermediate" ? "bg-amber-50 text-amber-700" :
                                            "bg-red-50 text-red-700"
                                        }`}>
                                            {course.level}
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-sm text-slate-400">
                                        by {course.instructorName}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                        <span>📖 {course.totalLessons || 0} lessons</span>
                                        <span>·</span>
                                        <span>👥 {course.totalStudents || 0} students</span>
                                    </div>

                                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
                                        <span className="text-base font-bold text-indigo-600">
                                            {course.price === 0 ? "Free" : `₹${course.price}`}
                                        </span>
                                        <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            View course →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Catalog;