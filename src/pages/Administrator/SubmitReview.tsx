import React, { useState } from "react"
import Swal from "sweetalert2"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { useProfile } from "../../context/UserProfileContext"
import { enviaRevision } from "../../ts/Administrator/SubmitReview" // Make sure to import correctly
import ModalCreateUserSinLogin from "../../components/Modals/CreateUserWithoutLogin"
import { User, FileText, CheckCircle, Loader2, UploadCloud } from "lucide-react"

/**
 * Component for submitting thesis reviews
 * Allows users to upload thesis documents and approval letters
 */
const SubmitReview: React.FC = () => {
  const { profile } = useProfile()
  const campusId = profile?.sede ?? null
  const [studentId, setStudentId] = useState<string>("")
  const [approvedThesis, setApprovedThesis] = useState<File | null>(null)
  const [approvalLetter, setApprovalLetter] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  /**
   * Handles changes to the student ID input
   */
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value)
  }

  /**
   * Handles changes to the thesis file input
   */
  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setApprovedThesis(e.target.files[0])
    }
  }

  /**
   * Handles changes to the approval letter file input
   */
  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setApprovalLetter(e.target.files[0])
    }
  }

  /**
   * Submits the review to the backend API
   */
  const handleSubmit = async () => {
    if (!studentId || !approvedThesis || !approvalLetter || !campusId) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, ingresa el carnet y selecciona ambos archivos.",
        confirmButtonColor: "#ef4444",
      })
      return
    }

    setLoading(true)
    try {
      const response = await enviaRevision({
        carnet: studentId,
        sede_id: campusId,
        thesis: approvedThesis,
        approval_letter: approvalLetter,
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: response.message || "Revisión enviada correctamente.",
        confirmButtonColor: "#10b981",
      })

      // Reset form
      setStudentId("")
      setApprovedThesis(null)
      setApprovalLetter(null)
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: error.message || "Ocurrió un problema al enviar la revisión.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setLoading(false)
    }
  }

  // campusId is derived from profile context — no useEffect needed

  return (
    <>
      <Breadcrumb pageName="Enviar Tesis a Revisión" />
      <div className="mx-auto max-w-4xl px-6 py-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="relative mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Formulario de Revisión</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Crear Estudiante
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="studentId" className="block text-lg font-semibold text-gray-700 dark:text-white mb-2">
            <User className="inline-block h-5 w-5 mr-2 text-blue-500" /> Carnet del Estudiante
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={handleStudentIdChange}
            className="w-full px-4 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 text-base"
            placeholder="Ingresa el carnet del estudiante"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Archivos Solicitados</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="w-full">
            <label htmlFor="file1" className="block text-lg font-semibold text-gray-700 dark:text-white mb-2">
              <FileText className="inline-block h-5 w-5 mr-2 text-green-500" /> Tesis Aprobada
            </label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-all duration-300">
              <input
                type="file"
                id="file1"
                onChange={handleFile1Change}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                {approvedThesis ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{approvedThesis.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Archivo seleccionado</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-blue-500 mb-3" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Arrastra y suelta tu tesis aquí
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">o haz clic para seleccionar</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="file2" className="block text-lg font-semibold text-gray-700 dark:text-white mb-2">
              <FileText className="inline-block h-5 w-5 mr-2 text-purple-500" /> Carta de Aprobación
            </label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-all duration-300">
              <input
                type="file"
                id="file2"
                onChange={handleFile2Change}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                {approvalLetter ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{approvalLetter.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Archivo seleccionado</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-blue-500 mb-3" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Arrastra y suelta tu carta aquí
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">o haz clic para seleccionar</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !studentId || !approvedThesis || !approvalLetter || campusId === null}
            className={`px-8 py-3 w-full flex justify-center items-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${loading || !studentId || !approvedThesis || !approvalLetter || campusId === null
              ? "opacity-50 cursor-not-allowed"
              : ""
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" /> Enviando...
              </>
            ) : (
              "Enviar Revisión"
            )}
          </button>
        </div>
      </div>
      {isModalOpen && <ModalCreateUserSinLogin onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

export default SubmitReview
