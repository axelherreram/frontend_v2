import React, { useEffect, useState } from "react";
import { getSubmissionByTask, type TaskSubmissionResult } from "../../ts/Administrator/GetSubmissionByTask";
import { getSecureFileUrl } from "../../ts/secureFile";
import { FileText, Calendar, CheckCircle, XCircle } from "lucide-react";

interface ViewStudentTaskProps {
    estudiante: { id: number; sedeId?: number; [key: string]: any };
    taskId: number; // ID de la tarea específica a mostrar
}

/**
 * Muestra la entrega PDF de un estudiante para una tarea concreta.
 * Usa el endpoint GET /api/students/:user_id/tasks/:task_id/submission
 * que devuelve exactamente 1 entrega, sin traer datos innecesarios.
 */
const ViewStudentTask: React.FC<ViewStudentTaskProps> = ({ estudiante, taskId }) => {
    const [result, setResult] = useState<TaskSubmissionResult | null>(null);
    const [noSubmission, setNoSubmission] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!estudiante?.id || !taskId) return;

        const fetch = async () => {
            setLoading(true);
            setError(null);
            setNoSubmission(false);
            try {
                const data = await getSubmissionByTask(estudiante.id, taskId);
                if (data) {
                    setResult(data);
                } else {
                    setNoSubmission(true);
                }
            } catch {
                setError("No se pudo cargar la entrega del estudiante.");
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [estudiante?.id, taskId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3" />
                Cargando entrega...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (noSubmission || !result) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                <FileText className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">El estudiante aún no ha entregado esta tarea.</p>
            </div>
        );
    }

    const { submission } = result;

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            {/* Encabezado de la entrega */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-blue-500" />
                    Entrega: {submission.task_title}
                </h3>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        submission.submission_complete
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}>
                        {submission.submission_complete
                            ? <><CheckCircle className="h-4 w-4" /> Completa</>
                            : <><XCircle className="h-4 w-4" /> Incompleta</>}
                    </span>
                    {submission.date && (
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {new Date(submission.date).toLocaleDateString("es-GT")}
                        </span>
                    )}
                </div>
            </div>

            {/* Visor del PDF */}
            {submission.file_url ? (
                <iframe
                    src={getSecureFileUrl(submission.file_url)}
                    title={`PDF - ${submission.task_title}`}
                    width="100%"
                    height="550px"
                    className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner"
                />
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                    No hay archivo adjunto para esta entrega.
                </p>
            )}
        </div>
    );
};

export default ViewStudentTask;
