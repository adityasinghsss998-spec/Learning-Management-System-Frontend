import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { motion } from "framer-motion";

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
            return res.data.data;
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Course Catalog</h1>
                <p className="mt-2 text-slate-500">
                   Browse {courses?.length || ""} courses across development, design, and more.
                   </p>
               </div>

                <div className="mb-8 flex flex-wrap gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="">All categories</option>
                        <option value="development">Development</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="">All levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="">Sort: Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>

                {isLoading && <p className="text-slate-400">Loading courses...</p>}
                {error && (
                    <p className="text-red-500">
                        Failed to load courses. Please try again.
                    </p>
                )}
                {courses && courses.length === 0 && (
                    <p className="text-slate-400">No courses found.</p>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses?.map((course,index) => (

                 <motion.div
                         key={course.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            
                            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600">
                                <span className="text-sm font-medium text-white">
                                    {course.category}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="mb-1 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-800">
                                        {course.title}
                                    </h3>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">
                                        {course.level}
                                    </span>
                                </div>
                                <p className="mb-3 text-sm text-slate-500">
                                    by {course.instructorName}
                                </p>
                                <div className="flex items-center justify-between">
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
        </div>
    );
}

export default Catalog;