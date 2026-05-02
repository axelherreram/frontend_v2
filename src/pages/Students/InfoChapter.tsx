import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { enviaComentario } from "../../ts/General/SendComment"
import { getComentarios, type ComentarioData } from "../../ts/General/GetComment"
import { useProfile } from "../../context/UserProfileContext"
import TourInfoCap from "../../components/Tours/Student/TourInfoCap"
import Swal from "sweetalert2"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { ArrowLeft, MessageSquare, Calendar } from "lucide-react" // Import Lucide React icons

/**
 * Interface defining the structure for the comments
 */
interface Comentario {
  id: number
  texto: string
  fecha: string
  role: string
  comment_active: boolean
}

/**
 * Component for displaying chapter information and comments
 */
const InfoChapter: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const { task_id, endTask, endTime, NameCapitulo } = location.state || {}
  const [comentario, setComentario] = useState<string>("")
  const [comentariosPrevios, setComentariosPrevios] = useState<Comentario[]>([])
  const userId = profile?.user_id ?? null
  const [inputBloqueado, setInputBloqueado] = useState<boolean>(true)

  // Determines if the writing component and buttons should be disabled.
  // If there is at least one comment and its comment_active property is false, it is disabled.
  const isComentarioBloqueado = comentariosPrevios.length > 0 && comentariosPrevios[0].comment_active === false

  /**
   * Function to check whether the button should be disabled based on the task end time
   */
  const isButtonDisabled = (): boolean => {
    const currentDate = new Date()
    const endDate = new Date(endTask) // Convert the passed endTask date into a Date object
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) // Strip the time for current date comparison
    const currentHour = currentDate.getHours()
    const currentMinutes = currentDate.getMinutes()
    const currentSeconds = currentDate.getSeconds()
    // Format the current time into HH:MM:SS
    const formattedCurrentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}:${currentSeconds.toString().padStart(2, "0")}`
    const formattedCurrentDateTime = `${currentDateOnly.toISOString().split("T")[0]} ${formattedCurrentTime}`
    // Format the task's end time for comparison
    const endDateOnly = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
    const formattedEndDateTime = `${endDateOnly.toISOString().split("T")[0]} ${endTime || ""}`
    // Return true if the task's end date/time is in the past
    if (isNaN(endDateOnly.getTime())) return true
    return formattedCurrentDateTime > formattedEndDateTime
  }

  /**
   * Function to format dates into a user-friendly format (DD/MM/YYYY)
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  /**
   * Function to load the previous comments for the task
   */
  const cargarComentarios = async () => {
    if (!task_id || !userId) return // If task_id or userId are missing, do nothing
    try {
      // Fetch the comments using the task_id and user_id
      const comentarios: ComentarioData = await getComentarios(task_id, userId)
      // Map the fetched comments into the required format
      const comentariosFormateados = comentarios.comments.map((comment) => ({
        id: comment.comment_id, // Unique comment ID
        texto: comment.comment,
        fecha: formatearFecha(comment.datecomment),
        role: comment.role,
        comment_active: comment.comment_active,
      }))
      // Update state with formatted comments
      setComentariosPrevios(comentariosFormateados)
      // Check if the first comment is from the student and block input accordingly
      if (comentariosFormateados.length > 0 && comentariosFormateados[0].role === "Estudiante") {
        setInputBloqueado(true)
      } else {
        setInputBloqueado(false)
      }
    } catch (error) {
      // In case of error, clear comments and block input by default
      setComentariosPrevios([])
      setInputBloqueado(true)
    }
  }

  // userId is derived from profile context — no separate useEffect needed

  /**
   * Hook to load comments whenever task_id or userId changes
   */
  useEffect(() => {
    cargarComentarios() // Load the comments after the component mounts
  }, [task_id, userId])

  /**
   * Handle changes in the comment textarea input
   */
  const handleComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComentario(e.target.value)
  }

  /**
   * Function to handle sending the comment
   */
  const handleEnviarComentario = async () => {
    if (!task_id || !userId) {
      // Show error if task_id or user_id are missing
      Swal.fire({
        title: "Error",
        text: "Datos de la tarea o del usuario no disponibles",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }
    // Prepare the comment data
    const commentData = {
      comment: comentario,
      role: "student",
      user_id: userId,
    }
    try {
      // Attempt to send the comment via the API
      await enviaComentario(task_id, commentData)
      setComentario("") // Clear the comment input
      await cargarComentarios() // Reload comments after submitting
      // Show success alert
      Swal.fire({
        title: "Comentario enviado",
        text: "El comentario se ha enviado exitosamente",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      })
    } catch (error: any) {
      // Show error alert if there was an issue submitting the comment
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
      {/* Breadcrumb to show the current page's name */}
      <Breadcrumb pageName={`Detalle del Capítulo - ${NameCapitulo}`} />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Button to go back to the previous page */}
          <button
            id="back-button"
            className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
          </button>
          {/* Tour start button */}
          <TourInfoCap />
        </div>
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
              <p className="text-lg font-medium">No hay comentarios previos para este capítulo. 📝</p>
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
            disabled={inputBloqueado || isButtonDisabled() || isComentarioBloqueado}
            value={comentario}
            onChange={handleComentarioChange}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 flex-grow"
            rows={8}
            placeholder="Escribe tu comentario aquí..."
          />
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
            {(isButtonDisabled() || isComentarioBloqueado) && (
              <div className="text-red-500 text-sm font-medium">
                {isButtonDisabled() && <p>Tarea llegó a fecha límite.</p>}
                {isComentarioBloqueado && <p>Admin ha bloqueado los comentarios.</p>}
              </div>
            )}
            <button
              id="enviar-button"
              disabled={isButtonDisabled() || isComentarioBloqueado || comentario.trim() === ""}
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${isButtonDisabled() || isComentarioBloqueado || comentario.trim() === ""
                ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${!(isButtonDisabled() || isComentarioBloqueado) && "md:ml-auto"}`}
              onClick={handleEnviarComentario}
            >
              Enviar Comentario
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfoChapter
