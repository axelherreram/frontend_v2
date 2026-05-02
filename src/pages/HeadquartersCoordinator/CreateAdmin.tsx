import type React from "react"
import { useState, useEffect } from "react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { getAdmins } from "../../ts/HeadquartersCoordinator/GetAdmins"
import { ActiveAdmin } from "../../ts/HeadquartersCoordinator/ActiveAdmin"
import { useProfile } from "../../context/UserProfileContext"
import ActivaAdmin from "../../components/Switchers/ActivateAdmin"
import Swal from "sweetalert2"
import TourCreateAdmin from "../../components/Tours/HeadquartersCoordinator/TourCreateAdmin"
import CrearAdminModal from "../../components/Modals/CreateAdmin"
import { UserPlus, Users, ChevronLeft, ChevronRight, UserX } from "lucide-react"

/**
 * Interface defining the structure of an Admin object
 */
interface Admin {
  id: number
  nombre: string
  email: string
  sede: string
  carnet: string
  active: boolean
}

/**
 * Component for creating and managing administrators
 */
const CreateAdmin: React.FC = () => {
  const { profile } = useProfile()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sedeId, setSedeId] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [adminsPerPage, setAdminsPerPage] = useState(5)
  const [maxPageButtons, setMaxPageButtons] = useState(5)

  useEffect(() => {
    if (profile?.sede) {
      fetchAdmins()
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [profile])

  const fetchAdmins = async () => {
    try {
      if (!profile?.sede) return
      const currentSedeId = profile.sede
      setSedeId(currentSedeId)
      const data = await getAdmins(currentSedeId)
      const transformedAdmins: Admin[] = data.map((admin: any) => ({
        id: admin.user_id,
        nombre: admin.name,
        email: admin.email,
        sede: admin.sede.nombre,
        carnet: admin.carnet,
        active: admin.active, // Asegúrate que el backend envíe este campo
      }))
      const sortedAdmins = transformedAdmins.sort((a, b) => a.id - b.id)
      setAdmins(sortedAdmins)
    } catch (error) {
      setAdmins([]) // Set to empty array on error
    }
  }

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setAdminsPerPage(10)
      setMaxPageButtons(3)
    } else {
      setAdminsPerPage(10)
      setMaxPageButtons(10)
    }
  }

  const indexOfLastAdmin = currentPage * adminsPerPage
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin)
  const totalPages = Math.ceil(admins.length / adminsPerPage)

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const getPageRange = () => {
    const range: number[] = []
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    return range
  }

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleActiveChange = async (userId: number, newStatus: boolean) => {
    const updatedAdmins = admins.map((admin) =>
      admin.id === userId ? { ...admin, active: newStatus } : admin,
    )
    setAdmins(updatedAdmins)

    if (!newStatus) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Este administrador no podrá iniciar sesión, ¿aún deseas desactivarlo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "No, cancelar",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#ef4444",
      })
      if (!result.isConfirmed) {
        setAdmins(admins) // revertir cambios si cancela
        return
      }
    }

    try {
      const response = await ActiveAdmin(userId, newStatus)
      Swal.fire({
        title: "¡Éxito!",
        text: response.message,
        icon: "success",
        confirmButtonText: "De Acuerdo",
        confirmButtonColor: "#10b981",
      })
    } catch (err) {
      // revertir si hay error
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === userId ? { ...admin, active: !newStatus } : admin)),
      )
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

  return (
    <>
      <Breadcrumb pageName="Crear Administrador y Asignarlo a una Sede" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header and Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Administradores Registrados</h3>
                  <p className="text-blue-100 text-sm">Gestiona los administradores del sistema</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  id="boton-crear-admin"
                  onClick={handleOpenModal}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Crear Nuevo</span>
                </button>
                <TourCreateAdmin />
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="p-8">
            <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              <table id="tabla-admins" className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Nombre</th>
                    <th className="py-3 px-4 text-center hidden sm:table-cell">Correo</th>
                    <th className="py-3 px-4 text-center">Sede</th>
                    <th className="py-3 px-4 text-center hidden sm:table-cell">Código</th>
                    <th className="py-3 px-4 text-center rounded-tr-xl">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAdmins.length > 0 ? (
                    currentAdmins.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/50" : ""
                          }`}
                      >
                        <td className="py-3 px-4 text-left text-gray-900 dark:text-white">{admin.nombre}</td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          {admin.email}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{admin.sede}</td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          {admin.carnet}
                        </td>
                        <td className="py-3 px-4 text-center" id="activa-admin">
                          <ActivaAdmin
                            enabled={admin.active}
                            onChange={() => handleActiveChange(admin.id, !admin.active)}
                            uniqueId={`admin-${admin.id}`}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <UserX className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No hay administradores registrados.</p>
                          <p className="text-sm">Crea tu primer administrador para comenzar</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div id="pagination" className="mt-8 flex justify-center items-center space-x-2">
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
      <CrearAdminModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAdminCreated={fetchAdmins} 
        sedeId={sedeId}
      />
    </>
  )
}

export default CreateAdmin
