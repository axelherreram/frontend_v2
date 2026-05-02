import type React from "react"
import { useState, useEffect } from "react"
import { getCatedraticosActivos } from "../../ts/HeadquartersCoordinator/GetProfessorActive"
import { useProfile } from "../../context/UserProfileContext"
import { asignarCatedraticoComision } from "../../ts/HeadquartersCoordinator/AssignsProfessorCommission"
import Swal from "sweetalert2"

interface Catedratico {
  user_id: number
  userName: string
  profilePhoto: string | null
  active: boolean
}

interface ListProfessorsModalProps {
  onClose: () => void
  selectedRow: number | null
  groupId: number | null
}

const ROLES_CODIGOS: { [key: string]: number } = {
  Presidente: 1,
  Secretario: 2,
  "Vocal 1": 3,
  "Vocal 2": 4,
  "Vocal 3": 5,
}

const ListProfessors: React.FC<ListProfessorsModalProps> = ({ onClose, selectedRow, groupId }) => {
  const { profile } = useProfile()
  const [catedraticos, setCatedraticos] = useState<Catedratico[]>([])
  const [selectedCatedratico, setSelectedCatedratico] = useState<Catedratico | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!profile?.sede) return
    const fetchCatedraticos = async () => {
      try {
        const year = new Date().getFullYear()
        const catedraticosRecuperados = await getCatedraticosActivos(profile.sede!, year)
        setCatedraticos(catedraticosRecuperados)
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false)
      }
    }

    fetchCatedraticos()
  }, [profile])

  const handleSelect = (catedratico: Catedratico) => {
    setSelectedCatedratico(catedratico)
  }

  const handleAssign = async () => {
    if (selectedCatedratico && selectedRow && groupId) {
      try {
        await asignarCatedraticoComision(groupId, {
          user_id: selectedCatedratico.user_id,
          rol_comision_id: selectedRow,
        })

        const roleNames = Object.keys(ROLES_CODIGOS)
        const selectedRoleName = roleNames.find(role => ROLES_CODIGOS[role] === selectedRow) || "rol desconocido"
        
        Swal.fire({
          icon: "success",
          title: "¡Catedrático asignado!",
          text: `El catedrático "${selectedCatedratico.userName}" ha sido asignado exitosamente como ${selectedRoleName} en la comisión.`,
          confirmButtonText: "De Acuerdo",
          confirmButtonColor: "#10b981",
        })
        onClose()
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error al asignar catedrático",
          text: error.message || "Error desconocido",
          confirmButtonText: "De Acuerdo",
          confirmButtonColor: "#ef4444",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando catedráticos...</p>
        </div>
      </div>
    )
  }

  if (catedraticos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-2xl mt-32 md:max-w-3xl md:mt-40 lg:max-w-4xl lg:mt-35 lg:ml-[330px] transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay catedráticos activos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se encontraron catedráticos disponibles para asignar.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  const roleText = selectedRow ? Object.keys(ROLES_CODIGOS).find((key) => ROLES_CODIGOS[key] === selectedRow) : ""

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-2xl mt-16 md:max-w-3xl md:mt-15 lg:max-w-4xl lg:mt-15 lg:ml-[350px] transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Listado de Catedráticos Activos</h3>
          {roleText && <p className="text-sm text-gray-600 dark:text-gray-400">Por favor seleccione {roleText}</p>}
        </div>

        {/* Professors List */}
        <div className="mb-4">
          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {catedraticos.map((catedratico) => (
              <div
                key={catedratico.user_id}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCatedratico?.user_id === catedratico.user_id
                    ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                } ${catedraticos.indexOf(catedratico) !== catedraticos.length - 1 ? "border-b border-gray-200 dark:border-gray-600" : ""}`}
                onClick={() => handleSelect(catedratico)}
              >
                <div className="flex items-center">
                  {catedratico.profilePhoto ? (
                    <img
                      src={catedratico.profilePhoto || "/placeholder.svg"}
                      alt={catedratico.userName}
                      className="w-10 h-10 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mr-4 font-semibold">
                      {catedratico.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-900 dark:text-white font-medium">{catedratico.userName}</span>
                </div>
                {selectedCatedratico?.user_id === catedratico.user_id && (
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 font-medium rounded-md transition-all duration-200 text-sm
                       border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedCatedratico}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-medium rounded-md transition-all duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListProfessors
