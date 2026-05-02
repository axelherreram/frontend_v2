import { useState, useEffect } from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { getCatedraticos } from "../../../ts/HeadquartersCoordinator/GetProfessor"
import { activaUsuario } from "../../../ts/HeadquartersCoordinator/ActivateProfessor"
import type React from "react"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import ActivaCatedraticos from "../../../components/Switchers/ActiveProfessors"
import Swal from "sweetalert2"
import BusquedaCatedratico from "../../../components/Searches/SearchProfessor"
import TourProfessors from "../../../components/Tours/HeadquartersCoordinator/TourProfessors"
import { ChevronLeft, ChevronRight, UserX } from "lucide-react" // Import Lucide React icons

/**
 * Interface to define the structure of a professor's data
 */
interface Professor {
  user_id: number // Unique identifier for the professor
  email: string // Professor's email address
  userName: string // Professor's name
  professorCode: string // Unique professor code
  profilePhoto: string | null // Profile photo URL or null if not available
  active: boolean // Status if the professor is active or not
}

const ListProfessors: React.FC = () => {
  const { profile } = useProfile()
  const [professors, setProfessors] = useState<Professor[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [professorsPerPage, setProfessorsPerPage] = useState(5)
  const [maxPageButtons, setMaxPageButtons] = useState(10)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setProfessorsPerPage(10)
        setMaxPageButtons(3)
      } else {
        setProfessorsPerPage(10)
        setMaxPageButtons(10)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (profile?.sede) {
      fetchProfessors(profile.sede)
    }
  }, [profile])

  const fetchProfessors = async (headquartersId: number) => {
    try {
      const retrievedProfessors = await getCatedraticos(headquartersId)
      setProfessors(Array.isArray(retrievedProfessors) ? retrievedProfessors : [])
    } catch {
      setProfessors([])
    }
  }

  const handleSearchResults = (results: Professor[]) => {
    setProfessors(results)
    setCurrentPage(1)
  }

  const handleActiveChange = async (userId: number, newStatus: boolean) => {
    if (!newStatus) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Este catedrático no podrá iniciar sesión, ¿aún deseas desactivarlo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "No, cancelar",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
      })
      if (!result.isConfirmed) {
        return
      }
    }
    const updatedProfessors = professors.map((prof) =>
      prof.user_id === userId ? { ...prof, active: newStatus } : prof,
    )
    setProfessors(updatedProfessors)
    try {
      await activaUsuario(userId, newStatus)
      Swal.fire({
        icon: "success",
        title: "Estado Actualizado",
        text: `El catedrático ha sido ${newStatus ? "activado" : "desactivado"} correctamente.`,
        confirmButtonColor: "#28a745",
      })
    } catch {
      setProfessors((prev) => prev.map((prof) => (prof.user_id === userId ? { ...prof, active: !newStatus } : prof)))
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al actualizar el estado del catedrático.",
        confirmButtonColor: "#d33",
      })
    }
  }

  const indexOfLastProfessor = currentPage * professorsPerPage
  const indexOfFirstProfessor = indexOfLastProfessor - professorsPerPage
  const currentProfessors = professors.slice(indexOfFirstProfessor, indexOfLastProfessor)
  const totalPages = Math.ceil(professors.length / professorsPerPage)

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const renderProfilePhoto = (profilePhoto: string | null, userName: string) =>
    profilePhoto ? (
      <img
        src={profilePhoto || "/placeholder.svg"}
        alt={userName}
        className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-sm"
      />
    ) : (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-md">
        {userName.charAt(0).toUpperCase()}
      </div>
    )

  const getPageRange = () => {
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const end = Math.min(totalPages, start + maxPageButtons - 1)
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <>
      <Breadcrumb pageName="Listar Catedráticos" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <div className="flex-grow w-full md:w-auto">
            <BusquedaCatedratico onSearchResults={handleSearchResults} />
          </div>
          <div className="flex items-center">
            <TourProfessors />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <table id="professors-table" className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-xl">Foto</th>
                <th className="py-3 px-4 text-center">Nombre</th>
                <th className="py-3 px-4 text-center">Código</th>
                <th className="py-3 px-4 text-right rounded-tr-xl">Activo</th>
              </tr>
            </thead>
            <tbody>
              {currentProfessors.length > 0 ? (
                currentProfessors.map((prof) => (
                  <tr
                    key={prof.user_id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 text-center">{renderProfilePhoto(prof.profilePhoto, prof.userName)}</td>
                    <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{prof.userName}</td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{prof.professorCode}</td>
                    <td className="py-3 px-4 flex justify-end" id="active-switcher">
                      <ActivaCatedraticos
                        enabled={prof.active}
                        onChange={() => handleActiveChange(prof.user_id, !prof.active)}
                        uniqueId={prof.user_id.toString()}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <UserX className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No se encontraron catedráticos.  </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 shadow-sm ${
                  currentPage === page
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

export default ListProfessors
