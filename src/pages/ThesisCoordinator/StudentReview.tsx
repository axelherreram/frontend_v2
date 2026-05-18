import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getRevisionDetallePendi } from "../../ts/ThesisCoordinatorandReviewer/GetRevisionDetailPend"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import AsignaRevisor from "../../components/Modals/AssignReviewer"
import { ArrowLeft, Download, User } from "lucide-react"
import { getSecureFileUrl } from "../../ts/secureFile"

/**
 * Component for displaying student thesis review details
 */
const StudentReview: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRevisionId, setSelectedRevisionId] = useState<number | null>(null)
  const [revisiones, setRevisiones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true) // Added loading state
  const userId = location.state?.userId
  /**
   * Fetch review details when component mounts or userId changes
   */
  useEffect(() => {
    if (userId) {
      const fetchRevisiones = async () => {
        setIsLoading(true) // Set loading to true
        try {
          const data = await getRevisionDetallePendi(userId)
          setRevisiones(data)
        } catch (error) {

        } finally {
          setIsLoading(false) // Set loading to false
        }
      }
      fetchRevisiones()
    }
  }, [userId])
  /**
   * Open the reviewer assignment modal
   */
  const handleOpenModal = (revisionId: number) => {
    setSelectedRevisionId(revisionId)
    setIsModalOpen(true)
  }
  /**
   * Close the reviewer assignment modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRevisionId(null)
  }
  /**
   * Handle thesis PDF download
   */
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
    }
  }
  return (
    <>
      <Breadcrumb pageName="Revisión de estudiante" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <button
            className="flex items-center px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-300 shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Regresar
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : revisiones.length > 0 ? (
          revisiones.map((revision) => (
            <div
              key={revision.revision_thesis_id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden mb-6"
            >
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
                <h2 className="text-lg font-bold text-white">Detalles de la Revisión #{revision.revision_thesis_id}</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      {revision.user.profilePhoto ? (
                        <img
                          src={revision.user.profilePhoto || "/placeholder.svg"}
                          alt="Foto de perfil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
                          {revision.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos del Alumno</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Nombre:</span> {revision.user.name}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Correo:</span> {revision.user.email}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Carnet:</span> {revision.user.carnet}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos de la Sede</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Año:</span>{" "}
                        {revision.user.year?.year ?? "Sin año asignado"}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Sede:</span>{" "}
                        {revision.user.location?.nameSede ?? "Sin sede"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Estado de Revisión</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Fecha de revisión:</span>{" "}
                        {new Date(revision.date_revision).toLocaleDateString()}
                      </p>
                      <p
                        className={`text-sm font-semibold ${revision.active_process ? "text-green-500" : "text-red-500"}`}
                      >
                        <span className="font-medium">Estado:</span>{" "}
                        {revision.active_process ? "En proceso" : "Finalizado"}
                      </p>
                    </div>
                  </div>
                  {revision.thesis_dir && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Documento de Tesis</h3>
                      <div className="flex flex-wrap gap-4">
                        <button
                          className="flex items-center px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => handleDownload(getSecureFileUrl(revision.thesis_dir), `tesis_${revision.user.carnet}.pdf`)}
                        >
                          <Download className="mr-2 h-5 w-5" /> Descargar Tesis
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {revision.thesis_dir && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vista previa del PDF</h3>
                    <iframe
                      src={getSecureFileUrl(revision.thesis_dir)}
                      width="100%"
                      height="400"
                      className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    ></iframe>
                  </div>
                )}

                <div className="mt-6 text-right">
                  <button
                    className="flex items-center justify-center ml-auto px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => handleOpenModal(revision.revision_thesis_id)}
                  >
                    <User className="mr-2 h-5 w-5" /> Asignar Revisor
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Cargando información o no hay revisiones pendientes...
            </p>
          </div>
        )}
      </div>
      {isModalOpen && selectedRevisionId && (
        <AsignaRevisor revisionThesisId={selectedRevisionId} onClose={handleCloseModal} />
      )}
    </>
  )
}

export default StudentReview
