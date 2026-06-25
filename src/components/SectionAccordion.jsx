import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SectionAccordion({ section, index }) {
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
                <div>
                    <p className="font-medium text-slate-800">{section.title}</p>
                    <p className="text-xs text-slate-400">
                        {section.lessons.length} lessons
                    </p>
                </div>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                >
                    ▼
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3">
                            {section.lessons.map((lesson) => (
                                <div
                                    key={lesson._id}
                                    className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                                >
                                    <span className="flex items-center gap-2 text-slate-600">
                                        {lesson.contentType === "video" ? "▶" : "📄"}
                                        {lesson.title}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {lesson.duration} min
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SectionAccordion;