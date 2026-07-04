import { useQuery, useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (user?.role === "instructor") {
            navigate("/instructor", { replace: true });
        }
    }, [user]);
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
                return res.data.data || res.data; // <-- FIX #2
            },
            enabled: !!enrollments,
        })),
    });

    const isLoadingCourses = courseQueries.some((q) => q.isLoading);

    const enrolledCourses = (enrollments || []).map((enrollment, index) => ({
        enrollment,
        course: courseQueries[index]?.data,
    })).filter((item) => item.course);

    const inProgressCount = enrollments?.filter((e) => !e.completed).length || 0;
    const completedCount = enrollments?.filter((e) => e.completed).length || 0;
    const certificatesCount = enrollments?.filter((e) => e.certificateUrl).length || 0;

    if (enrollmentsLoading || isLoadingCourses) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-slate-800">
                    Welcome back, {user?.name}
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-indigo-50 p-5">
                        <p className="text-sm text-indigo-700">In Progress</p>
                        <p className="mt-1 text-2xl font-bold text-indigo-900">
                            {inProgressCount}
                        </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-5">
                        <p className="text-sm text-emerald-700">Completed</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-900">
                            {completedCount}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-5">
                        <p className="text-sm text-slate-500">Certificates</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">
                            {certificatesCount}
                        </p>
                    </div>
                </div>

                <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-800">
                    My Courses
                </h2>

                {enrolledCourses.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                        <p className="text-slate-400">
                            You haven't enrolled in any courses yet.
                        </p>
                        <Link
                            to="/catalog"
                            className="mt-3 inline-block text-indigo-600 hover:underline"
                        >
                            Browse the catalog
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {enrolledCourses.map(({ enrollment, course }) => (
                            <Link
                                key={enrollment._id}
                                to={`/learn/${course._id}`} 
                                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                    {enrollment.completed ? "✓" : "▶"}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">
                                        {course.title}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{
                                                    width: `${enrollment.progressPercent || 0}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {enrollment.progressPercent || 0}%
                                        </span>
                                    </div>
                                </div>

                                
                                {enrollment.certificateUrl && (
                                    <a
                                        href={enrollment.certificateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                    >
                                        Certificate
                                    </a>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;