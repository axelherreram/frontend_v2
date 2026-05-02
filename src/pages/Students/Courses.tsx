import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../../context/UserProfileContext"
import { getCursos } from "../../ts/General/GetCourses"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { BookOpen, GraduationCap, Loader2 } from "lucide-react"

/**
 * Component for displaying available courses
 */
const Courses: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleNavigate = (courseTitle: string, courseId: number) => {
    navigate("/estudiantes/info-curso", { state: { courseTitle, courseId } })
  }

  useEffect(() => {
    if (!profile) return
    const fetchData = async () => {
      try {
        const currentYear = new Date().getFullYear()
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
  }, [profile])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Cargando cursos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <>
      <Breadcrumb pageName="Cursos" />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
          <GraduationCap className="inline-block h-10 w-10 mr-3 text-blue-500" /> Listado de Cursos
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-items-center">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="h-16 w-16 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">{course.courseName}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{course.description}</p>
              <button
                onClick={() => handleNavigate(course.courseName, course.course_id)}
                className="w-full py-3 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ver más detalles
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Courses
