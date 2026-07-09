import { useQuery, useQueries } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === "instructor") {
            navigate("/instructor", { replace: true });
        }
    }, [user, navigate]);

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ["myEnrollments"],
        queryFn: async () => {
            const res = await api.get("/enrollments/my");
            return res.data.data || res.data || [];
        },
    });

    const courseQueries = useQueries({
        queries: (enrollments || []).map((enrollment) => ({
            queryKey: ["course", enrollment.courseId],
            queryFn: async () => {
                const res = await api.get(`/courses/${enrollment.courseId}`);
                return res.data.data || res.data;
            },
            enabled: !!enrollment?.courseId,
        })),
    });

    const isLoadingCourses = courseQueries.some((q) => q.isLoading);

    const enrolledCourses = (enrollments || [])
        .map((enrollment, index) => ({
            enrollment,
            course: courseQueries[index]?.data,
        }))
        .filter((item) => item.course);

    const inProgressCount = enrollments?.filter((e) => !e.completed).length || 0;
    const completedCount = enrollments?.filter((e) => e.completed).length || 0;
    const certificatesCount = enrollments?.filter((e) => e.certificateUrl).length || 0;

    const { data: allCourses } = useQuery({
        queryKey: ["allPublicCourses"],
        queryFn: async () => {
            const res = await api.get("/courses");
            return res.data.data || res.data || [];
        },
    });

    const completedTitles = enrolledCourses
        .filter(({ enrollment }) => enrollment.completed)
        .map(({ course }) => course?.title)
        .filter(Boolean);

    const enrolledCourseIds = (enrollments || []).map((e) => e.courseId);

    const unenrolledCourses = (allCourses || []).filter(
        (c) => !enrolledCourseIds.includes(c._id || c.id)
    );

    const availableTitles = unenrolledCourses.map((c) => c.title);

    const {
        data: suggestions,
        isLoading: isSuggesting,
        error: suggestionError,
    } = useQuery({
        queryKey: ["aiSuggestions", completedTitles.join(","), availableTitles.join(",")],
        queryFn: async () => {
            const res = await api.post("/ai/suggest", {
                completedCourseTitles: completedTitles,
                availableCourseTitles: availableTitles.length > 0
                    ? availableTitles
                    : (allCourses || []).map((c) => c.title),
            });
            return res.data.data || res.data;
        },
        enabled: !!(allCourses && allCourses.length > 0 && enrolledCourses.length >= 0),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    if (enrollmentsLoading || isLoadingCourses) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="mx-auto max-w-5xl px-6 py-8">
                    <p className="text-sm text-slate-400">
                        {new Date().toLocaleDateString("en-IN", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">
                        Welcome back, {user?.name} 👋
                    </h1>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="rounded-xl bg-indigo-600 p-5 text-white">
                        <p className="text-sm text-indigo-200">In Progress</p>
                        <p className="mt-1 text-3xl font-bold">{inProgressCount}</p>
                        <p className="mt-1 text-xs text-indigo-300">Active courses</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-100 p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="mt-1 text-3xl font-bold text-slate-800">{completedCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Finished courses</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-100 p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Certificates</p>
                        <p className="mt-1 text-3xl font-bold text-slate-800">{certificatesCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Earned certificates</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">My Courses</h2>
                    <Link to="/catalog" className="text-sm text-indigo-600 hover:underline">
                        Browse more →
                    </Link>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="rounded-xl bg-white border border-dashed border-slate-200 p-12 text-center">
                        <span className="text-4xl">📚</span>
                        <p className="mt-4 font-medium text-slate-700">
                            No courses yet
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Start learning something new today
                        </p>
                        <Link
                            to="/catalog"
                            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {enrolledCourses.map(({ enrollment, course }) => (
                            <Link
                                key={enrollment._id}
                                to={`/learn/${course._id || course.id}`}
                                className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-50 transition-all hover:shadow-md hover:border-indigo-100"
                            >
                                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${
                                    enrollment.completed
                                        ? "bg-emerald-100"
                                        : "bg-indigo-100"
                                }`}>
                                    {enrollment.completed ? "✅" : "▶"}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                        {course.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    enrollment.completed
                                                        ? "bg-emerald-500"
                                                        : "bg-indigo-500"
                                                }`}
                                                style={{ width: `${enrollment.progressPercent || 0}%` }}
                                            />
                                        </div>
                                        <span className="flex-shrink-0 text-xs text-slate-400">
                                            {enrollment.progressPercent || 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 flex items-center gap-3">
                                    {enrollment.certificateUrl && (
                                        <a
                                            href={enrollment.certificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                                        >
                                            🎓 Certificate
                                        </a>
                                    )}
                                    <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-lg">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-10">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                <span className="text-xs">✨</span>
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800">
                                Recommended for You
                            </h2>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                            Powered by Gemini AI
                        </span>
                    </div>

                    {isSuggesting && (
                        <div className="rounded-xl bg-white border border-slate-100 p-8 text-center shadow-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {[0, 0.15, 0.3].map((delay, i) => (
                                        <div
                                            key={i}
                                            className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                                            style={{ animationDelay: `${delay}s` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400">
                                    Gemini is analyzing your learning history...                
                                </p>
                            </div>
                        </div>
                    )}

                    {suggestionError && (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
                            <p className="text-sm text-red-500">
                                Couldn't load AI suggestions right now — make sure ai-service is running on port 3007
                            </p>
                        </div>
                    )}

                    {!isSuggesting && suggestions?.suggestions?.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {suggestions.suggestions.map((title, index) => {
                                const course = (allCourses || []).find((c) => c.title === title);
                                if (!course) return null;
                                return (
                                    <Link
                                        key={index}
                                        to={`/courses/${course._id || course.id}`}
                                        className="group relative overflow-hidden rounded-xl bg-white border border-slate-100 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
                                    >
                                        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-500">
                                            {index + 1}
                                        </div>
                                        <div className="mb-3 text-2xl">
                                            {course.category === "development" ? "💻" : 
                                             course.category === "design" ? "🎨" : 
                                             course.category === "business" ? "📊" : "📚"}
                                        </div>
                                        <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm leading-snug pr-6">
                                            {course.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            by {course.instructorName}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                course.level === "beginner" ? "bg-emerald-50 text-emerald-700" :
                                                course.level === "intermediate" ? "bg-amber-50 text-amber-700" :
                                                "bg-red-50 text-red-700"
                                            }`}>
                                                {course.level}
                                            </span>
                                            <span className="text-sm font-bold text-indigo-600">
                                                {course.price === 0 ? "Free" : `₹${course.price}`}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <span>Enroll now</span>
                                            <span>→</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {!isSuggesting && !suggestionError && !suggestions?.suggestions?.length && (
                        <div className="rounded-xl bg-white border border-dashed border-slate-200 p-8 text-center">
                            <span className="text-3xl">🎓</span>
                            <p className="mt-3 font-medium text-slate-700">You're all caught up!</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Enroll in more courses and AI will suggest what to learn next
                            </p>
                            <Link
                                to="/catalog"
                                className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Browse Catalog
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;