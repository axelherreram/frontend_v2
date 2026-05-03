import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getTimeLineEstudiante } from "../../../ts/General/GetTimeLineStudent"
import TourTimeLine from "../../../components/Tours/Administrator/TourTimeLine"
import ModalNota from "../../../components/Modals/UpdateNote"
import Swal from "sweetalert2"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import generaPDFIndividual from "../../../components/Pdfs/generatesIndividualPDF"
import { ArrowLeft, CalendarDays, Clock, FileText, Award, Users, Printer, XCircle } from "lucide-react" // Import Lucide React icons

/**
 * Interface for a single event in the timeline
 */
interface TimeLineEvent {
  user_id: number
  typeEvent: string
  description: string
  task_id: number
  date: string
}

/**
 * Timeline Component
 * Displays a chronological timeline of student activities
 */
const TimeLine: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState<TimeLineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { estudiante, selectedAño, selectedCurso } = location.state || {}
  const studentName = estudiante ? estudiante.userName : "Desconocido"
  const userId = estudiante ? estudiante.id : null

  useEffect(() => {
    if (!userId) {
      showAlert("error", "¡Error!", "No se proporcionó un user_id válido.")
      setLoading(false)
      return
    }

    const fetchTimeline = async () => {
      try {
        setLoading(true)
        const logs = await getTimeLineEstudiante(userId)
        setEvents(
          logs
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((log) => ({
              user_id: log.user_id,
              typeEvent: log.typeEvent,
              description: log.description,
              task_id: log.task_id,
              date: new Date(log.date).toLocaleDateString(),
            })),
        )
      } catch (err: any) {
        showAlert("error", "Error", "Hubo un problema al cargar la línea de tiempo.")
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
  }, [userId])

  const showAlert = (type: "success" | "error" | "warning", title: string, text: string) => {
    const confirmButtonColor = type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#ffc107"
    Swal.fire({
      icon: type,
      title,
      text,
      confirmButtonColor,
      confirmButtonText: "De Acuerdo",
    })
  }

  const handlePrintPDF = () => {
    if (estudiante && selectedAño) {
      generaPDFIndividual(estudiante, selectedAño, selectedCurso)
    } else {
      showAlert("warning", "Información Faltante", "No se puede generar el reporte sin datos del estudiante o año.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center text-gray-700 dark:text-gray-300">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg">Cargando línea de tiempo... ⏳</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Breadcrumb pageName="TimeLine" />
      <div className="mb-6 flex items-center justify-between sm:justify-start gap-4">
        <button
          id="back-button"
          className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
        </button>
        <TourTimeLine />
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Award className="h-5 w-5 inline-block mr-2" /> Nota
        </button>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center text-center md:text-left w-full md:w-auto justify-center md:justify-start">
            <Users className="h-7 w-7 mr-3 text-blue-600 flex-shrink-0" />
            <span className="break-words">Línea de Tiempo - {studentName}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0 w-full sm:w-auto justify-center">
            <button
              id="print-report"
              onClick={handlePrintPDF}
              className="flex items-center justify-center px-6 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-nowrap"
            >
              <Printer className="h-5 w-5 mr-2 flex-shrink-0" /> Imprimir Reporte
            </button>
            <button
              id="view-tasks"
              onClick={() => {
                navigate("/coordinadorgeneral/tareas-estudiante", {
                  state: { estudiante, selectedAño, selectedCurso },
                })
              }}
              className="flex items-center justify-center px-6 py-2 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 whitespace-nowrap"
            >
              <FileText className="h-5 w-5 mr-2 flex-shrink-0" /> Ver Tareas
            </button>
          </div>
        </div>
        <div id="timeline" className="mt-8 overflow-x-auto pb-4">
          {events.length > 0 ? (
            <ol className="flex items-center min-w-max bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              {events.map((event, index) => (
                <li
                  key={index}
                  className="relative flex-shrink-0 flex flex-col justify-start items-center text-center"
                  style={{ minWidth: "280px", maxWidth: "350px", minHeight: "220px" }}
                >
                  <div className="flex flex-col items-center">
                    <div className="z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full ring-4 ring-white dark:bg-blue-900 dark:ring-gray-900 shadow-md">
                      <CalendarDays className="w-6 h-6 text-blue-800 dark:text-blue-300" />
                    </div>
                    {index < events.length - 1 && (
                      <div
                        className="flex w-full bg-gray-300 h-1 dark:bg-gray-700 mt-4"
                        style={{ minWidth: "100px" }}
                      ></div>
                    )}
                  </div>
                  <div className="mt-6 px-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.typeEvent}</h3>
                    <time className="block mb-2 text-sm font-medium leading-none text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" /> {event.date}
                    </time>
                    <p className="text-base font-normal text-gray-700 dark:text-gray-300">{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
              <XCircle className="h-20 w-20 mb-6 text-red-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ¡No Se Encontraron Eventos En Este Estudiante!  
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Parece que no hay actividades registradas para este estudiante.
              </p>
            </div>
          )}
        </div>
      </div>
      {userId && selectedCurso && (
        <ModalNota isOpen={modalOpen} onClose={() => setModalOpen(false)} studentId={userId} courseId={selectedCurso} />
      )}
    </>
  )
}

export default TimeLine
