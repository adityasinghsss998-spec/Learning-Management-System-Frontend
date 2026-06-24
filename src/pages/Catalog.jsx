import React from "react";
import { useState } from "react";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import api from "../api/axios";

function Catalog() {
    const [search,setsearch]=useState("");
    const [category,setcategory]=useState("");

    const {data:courses,isLoading,error}=useQuery({
        queryKey:["courses",search,category],
        queryFn:async()=>{
            const params={};
            if(search) params.search=search;
            if(category) params.category=category;
            
            const response=await api.get("/courses",{params});
            return response.data.data;
        }
    })
    console.log("BACKEND DATA:", courses);


    return (
       <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
                <h1 className="mb-6 text-3xl font-bold text-slate-800">
                    Course Catalog
                </h1>

               <div className="mb-8 flex flex-wrap gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="">All categories</option>
                        <option value="development">Development</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                    </select>
               </div>  
               {isLoading && (
                   <p className="text-slate-400">Loading courses...</p>
               )}

               {error && (
                    <p className="text-red-500">
                        Failed to load courses. Please try again.
                    </p>
                )}

                {courses && courses.length === 0 && (
                    <p className="text-slate-400">No courses found.</p>
                )}

             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses?.map((course) => (
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600">
                                <span className="text-sm font-medium text-white">
                                    {course.category}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="mb-1 font-semibold text-slate-800">
                                    {course.title}
                                </h3>
                                <p className="mb-3 text-sm text-slate-500">
                                    by {course.instructorName}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-indigo-600">
                                        {course.price === 0 ? "Free" : `₹${course.price}`}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {course.totalLessons} lessons
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Catalog;