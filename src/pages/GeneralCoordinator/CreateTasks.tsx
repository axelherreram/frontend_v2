import { useState, useEffect } from "react"
import { useYears } from "../../context/YearsContext"
import { getTareas } from "../../ts/General/GetTasks"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import TourCreatesTasks from "../../components/Tours/Administrator/TourCreatesTasks"
import { useSede } from "../../components/ReloadPages/HeadquarterPagesContext"

export interface Task {
  task_id: number
  asigCourse_id: number
  typeTask_id: number
  title: string
  description: string
  taskStart: string
  endTask: string
  startTime: string
  endTime: string
  year_id: number
}

const CreateTasks = () => {
  const { years: yearsData } = useYears()
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [years, setYears] = useState<number[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [tasksPerPage, setTasksPerPage] = useState(3)
  const [maxPageButtons, setMaxPageButtons] = useState(5)
  const { selectedSede } = useSede()

  useEffect(() => {
    if (yearsData.length === 0) return
    const fetchInitialData = async () => {
      const yearNumbers = yearsData.map((y) => y.year)
      setYears(yearNumbers)
      const currentYear = new Date().getFullYear()
      if (yearNumbers.includes(currentYear)) {
        setSelectedYear(currentYear.toString())
      }
    }
    fetchInitialData()
    const currentMonth = new Date().getMonth() + 1
    setSelectedCourse(currentMonth > 6 ? "2" : "1")
  }, [yearsData])

  useEffect(() => {
    const fetchCoursesAndUpdateTasks = async () => {
      if (selectedYear) {
        setCourses([
          { course_id: 1, courseName: "Proyecto De Graduación I" },
          { course_id: 2, courseName: "Proyecto De Graduación II" },
        ])
        const currentMonth = new Date().getMonth() + 1
        setSelectedCourse(currentMonth > 6 ? "2" : "1")
      }
    }
    fetchCoursesAndUpdateTasks()
  }, [selectedYear])

  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedCourse && selectedYear && selectedSede) {
        const retrievedTasks = await getTareas(Number(selectedSede), Number(selectedCourse), Number(selectedYear))
        const sortedTasks = retrievedTasks.sort((a: Task, b: Task) => b.task_id - a.task_id)
        setTasks(Array.isArray(sortedTasks) ? sortedTasks : [])
      }
    }
    fetchTasks()
  }, [selectedCourse, selectedYear, selectedSede])

  const formatTime24Hour = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number)
    const amPm = hours < 12 ? "AM" : "PM"
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${amPm}`
  }

  const indexOfLastTask = currentPage * tasksPerPage
  const currentTasks = tasks.slice(indexOfLastTask - tasksPerPage, indexOfLastTask)
  const totalPages = Math.ceil(tasks.length / tasksPerPage)

  const paginate = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const getPageRange = () => {
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const end = Math.min(totalPages, start + maxPageButtons - 1)
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getUTCFullYear()}`
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setTasksPerPage(10)
        setMaxPageButtons(3)
      } else {
        setTasksPerPage(10)
        setMaxPageButtons(10)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <Breadcrumb pageName="Crear Tareas" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header with Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Gestión de Tareas</h3>
                <p className="text-indigo-100 text-sm">Administra las tareas del sistema</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-indigo-100 text-sm font-medium mb-2">📅 Año Académico</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl text-sm
                             bg-white/10 backdrop-blur-sm text-white placeholder-white/70
                             focus:border-white/40 focus:ring-4 focus:ring-white/20 focus:bg-white/20
                             transition-all duration-200 outline-none"
                >
                  <option value="" className="text-gray-900">
                    Seleccionar año
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()} className="text-gray-900">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-indigo-100 text-sm font-medium mb-2">📚 Curso</label>
                <select
                  id="curso-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl text-sm
                             bg-white/10 backdrop-blur-sm text-white placeholder-white/70
                             focus:border-white/40 focus:ring-4 focus:ring-white/20 focus:bg-white/20
                             transition-all duration-200 outline-none"
                >
                  <option value="" className="text-gray-900">
                    Seleccionar curso
                  </option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id.toString()} className="text-gray-900">
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <TourCreatesTasks />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-8">
            {tasks.length > 0 ? (
              <div id="tareas-list" className="space-y-6">
                {currentTasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 
                               rounded-2xl p-6 border border-gray-200 dark:border-gray-600 
                               hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">#{task.task_id}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{task.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              Inicio: {formatDate(task.taskStart)} - {formatTime24Hour(task.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              Final: {formatDate(task.endTask)} - {formatTime24Hour(task.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div id="pagination" className="flex justify-center mt-8 gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ←
                    </button>
                    {getPageRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay tareas disponibles</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Selecciona un año y curso para ver las tareas disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateTasks
