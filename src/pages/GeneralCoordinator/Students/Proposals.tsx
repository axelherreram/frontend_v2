import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getPropuesta } from "../../../ts/General/GetProposal"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import Swal from "sweetalert2"
import TourProposals from "../../../components/Tours/Administrator/TourProposals"
import { ArrowLeft, FileText, XCircle } from "lucide-react"
import { getSecureFileUrl } from "../../../ts/secureFile"

interface LocationState {
  tarea: string
  estudiante: { id: number; userName: string }
  selectedAño: number
}

const Proposals: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { estudiante } = location.state as LocationState
  const userId = estudiante ? estudiante.id : null
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [noProposals, setNoProposals] = useState<boolean>(false)

  const fetchProposal = async (user_id: number) => {
    try {
      const proposalData = await getPropuesta(user_id)
      if (proposalData) {
        setPdfUrl(proposalData.file_path)
      } else {
        setNoProposals(true)
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al obtener la propuesta",
        text: "No se pudo cargar la propuesta.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProposal(userId)
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener el ID del estudiante.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    }
  }, [userId])

  return (
    <>
      <Breadcrumb pageName="Propuestas del Estudiante" />
      <div className="mb-6 flex items-center justify-between sm:justify-start gap-4">
        <button
          id="back-button"
          className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
        </button>
        {pdfUrl && <TourProposals />}
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {noProposals ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-20 w-20 mb-6 text-red-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Estudiante No Ha Subido Sus Propuestas!  
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Por favor, asegúrate de que el estudiante haya cargado su documento.
            </p>
          </div>
        ) : (
          <>
            {pdfUrl && (
              <div
                id="pdf-viewer"
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-500" /> Visualización de Documento PDF
                </h3>
                <div className="relative pt-[75%] md:pt-[56.25%]">
                  {" "}
                  {/* 4:3 aspect ratio for mobile, 16:9 for desktop */}
                  <iframe
                    src={getSecureFileUrl(pdfUrl)}
                    title="Vista PDF"
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-inner border border-gray-300 dark:border-gray-600"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default Proposals
