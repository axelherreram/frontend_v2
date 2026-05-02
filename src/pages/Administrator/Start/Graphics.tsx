import type React from "react"
import { useEffect, useState } from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { getStudentsSede } from "../../../ts/Administrator/GetStudentsSede.ts"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb.tsx"
import CardDataStats from "../../../components/Cards/CardDataStats.tsx"
import TareasEstudiantes from "../../../components/Graphics/Administrator/TasksStudents.tsx"
import PorcentajeSede from "../../../components/Graphics/Administrator/PercentageHeadquarters.tsx"
import { Users, CheckCircle, Clock, MapPin, GraduationCap } from "lucide-react" // Import Lucide icons

/**
 * Charts Component
 * Displays statistical data and charts for students and revisions
 */
const Graphics: React.FC = () => {
  const { profile } = useProfile()
  // State to store the total number of students, total students per sede, and revision data
  const [totalStudents, setTotalStudents] = useState<number | null>(null)
  const [totalStudentsSede, setTotalStudentsSede] = useState<number | null>(null)
  const [totalApprovedRevisions, setTotalApprovedRevisions] = useState<number | null>(null)
  const [totalInRevisions, setTotalInRevisions] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /**
   * Effect hook to fetch data when the component mounts
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.sede) return
      setIsLoading(true)
      try {
        const sedeId = profile.sede // Getting the 'sede' id from the profile data
        if (sedeId) {
          // Fetching students data for the specific 'sede'
          const studentsData = await getStudentsSede(sedeId)
          setTotalStudents(studentsData.totalStudents)
          setTotalStudentsSede(studentsData.totalStudentsSede)
          setTotalApprovedRevisions(studentsData.totalApprovedRevisions)
          setTotalInRevisions(studentsData.totalInRevisions)
        }
      } catch (error) {
        // Error handling
        
        setTotalStudents(0)
        setTotalStudentsSede(0)
        setTotalApprovedRevisions(0)
        setTotalInRevisions(0)
      } finally {
        setIsLoading(false)
      }
    }
    // Invoking the function to fetch data
    fetchData()
  }, [profile])

  // Calculate percentages for display
  const studentSedePercentage =
    totalStudentsSede && totalStudents ? ((totalStudentsSede / (totalStudents || 1)) * 100).toFixed(2) : "0"
  const approvedRevisionsPercentage =
    totalApprovedRevisions && totalInRevisions
      ? ((totalApprovedRevisions / (totalInRevisions || 1)) * 100).toFixed(2)
      : "0"

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-900 sm:px-6 lg:px-8">
      {/* Header section with Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb pageName="Gráficas" />
      </div>
      {/* Stats Cards Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Resumen de Estadísticas</h2>
        {isLoading ? (
          // Loading state for stats cards
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <div className="mt-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-4 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        ) : (
          // Actual stats cards
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
            <CardDataStats
              title="Total Estudiantes"
              total={totalStudents ? totalStudents.toLocaleString() : "0"}
              rate={`${studentSedePercentage}%`}
              levelUp={Number(studentSedePercentage) > 0}
              levelDown={Number(studentSedePercentage) < 0}
            >
              <Users className="h-6 w-6" />
            </CardDataStats>
            <CardDataStats
              title="Revisiones Aprobadas"
              total={totalApprovedRevisions ? totalApprovedRevisions.toLocaleString() : "0"}
              rate={`${approvedRevisionsPercentage}%`}
              levelUp={Number(approvedRevisionsPercentage) > 0}
              levelDown={Number(approvedRevisionsPercentage) < 0}
            >
              <CheckCircle className="h-6 w-6" />
            </CardDataStats>
            <CardDataStats
              title="Total en Revisiones"
              total={totalInRevisions ? totalInRevisions.toLocaleString() : "0"}
              rate={`${
                100 - Number(approvedRevisionsPercentage) > 0
                  ? (100 - Number(approvedRevisionsPercentage)).toFixed(2)
                  : "0"
              }%`}
              levelUp={false}
              levelDown={100 - Number(approvedRevisionsPercentage) > 0}
            >
              <Clock className="h-6 w-6" />
            </CardDataStats>
          </div>
        )}
      </div>
      {/* Charts Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Visualización de Datos</h2>
        {isLoading ? (
          // Loading state for charts
          <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12 animate-pulse xl:col-span-6">
              <div className="h-96 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-[calc(100%-2rem)] w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="col-span-12 animate-pulse xl:col-span-6">
              <div className="h-96 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-[calc(100%-2rem)] w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ) : (
          // Actual charts
          <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12 transition-transform duration-300 xl:col-span-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Porcentaje por Sede</h3>
                </div>
                <PorcentajeSede />
              </div>
            </div>
            <div className="col-span-12 transition-transform duration-300 xl:col-span-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Tareas de Estudiantes</h3>
                </div>
                <TareasEstudiantes />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Additional Info Section */}
      {!isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Actividad</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Estudiantes activos: {totalStudentsSede || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Graphics
