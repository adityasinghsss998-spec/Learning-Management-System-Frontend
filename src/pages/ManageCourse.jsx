import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

function ManageCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [sectionTitle, setSectionTitle] = useState("");
    const [activeSectionId, setActiveSectionId] = useState(null);

    const [lessonTitle, setLessonTitle] = useState("");
    const [contentType, setContentType] = useState("video");
    const [duration, setDuration] = useState(0);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data: course, isLoading } = useQuery({
        queryKey: ["course", id],
        queryFn: async () => {
            const res = await api.get(`/courses/${id}`);
            return res.data.data || res.data;
        },
    });

    const { mutate: addSection, isPending: isAddingSection } = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/courses/${id}/sections`, {
                title: sectionTitle,
                order: (course?.sections?.length || 0) + 1,
            });
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", id] });
            setSectionTitle("");
        },
    });

    const { mutate: addLesson, isPending: isUploading } = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("title", lessonTitle);
            formData.append("contentType", contentType);
            formData.append("duration", duration);
            formData.append("content", file);

            const res = await api.post(
                `/courses/${id}/sections/${activeSectionId}/lessons`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percent);
                    },
                }
            );
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", id] });
            setLessonTitle("");
            setFile(null);
            setUploadProgress(0);
            setActiveSectionId(null);
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Loading course...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <button
                    onClick={() => navigate("/instructor")}
                    className="mb-4 text-sm text-slate-400 hover:text-slate-600"
                >
                    ← Back to my courses
                </button>

                <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
                <p className="mt-2 text-slate-500">{course.description}</p>

                <div className="mt-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            addSection();
                        }}
                        className="flex gap-3"
                    >
                        <input
                            type="text"
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            placeholder="New section title"
                            required
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={isAddingSection}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Add Section
                        </button>
                    </form>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    {course.sections?.map((section) => (
                        <div
                            key={section._id}
                            className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <p className="font-medium text-slate-800">{section.title}</p>

                            <div className="mt-3 flex flex-col gap-1">
                                {section.lessons.map((lesson) => (
                                    <div
                                        key={lesson._id}
                                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                                    >
                                        <span className="text-slate-600">
                                            {lesson.contentType === "video" ? "▶" : "📄"}{" "}
                                            {lesson.title}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {lesson.duration} min
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {activeSectionId === section._id ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        addLesson();
                                    }}
                                    className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-4"
                                >
                                    <input
                                        type="text"
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                        placeholder="Lesson title"
                                        required
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex gap-3">
                                        <select
                                            value={contentType}
                                            onChange={(e) => setContentType(e.target.value)}
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        >
                                            <option value="video">Video</option>
                                            <option value="pdf">PDF</option>
                                            <option value="article">Article</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="Duration (min)"
                                            min={0}
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        required
                                        className="text-sm"
                                    />

                                    {isUploading && (
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full bg-indigo-500 transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isUploading || !file}
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {isUploading
                                                ? `Uploading ${uploadProgress}%...`
                                                : "Upload Lesson"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSectionId(null)}
                                            className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setActiveSectionId(section._id)}
                                    className="mt-3 text-sm text-indigo-600 hover:underline"
                                >
                                    + Add lesson to this section
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ManageCourse;