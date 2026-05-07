import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getComentariosRevision } from "../../ts/ThesisCoordinatorandReviewer/GetCommentsReview"
import { ArrowLeft, Download, MessageSquare } from "lucide-react"
import type React from "react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"

/**
 * Component for displaying thesis review comments for students
 */
const StudentReviewComments: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const userId = location.state?.userId
  /**
   * Effect hook to fetch review comments when the component mounts
   */
  useEffect(() => {
    if (userId) {
      const fetchReviews = async () => {
        setIsLoading(true)
        try {
          const data = await getComentariosRevision(userId)
          setReviews(data)
        } catch (error) {

        } finally {
          setIsLoading(false)
        }
      }
      fetchReviews()
    }
  }, [userId])
  /**
   * Handles downloading files
   */
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {

    }
  }
  /**
   * Formats a date string into short and long formats
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return { short: "Fecha no disponible", long: "Fecha no disponible" }
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const formattedLongDate = date.toLocaleDateString("es-ES", {
      weekday: "long",
      month: "long",
      year: "numeric",
    })
    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    return {
      short: formattedDate,
      long: `${formattedLongDate} / ${formattedTime}`,
    }
  }
  // Get student info from the first review (assuming all reviews are from the same student)
  const studentInfo = reviews.length > 0 ? reviews[0].user : null
  const campusInfo = reviews.length > 0 ? reviews[0].user.location : null

  return (
    <>
      <Breadcrumb pageName="Revisión de estudiante" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <button
            className="flex items-center px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-300 shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Regresar
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
                <h2 className="text-lg font-bold text-white">Información del Estudiante</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      {studentInfo?.profilePhoto ? (
                        <img
                          src={studentInfo.profilePhoto || "/placeholder.svg"}
                          alt="Foto de perfil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
                          {studentInfo?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos del Alumno</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Nombre:</span> {studentInfo?.name}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Carné:</span> {studentInfo?.carnet}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Correo:</span> {studentInfo?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos de la Sede</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Sede:</span> {campusInfo?.nameSede ?? "Sin sede"}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Año:</span> {studentInfo?.year?.year ?? "Sin año asignado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
              Revisiones ({reviews.length})
            </h2>
            <div className="grid gap-6">
              {reviews.map((review, index) => (
                <div
                  key={review.revision_thesis_id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className={`px-6 py-3 flex justify-between items-center ${!review.AssignedReviews[0]?.commentsRevisions ||
                        review.AssignedReviews[0].commentsRevisions.length === 0 ||
                        review.approvaltheses?.[0]?.status === "pending"
                        ? "bg-yellow-500"
                        : review.approvaltheses?.[0]?.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      } rounded-t-xl`}
                  >
                    <h2 className="text-lg font-bold text-white">Revisión #{review.revision_thesis_id}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${!review.AssignedReviews[0]?.commentsRevisions ||
                          review.AssignedReviews[0].commentsRevisions.length === 0 ||
                          review.approvaltheses?.[0]?.status === "pending"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                          : review.approvaltheses?.[0]?.status === "approved"
                            ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                        }`}
                    >
                      {!review.AssignedReviews[0]?.commentsRevisions ||
                        review.AssignedReviews[0].commentsRevisions.length === 0 ||
                        review.approvaltheses?.[0]?.status === "pending"
                        ? "Pendiente a revisar"
                        : review.approvaltheses?.[0]?.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos del Revisor</h3>
                        <div className="space-y-3">
                          {review.AssignedReviews.map((assignedReview: any) => (
                            <div
                              key={assignedReview.assigned_review_id}
                              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Nombre:</span> {assignedReview.user.name}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Correo:</span> {assignedReview.user.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Fecha de Revisión</h3>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          {review.approvaltheses &&
                            review.approvaltheses[0]?.status === "approved" &&
                            review.approvaltheses[0]?.date_approved ? (
                            <div>
                              <p className="text-base font-medium text-gray-800 dark:text-white">
                                {formatDate(
                                  new Date(review.approvaltheses[0].date_approved).toString(),
                                ).short}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(
                                  new Date(review.approvaltheses[0].date_approved).toString(),
                                ).long}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-base font-medium text-gray-800 dark:text-white">
                                {formatDate(review.AssignedReviews[0]?.date_assigned || "").short}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(review.AssignedReviews[0]?.date_assigned || "").long}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" /> Comentarios
                      </h3>
                      {review.AssignedReviews.some(
                        (review: any) =>
                          review.commentsRevisions && review.commentsRevisions.length > 0,
                      ) ? (
                        <div className="space-y-4">
                          {review.AssignedReviews.map((assignedReview: any) =>
                            assignedReview.commentsRevisions &&
                              assignedReview.commentsRevisions.length > 0 ? (
                              <div
                                key={`comments-${assignedReview.assigned_review_id}`}
                                className="space-y-3"
                              >
                                {assignedReview.commentsRevisions.map(
                                  (comment: any, index: number) => (
                                    <div
                                      key={`comment-${index}`}
                                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-grey-500"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                                          {comment.title || "Sin título"}
                                        </h4>
                                        {comment.date_comment && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(comment.date_comment).short}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {comment.comment || "Sin comentario"}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Por: {assignedReview.user.name}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : null,
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            No hay comentarios disponibles
                          </p>
                        </div>
                      )}
                    </div>

                    {/* SOLO en el primer registro */}
                    {index === 0 && (
                      <div className="mt-6 flex flex-wrap gap-4">
                        {review.thesis_dir && (
                          <button
                            className="flex items-center px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={() =>
                              handleDownload(
                                review.thesis_dir,
                                `tesis_${review.AssignedReviews[0].user.user_id}.pdf`,
                              )
                            }
                          >
                            <Download className="mr-2 h-5 w-5" /> Descargar Tesis
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Cargando información o no hay revisiones pendientes...
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default StudentReviewComments
