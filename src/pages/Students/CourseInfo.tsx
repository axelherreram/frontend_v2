import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useProfile } from "../../context/UserProfileContext"
import { getTareas } from "../../ts/General/GetTasks"
import { getTareasEstudiante } from "../../ts/Students/GetTasksStudent"
import { getComentarios } from "../../ts/General/GetComment"
import ThesisDeliveryModal from "../../components/Modals/ThesisDeliveryModal"
import { Calendar, Clock, ArrowLeft, ArrowRight, MessageSquare, CheckCircle, XCircle, Lock } from "lucide-react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import Swal from "sweetalert2"
import type React from "react"

/**
 * Component for displaying course information and tasks
 */
const CourseInfo: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { courseTitle, courseId } = location.state || {}
  const [tareas, setTareas] = useState<any[]>([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTaskId, setModalTaskId] = useState<number | null>(null)
  const [modalTaskTitle, setModalTaskTitle] = useState<string>("")
  const [isCommentsBlocked, setIsCommentsBlocked] = useState(false)


  /**
   * Fetch tasks for the course when component mounts or courseId changes
   */
  useEffect(() => {
    const fetchTareas = async () => {
      if (!profile) return
      setLoading(true)
      try {
        const currentYear = new Date().getFullYear()
        const tareasGenerales = await getTareas(profile.sede, courseId, currentYear)
        const tareasEstudiante = await getTareasEstudiante(profile.user_id, currentYear, profile.sede)
        const tareasCombinadas = tareasGenerales
          .map((tarea) => {
            const tareaEstudiante = tareasEstudiante.find((t) => t.task_id === tarea.task_id)
            return {
              ...tarea,
              submission_complete: tareaEstudiante?.submission_complete ?? false,
            }
          })
          .filter((tarea) => tarea.typeTask_id !== 1) // Filter out tasks with typeTask_id === 1

        // Sort tasks: not submitted first
        const tareasOrdenadas = tareasCombinadas.sort(
          (a, b) => Number(a.submission_complete) - Number(b.submission_complete),
        )
        setTareas(tareasOrdenadas)
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar las tareas",
          text: "Ocurrió un error al obtener las tareas. Intente nuevamente.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      } finally {
        setLoading(false)
      }
    }
    if (courseId) {
      fetchTareas()
    }
  }, [courseId])

  /**
   * Check if comments are blocked for the current task.
   * Runs whenever the active task changes.
   */
  useEffect(() => {
    const checkCommentsBlocked = async () => {
      if (!profile || !tareas.length) return
      const tarea = tareas[currentTaskIndex]
      if (!tarea?.task_id) return
      try {
        const data = await getComentarios(tarea.task_id, profile.user_id)
        const blocked = data.comments.length > 0 && data.comments[0].comment_active === false
        setIsCommentsBlocked(blocked)
      } catch {
        setIsCommentsBlocked(false)
      }
    }
    checkCommentsBlocked()
  }, [currentTaskIndex, tareas, profile])

  /**
   * Format date to DD/MM/YYYY
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getUTCFullYear()}`
  }

  /**
   * Format time to 24-hour format with AM/PM
   */
  const formatTime24Hour = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number)
    const amPm = hours < 12 ? "AM" : "PM"
    const formattedHours = hours % 12 || 12 // Convert to 12-hour format, 0 becomes 12
    return `${formattedHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${amPm}`
  }

  /**
   * Navigate to chapter information page
   */
  const handleNavigateToCapitulo = (
    task_id: number,
    submission_complete: boolean,
    NameCapitulo: string,
    endTask: string,
    endTime: string | undefined,
  ) => {
    if (!submission_complete) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No puedes acceder al capítulo porque la tarea no está entregada.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }
    navigate("/estudiantes/info-capitulo", {
      state: { task_id, endTask, endTime, NameCapitulo },
    })
  }

  /**
   * Check if the current time is outside the task date range
   */
  const isDateOutOfRange = (
    taskStart: string,
    startTime: string | undefined,
    endTask: string,
    endTime: string | undefined
  ): boolean => {
    const currentDate = new Date()
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    const currentHour = currentDate.getHours()
    const currentMinutes = currentDate.getMinutes()
    const currentSeconds = currentDate.getSeconds()

    const formattedCurrentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}:${currentSeconds.toString().padStart(2, "0")}`
    const formattedCurrentDateTime = `${currentDateOnly.toISOString().split("T")[0]} ${formattedCurrentTime}`

    const startDate = new Date(taskStart)
    const startDateOnly = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()))
    const formattedStartDateTime = `${startDateOnly.toISOString().split("T")[0]} ${startTime || "00:00:00"}`

    const endDate = new Date(endTask)
    const endDateOnly = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
    const formattedEndDateTime = `${endDateOnly.toISOString().split("T")[0]} ${endTime || "23:59:59"}`

    if (isNaN(endDateOnly.getTime()) || isNaN(startDateOnly.getTime())) return true
    
    return formattedCurrentDateTime < formattedStartDateTime || formattedCurrentDateTime > formattedEndDateTime
  }

  /**
   * Navigate to next task
   */
  const handleNextTask = () => {
    setCurrentTaskIndex((prevIndex) => (prevIndex + 1) % tareas.length)
  }

  /**
   * Navigate to previous task
   */
  const handlePreviousTask = () => {
    setCurrentTaskIndex((prevIndex) => (prevIndex - 1 + tareas.length) % tareas.length)
  }

  const currentTarea = tareas[currentTaskIndex]

  // Función para abrir modal
  const openModal = () => {
    if (!currentTarea) return
    setModalTaskId(currentTarea.task_id)
    setModalTaskTitle(currentTarea.title)
    setIsModalOpen(true)
  }

  // Función para cerrar modal
  const closeModal = () => {
    setIsModalOpen(false)
    setModalTaskId(null)
    setModalTaskTitle("")
  }


  return (
    <>
      <Breadcrumb pageName={courseTitle} />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <button
            id="back-button"
            className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-3xl">
            <h2 className="text-2xl font-bold mb-2">Información del Curso</h2>
            <p className="text-indigo-100 text-sm">
              {tareas.length > 0 ? `${tareas.length} tareas disponibles` : "No hay tareas disponibles"}
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : tareas.length > 0 ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tarea {currentTaskIndex + 1} de {tareas.length}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousTask}
                    disabled={currentTaskIndex === 0}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-50 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    aria-label="Tarea anterior"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextTask}
                    disabled={currentTaskIndex === tareas.length - 1}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-50 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    aria-label="Tarea siguiente"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-inner">
                <div className="flex flex-col">
                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      {currentTarea.title}
                      {currentTarea.submission_complete && (
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm">
                          <CheckCircle className="mr-1.5 h-4 w-4" /> Entregada
                        </span>
                      )}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {currentTarea.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Fecha de inicio</p>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          {formatDate(currentTarea.taskStart)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Hora de inicio</p>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          {formatTime24Hour(currentTarea.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Calendar className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Fecha límite</p>
                        <p className="text-base text-gray-700 dark:text-gray-300">{formatDate(currentTarea.endTask)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Clock className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Hora límite</p>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          {formatTime24Hour(currentTarea.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                      onClick={openModal}
                      disabled={
                        isDateOutOfRange(currentTarea.taskStart, currentTarea.startTime, currentTarea.endTask, currentTarea.endTime) ||
                        (currentTarea.submission_complete && isCommentsBlocked)
                      }
                      className={`px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center shadow-md ${
                        isDateOutOfRange(currentTarea.taskStart, currentTarea.startTime, currentTarea.endTask, currentTarea.endTime) ||
                        (currentTarea.submission_complete && isCommentsBlocked)
                          ? "bg-gray-400 cursor-not-allowed"
                          : currentTarea.submission_complete
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-blue-600 hover:bg-purple-700"
                      }`}
                    >
                      {currentTarea.submission_complete && isCommentsBlocked
                        ? <><Lock className="mr-2 h-5 w-5" /> Entrega Bloqueada</>
                        : <><CheckCircle className="mr-2 h-5 w-5" /> {currentTarea.submission_complete ? "Actualizar Entrega" : "Entregar Capítulo"}</>
                      }
                    </button>

                    <button
                      onClick={() =>
                        handleNavigateToCapitulo(
                          currentTarea.task_id,
                          currentTarea.submission_complete ?? false,
                          currentTarea.title,
                          currentTarea.endTask,
                          currentTarea.endTime,
                        )
                      }
                      disabled={isDateOutOfRange(currentTarea.taskStart, currentTarea.startTime, currentTarea.endTask, currentTarea.endTime)}
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDateOutOfRange(currentTarea.taskStart, currentTarea.startTime, currentTarea.endTask, currentTarea.endTime)
                        ? "bg-gray-400 text-white cursor-not-allowed focus:ring-gray-500"
                        : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                        }`}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" /> Comentarios
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isDateOutOfRange(currentTarea.taskStart, currentTarea.startTime, currentTarea.endTask, currentTarea.endTime)
                    ? "La tarea no está en el rango de fechas permitido."
                    : currentTarea.submission_complete && isCommentsBlocked
                      ? "El administrador ha bloqueado la revisión. No puedes actualizar esta entrega."
                      : currentTarea.submission_complete
                        ? "Ya realizaste una entrega. Puedes actualizarla antes de la fecha límite."
                        : "Entrega la tarea antes de la fecha límite."}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                <XCircle className="h-10 w-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No hay tareas disponibles</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                No se encontraron tareas para este curso. Vuelve más tarde o contacta con tu profesor.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Aquí se incluye el modal */}
      {modalTaskId !== null && currentTarea && (
        <ThesisDeliveryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          taskId={modalTaskId}
          taskTitle={modalTaskTitle}
          hasPreviousSubmission={currentTarea.submission_complete}
        />
      )}
    </>
  )
}

export default CourseInfo
