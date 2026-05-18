import type React from "react"
import Swal from "sweetalert2"
import TourChapters from "../../../components/Tours/Administrator/TourChapters"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import ViewStudentTask from "../../../components/Pdfs/ViewStudentTask";
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { enviaComentario } from "../../../ts/General/SendComment"
import { getComentarios, type ComentarioData } from "../../../ts/General/GetComment"
import { updateComentStats } from "../../../ts/Administrator/UpdateComentStat"
import { ArrowLeft, MessageSquare, Calendar } from "lucide-react"

/**
 * Interface for comment data with active status
 */
interface Comentario {
  id: number
  texto: string
  fecha: string
  role: string
  comment_active: boolean
}

/**
 * Chapters Component
 * Displays and manages chapter details and comments
 */
const Chapters: React.FC = () => {
  const navigate = useNavigate() // Hook for navigating between pages
  const location = useLocation() // Hook to get the state from the URL
  const { tarea, estudiante, selectedAño, selectedCurso } = location.state || {} // Destructure task and student from the location state

  const [comentario, setComentario] = useState<string>("") // State to store the new comment
  const [comentariosPrevios, setComentariosPrevios] = useState<Comentario[]>([]) // State to store previous comments

  // Determines if the comment writing area and buttons should be disabled.
  // If there is at least one comment and its comment_active property is false, it is disabled.
  const isComentarioBloqueado = comentariosPrevios.length > 0 && comentariosPrevios[0].comment_active === false

  /**
   * Function to format the date as day/month/year
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`
  }

  /**
   * Load previous comments when the component mounts
   */
  useEffect(() => {
    const cargarComentarios = async () => {
      if (!tarea || !estudiante) return // If there is no task or student, do not load comments
      const taskId = tarea.task_id // Get the task ID
      const userId = estudiante.id // Get the student ID
      try {
        // Get the comments from the API
        const comentarios: ComentarioData = await getComentarios(taskId, userId)
        // Format the comments into a more usable structure, including comment_active
        const comentariosFormateados = comentarios.comments.map((comment) => ({
          id: comment.comment_id, // Unique comment ID
          texto: comment.comment,
          fecha: formatearFecha(comment.datecomment),
          role: comment.role,
          comment_active: comment.comment_active,
        }))
        setComentariosPrevios(comentariosFormateados) // Update the state with the formatted comments
      } catch (error) {

      }
    }
    cargarComentarios()
  }, [tarea, estudiante])

  /**
   * Handle the change in the textarea for the comment
   */
  const handleComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComentario(e.target.value)
  }

  /**
   * Handle disabling a comment and updating the comment list
   */
  const handleDesactivarComentario = async (comentId: number, estaBloqueado: boolean) => {
    try {
      // Call the API to update the comment status
      await updateComentStats(comentId)
      // After updating, fetch the comment list again
      if (tarea && estudiante) {
        const updatedComentarios: ComentarioData = await getComentarios(tarea.task_id, estudiante.id)
        const comentariosFormateados = updatedComentarios.comments.map((comment) => ({
          id: comment.comment_id,
          texto: comment.comment,
          fecha: formatearFecha(comment.datecomment),
          role: comment.role,
          comment_active: comment.comment_active,
        }))
        setComentariosPrevios(comentariosFormateados)
      }
      Swal.fire({
        title: estaBloqueado ? "Comentarios activados" : "Comentario bloqueado",
        text: estaBloqueado
          ? "Los comentarios se han activado correctamente"
          : "Los comentario se han bloqueado exitosamente",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      }
    }
  }

  /**
   * Handle submitting a new comment
   */
  const handleEnviarComentario = async () => {
    if (!tarea || !estudiante) {
      Swal.fire({
        title: "Error",
        text: "Datos de la tarea o estudiante no disponibles",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }
    const taskId = tarea.task_id
    const user_id = estudiante.id
    const commentData = {
      comment: comentario,
      role: "teacher",
      user_id: user_id,
    }
    try {
      await enviaComentario(taskId, commentData)
      // Update the list of previous comments with the new comment
      setComentariosPrevios((prevComentarios) => [
        {
          id: prevComentarios.length + 1,
          texto: comentario,
          fecha: new Date().toLocaleDateString(),
          role: "teacher",
          comment_active: true, // Assume that the new comment is active
        },
        ...prevComentarios,
      ])
      setComentario("")
      Swal.fire({
        title: "Comentario enviado",
        text: "El comentario se ha enviado exitosamente",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      })
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message || "Hubo un error al enviar el comentario",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    }
  }

  return (
    <>
      <Breadcrumb pageName={`Detalle del ${tarea?.title}`} />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            id="back-button"
            className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
          </button>
          <TourChapters />
        </div>

        <button
          id="bloquear-button"
          className={`px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${isComentarioBloqueado
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-red-600 text-white hover:bg-red-700"
            }`}
          onClick={() => handleDesactivarComentario(comentariosPrevios[0]?.id, isComentarioBloqueado)}
          disabled={comentariosPrevios.length === 0}
        >
          {isComentarioBloqueado ? "Activar Comentario" : "Bloquear Comentarios"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
        {/* Display the previous comments */}
        <div
          id="comentarios-previos"
          className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[600px]"
        >
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-blue-500" /> Comentarios Previos
          </h4>
          {comentariosPrevios.length > 0 ? (
            <ul className="space-y-5">
              {comentariosPrevios.map((comentario, index) => (
                <li
                  key={`${comentario.id}-${index}`}
                  className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-lg"
                >
                  <p className="text-base text-gray-800 dark:text-gray-200 mb-2">{comentario.texto}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{comentario.role}</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" /> {comentario.fecha}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400 text-center">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium">No hay comentarios previos para este capítulo.</p>
            </div>
          )}
        </div>
        {/* Form to submit a new comment */}
        <div
          id="enviar-comentario"
          className="w-full md:w-1/2 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col"
        >
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-blue-500" /> Enviar Comentario
          </h4>
          <textarea
            id="textarea-comentario"
            disabled={isComentarioBloqueado}
            value={comentario}
            onChange={handleComentarioChange}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 flex-grow"
            rows={8}
            placeholder="Escribe tu comentario aquí..."
          />
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
            {isComentarioBloqueado && (
              <div className="text-red-500 text-sm font-medium">
                <p>Has bloqueado los comentarios.</p>
              </div>
            )}
            <button
              id="enviar-button"
              disabled={isComentarioBloqueado || comentario.trim() === ""}
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${isComentarioBloqueado || comentario.trim() === ""
                ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${!isComentarioBloqueado && "md:ml-auto"}`}
              onClick={handleEnviarComentario}
            >
              Enviar Comentario
            </button>
          </div>
        </div>
      </div>
      {/* Mostrar ViewStudentTask debajo de comentarios */}
      <ViewStudentTask estudiante={estudiante} taskId={tarea?.task_id} />
    </>
  )
}

export default Chapters
