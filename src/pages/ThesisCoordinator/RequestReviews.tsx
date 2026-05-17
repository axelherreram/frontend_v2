import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getRevisionesPendientes } from "../../ts/ThesisCoordinatorandReviewer/GetPendingRevisions"
import TourRequestReviews from "../../components/Tours/ThesisCoordinator/TourRequestReviews"
import type React from "react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 10

/**
 * Component for displaying pending thesis review requests (server-side pagination)
 */
const RequestReviews: React.FC = () => {
  const navigate = useNavigate()

  const [revisiones, setRevisiones] = useState<any[]>([])
  const [searchCarnet, setSearchCarnet] = useState("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [isCarnetSearch, setIsCarnetSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  /**
   * Fetch pending reviews from the API with server-side pagination
   */
  const fetchRevisiones = useCallback(
    async (order: "asc" | "desc", carnet: string, page: number) => {
      setIsSearching(true)
      try {
        const result = await getRevisionesPendientes(order, carnet || undefined, page, ITEMS_PER_PAGE)
        setRevisiones(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalRecords(result.pagination.total)
        setIsCarnetSearch(carnet.length >= 10)
      } catch {
        setRevisiones([])
        setTotalPages(1)
        setTotalRecords(0)
        setIsCarnetSearch(carnet.length >= 10)
      } finally {
        setIsSearching(false)
      }
    },
    [],
  )

  /**
   * Re-fetch when order, carnet or page changes
   */
  useEffect(() => {
    const carnetValue = searchCarnet.length >= 10 ? searchCarnet : ""
    const timer = setTimeout(() => {
      fetchRevisiones(order, carnetValue, currentPage)
    }, 300)
    return () => clearTimeout(timer)
  }, [order, searchCarnet, currentPage, fetchRevisiones])

  /**
   * When filter/order changes, reset to page 1
   */
  useEffect(() => {
    setCurrentPage(1)
  }, [order, searchCarnet])

  /**
   * Format date to local format
   */
  const formatDate = (date: string) => {
    const formattedDate = new Date(date)
    return (
      <>
        {formattedDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </>
    )
  }

  /**
   * Navigate to student review details page
   */
  const handleVerDetalle = (userId: number) => {
    navigate(`/coordinadortesis/revision-estudiante`, { state: { userId } })
  }

  const handleChangeOrder = () => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const handleChangeSearchCarnet = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCarnet(e.target.value)
  }

  // Page buttons range (show up to 7 buttons)
  const getPageRange = () => {
    const maxButtons = 7
    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxButtons - 1)
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1)
    const range: number[] = []
    for (let i = start; i <= end; i++) range.push(i)
    return range
  }

  return (
    <>
      <Breadcrumb pageName="Nuevas solicitudes de revisión" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Controls */}
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
          <TourRequestReviews />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <table id="tabla-revisiones" className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center">Nombre</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Carnet</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Fec. Solicitud</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Estado</th>
                <th className="py-3 px-4 text-center rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody>
              {revisiones.length > 0 ? (
                revisiones.map((revision) => (
                  <tr
                    key={revision.revision_thesis_id}
                    className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
                    onClick={() => handleVerDetalle(revision.user.user_id)}
                  >
                    <td className="py-3 px-4 text-center text-black dark:text-white">{revision.user.name}</td>
                    <td className="py-3 px-4 text-center text-black dark:text-white hidden md:table-cell">
                      {revision.user.carnet}
                    </td>
                    <td className="py-3 px-4 text-center text-black dark:text-white hidden md:table-cell">
                      {formatDate(revision.date_revision)}
                    </td>
                    <td className="py-3 px-4 text-center text-black dark:text-white bg-yellow-300 dark:bg-yellow-500 font-semibold hidden md:table-cell">
                      {revision.approvalThesis.status}
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
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {isCarnetSearch ? "No existe carnet del Estudiante" : "No hay solicitudes de revisión"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — server-side */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando página <span className="font-semibold text-gray-700 dark:text-gray-200">{currentPage}</span> de{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span>{" "}
              ({totalRecords} registros)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPageRange().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RequestReviews
