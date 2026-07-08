function LessonSidebar({ sections, completedLessonIds, activeLessonId, onSelectLesson }) {
    return (
        <div className="flex flex-col gap-4">
            {sections.map((section) => (
                <div key={section._id}>
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {section.title}
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {section.lessons.map((lesson) => {
                            const isCompleted = completedLessonIds.includes(lesson._id);
                            const isActive = lesson._id === activeLessonId;

                            return (
                                <button
                                    key={lesson._id}
                                    onClick={() => onSelectLesson(lesson)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                        isActive
                                            ? "bg-indigo-600/20 text-white border border-indigo-600/30"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs transition-colors ${
                                            isCompleted
                                                ? "bg-emerald-500 text-white"
                                                : isActive
                                                ? "border border-indigo-400 text-indigo-400"
                                                : "border border-slate-600 text-transparent"
                                        }`}
                                    >
                                        ✓
                                    </span>
                                    <span className="line-clamp-2 leading-snug text-xs">
                                        {lesson.title}
                                    </span>
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