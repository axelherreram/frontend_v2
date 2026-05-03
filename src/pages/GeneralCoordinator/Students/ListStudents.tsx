import type React from "react"
import { useState, useEffect } from "react"
import { useYears } from "../../../context/YearsContext"
import { getStudents } from "../../../ts/General/GetStudents"
import { useNavigate } from "react-router-dom"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import generaPDFGeneral from "../../../components/Pdfs/GeneralCoordinator/generatePDFGeneral"
import BuscadorEstudiantes from "../../../components/Searches/SearchStudents"
import TourStudents from "../../../components/Tours/Administrator/TourStudents"
import { Users, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react"
import { useSede } from "../../../components/ReloadPages/HeadquarterPagesContext"

interface Estudiante {
  id: number
  userName: string
  carnet: string
  email: string
  sedeId: number
  fotoPerfil: string
}

interface Curso {
  course_id: number
  courseName: string
}

const ListStudents: React.FC = () => {
  const { selectedSede } = useSede()
  const { years: yearsData } = useYears()
  const SedeId = Number(selectedSede)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedAño, setSelectedAño] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [selectedCurso, setSelectedCurso] = useState<string>("")
  const [estudiantesPerPage, setEstudiantesPerPage] = useState(4)
  const [maxPageButtons, setMaxPageButtons] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    if (yearsData.length === 0) return
    const fetchInitialData = async () => {
      const SedeId = Number(selectedSede)
      const yearNumbers = yearsData.map((y) => y.year)
      setYears(yearNumbers)
      const currentYear = new Date().getFullYear().toString()
      if (yearNumbers.map(String).includes(currentYear)) {
        setSelectedAño(currentYear)
      }
      const currentMonth = new Date().getMonth()
      const initialCourseId = currentMonth >= 6 ? "2" : "1"
      setSelectedCurso(initialCourseId)
      setCursos([
        { course_id: 1, courseName: "Proyecto de Graduación I" },
        { course_id: 2, courseName: "Proyecto de Graduación II" },
      ])
      if (currentYear && SedeId) {
        fetchEstudiantes(initialCourseId, currentYear, SedeId)
      }
    }
    fetchInitialData()
  }, [SedeId, yearsData])

  const fetchEstudiantes = async (courseId: string, nameYear: string, sedeId: number) => {
    try {
      const estudiantesRecuperados = await getStudents(sedeId, Number.parseInt(courseId), Number.parseInt(nameYear))
      setEstudiantes(Array.isArray(estudiantesRecuperados) ? estudiantesRecuperados : [])
    } catch {
      setEstudiantes([])
    }
  }

  const handleAñoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const añoSeleccionado = e.target.value
    setSelectedAño(añoSeleccionado)
    if (añoSeleccionado && selectedCurso && SedeId) {
      fetchEstudiantes(selectedCurso, añoSeleccionado, SedeId)
    }
  }

  const handleCursoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cursoSeleccionado = e.target.value
    setSelectedCurso(cursoSeleccionado)
    if (selectedAño && cursoSeleccionado && SedeId) {
      fetchEstudiantes(cursoSeleccionado, selectedAño, SedeId)
    }
  }

  const handleStudentClick = (estudiante: Estudiante) => {
    navigate(`/coordinadorgeneral/time-line`, {
      state: {
        estudiante,
        selectedAño,
        selectedCurso,
      },
    })
  }

  const handlePrintPDF = (selectedAño: number, selectedCurso: number) => {
    generaPDFGeneral(selectedAño, selectedCurso)
  }

  const handleSearchResults = (resultados: Estudiante[]) => {
    setEstudiantes(resultados)
    setCurrentPage(1)
  }

  const indexOfLastEstudiante = currentPage * estudiantesPerPage
  const indexOfFirstEstudiante = indexOfLastEstudiante - estudiantesPerPage
  const currentEstudiantes = estudiantes.slice(indexOfFirstEstudiante, indexOfLastEstudiante)
  const totalPages = Math.ceil(estudiantes.length / estudiantesPerPage)

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const getPageRange = () => {
    const range: number[] = []
    const totalPages = Math.ceil(estudiantes.length / estudiantesPerPage)
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    return range
  }

  const renderProfilePhoto = (profilePhoto: string, userName: string) => {
    if (profilePhoto) {
      return (
        <img
          src={profilePhoto || "/placeholder.svg"}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-sm"
        />
      )
    } else {
      const initial = userName.charAt(0).toUpperCase()
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-md">
          {initial}
        </div>
      )
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setEstudiantesPerPage(10)
        setMaxPageButtons(3)
      } else {
        setEstudiantesPerPage(10)
        setMaxPageButtons(10)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
              className="flex items-center px-5 py-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => handlePrintPDF(Number(selectedAño), Number(selectedCurso))}
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" /> Exportar a Excel
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
