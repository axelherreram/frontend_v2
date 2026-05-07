import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../../context/UserProfileContext"
import { useYears } from "../../context/YearsContext"
import { getCursos } from "../../ts/General/GetCourses"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { BookOpen, GraduationCap, Loader2, CalendarDays, ChevronRight } from "lucide-react"

/**
 * Component for displaying available courses
 */
const Courses: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { years } = useYears()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const activeYear = years.find((y) => y.year === currentYear)?.year || currentYear

  const handleNavigate = (courseTitle: string, courseId: number) => {
    navigate("/estudiantes/info-curso", { state: { courseTitle, courseId } })
  }

  useEffect(() => {
    if (!profile) return
    const fetchData = async () => {
      try {
        const cursos = await getCursos(profile.sede, currentYear)
        const updatedCourses = cursos.map((course) => {
          let description = ""
          if (course.course_id === 1) {
            description = "Este curso cubre la primera fase del proyecto de graduación, enfocándose en la planificación y diseño."
          } else if (course.course_id === 2) {
            description = "En este curso, completarás el desarrollo y presentación final de tu proyecto de graduación."
          }
          return { ...course, description }
        })
        setCourses(updatedCourses)
        setLoading(false)
      } catch {
        setError("Hubo un error al recuperar los datos.")
        setLoading(false)
      }
    }
    fetchData()
  }, [profile, currentYear])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="ml-4 text-lg font-medium text-gray-600 dark:text-gray-300">Cargando cursos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-800">
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Breadcrumb pageName="Mis Cursos" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide">Ciclo Académico {activeYear}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Mis Cursos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Asignados</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-base">
              Selecciona el curso en el que deseas trabajar para ver tus tareas, subir capítulos y revisar los comentarios de revisión.
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="w-full max-w-md group flex flex-col bg-white dark:bg-boxdark rounded-[2rem] p-8 
                         border border-gray-100 dark:border-strokedark shadow-sm
                         hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30
                         transition-all duration-300 ease-in-out"
            >
              {/* Card Icon */}
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="h-8 w-8 text-white" />
              </div>

              {/* Card Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  {course.courseName}
                </h2>
                <p className="text-gray-600 dark:text-bodydark mb-8 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleNavigate(course.courseName, course.course_id)}
                className="w-full flex items-center justify-between px-6 py-4 
                           bg-gray-50 dark:bg-meta-4 hover:bg-blue-600 dark:hover:bg-blue-600
                           text-gray-700 dark:text-white hover:text-white
                           rounded-xl font-semibold transition-colors duration-300"
              >
                <span>Acceder al curso</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Courses
