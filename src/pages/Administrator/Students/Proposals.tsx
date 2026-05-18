import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getPropuesta } from "../../../ts/General/GetProposal"
import { aprobarPropuesta } from "../../../ts/Administrator/ApproveProposal"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import Swal from "sweetalert2"
import TourProposals from "../../../components/Tours/Administrator/TourProposals"
import { ArrowLeft, FileText, XCircle } from "lucide-react"
import { getSecureFileUrl } from "../../../ts/secureFile"


/**
 * Interface for proposal data
 */
interface Propuesta {
  id: number
  titulo: string
}

/**
 * Interface for location state data
 */
interface LocationState {
  tarea: string
  estudiante: { id: number; userName: string }
  selectedAño: number
}

/**
 * Proposals Component
 * Displays and manages student thesis proposals
 */
const Proposals: React.FC = () => {
  const navigate = useNavigate() // Hook to handle navigation
  const location = useLocation() // Hook to get the current location (for accessing route state)
  const { estudiante } = location.state as LocationState // Retrieve student data from location state
  const userId = estudiante ? estudiante.id : null // Get the student's ID

  // State management using React's useState hook
  const [propuestas] = useState<Propuesta[]>([
    { id: 1, titulo: "Propuesta 1" },
    { id: 2, titulo: "Propuesta 2" },
    { id: 3, titulo: "Propuesta 3" },
  ])
  const [selectedPropuesta, setSelectedPropuesta] = useState<number | null>(null) // Selected proposal ID
  const [aprobadaPropuesta, setAprobadaPropuesta] = useState<number | null>(null) // Approved proposal ID
  const [pdfUrl, setPdfUrl] = useState<string | null>(null) // URL for the proposal PDF
  const [noPropuestas, setNoPropuestas] = useState<boolean>(false) // Flag for no proposals uploaded
  const [thesisSubmissionsId, setThesisSubmissionsId] = useState<number | null>(null) // Thesis submission ID

  /**
   * Function to fetch proposal data from the server
   */
  const fetchPropuesta = async (user_id: number) => {
    try {
      const propuestaData = await getPropuesta(user_id);

      if (propuestaData) {
        // El estudiante ya subio una propuesta
        setPdfUrl(propuestaData.file_path);
        setThesisSubmissionsId(propuestaData.thesisSubmissions_id);
        if (propuestaData.approved_proposal === 0) {
          setAprobadaPropuesta(null);
        } else {
          setAprobadaPropuesta(propuestaData.approved_proposal);
          setSelectedPropuesta(propuestaData.approved_proposal);
        }
      } else {
        // null = 404 = el estudiante aun no ha subido nada
        setNoPropuestas(true);
      }
    } catch {
      // Error inesperado (401, red, 500)
      Swal.fire({
        icon: "error",
        title: "Error al obtener la propuesta",
        text: "No se pudo cargar la propuesta. Verifica tu conexión o intenta de nuevo.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      });
    }
  }

  /**
   * useEffect hook to fetch proposal data when the component mounts
   */
  useEffect(() => {
    if (userId) {
      fetchPropuesta(userId) // Call fetchPropuesta function if student ID is available
    } else {
      // Show error if student ID is not available
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener el ID del estudiante.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    }
  }, [userId])

  /**
   * Function to handle proposal selection
   */
  const handleSelectPropuesta = (id: number) => {
    // Allow selection only if the proposal is not approved
    if (aprobadaPropuesta === null) {
      setSelectedPropuesta(id)
    }
  }

  /**
   * Function to handle approval of the selected proposal
   */
  const handleAprobarPropuesta = async () => {
    // Ensure selected proposal and thesis submission ID are not null
    if (selectedPropuesta !== null && thesisSubmissionsId !== null && userId !== null) {
      const approvedProposalValue = selectedPropuesta // Store selected proposal ID for approval
      try {
        // Call API to approve the proposal
        await aprobarPropuesta(thesisSubmissionsId, userId, approvedProposalValue)
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Propuesta Aprobada",
          text: `La propuesta ${selectedPropuesta} ha sido aprobada correctamente.`,
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        })
        // Update state after successful approval
        setAprobadaPropuesta(selectedPropuesta)
        setSelectedPropuesta(null) // Reset selected proposal after approval
      } catch (error: any) {
        // Show error message if approval fails
        Swal.fire({
          icon: "error",
          title: "Error al aprobar la propuesta",
          text: error?.response?.data?.message || "No se pudo aprobar la propuesta.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      }
    }
  }

  return (
    <>
      <Breadcrumb pageName="Propuestas del Estudiante" /> {/* Breadcrumb component for navigation */}
      <div className="mb-6 flex items-center justify-between sm:justify-start gap-4">
        {/* Botón de regresar */}
        <button
          id="back-button"
          className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Regresar
        </button>
        {/* Botón para iniciar el recorrido (solo si hay una entrega de propuesta) */}
        {pdfUrl && <TourProposals />}
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Display message if no proposals are found */}
        {noPropuestas ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-20 w-20 mb-6 text-red-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {"¡Estudiante No Ha Subido Sus Propuestas!  "}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Por favor, asegúrate de que el estudiante haya cargado su documento.
            </p>
          </div>
        ) : (
          <>
            {/* Section to select a proposal */}
            <div id="select-proposal" className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-500" /> Seleccione una Propuesta
              </h3>
              {/* Render each proposal */}
              {propuestas.map((propuesta) => (
                <div
                  key={propuesta.id}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border ${aprobadaPropuesta === propuesta.id
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-500" // Highlight approved proposal
                    : selectedPropuesta === propuesta.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-500" // Highlight selected proposal
                      : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:shadow-md"
                    }`}
                  onClick={() => handleSelectPropuesta(propuesta.id)}
                >
                  {/* Radio button to select proposal */}
                  <input
                    type="radio"
                    checked={selectedPropuesta === propuesta.id}
                    onChange={() => handleSelectPropuesta(propuesta.id)}
                    className="mr-2 cursor-pointer"
                    disabled={aprobadaPropuesta !== null} // Disable selection if proposal is already approved
                  />
                  <label className="cursor-pointer">{propuesta.titulo}</label>
                </div>
              ))}
              <div className="mt-6">
                {/* Button to approve proposal */}
                <button
                  id="approve-button"
                  className={`w-full px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${selectedPropuesta === null || [1, 2, 3].includes(aprobadaPropuesta ?? 0)
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300" // Disable button when no proposal is selected or proposal is approved
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  onClick={handleAprobarPropuesta}
                  disabled={selectedPropuesta === null || [1, 2, 3].includes(aprobadaPropuesta ?? 0)}
                >
                  Aprobar Propuesta
                </button>
              </div>
            </div>
            {/* Section to display PDF if available */}
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
