import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import LessonSidebar from "../components/LessonSidebar";
import { useState, useEffect } from "react";

function LessonPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeLesson, setActiveLesson] = useState(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
        const res = await api.get(`/courses/${courseId}`);
        return res.data.data;
    },
    enabled: !!courseId,
});

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ["myEnrollments"],
        queryFn: async () => {
            const res = await api.get(`/enrollments/my`);
            return res.data || res.data.data;
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
            return res.data||res.data.data;
        },
        onSuccess: (updatedEnrollment) => {
            queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });

            if (updatedEnrollment.completed) {
                return;
            }

            const allLessons = course.sections.flatMap((s) => s.lessons);
            const currentIndex = allLessons.findIndex((l) => l._id === activeLesson._id);
            const nextLesson = allLessons[currentIndex + 1];

            if (nextLesson) {
                setActiveLesson(nextLesson);
            }
        },
    });

    if (courseLoading || enrollmentsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Loading lesson...</p>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">
                    You're not enrolled in this course.
                </p>
            </div>
        );
    }

    const isActiveLessonComplete = completedLessonIds.includes(activeLesson?._id);

    return (
        <div className="flex h-screen bg-slate-50">
            <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white p-4">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-4 text-sm text-slate-400 hover:text-slate-600"
                >
                    ← Back to Dashboard
                </button>
                <h2 className="mb-4 font-semibold text-slate-800">{course.title}</h2>
                <LessonSidebar
                    sections={course.sections}
                    completedLessonIds={completedLessonIds}
                    activeLessonId={activeLesson?._id}
                    onSelectLesson={setActiveLesson}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-8">
                <div className="mx-auto max-w-3xl">
                    {enrollment.completed && (
                        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                            <p className="text-sm font-medium text-emerald-700">
                                🎉 Course completed! Your certificate is on its way to your email.
                            </p>
                            {enrollment.certificateUrl && (
                                <a
                                
                                    href={enrollment.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    View Certificate
                                </a>
                            )}
                        </div>
                    )}

                    {activeLesson?.contentType === "video" ? (
                        <video
                            key={activeLesson._id}
                            src={activeLesson.contentUrl}
                            controls
                            className="w-full rounded-xl bg-black"
                        />
                    ) : (
                        <iframe
                            key={activeLesson?._id}
                            src={activeLesson?.contentUrl}
                            className="h-[600px] w-full rounded-xl border border-slate-200"
                            title={activeLesson?.title}
                        />
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">
                                {activeLesson?.title}
                            </h1>
                            <p className="text-sm text-slate-400">
                                {activeLesson?.duration} min
                            </p>
                        </div>

                        <button
                            onClick={() => markComplete()}
                            disabled={isMarking || isActiveLessonComplete}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isActiveLessonComplete
                                ? "✓ Completed"
                                : isMarking
                                ? "Saving..."
                                : "Mark Complete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LessonPlayer;