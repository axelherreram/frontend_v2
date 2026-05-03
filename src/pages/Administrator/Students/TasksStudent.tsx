import type React from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getTareasSede, type Tarea } from "../../../ts/General/GetTasksHeadquarters"
import { getTareasEstudiante, type TareaEstudiante } from "../../../ts/Students/GetTasksStudent"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import Swal from "sweetalert2"
import AyudaTareasEstudiante from "../../../components/Tours/Administrator/StudentTasksTour"
import { ArrowLeft, FileText, BookOpen, Clock, CalendarDays, XCircle } from "lucide-react" // Import Lucide React icons

const TasksStudent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [tareasEstudiante, setTareasEstudiante] = useState<TareaEstudiante[]>([])
  const { estudiante, selectedAño, selectedCurso } = location.state || {}

  const sedeId = profile?.sede ?? null

  useEffect(() => {
    const fetchTasks = async () => {
      if (sedeId !== null && selectedAño) {
        try {
          const retrievedTasks = await getTareasSede(sedeId, selectedAño)
          setTareas(retrievedTasks)
        } catch (err) {}
      }
    }
    fetchTasks()
  }, [sedeId, selectedAño])

  useEffect(() => {
    const fetchStudentTasks = async () => {
      if (estudiante && selectedAño && sedeId !== null) {
        const studentTasksData = await getTareasEstudiante(estudiante.id, selectedAño, sedeId)
        setTareasEstudiante(studentTasksData)
      }
    }
    fetchStudentTasks()
  }, [estudiante, selectedAño, sedeId])

  const sortedTasks = tareas.sort((a, b) => {
    if (a.typeTask_id === 1 && b.typeTask_id !== 1) {
      return -1
    }
    if (a.typeTask_id !== 1 && b.typeTask_id === 1) {
      return 1
    }
    return 0
  })

  const handleNavigate = (task: Tarea) => {
    const studentTask = tareasEstudiante.find((t) => t.task_id === task.task_id)

    if (studentTask && task.typeTask_id !== 1) {
      if (!studentTask.submission_complete) {
        Swal.fire({
          icon: "warning",
          title: "Aviso",
          text: "No puedes acceder al capítulo porque la tarea no ha sido entregada por el estudiante.",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "De Acuerdo",
        })
        return
      }
    }

    if (task.typeTask_id === 1) {
      navigate("/administrador/propuestas", {
        state: { tarea: task, estudiante, selectedAño },
      })
    } else {
      navigate("/administrador/capitulo", {
        state: { tarea: task, estudiante, selectedAño, selectedCurso },
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getUTCFullYear()}`
  }

  const formatTime24Hour = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number)
    const amPm = hours < 12 ? "AM" : "PM"
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${amPm}`
  }

  return (
    <>
      <Breadcrumb pageName="Tareas del Estudiante" />
      <div className="mb-6 flex items-center justify-between sm:justify-start gap-4">
        <button
          id="back-button"
          className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
        </button>
        <AyudaTareasEstudiante />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {sortedTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
            <XCircle className="h-20 w-20 mb-6 text-red-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡No Se Encontraron Tareas Creadas!  
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Parece que no hay tareas asignadas para este estudiante en el año seleccionado.
            </p>
          </div>
        ) : (
          <>
            <div id="proposals-section" className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-500" /> Propuestas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTasks
                  .filter((task) => task.typeTask_id === 1)
                  .map((task) => (
                    <div
                      key={task.task_id}
                      className="p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-900 border border-blue-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                      onClick={() => handleNavigate(task)}
                    >
                      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">{task.title}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>
                      <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                          Inicio: {formatDate(task.taskStart)}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          Hora Inicio: {formatTime24Hour(task.startTime)}
                        </p>
                        <p className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                          Fin: {formatDate(task.endTask)}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          Hora Fin: {formatTime24Hour(task.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div id="chapters-section">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-green-500" /> Capítulos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTasks
                  .filter((task) => task.typeTask_id !== 1)
                  .map((task) => (
                    <div
                      key={task.task_id}
                      className="p-6 rounded-2xl shadow-lg cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                      onClick={() => handleNavigate(task)}
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>
                      <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                          Inicio: {formatDate(task.taskStart)}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          Hora Inicio: {formatTime24Hour(task.startTime)}
                        </p>
                        <p className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                          Fin: {formatDate(task.endTask)}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          Hora Fin: {formatTime24Hour(task.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default TasksStudent
