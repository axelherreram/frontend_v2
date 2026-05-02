import React, { useState, useEffect } from "react"
import Swal from "sweetalert2"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import { getCursos } from "../../../ts/General/GetCourses"
import { useProfile } from "../../../context/UserProfileContext"
import { cargaMasiva } from "../../../ts/Administrator/MassiveLoadStudents"
import TourUploadStudents from "../../../components/Tours/Administrator/TourUploadStudents"
import { UploadCloud, Download, FileText, Loader2, XCircle } from "lucide-react"

/**
 * Main component for uploading students in bulk
 */
const UploadStudents = () => {
  const { profile } = useProfile()
  const [fileSelected, setFileSelected] = useState<File | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [apiLoading, setApiLoading] = useState<boolean>(false)
  const fileInputRef = React.createRef<HTMLInputElement>()

  /**
   * Fetching the courses when the component mounts
   */
  useEffect(() => {
    if (!profile) return
    const fetchCourses = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const coursesData = await getCursos(profile.sede, currentYear)
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          setCourses(coursesData)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [profile])

  /**
   * Helper function to show alerts
   */
  const showAlert = (type: "success" | "error", title: string, text: string) => {
    const confirmButtonColor = type === "success" ? "#28a745" : "#dc3545" // Success is green, error is red
    Swal.fire({
      icon: type, // Setting the alert type (success or error)
      title, // Setting the title of the alert
      text, // Setting the text of the alert
      confirmButtonColor, // Setting the button color
      confirmButtonText: "De Acuerdo", // Setting the button text
    })
  }

  /**
   * Handling file input changes
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null // Getting the selected file
    if (
      file &&
      file.type !== "application/vnd.ms-excel" &&
      file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // If the file is not an Excel file
      showAlert("error", "¡Error!", "Por favor, seleccione un archivo Excel válido (.xls, .xlsx).") // Show error alert
      setFileSelected(null) // Reset the selected file state
      return
    }
    setFileSelected(file) // Set the selected file
  }

  /**
   * Handling the file upload process
   */
  const handleUpload = async () => {
    if (!fileSelected || !selectedCourse) {
      showAlert("error", "¡Error!", "Archivo o curso no seleccionado.") // Show error if no file or course is selected
      return
    }
    setApiLoading(true)
    try {
      const selectedCourseObj = courses.find((course) => course.courseName === selectedCourse)
      if (!selectedCourseObj) throw new Error("Curso seleccionado no encontrado")
      await cargaMasiva({
        archivo: fileSelected,
        sede_id: profile?.sede!,
        rol_id: 1,
        course_id: selectedCourseObj.course_id,
      })
      showAlert("success", "Carga masiva completada", "Los estudiantes se han cargado correctamente.") // Show success alert
      handleReset() // Reset the form after successful upload
    } catch (error) {
      if (error instanceof Error) {
        showAlert("error", "¡Error!", error.message) // Show error alert if an error occurs
      }
    } finally {
      setApiLoading(false) // Stop loading state
    }
  }

  /**
   * Resetting the form to its initial state
   */
  const handleReset = () => {
    setFileSelected(null) // Reset file state
    setSelectedCourse("") // Reset selected course
    fileInputRef.current && (fileInputRef.current.value = "") // Clear the file input
  }

  /**
   * Handling the download of the Excel template
   */
  const handleDownloadTemplate = () => {
    const link = document.createElement("a")
    link.href = "/Plantilla.xlsx" // Path to the template file
    link.download = "Plantilla_Estudiantes.xlsx" // File name for the download
    link.click() // Trigger the download
  }

  // Displaying a loading message while fetching courses
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="flex flex-col items-center text-white text-xl">
          <Loader2 className="animate-spin h-12 w-12 text-blue-400 mb-4" />
          Cargando cursos...
        </div>
      </div>
    )
  }

  // If no courses are available, show a message
  if (courses.length === 0) {
    return (
      <>
        <Breadcrumb pageName="Subir Estudiantes" />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6 flex flex-col items-center justify-center text-center">
            <XCircle className="h-20 w-20 mb-6 text-red-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No existen cursos asignados a esta sede.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Por favor, comuníquese con central para asignar cursos.
            </p>
          </div>
        </div>
      </>
    )
  }

  // Main JSX structure
  return (
    <>
      <Breadcrumb pageName="Subir Estudiantes" /> {/* Breadcrumb component for navigation */}
      <div className="flex justify-center mt-8 px-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Subir Estudiantes</h3>
              <TourUploadStudents />
            </div>
            <div className="p-6">
              <label htmlFor="curso" className="block text-base font-medium text-gray-800 dark:text-white mb-4">
                Seleccionar curso:
              </label>
              <select
                id="curso"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)} // Update selected course
                className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seleccionar curso"
              >
                <option value="">Seleccionar curso</option>
                {courses.map(({ course_id, courseName }) => (
                  <option key={course_id} value={courseName}>
                    {courseName}
                  </option>
                ))}
              </select>
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
                id="confirm-submit"
                className={`mt-6 w-full flex justify-center items-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 p-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${fileSelected && selectedCourse && !apiLoading
                    ? "opacity-100 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                  }`}
                onClick={handleUpload}
                disabled={!fileSelected || !selectedCourse || apiLoading}
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
                  id="plantilla-excel"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600 p-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
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
            Espere un momento en lo que se suben los Estudiantes...
          </div>
        </div>
      )}
    </>
  )
}

export default UploadStudents
