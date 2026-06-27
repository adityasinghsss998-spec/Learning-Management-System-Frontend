function LessonSidebar({ sections, completedLessonIds, activeLessonId, onSelectLesson }) {
    return (
        <div className="flex flex-col gap-4 overflow-y-auto">
            {sections?.map((section) => (
                <div key={section._id}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {section.title}
                    </p>
                    <div className="flex flex-col gap-1">
                        {section.lessons.map((lesson) => {
                            const isCompleted = completedLessonIds.includes(lesson._id);
                            const isActive = lesson._id === activeLessonId;

                            return (
                                <button
                                    key={lesson._id}
                                    onClick={() => onSelectLesson(lesson)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                                            isCompleted
                                                ? "bg-emerald-500 text-white"
                                                : "border border-slate-300 text-transparent"
                                        }`}
                                    >
                                        ✓
                                    </span>
                                    <span className="line-clamp-1">{lesson.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LessonSidebar;