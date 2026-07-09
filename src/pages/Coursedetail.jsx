import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import SectionAccordion from "../components/SectionAccordion";

// 1. Helper to load script
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function CourseDetail() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [enrollError, setEnrollError] = useState("");
    const [justEnrolled, setJustEnrolled] = useState(false);

    
    useEffect(() => {
        loadScript("https://checkout.razorpay.com/v1/checkout.js");
    }, []);

    const { data: course, isLoading } = useQuery({
        queryKey: ["course", id],
        queryFn: async () => {
            const res = await api.get(`/courses/${id}`);
            return res.data.data || res.data;
        },
    });

    const { data: enrollments , isLoading: isLoadingEnrollments } = useQuery({
        queryKey: ["myEnrollments"],
        queryFn: async () => {
            const res = await api.get("/enrollments/my");
            return res.data.data || res.data || [];
        },
        enabled: isAuthenticated,
    });

    
    const existingEnrollment = enrollments?.find((e) => {
        const matchId = e.courseId?._id || e.courseId || e.course?._id || e.course;
        return matchId === id;
    });

    const isEnrolled = !!existingEnrollment || justEnrolled;

    const { mutate: enrollFree, isPending: isEnrollingFree } = useMutation({
        mutationFn: async () => {
            const res = await api.post("/enrollments/free", { courseId: id });
            return res.data.data || res.data;
        },
        onSuccess: () => {
            setJustEnrolled(true);
            setEnrollError("");
            queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
        },
    });

    

    const { mutate: enrollPaid, isPending: isEnrollingPaid } = useMutation({
        mutationFn: async () => {
            const res = await api.post("/enrollments/checkout", { courseId: id });
            const data = res.data.data || res.data; // Failsafe extraction
            
            console.log("1. CHECKOUT RESPONSE DATA:", data);

            return new Promise((resolve, reject) => {
                const options = {
                    key: data.keyId,
                    order_id: data.orderId,
                    amount: data.amount * 100,
                    currency: data.currency,
                    name: "Nexus",
                    description: data.courseTitle,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post("/enrollments/verify-payment", {
                                courseId: id,
                                orderId: data.orderId,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            });
                            resolve(verifyRes.data.data || verifyRes.data);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                    },
                    theme: { color: "#4f46e5" },
                    modal: {
                        ondismiss: () => reject(new Error("Payment cancelled")),
                    },
                };

                try {
                    console.log("2. WINDOW.RAZORPAY EXISTS:", !!window.Razorpay);
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } catch (instanceError) {
                    console.error("3. RAZORPAY INITIALIZATION CRASHED:", instanceError);
                    reject(instanceError);
                }
            });
        },
        onSuccess: () => {
            setJustEnrolled(true);
            setEnrollError("");
            queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
        },
        onError: (err) => {
            console.error("4. MUTATION CAUGHT ERROR:", err);
            setEnrollError(err.message || "Something went wrong with the payment.");
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Loading course...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-400">Course not found.</p>
            </div>
        );
    }

    const handleEnrollClick = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (isEnrolled) {
            navigate(`/learn/${id}`);
            return;
        }

        if (course.price === 0) {
            enrollFree();
        } else {
            enrollPaid();
        }
    };

    
    const isEnrolling = isEnrollingFree || isEnrollingPaid || isLoadingEnrollments;

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
                <p className="mt-2 text-slate-500">{course.description}</p>
                <p className="mt-1 text-sm text-slate-400">
                    by {course.instructorName}
                </p>

                <div className="mt-6 flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600">
                            {course.price === 0 ? "Free" : `₹${course.price}`}
                        </span>
                        <button
                            onClick={handleEnrollClick}
                            disabled={isEnrolling}
                            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {/* 4. Button now checks isEnrolled correctly! */}
                            {isEnrolling
                                ? "Processing..."
                                : isEnrolled
                                ? "Continue Learning"
                                : course.price === 0
                                ? "Enroll Free"
                                : "Enroll Now"}
                        </button>
                    </div>
                    {enrollError && (
                        <p className="text-right text-sm font-medium text-red-500">{enrollError}</p>
                    )}
                </div>

                <h2 className="mt-10 mb-4 text-xl font-semibold text-slate-800">
                    Course Content
                </h2>

                <div className="flex flex-col gap-3">
                    {course.sections?.map((section, index) => (
                        <SectionAccordion
                            key={section._id}
                            section={section}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;