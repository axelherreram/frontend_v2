import React, { useState, useEffect } from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { cargarCatedraticos } from "../../../ts/HeadquartersCoordinator/LoadProfessors"
import TourUploadProffesor from "../../../components/Tours/HeadquartersCoordinator/TourUploadProffesor"
import Swal from "sweetalert2"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import { UploadCloud, Download, FileText, Loader2 } from "lucide-react" // Import Lucide React icons

const UploadProfessors: React.FC = () => {
  const { profile } = useProfile()
  const headquarterId = profile?.sede ?? null
  const [fileSelected, setFileSelected] = useState<File | null>(null)
  const [apiLoading, setApiLoading] = useState<boolean>(false)
  const fileInputRef = React.createRef<HTMLInputElement>()

  // headquarterId is derived directly from profile context

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setFileSelected(file)
  }

  const handleUpload = async () => {
    if (!fileSelected || !headquarterId) {
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "Archivo o sede no seleccionada.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }
    setApiLoading(true)
    try {
      const response = await cargarCatedraticos({
        archivo: fileSelected,
        sede_id: headquarterId,
      })
      Swal.fire({
        icon: "success",
        title: "Carga completada",
        text: response.message || "Los catedráticos se han cargado exitosamente. 🎉",
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      })
      handleReset()
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: error.message,
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        })
      }
    } finally {
      setApiLoading(false)
    }
  }

  const handleReset = () => {
    setFileSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement("a")
    link.href = "/Plantilla.xlsx"
    link.download = "Plantilla_Catedraticos.xlsx"
    link.click()
  }

  return (
    <>
      <Breadcrumb pageName="Subir Catedráticos" />
      <div className="flex justify-center mt-8 px-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Subir Catedráticos</h3>
              <TourUploadProffesor />
            </div>
            <div className="p-6">
              <p className="text-center text-base font-medium text-gray-800 dark:text-white mb-6">
                Favor de seleccionar un archivo Excel (.xls, .xlsx)
              </p>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300">
                <input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  {fileSelected ? (
                    <>
                      <FileText className="h-12 w-12 text-green-500 mb-3" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{fileSelected.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Archivo seleccionado</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-blue-500 mb-3" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        Arrastra y suelta tu archivo aquí
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">o haz clic para seleccionar</p>
                    </>
                  )}
                </div>
              </div>

              <button
                id="confirm-button"
                className={`mt-6 w-full flex justify-center items-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 p-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fileSelected && headquarterId ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleUpload}
                disabled={!fileSelected || !headquarterId || apiLoading}
              >
                {apiLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-3" /> Cargando...
                  </>
                ) : (
                  "Confirmar Subida"
                )}
              </button>

              <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-800 dark:text-white mb-4">
                  ¿Necesitas una plantilla? Descarga la plantilla de Excel.
                </p>
                <button
                  id="download-template"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Download className="h-5 w-5 mr-2" /> Descargar Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {apiLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center text-white text-xl">
            <Loader2 className="animate-spin h-12 w-12 text-blue-400 mb-4" />
            Espere un momento en lo que se suben los Catedráticos...
          </div>
        </div>
      )}
    </>
  )
}

export default UploadProfessors
