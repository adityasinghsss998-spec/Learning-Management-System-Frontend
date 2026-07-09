import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InstructorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === "student") {
            navigate("/dashboard", { replace: true });
        }
    }, [user]);

    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createError, setCreateError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("development");
    const [level, setLevel] = useState("beginner");

    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState("");

    const handleGenerateDescription = async () => {
        if (!title.trim()) {
            setGenerateError("Enter a course title first");
            return;
        }
        setIsGenerating(true);
        setGenerateError("");
        try {
            const res = await api.post("/ai/describe", {
                title,
                topics: category,
            });
            const data = res.data.data || res.data;
            setDescription(data.description);
        } catch (e) {
            setGenerateError("AI generation failed — try again");
        } finally {
            setIsGenerating(false);
        }
    };

    const { data: courses, isLoading } = useQuery({
        queryKey: ["myCourses"],
        queryFn: async () => {
            const res = await api.get("/courses/my");
            return res.data.data || res.data;
        }
    });

    const { mutate: createCourse, isPending: isCreating } = useMutation({
        mutationFn: async () => {
            const res = await api.post("/courses", {
                title,
                description,
                price: Number(price),
                category,
                level,
            });
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myCourses"] });
            setTitle("");
            setDescription("");
            setPrice(0);
            setCreateError("");
            setShowCreateForm(false);
        },
        onError: (err) => {
            setCreateError(err.response?.data?.message || "Failed to create course");
        },
    });

    const { mutate: togglePublish } = useMutation({
        mutationFn: async (courseId) => {
            const res = await api.patch(`/courses/${courseId}/publish`);
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myCourses"] });
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Your Courses
                    </h1>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        {showCreateForm ? "Cancel" : "+ New Course"}
                    </button>
                </div>

                {showCreateForm && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createCourse();
                        }}
                        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm"
                    >
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Course title"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-500">Description</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating || !title.trim()}
                                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 transition-colors"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin">⟳</span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <span>✨</span>
                                            Auto-generate with AI
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                placeholder="Describe what students will learn..."
                                rows={3}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                            {generateError && (
                                <p className="text-xs text-red-500">{generateError}</p>
                            )}
                            {description && !isGenerating && (
                                <p className="text-xs text-emerald-600">✓ AI-generated description ready — edit if needed</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min={0}
                                placeholder="Price (0 = free)"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            >
                                <option value="development">Development</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                                <option value="marketing">Marketing</option>
                                <option value="other">Other</option>
                            </select>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        {createError && (
                            <p className="text-sm text-red-500">{createError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="self-start rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isCreating ? "Creating..." : "Create Course"}
                        </button>
                    </form>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    {isLoading && <p className="text-slate-400">Loading...</p>}

                    {courses?.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                        >
                            <div>
                                <p className="font-medium text-slate-800">
                                    {course.title}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {course.sections?.length || 0} sections ·{" "}
                                    {course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 0} lessons ·{" "}
                                    {course.price === 0 ? "Free" : `₹${course.price}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        course.isPublished
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                    {course.isPublished ? "Published" : "Draft"}
                                </span>
                                <button
                                    onClick={() => togglePublish(course.id)}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    {course.isPublished ? "Unpublish" : "Publish"}
                                </button>
                                <Link
                                    to={`/instructor/courses/${course.id}`}
                                    className="text-sm text-slate-500 hover:text-slate-700"
                                >
                                    Manage →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InstructorDashboard;