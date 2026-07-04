import {useState, useEffect} from 'react';
import {useAuth} from '../hooks/useAuth';
import {Link} from 'react-router-dom';
import api from '../api/axios';

import {useQuery,useMutations,useQueryClient} from '@tanstack/react-query';

function InstructorDashboard() {
    const queryClient = useQueryClient();
    const [showCreateForm,setShowCreateForm] = useState(false);

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [price,setPrice] = useState(0);
    const [category,setCategory] = useState("");
    const [level,setLevel] = useState("");

    const {data:courses,isLoading}=useQuery({
        queryKey:["myCourses"],
        queryFn:async()=>{
            const response=await api.get("/courses/my");
            return response.data.data || response.data;
        }
    })

    const {mutate:createCourse,isPending:isCreating}=useMutation({
        mutationFn:async ()=>{
            const res=await api.post("/courses",{
                title,
                description,
                price:Number(price),
                category,
                level
            })
            return res.data || res.data.data;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["myCourses"]});
            setTitle("");
            setDescription("");
            setPrice(0);
            setShowCreateForm(false);
        }
    })

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-5xl">
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
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Course description"
                            rows={3}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
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
                                    {course.totalSections} sections ·{" "}
                                    {course.totalLessons} lessons ·{" "}
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