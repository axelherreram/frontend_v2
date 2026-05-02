import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { activateThesisCoordinator } from "../../ts/GeneralCoordinator/ActivateThesisCoodinator"
import { getThesisCoordinators } from "../../ts/GeneralCoordinator/GetThesisCoordinator"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import TourThesisCoordinator from "../../components/Tours/GeneralCoordinator/TourThesisCoordinator"
import ActivateThesisCoordinator from "../../components/Switchers/ActivateThesisCoordinator"
import CreateThesisCoordinatorModal from "../../components/Modals/CreateThesisCoordinator"
import Swal from "sweetalert2"
import { User, ChevronLeft, ChevronRight, UserPlus, XCircle, Pencil } from "lucide-react" // Import Lucide icons

const CreateThesisCoordinator: React.FC = () => {
  const { profile } = useProfile()
  const userIdFromProfile = profile?.user_id ?? null
  const [coordinators, setCoordinators] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedCoordinator, setSelectedCoordinator] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [coordinatorsPerPage, setCoordinatorsPerPage] = useState(5)
  const [maxPageButtons, setMaxPageButtons] = useState(10)

  // user profile fetched from context


  useEffect(() => {
    if (userIdFromProfile !== null) {
      fetchCoordinators()
    }
  }, [userIdFromProfile])

  const fetchCoordinators = async () => {
    if (userIdFromProfile === null) return
    setLoading(true)
    try {
      const data = await getThesisCoordinators()
      const filtered = data.filter((c) => c.user_id !== userIdFromProfile)
      setCoordinators(filtered)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const indexOfLastCoordinator = currentPage * coordinatorsPerPage
  const indexOfFirstCoordinator = indexOfLastCoordinator - coordinatorsPerPage
  const currentCoordinators = coordinators.slice(indexOfFirstCoordinator, indexOfLastCoordinator)
  const totalPages = Math.ceil(coordinators.length / coordinatorsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCoordinatorsPerPage(10)
        setMaxPageButtons(3)
      } else {
        setCoordinatorsPerPage(10)
        setMaxPageButtons(10)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleActiveChange = async (userId: number, newStatus: boolean) => {
    const updatedCoordinators = coordinators.map((c) => (c.user_id === userId ? { ...c, active: newStatus } : c))
    setCoordinators(updatedCoordinators)
    if (!newStatus) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Este coordinador no podrá iniciar sesión, ¿aún deseas desactivarlo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "No, cancelar",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#ef4444",
      })
      if (!result.isConfirmed) {
        setCoordinators(coordinators)
        return
      }
    }
    try {
      const response = await activateThesisCoordinator(userId)
      Swal.fire({
        title: "¡Éxito!",
        text: response.message,
        icon: "success",
        confirmButtonText: "De Acuerdo",
        confirmButtonColor: "#10b981",
      })
    } catch (err) {
      setCoordinators((prev) => prev.map((c) => (c.user_id === userId ? { ...c, active: !newStatus } : c)))
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "De Acuerdo",
        confirmButtonColor: "#ef4444",
      })
    }
  }

  const openModal = (coordinator: any | null = null) => {
    setSelectedCoordinator(coordinator)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCoordinator(null)
  }

  const handleCoordinatorCreated = () => {
    fetchCoordinators()
    closeModal()
  }

  const getPageRange = () => {
    const range: number[] = []
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    return range
  }

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Coordinadores de Tesis" />
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando Coordinadores...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Coordinadores de Tesis" />
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar datos</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </>
    )
  }

  const renderProfilePhoto = (profilePhoto: string, userName: string) => {
    if (profilePhoto) {
      return (
        <img
          src={profilePhoto || "/placeholder.svg"}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-sm"
        />
      )
    } else {
      const initial = userName.charAt(0).toUpperCase()
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-md">
          {initial}
        </div>
      )
    }
  }

  return (
    <>
      <Breadcrumb pageName="Crear Coordinadores de Tesis" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header and Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Coordinadores de Tesis</h3>
                  <p className="text-blue-100 text-sm">Gestiona los Coordinadores del sistema</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="boton-crear-coordinador-tesis"
                  onClick={() => openModal()}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Crear Nuevo</span>
                </button>
                <TourThesisCoordinator />
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="p-8">
            <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              <table id="tabla-coordinadores-tesis" className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left rounded-tl-xl">Foto</th>
                    <th className="py-3 px-4 text-center hidden md:table-cell">Nombre</th>
                    <th className="py-3 px-4 text-center hidden md:table-cell">Correo</th>
                    <th className="py-3 px-4 text-center hidden md:table-cell">Código</th>
                    <th className="py-3 px-4 text-center rounded-tr-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCoordinators.length > 0 ? (
                    currentCoordinators.map((coordinator) => (
                      <tr
                        key={coordinator.user_id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-center">
                          {renderProfilePhoto(coordinator.profilePhoto, coordinator.name)}
                        </td>
                        <td className="py-3 px-4 text-left text-gray-900 dark:text-white font-medium">
                          {coordinator.name}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          {coordinator.email}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          {coordinator.carnet}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              id="boton-editar-coordinador-tesis"
                              onClick={() => openModal(coordinator)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform shadow-md hover:shadow-lg inline-flex items-center gap-1"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>
                            <ActivateThesisCoordinator
                              enabled={coordinator.active}
                              onChange={() => handleActiveChange(coordinator.user_id, !coordinator.active)}
                              uniqueId={`coordinator-${coordinator.user_id}`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No hay Coordinadores registrados</p>
                          <p className="text-sm">Crea tu primer Coordinador para comenzar</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
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
        </div>
      </div>
      {showModal && (
        <CreateThesisCoordinatorModal onClose={handleCoordinatorCreated} coordinator={selectedCoordinator} />
      )}
    </>
  )
}

export default CreateThesisCoordinator
