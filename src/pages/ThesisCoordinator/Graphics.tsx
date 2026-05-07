import type React from "react"
import { useEffect, useState } from "react"
import { getTotalesRevision } from "../../ts/ThesisCoordinatorandReviewer/TotalsReview.ts"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb.tsx"
import CardDataStats from "../../components/Cards/CardDataStats.tsx"
import GraficaPorSede from "../../components/Graphics/ThesisCoordinator/TotalReviewsPerHeadquarters.tsx"
import { List, CheckCircle, XCircle, AlertCircle, CalendarDays } from "lucide-react"
import { useYears } from "../../context/YearsContext"

/**
 * Component for displaying thesis review statistics and charts
 */
const Graphics: React.FC = () => {
  const { years } = useYears()
  const currentYear = new Date().getFullYear()
  const activeYear = years.find((y) => y.year === currentYear)?.year || currentYear

  // State for storing review statistics
  const [totales, setTotales] = useState({
    totalRevisions: 0,
    totalApprovedRevisions: 0,
    totalRejectedRevisions: 0,
    totalActiveRevisions: 0,
    totalRevisores: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)

  /**
   * Fetch review statistics data when component mounts
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTotalesRevision()
        setTotales(data.data)
      } catch (error) {
        console.error("Error cargando las estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Breadcrumb pageName="Métricas Globales" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:gap-7.5">
          {loading ? (
            <div className="flex justify-center items-center col-span-full min-h-[200px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Cargando métricas...</p>
              </div>
            </div>
          ) : (
            <>
              <CardDataStats
                title="Total de Revisiones"
                total={totales.totalRevisions.toLocaleString()}
                rate=""
                levelDown={false}
              >
                <List className="w-6 h-6" />
              </CardDataStats>
              <CardDataStats
                title="Revisiones Aprobadas"
                total={totales.totalApprovedRevisions.toLocaleString()}
                rate=""
                levelDown={false}
              >
                <CheckCircle className="w-6 h-6" />
              </CardDataStats>
              <CardDataStats
                title="Revisiones Rechazadas"
                total={totales.totalRejectedRevisions.toLocaleString()}
                rate=""
                levelDown={false}
              >
                <XCircle className="w-6 h-6" />
              </CardDataStats>
              <CardDataStats
                title="Revisiones Activas"
                total={totales.totalActiveRevisions.toLocaleString()}
                rate=""
                levelDown={false}
              >
                <AlertCircle className="w-6 h-6" />
              </CardDataStats>
            </>
          )}
        </div>

        {/* Chart Section */}
        <div className="mt-8 bg-white dark:bg-boxdark rounded-[2rem] border border-gray-100 dark:border-strokedark shadow-sm overflow-hidden p-6 transition-colors duration-300">
          <GraficaPorSede />
        </div>
      </div >
    </>
  )
}

export default Graphics
