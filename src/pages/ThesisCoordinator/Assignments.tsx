import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getRevisionesEnRevision } from "../../ts/ThesisCoordinatorandReviewer/GetReviewsInReview"
import { useProfile } from "../../context/UserProfileContext"
import TourAssignments from "../../components/Tours/ThesisCoordinator/TourAssignments"
import type React from "react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react" // Import Lucide React icons

/**
 * Component for displaying thesis review assignments
 */
const Assignments: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const userId = profile?.user_id ?? null
  const [revisiones, setRevisiones] = useState<any[]>([])
  const [searchCarnet, setSearchCarnet] = useState("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [filteredRevisiones, setFilteredRevisiones] = useState(revisiones)
  const [isCarnetSearch, setIsCarnetSearch] = useState(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [revisionesPerPage, setRevisionesPerPage] = useState(5)
  const [maxPageButtons, setMaxPageButtons] = useState(10)

  /**
   * Fetch reviews from the API
   */
  const fetchRevisiones = useCallback(
    async (order: "asc" | "desc", carnet: string) => {
      setIsSearching(true) // Set searching state to true
      try {
        const revisiones = await getRevisionesEnRevision(order, carnet)
        if (userId) {
          const revisionesFiltradas = revisiones.filter(
            (revision) => !revision.assignedReviews.some((assignedReview) => assignedReview.user_id === userId),
          )
          setRevisiones(revisionesFiltradas)
          setFilteredRevisiones(revisionesFiltradas)
        }
        setIsCarnetSearch(carnet.length >= 10)
      } catch (error) {
        setRevisiones([])
        setFilteredRevisiones([])
        setIsCarnetSearch(carnet.length >= 10)
      } finally {
        setIsSearching(false) // Set searching state to false
      }
    },
    [userId],
  )

  /**
   * Load reviews when carnet or order changes
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const carnetValue = searchCarnet.length >= 10 ? searchCarnet : ""
      fetchRevisiones(order, carnetValue)
    }, 300) // Small delay to improve performance
    return () => clearTimeout(timer)
  }, [order, searchCarnet, fetchRevisiones])

  // Pagination calculations
  const indexOfLastRevision = currentPage * revisionesPerPage
  const indexOfFirstRevision = indexOfLastRevision - revisionesPerPage
  const currentRevisiones = filteredRevisiones.slice(indexOfFirstRevision, indexOfLastRevision)
  const totalPages = Math.ceil(filteredRevisiones.length / revisionesPerPage)

  /**
   * Handle pagination
   */
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  /**
   * Change the sort order of reviews
   */
  const handleChangeOrder = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
  }

  /**
   * Format date to local format
   */
  const formatDate = (date: string) => {
    const formattedDate = new Date(date)
    return formattedDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  /**
   * Navigate to review details page
   */
  const handleVerDetalle = (userId: number) => {
    navigate(`/coordinadortesis/asignaciones/detalle`, { state: { userId } })
  }

  /**
   * Handle search input change
   */
  const handleChangeSearchCarnet = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCarnet(e.target.value)
  }

  /**
   * Adjust page configuration based on window size
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRevisionesPerPage(10)
        setMaxPageButtons(3)
      } else {
        setRevisionesPerPage(10)
        setMaxPageButtons(10)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getPageRange = () => {
    const range: number[] = []
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    return range
  }

  return (
    <>
      <Breadcrumb pageName="Revisiones en revisión" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex items-center flex-grow w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar por Carnet de Estudiante 🔍"
              value={searchCarnet}
              onChange={handleChangeSearchCarnet}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600 sm:w-80"
            />
            <Search className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-300" />
            {isSearching && (
              <div className="absolute right-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="sr-only">Buscando...</span>
              </div>
            )}
          </div>
          <button
            id="cambiar-orden"
            onClick={handleChangeOrder}
            className="px-5 py-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Cambiar Orden ({order === "asc" ? "Ascendente" : "Descendente"})
          </button>
          <TourAssignments />
        </div>
        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <table id="tabla-revisiones" className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center">Nombre</th>
                {/* These columns are hidden on small screens */}
                <th className="py-3 px-4 text-center hidden md:table-cell">Carnet</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Fec. Solicitud</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Estado</th>
                <th className="py-3 px-4 text-center rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentRevisiones.length > 0 ? (
                currentRevisiones.map((revision) => (
                  <tr
                    key={revision.revision_thesis_id}
                    className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
                    onClick={() => handleVerDetalle(revision.user.user_id)}
                  >
                    <td className="py-3 px-4 text-center text-black dark:text-white">{revision.user.name}</td>
                    {/* These columns are hidden on small screens */}
                    <td className="py-3 px-4 text-center text-black dark:text-white hidden md:table-cell">
                      {revision.user.carnet}
                    </td>
                    <td className="py-3 px-4 text-center text-black dark:text-white hidden md:table-cell">
                      {formatDate(revision.date_revision)}
                    </td>
                    <td
                      className={`py-3 px-4 text-center text-black dark:text-white font-semibold hidden md:table-cell
    ${revision.approval_status === "En revisión"
                          ? "bg-yellow-300 dark:bg-yellow-500"
                          : revision.approval_status === "Rechazado"
                            ? "bg-red-600 dark:bg-red-600"
                            : ""
                        }`}
                    >
                      {revision.approval_status}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        id="boton-ver-detalle"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {isCarnetSearch && searchCarnet.length >= 10
                      ? "No existe carnet del Estudiante"
                      : "No hay solicitudes de revisión"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {getPageRange().map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 shadow-sm ${currentPage === page
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Assignments
