import { useEffect, useState } from "react"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import { useProfile } from "../../../context/UserProfileContext"
import { getBitacora } from "../../../ts/Administrator/GetBinnacle"

/**
 * Type definition for a log entry in the activity log
 */
type Log = {
  date: string
  username: string
  id_user: number
  action: string
  description: string
}

/**
 * Activity Log Component
 * Displays a chronological list of system activities with pagination
 */
const Binnacle = () => {
  const { profile } = useProfile()
  // State variables to store logs, current page, selected sede, logs per page, and max page buttons
  const [logs, setLogs] = useState<Log[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sedeId, setSedeId] = useState<number | null>(null)
  const [logsPerPage, setLogsPerPage] = useState(3)
  const [maxPageButtons, setMaxPageButtons] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Effect hook to fetch sedeId and set up the responsive design
   */
  useEffect(() => {
    if (profile?.sede) {
      setSedeId(profile.sede)
    }

    // Handle window resizing to adjust logs per page and max page buttons
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLogsPerPage(4)
        setMaxPageButtons(5)
      } else {
        setLogsPerPage(3)
        setMaxPageButtons(10)
      }
    }

    // Initial resize handling
    handleResize()
    // Add resize event listener
    window.addEventListener("resize", handleResize)
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize)
  }, [profile])

  /**
   * Effect hook to fetch logs whenever the sedeId changes
   */
  useEffect(() => {
    if (sedeId !== null) {
      const fetchLogs = async () => {
        setIsLoading(true)
        try {
          // Fetching logs from the server based on sedeId
          const response = await getBitacora(sedeId)
          // Mapping response logs to the desired structure
          setLogs(
            response.logs.map((log: any) => ({
              date: log.date,
              username: log.username,
              id_user: log.user_id,
              action: log.action,
              description: log.description,
            })),
          )
        } catch (error) {

        } finally {
          setIsLoading(false)
        }
      }

      fetchLogs()
    }
  }, [sedeId])

  // Calculate the index of the last log and first log based on current page and logs per page
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog)

  // Calculate total number of pages
  const totalPages = Math.ceil(logs.length / logsPerPage)

  /**
   * Function to handle pagination
   * @param pageNumber - The page number to navigate to
   */
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  /**
   * Function to get the range of pages to be displayed in pagination
   * @returns Array of page numbers to display
   */
  const getPageRange = () => {
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const end = Math.min(totalPages, start + maxPageButtons - 1)

    // Adjust range if it doesn't fill the max number of page buttons
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  /**
   * Function to format the date and time
   * @param dateTime - The date time string to format
   * @returns Formatted date and time string
   */
  const formatDateTime = (dateTime: string) => {
    const dateObj = new Date(dateTime)
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const formattedTime = dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    return `${formattedDate} - ${formattedTime}`
  }

  /**
   * Function to get action badge color based on action type
   * @param action - The action string to determine color for
   * @returns CSS class string for the badge
   */
  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes("crear") || actionLower.includes("agregar"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (actionLower.includes("eliminar") || actionLower.includes("borrar"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (actionLower.includes("editar") || actionLower.includes("modificar") || actionLower.includes("actualizar"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    if (actionLower.includes("iniciar") || actionLower.includes("sesión"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header section */}
      <div className="mb-8">
        <Breadcrumb pageName="Bitácora de Actividades" />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-boxdark p-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="h-4 w-[250px] bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-[200px] bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && logs.length === 0 && (
        <div className="bg-white dark:bg-boxdark border border-gray-200 dark:border-gray-700 rounded-lg p-12 flex flex-col items-center justify-center">
          <div className="h-16 w-16 text-gray-400 mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No hay registros disponibles</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            No se encontraron actividades en la bitácora para mostrar.
          </p>
        </div>
      )}

      {/* Log entries */}
      {!isLoading && logs.length > 0 && (
        <div className="space-y-6">
          {currentLogs.map((log, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-boxdark overflow-hidden transition-all hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row">
                {/* User info sidebar */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 md:w-64 flex flex-row md:flex-col items-center md:items-start gap-4">
                  <div className="flex items-center justify-center bg-blue-600 text-white rounded-full w-12 h-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{log.username}</h3>
                  </div>
                </div>

                {/* Log details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDateTime(log.date)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-700 dark:text-gray-300">{log.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && logs.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, logs.length)} de {logs.length} registros
          </div>

          <div className="flex items-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 flex items-center justify-center rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex">
              {getPageRange().map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`h-9 w-9 flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600 ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  aria-label={`Página ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 flex items-center justify-center rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Binnacle
