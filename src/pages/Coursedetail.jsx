import { useParams } from "react-router-dom";

function CourseDetail() {
    const { id } = useParams();

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">
                Course Detail — ID: {id}
            </h1>
        </div>
    );
}

export default CourseDetail;