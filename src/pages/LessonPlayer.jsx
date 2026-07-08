import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import LessonSidebar from "../components/LessonSidebar";

function LessonPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeLesson, setActiveLesson] = useState(null);

    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const res = await api.get(`/courses/${courseId}`);
            return res.data.data || res.data;
        },
        enabled: !!courseId,
    });

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ["myEnrollments"],
        queryFn: async () => {
            const res = await api.get("/enrollments/my");
            return res.data.data || res.data || [];
        },
    });

    const enrollment = enrollments?.find((e) => e.courseId === courseId);
    const completedLessonIds =
        enrollment?.progress?.filter((p) => p.completed).map((p) => p.lessonId) || [];

    useEffect(() => {
        if (course && !activeLesson) {
            const firstIncomplete = course.sections
                ?.flatMap((s) => s.lessons)
                .find((lesson) => !completedLessonIds.includes(lesson._id));
            setActiveLesson(firstIncomplete || course?.sections?.[0]?.lessons?.[0]);
        }
    }, [course]);

    const { mutate: markComplete, isPending: isMarking } = useMutation({
        mutationFn: async () => {
            const res = await api.patch("/enrollments/progress", {
                courseId,
                lessonId: activeLesson._id,
            });
            return res.data.data || res.data;
        },
        onSuccess: (updatedEnrollment) => {
            queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
            if (updatedEnrollment?.completed) return;
            const allLessons = course.sections.flatMap((s) => s.lessons);
            const currentIndex = allLessons.findIndex((l) => l._id === activeLesson._id);
            const nextLesson = allLessons[currentIndex + 1];
            if (nextLesson) setActiveLesson(nextLesson);
        },
    });

    if (courseLoading || enrollmentsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <span className="text-4xl">🔒</span>
                    <p className="mt-3 font-medium text-slate-700">Not enrolled</p>
                    <p className="text-sm text-slate-400 mt-1">You need to enroll to access this course</p>
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        View Course
                    </button>
                </div>
            </div>
        );
    }

    if (!activeLesson) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">This course has no lessons yet.</p>
            </div>
        );
    }

    const isActiveLessonComplete = completedLessonIds.includes(activeLesson?._id);
    const allLessons = course.sections?.flatMap((s) => s.lessons) || [];
    const currentLessonIndex = allLessons.findIndex((l) => l._id === activeLesson._id);
    const prevLesson = allLessons[currentLessonIndex - 1];
    const nextLesson = allLessons[currentLessonIndex + 1];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900">
            <div className="flex w-72 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 p-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        ← Dashboard
                    </button>
                    <h2 className="mt-3 text-sm font-semibold text-white leading-snug line-clamp-2">
                        {course.title}
                    </h2>

                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                            <span>{completedLessonIds.length} / {allLessons.length} lessons</span>
                            <span>{enrollment.progressPercent || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                            <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${enrollment.progressPercent || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <LessonSidebar
                        sections={course.sections}
                        completedLessonIds={completedLessonIds}
                        activeLessonId={activeLesson?._id}
                        onSelectLesson={setActiveLesson}
                    />
                </div>

                <div className="border-t border-slate-800 p-4">
                    <button
                        onClick={() => navigate(`/live/${courseId}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                        <span>💬</span>
                        Join Live Session
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                {enrollment.completed && (
                    <div className="flex items-center justify-between bg-emerald-900/40 border-b border-emerald-800/50 px-6 py-3">
                        <div className="flex items-center gap-2">
                            <span>🎉</span>
                            <p className="text-sm font-medium text-emerald-300">
                                Course completed! Your certificate is on its way.
                            </p>
                        </div>
                        {enrollment.certificateUrl && (
                            <a
                                href={enrollment.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                            >
                                View Certificate
                            </a>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Lesson {currentLessonIndex + 1} of {allLessons.length}
                        </p>
                        <h1 className="mt-0.5 text-base font-semibold text-white">
                            {activeLesson.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => prevLesson && setActiveLesson(prevLesson)}
                            disabled={!prevLesson}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => markComplete()}
                            disabled={isMarking || isActiveLessonComplete}
                            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                                isActiveLessonComplete
                                    ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800"
                                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                            } disabled:opacity-50`}
                        >
                            {isActiveLessonComplete
                                ? "✓ Completed"
                                : isMarking
                                ? "Saving..."
                                : "Mark Complete"}
                        </button>
                        <button
                            onClick={() => nextLesson && setActiveLesson(nextLesson)}
                            disabled={!nextLesson}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-950">
                    {activeLesson?.contentType === "video" ? (
                        <video
                            key={activeLesson._id}
                            src={activeLesson.contentUrl}
                            controls
                            className="h-full w-full"
                        />
                    ) : (
                        <iframe
                            key={activeLesson?._id}
                            src={activeLesson?.contentUrl}
                            className="h-full w-full"
                            title={activeLesson?.title}
                        />
                    )}
                </div>

                <div className="border-t border-slate-800 bg-slate-900 px-6 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                            {activeLesson?.duration
                                ? `${activeLesson.duration} min · ${activeLesson.contentType}`
                                : activeLesson?.contentType}
                        </span>
                        <span>
                            {isActiveLessonComplete
                                ? "✓ You've completed this lesson"
                                : "Mark this lesson complete when you're done"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LessonPlayer;