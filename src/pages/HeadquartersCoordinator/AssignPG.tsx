import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { getCursos } from "../../ts/General/GetCourses"
import { crearAsignacionSedeCurso } from "../../ts/HeadquartersCoordinator/CreatePG"
import TourAssignPG from "../../components/Tours/HeadquartersCoordinator/TourAssignPG"
import Swal from "sweetalert2"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { CheckSquare, BookOpen, Loader2 } from "lucide-react" // Import Lucide React icons

/**
 * Component for assigning graduation projects to headquarters
 */
const AssignPG: React.FC = () => {
  const { profile } = useProfile()
  const sedeId = profile?.sede ?? null
  const sedeNombre = profile?.NombreSede ?? ""
  const [pg1, setPg1] = useState(false)
  const [pg2, setPg2] = useState(false)
  const [pg1Disabled, setPg1Disabled] = useState(false)
  const [pg2Disabled, setPg2Disabled] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile?.sede) return
    const fetchCursos = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const cursos = await getCursos(profile.sede!, currentYear)
        const pg1Available = cursos.some((curso) => curso.course_id === 1)
        const pg2Available = cursos.some((curso) => curso.course_id === 2)
        setPg1(pg1Available)
        setPg2(pg2Available)
        setPg1Disabled(pg1Available)
        setPg2Disabled(pg2Available)
        setIsButtonDisabled(pg1Available && pg2Available)
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      }
    }
    fetchCursos()
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sedeId) return

    setLoading(true)
    try {
      const currentYear = new Date().getFullYear()
      let payload = null
      if (pg1 && !pg1Disabled) {
        payload = { course_id: 1, sede_id: sedeId, year_id: currentYear, courseActive: true }
      } else if (pg2 && !pg2Disabled) {
        payload = { course_id: 2, sede_id: sedeId, year_id: currentYear, courseActive: true }
      }

      if (payload) {
        await crearAsignacionSedeCurso(payload)
        Swal.fire({
          icon: "success",
          title: "¡Asignación completada! 🎉",
          text: `El curso ${payload.course_id === 1 ? "PG I" : "PG II"} se asignó correctamente a la sede "${sedeNombre}" para el año ${currentYear}.`,
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        })
        if (payload.course_id === 1) setPg1Disabled(true)
        if (payload.course_id === 2) setPg2Disabled(true)
        setIsButtonDisabled(pg1Disabled && pg2Disabled)
      } else {
        Swal.fire({
          icon: "warning",
          title: "Nada que asignar",
          text: "Ambos cursos ya están asignados o no se seleccionó ninguno nuevo.",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "De Acuerdo",
        })
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error en la asignación",
        text: error.message,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Breadcrumb pageName="Asignar PG" />
      <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-16 border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-blue-500" /> Asignar PG1 y PG2 a {sedeNombre}{" "}
          </h2>
          <TourAssignPG />
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="pg1"
                  checked={pg1}
                  onChange={(e) => setPg1(e.target.checked)}
                  disabled={pg1Disabled || loading}
                  className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 transition-all duration-200"
                />
                <label
                  htmlFor="pg1"
                  className={`text-lg font-medium text-gray-800 dark:text-white ${pg1Disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Activar Proyecto de Graduación I
                </label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="pg2"
                  checked={pg2}
                  onChange={(e) => setPg2(e.target.checked)}
                  disabled={pg2Disabled || loading}
                  className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 transition-all duration-200"
                />
                <label
                  htmlFor="pg2"
                  className={`text-lg font-medium text-gray-800 dark:text-white ${pg2Disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Activar Proyecto de Graduación II
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isButtonDisabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-blue-600 to-purple-700"}`}
            disabled={isButtonDisabled || loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" /> Asignando...
              </>
            ) : (
              <>
                <CheckSquare className="h-5 w-5 mr-2" /> Asignar
              </>
            )}
          </button>
        </form>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center text-white text-xl">
            <Loader2 className="animate-spin h-12 w-12 text-blue-400 mb-4" />
            Asignando cursos...
          </div>
        </div>
      )}
    </>
  )
}

export default AssignPG
