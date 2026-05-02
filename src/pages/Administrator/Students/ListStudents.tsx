import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { useYears } from "../../../context/YearsContext"
import { getStudents } from "../../../ts/General/GetStudents"
import { getCursos } from "../../../ts/General/GetCourses"
import { useNavigate } from "react-router-dom"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import generaPDFGeneral from "../../../components/Pdfs/generatePDFGeneral"
import BuscadorEstudiantes from "../../../components/Searches/SearchStudents"
import TourStudents from "../../../components/Tours/Administrator/TourStudents"
import { Users, ChevronLeft, ChevronRight, Printer, XCircle } from "lucide-react"

/**
 * Interface for student data
 */
interface Estudiante {
  id: number
  userName: string
  carnet: string
  email: string
  sedeId: number
  fotoPerfil: string
}

/**
 * Interface for course data
 */
interface Curso {
  course_id: number
  courseName: string
}

/**
 * List Students Component
 * Displays a list of students with filtering and pagination
 */
const ListStudents: React.FC = () => {
  // Global context hooks — no individual API calls needed
  const { profile } = useProfile()
  const { years: yearsData } = useYears()

  // State variables for managing students data, years, courses, etc.
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]) // List of students
  const [years, setYears] = useState<number[]>([]) // List of available years
  const [selectedAño, setSelectedAño] = useState<string>("") // Selected year
  const [currentPage, setCurrentPage] = useState(1) // Current page for pagination
  const [cursos, setCursos] = useState<Curso[]>([]) // List of available courses
  const [selectedCurso, setSelectedCurso] = useState<string>("") // Selected course
  const [estudiantesPerPage, setEstudiantesPerPage] = useState(4) // Number of students per page
  const [maxPageButtons, setMaxPageButtons] = useState(10) // Maximum number of page buttons to show
  const navigate = useNavigate() // To navigate to other pages

  /**
   * Effect hook to initialize data once profile and years are loaded from context
   */
  useEffect(() => {
    if (!profile || yearsData.length === 0) return

    const yearNumbers = yearsData.map((y) => y.year)
    setYears(yearNumbers)

    const currentYear = new Date().getFullYear().toString()
    if (yearNumbers.map(String).includes(currentYear)) {
      setSelectedAño(currentYear)
    }

    const currentMonth = new Date().getMonth()
    const initialCourseId = currentMonth >= 6 ? "2" : "1"
    setSelectedCurso(initialCourseId)

    if (profile.sede && currentYear) {
      fetchEstudiantes(profile.sede, initialCourseId, currentYear)
      fetchCursos(profile.sede)
    }
  }, [profile, yearsData])

  /**
   * Fetch students based on selected year, course, and campus
   */
  const fetchEstudiantes = async (sedeId: number, courseId: string, nameYear: string) => {
    try {
      const estudiantesRecuperados = await getStudents(sedeId, Number.parseInt(courseId), Number.parseInt(nameYear))
      setEstudiantes(Array.isArray(estudiantesRecuperados) ? estudiantesRecuperados : []) // Set students in state
    } catch {
      setEstudiantes([]) // Set empty list in case of error
    }
  }

  /**
   * Fetch courses based on selected year and campus
   * @param sedeId - Campus ID
   */
  const fetchCursos = async (sedeId: number) => {
    try {
      const añoSeleccionado = selectedAño ? Number.parseInt(selectedAño) : new Date().getFullYear() // Set selected year or current year
      const cursosRecuperados = await getCursos(sedeId, añoSeleccionado) // Fetch courses
      setCursos(Array.isArray(cursosRecuperados) ? cursosRecuperados : []) // Set courses in state
    } catch (error) {
      setCursos([]) // Set empty list in case of error
    }
  }

  /**
   * Handle change of selected year from dropdown
   * @param e - Change event from select
   */
  const handleAñoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const añoSeleccionado = e.target.value
    setSelectedAño(añoSeleccionado)
    if (profile?.sede && añoSeleccionado) {
      const cursosRecuperados = await getCursos(profile.sede, Number.parseInt(añoSeleccionado))
      setCursos(Array.isArray(cursosRecuperados) ? cursosRecuperados : [])
    }
    if (profile?.sede && añoSeleccionado && selectedCurso) {
      fetchEstudiantes(profile.sede, selectedCurso, añoSeleccionado)
    }
  }

  /**
   * Handle change of selected course from dropdown
   */
  const handleCursoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurso(e.target.value)
    if (profile?.sede && selectedAño && e.target.value) {
      fetchEstudiantes(profile.sede, e.target.value, selectedAño)
    }
  }

  /**
   * Handle click on student row to navigate to the student's timeline
   * @param estudiante - Student data to pass to timeline
   */
  const handleStudentClick = (estudiante: Estudiante) => {
    navigate(`/administrador/time-line`, {
      state: {
        estudiante,
        selectedAño,
        selectedCurso,
      },
    })
  }

  /**
   * Handle print PDF for the selected year and course
   * @param selectedAño - Selected year
   * @param selectedCurso - Selected course
   */
  const handlePrintPDF = (selectedAño: number, selectedCurso: number) => {
    generaPDFGeneral(selectedAño, selectedCurso) // Generate PDF report
  }

  /**
   * Handle search results from the BuscadorEstudiantes component
   * @param resultados - Search results array
   */
  const handleSearchResults = (resultados: Estudiante[]) => {
    setEstudiantes(resultados)
    setCurrentPage(1) // Reset to first page when search results change
  }

  // Pagination logic
  const indexOfLastEstudiante = currentPage * estudiantesPerPage // Index of last student on current page
  const indexOfFirstEstudiante = indexOfLastEstudiante - estudiantesPerPage // Index of first student on current page
  const currentEstudiantes = estudiantes.slice(indexOfFirstEstudiante, indexOfLastEstudiante) // Slice students for current page
  const totalPages = Math.ceil(estudiantes.length / estudiantesPerPage) // Total number of pages

  /**
   * Pagination function to set the current page
   * @param pageNumber - Page number to navigate to
   */
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber) // Update current page
    }
  }

  /**
   * Get page range for pagination buttons
   * @returns Array of page numbers to display
   */
  const getPageRange = () => {
    const range: number[] = []
    const totalPages = Math.ceil(estudiantes.length / estudiantesPerPage) // Calculate total pages
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2)) // Calculate start page
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1) // Calculate end page

    for (let i = startPage; i <= endPage; i++) {
      range.push(i) // Add pages to range
    }

    return range
  }

  /**
   * Render the student's profile photo or an initial if no photo is available
   * @param profilePhoto - URL of profile photo
   * @param userName - Student's name
   * @returns JSX element for profile photo
   */
  const renderProfilePhoto = (profilePhoto: string, userName: string) => {
    if (profilePhoto) {
      return <img src={profilePhoto || "/placeholder.svg"} alt={userName} className="w-10 h-10 rounded-full" /> // Render photo if available
    } else {
      const initial = userName.charAt(0).toUpperCase() // Get first letter of user name
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white">
          {initial} {/* Render initial if no photo */}
        </div>
      )
    }
  }

  /**
   * Adjust number of students per page and pagination buttons on window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setEstudiantesPerPage(10) // Set more students per page on smaller screens
        setMaxPageButtons(3) // Set fewer page buttons
      } else {
        setEstudiantesPerPage(10) // Set default students per page
        setMaxPageButtons(10) // Set default page buttons
      }
    }

    handleResize() // Initial check for screen size
    window.addEventListener("resize", handleResize) // Add resize event listener
    return () => window.removeEventListener("resize", handleResize) // Cleanup event listener
  }, [])

  // If no courses are available, show a message
  if (cursos.length === 0) {
    return (
      <>
        <Breadcrumb pageName="Listar Estudiantes" />
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

  return (
    <>
      <Breadcrumb pageName="Listar Estudiantes" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-grow w-full md:w-auto">
            <BuscadorEstudiantes
              selectedAño={selectedAño}
              selectedCurso={selectedCurso}
              onSearchResults={handleSearchResults}
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="print-report"
              className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => handlePrintPDF(Number(selectedAño), Number(selectedCurso))}
            >
              <Printer className="h-5 w-5 mr-2" /> Imprimir Reporte
            </button>
            <TourStudents />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <select
            id="select-year"
            value={selectedAño}
            onChange={handleAñoChange}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 shadow-sm"
          >
            <option value="">Seleccionar año 📅</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          <select
            id="select-course"
            value={selectedCurso}
            onChange={handleCursoChange}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 shadow-sm"
          >
            <option value="">Seleccionar curso 📚</option>
            {cursos.map((curso) => (
              <option key={curso.course_id} value={curso.course_id.toString()}>
                {curso.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <table id="student-table" className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-xl">Foto</th>
                <th className="py-3 px-4 text-center">Nombre Estudiante</th>
                <th className="py-3 px-4 text-center rounded-tr-xl">Carnet</th>
              </tr>
            </thead>
            <tbody>
              {currentEstudiantes.length > 0 ? (
                currentEstudiantes.map((est) => (
                  <tr
                    key={est.id}
                    onClick={() => handleStudentClick(est)}
                    className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
                  >
                    <td className="py-3 px-4 text-center">{renderProfilePhoto(est.fotoPerfil, est.userName)}</td>
                    <td className="py-3 px-4 text-center text-gray-900 dark:text-white relative">
                      {est.userName}
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap dark:bg-gray-200 dark:text-gray-800 shadow-md">
                        Ir Hacia TimeLine Estudiante
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{est.carnet}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No se encontraron estudiantes.  </p>
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
    </>
  )
}

export default ListStudents
