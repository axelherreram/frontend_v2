import type React from "react"
import { useState, useEffect } from "react"
import { createTarea } from "../../ts/Administrator/CreateTasks"
import { updateTarea } from "../../ts/Administrator/UpdateTask"
import { getCursos } from "../../ts/General/GetCourses"
import { useProfile } from "../../context/UserProfileContext"
import { getDatosTarea } from "../../ts/Administrator/GetTaskData"
import Swal from "sweetalert2"

interface CreateTaskProps {
  onClose: () => void
  mode: "create" | "edit"
  taskId: number | null
}

interface FormState {
  selectedCurso: string
  selectedTipoTarea: string
  title: string
  description: string
  taskStart: string
  endTask: string
  startTime: string
  endTime: string
}

const CreateTask: React.FC<CreateTaskProps> = ({ onClose, mode, taskId }) => {
  const { profile } = useProfile()
  const [cursos, setCursos] = useState<any[]>([])
  const [form, setForm] = useState<FormState>({
    selectedCurso: "",
    selectedTipoTarea: "",
    title: "",
    description: "",
    taskStart: "",
    endTask: "",
    startTime: "",
    endTime: "",
  })
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!profile?.sede) return
    const fetchCursos = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const cursosData = await getCursos(profile.sede!, currentYear)
        setCursos(cursosData || [])
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los cursos.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [profile])

  useEffect(() => {
    const fetchTaskData = async () => {
      if (mode === "edit" && taskId) {
        try {
          const taskData = await getDatosTarea(taskId)
          if (taskData) {
            const { title, description, taskStart, endTask, startTime, endTime, course_id, typeTask_id } = taskData
            setForm({
              selectedCurso: course_id.toString(),
              selectedTipoTarea: typeTask_id.toString(),
              title,
              description,
              taskStart: taskStart.split("T")[0],
              endTask: endTask.split("T")[0],
              startTime,
              endTime,
            })
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los datos de la tarea.",
            confirmButtonColor: "#ef4444",
            confirmButtonText: "De Acuerdo",
          })
        }
      }
    }

    fetchTaskData()
  }, [mode, taskId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { selectedCurso, selectedTipoTarea, title, description, taskStart, endTask, startTime, endTime } = form

    if (!selectedCurso || !title || !description || !taskStart || !endTask || !startTime || !endTime) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor complete todos los campos.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }

    if (new Date(endTask) <= new Date(taskStart)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La Fecha Final debe ser mayor a la Fecha Inicial.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }

    if (startTime >= endTime) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La Hora Final debe ser mayor a la Fecha Inicial.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }

    try {
      setLoading(true)
      const sede = profile?.sede
      const selectedCourse = cursos.find((curso) => curso.course_id.toString() === selectedCurso)

      if (!selectedCourse) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Curso seleccionado no encontrado.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
        return
      }

      let resultMessage: string | null = null

      if (mode === "create") {
        const tareaData = {
          course_id: selectedCourse.course_id,
          sede_id: sede,
          typeTask_id: Number.parseInt(selectedTipoTarea),
          title,
          description,
          taskStart,
          endTask,
          startTime,
          endTime,
        }
        resultMessage = await createTarea(tareaData)
      } else if (mode === "edit" && taskId) {
        const tareaDataUpdate = {
          title,
          description,
          taskStart,
          endTask,
          startTime,
          endTime,
        }
        resultMessage = await updateTarea(taskId, tareaDataUpdate)
      }

      if (resultMessage) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo ${mode === "create" ? "crear" : "actualizar"} la tarea "${title}". ${resultMessage}`,
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      } else {
        Swal.fire({
          icon: "success",
          title: mode === "create" ? "¡Tarea creada!" : "¡Tarea actualizada!",
          text: `La tarea "${title}" ha sido ${mode === "create" ? "creada" : "actualizada"} exitosamente.`,
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        })
        onClose()
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Error desconocido",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-2xl mt-16 md:max-w-3xl md:mt-15 lg:max-w-4xl lg:mt-15 lg:ml-[350px] transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {mode === "create" ? "Crear Tarea" : "Editar Tarea"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === "create" ? "Crea una nueva tarea para el curso" : "Actualiza la información de la tarea"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course and Task Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📚 Curso</label>
              <select
                name="selectedCurso"
                value={form.selectedCurso}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
                disabled={mode === "edit"}
              >
                <option value="">Seleccionar curso</option>
                {cursos.map(({ course_id, courseName }) => (
                  <option key={course_id} value={course_id}>
                    {courseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📋 Tipo de Tarea
              </label>
              <select
                name="selectedTipoTarea"
                value={form.selectedTipoTarea}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
                disabled={mode === "edit"}
              >
                <option value="">Seleccionar tipo</option>
                <option value="1">Propuesta de Tesis</option>
                <option value="2">Entrega de Capítulos</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ✏️ Título de la Tarea
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                         transition-all duration-200 outline-none"
              placeholder="Ingrese el título de la tarea"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                         transition-all duration-200 outline-none resize-none"
              placeholder="Describe los detalles de la tarea"
              required
            />
          </div>

          {/* Dates and Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📅 Fecha Inicial
              </label>
              <input
                type="date"
                name="taskStart"
                value={form.taskStart}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📅 Fecha Final</label>
              <input
                type="date"
                name="endTask"
                value={form.endTask}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🕐 Hora Inicio</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🕐 Hora Final</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 font-medium rounded-md transition-all duration-200 text-sm
                         border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-medium rounded-md transition-all duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : mode === "create" ? (
                "Crear Tarea"
              ) : (
                "Actualizar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTask
