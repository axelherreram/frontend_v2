import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { subirPropuesta } from "../../ts/Students/UploadProposals"
import { updatePropuesta } from "../../ts/Students/UpdateProposal"
import { getPropuesta } from "../../ts/General/GetProposal"
import { getTareasSede, type Tarea } from "../../ts/General/GetTasksHeadquarters"
import Swal from "sweetalert2"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { FileText, XCircle } from "lucide-react"
import { getSecureFileUrl } from "../../ts/secureFile"

/**
 * Component for uploading and managing thesis proposals
 */
const Proposal: React.FC = () => {
  const { profile } = useProfile()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [approvalMessage, setApprovalMessage] = useState("Pendiente Aprobar")
  const [approvedProposal, setApprovedProposal] = useState<number>(0)
  const [taskId, setTaskId] = useState<number | null>(null)
  const [sedeId, setSedeId] = useState<number | null>(null)

  const propuestas = [
    { id: 1, titulo: "Propuesta 1" },
    { id: 2, titulo: "Propuesta 2" },
    { id: 3, titulo: "Propuesta 3" },
  ]

  useEffect(() => {
    if (!profile) return
    setSedeId(profile.sede)
    fetchPropuesta(profile.user_id)
  }, [profile])

  /**
   * Effect hook to fetch tasks when the site ID (sedeId) changes
   */
  useEffect(() => {
    const fetchTareas = async () => {
      if (sedeId !== null) {
        try {
          const currentYear = new Date().getFullYear() // Get the current year
          const tareas = await getTareasSede(sedeId, currentYear) // Fetch tasks for the given site and current year
          const tareaPropuesta = tareas.find((tarea: Tarea) => tarea.typeTask_id === 1) // Find the task for proposal
          if (tareaPropuesta) {
            setTaskId(tareaPropuesta.task_id) // Set the task ID if found
          } else {
            setTaskId(null) // Clear task ID if no task for proposal is found
          }
        } catch (error: any) {
          setTaskId(null) // Clear task ID if an error occurs
        }
      }
    }
    fetchTareas()
  }, [sedeId]) // The effect depends on the sedeId, so it runs when sedeId changes

  /**
   * Function to fetch proposal data for a given user_id
   */
  const fetchPropuesta = async (user_id: number) => {
    try {
      const propuestaData = await getPropuesta(user_id) // Fetch the proposal data
      if (propuestaData) {
        setPdfUrl(propuestaData.file_path) // Set the PDF URL for preview
        const approvalStatus = propuestaData.approved_proposal // Get the approval status of the proposal
        setApprovedProposal(approvalStatus) // Set the approval status
        // Set approval message based on the approval status
        if (approvalStatus === 0) {
          setApprovalMessage("Pendiente Aprobar")
        } else if (approvalStatus === 1) {
          setApprovalMessage("Propuesta 1 Aprobada")
        } else if (approvalStatus === 2) {
          setApprovalMessage("Propuesta 2 Aprobada")
        } else if (approvalStatus === 3) {
          setApprovalMessage("Propuesta 3 Aprobada")
        }
      } else {
        setPdfUrl(null)
        setApprovedProposal(0)
        setApprovalMessage("Pendiente Aprobar")
      }
    } catch (error) {
      setPdfUrl(null)
      setApprovedProposal(0)
      setApprovalMessage("Pendiente Aprobar")
    }
  }

  /**
   * Function to handle file selection for PDF upload
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] // Get the selected file
    if (file && file.type === "application/pdf") {
      setPdfFile(file) // Set the selected file
      setPdfUrl(URL.createObjectURL(file)) // Set the file URL for preview
    } else {
      Swal.fire({
        icon: "error",
        title: "Formato no válido",
        text: "Por favor, selecciona un archivo en formato PDF.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    }
  }

  /**
   * Function to handle file upload
   */
  const handleUpload = async () => {
    if (!pdfFile) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, selecciona un archivo PDF antes de continuar.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }
    setLoading(true)
    try {
      const user_id = profile?.user_id
      if (!user_id) throw new Error("No se pudo recuperar el ID del usuario.")
      const propuestaExistente = await getPropuesta(user_id)
      if (propuestaExistente && propuestaExistente.approved_proposal === 0) {
        await updatePropuesta({
          file: pdfFile,
          thesisSubmissions_id: propuestaExistente.thesisSubmissions_id,
          user_id,
        })
        Swal.fire({
          icon: "success",
          title: "Propuesta actualizada exitosamente",
          text: "Tu propuesta ha sido actualizada correctamente.",
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        })
      } else {
        await subirPropuesta({
          file: pdfFile,
          user_id,
          task_id: taskId!,
        })
        Swal.fire({
          icon: "success",
          title: "Propuesta subida exitosamente",
          text: "Tu propuesta ha sido subida correctamente.",
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        })
      }
      setPdfFile(null)
      setPdfUrl(null)
      fetchPropuesta(user_id) // Re-fetch to update status
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al subir",
        text: error.response?.data?.message || error.message || "Error al procesar la propuesta",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Function to handle the download of the proposal template
   */
  const handleDownloadTemplate = () => {
    const link = document.createElement("a") // Create a download link element
    link.href = "/FormatoPropuestaTesis.docx" // Set the template file URL
    link.download = "Formato_Propuesta_Tesis.docx" // Set the download file name
    link.click() // Trigger the download
  }

  return (
    <>
      <Breadcrumb pageName="Subir Propuesta" /> {/* Breadcrumb navigation component */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {taskId === null ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-20 w-20 mb-6 text-red-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡No Existe Tarea Para Subir Propuestas!  
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Por favor, contacta a tu administrador para habilitar la tarea de propuestas.
            </p>
          </div>
        ) : (
          <>
            {/* Section to display proposal status */}
            <div id="proposal-status" className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-500" /> Estado de la Propuesta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {propuestas.map((propuesta) => (
                  <div
                    key={propuesta.id}
                    className={`flex items-center p-4 rounded-xl transition-all duration-300 border ${approvedProposal === propuesta.id
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-500"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                      }`}
                  >
                    <input
                      type="radio"
                      checked={approvedProposal === propuesta.id}
                      onChange={() => { }} // No action on change, only reflects status
                      className="mr-2 cursor-default"
                      disabled // Always disabled for student view
                    />
                    <label className="cursor-default">{propuesta.titulo}</label>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span
                  className={`text-2xl font-semibold ${approvalMessage.includes("Aprobada") ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {approvalMessage}
                </span>
              </div>
            </div>

            {/* Section to upload PDF */}
            <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Subir PDF de Propuesta</h2>
                <button
                  onClick={handleDownloadTemplate}
                  className={`px-6 py-2 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${approvedProposal !== 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    }`}
                  disabled={approvedProposal !== 0} // Block if the proposal is approved
                >
                  Descargar Plantilla
                </button>
              </div>
              <label
                className={`flex flex-col items-center justify-center w-full h-32 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all ${approvedProposal !== 0
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 text-gray-500 dark:text-gray-300 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16v4h10v-4m-3-8h-4v4H7m6 0v6h3l4-4m-7 4h3M7 4h10v4H7z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">Haz clic para subir un archivo PDF</p>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={approvedProposal !== 0} // Block if the proposal is approved
                />
              </label>
              {pdfFile && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Archivo seleccionado:</span> {pdfFile.name}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handleUpload}
                  className={`w-full px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${approvedProposal !== 0 || loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  disabled={approvedProposal !== 0 || loading} // Block if the proposal is approved or loading
                >
                  {loading ? "Subiendo..." : "Subir Propuesta"}
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

export default Proposal
