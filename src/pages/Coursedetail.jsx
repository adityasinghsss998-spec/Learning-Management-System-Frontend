import { useParams } from "react-router-dom";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {useAuth} from '../hooks/useAuth'
import api from "../api/axios";
function CourseDetail() {
    const { id } = useParams();
    const {isAuthenticated} = useAuth();
    const {data:course,isLoading,error}=useQuery({
      queryKey: ['course', id],
      queryFn:async()=>{
        const response=await api.get(`/courses/${id}`);
        return response.data.data;
      }
    });

    const {data:enrollments}=useQuery({
      queryKey:['myENrollments'],
      queryFn:async()=>{
        const response=await api.get('/enrollments/my');
        return response.data.data;
      },
      enabled:isAuthenticated
    })

    const existingEnrollment=enrollments?.find((e)=>e.courseId===id);

    if(isLoading){
      return(
        <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Loading course...</p>
            </div>
      )
    }
    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Course not found.</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
                <p className="mt-2 text-slate-500">{course.description}</p>
                <p className="mt-1 text-sm text-slate-400">
                    by {course.instructorName}
                </p>
            </div>
        </div>
    );
}

export default CourseDetail;