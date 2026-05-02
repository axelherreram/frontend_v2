import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { getTareasSede, type Tarea } from "../../ts/General/GetTasksHeadquarters"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import "dayjs/locale/es"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Extend dayjs with isBetween plugin and set the locale to Spanish
dayjs.extend(isBetween)
dayjs.locale("es")

/**
 * Calendar component for displaying tasks and events
 */
const Calendar: React.FC = () => {
  // State to hold the current date
  const [currentDate, setCurrentDate] = useState(dayjs())
  // State to hold the list of tasks for the selected month
  const [tasks, setTasks] = useState<Tarea[]>([])

  // Calculate the first day of the month and the number of days in the current month
  const startOfMonth = currentDate.startOf("month")
  const startDay = startOfMonth.day()
  const daysInMonth = currentDate.daysInMonth()
  const totalDaysInCalendar = 42 // Total number of days in the calendar (6 rows of 7 days)
  const days: (number | null)[] = [] // Array to hold the days for the calendar view

  // Add null for the days before the start of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  // Add the days of the current month to the calendar
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  // Add null for the remaining days to complete the calendar
  const remainingDays = totalDaysInCalendar - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(null)
  }

  /**
   * Function to go to the previous month
   */
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => prevDate.subtract(1, "month"))
  }

  /**
   * Function to go to the next month
   */
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => prevDate.add(1, "month"))
  }

  /**
   * Function to check if a given day is today
   */
  const isToday = (day: number) => {
    return day && currentDate.date(day).isSame(dayjs(), "day")
  }

  // Read campus ID directly from context — no API call needed
  const { profile } = useProfile()
  const campusId = profile?.sede ?? null

  // Effect hook to fetch the tasks for the current campus and year
  useEffect(() => {
    const fetchTasks = async () => {
      if (campusId !== null) {
        const retrievedTasks = await getTareasSede(campusId, currentDate.year()) // Get tasks for the campus and year
        setTasks(retrievedTasks) // Set the tasks in state
      }
    }
    fetchTasks()
  }, [campusId, currentDate]) // Re-run the effect when campusId or currentDate changes

  /**
   * Function to get tasks for a specific day in the calendar
   */
  const getTasksForDate = (day: number) => {
    if (!day) return [] // Return an empty array if the day is null
    const date = currentDate.date(day).startOf("day") // Set the date for the specific day
    // Filter the tasks to get those that match the selected date
    return tasks.filter((task) => {
      const taskStart = dayjs(task.taskStart).startOf("day")
      const taskEnd = dayjs(task.endTask).endOf("day")
      return date.isBetween(taskStart, taskEnd, null, "[]") // Check if the date is between the task start and end dates
    })
  }

  return (
    <>
      <Breadcrumb pageName="Calendario" />
      <div className="mx-auto max-w-5xl px-4 py-0">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
          <header className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-md">
            <button
              onClick={handlePrevMonth}
              className="flex items-center px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 text-white font-semibold"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
            </button>
            <h2 className="text-2xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
            <button
              onClick={handleNextMonth}
              className="flex items-center px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 text-white font-semibold"
            >
              Siguiente <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </header>
          <table className="table-fixed w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr>
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <th
                    key={day}
                    className="p-3 font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  {days.slice(i * 7, (i + 1) * 7).map((day, j) => {
                    const tasksForDay = day !== null ? getTasksForDate(day) : []
                    return (
                      <td
                        key={j}
                        role="button"
                        tabIndex={0}
                        className={`h-28 text-center border border-gray-200 dark:border-gray-700 p-2 align-top transition-colors duration-200
                          ${
                            day
                              ? isToday(day)
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold shadow-inner"
                                : tasksForDay.length > 0
                                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 font-bold shadow-inner"
                                  : "bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <span className="block text-lg font-semibold mb-1">{day || ""}</span>
                        {tasksForDay.length > 0 && (
                          <div className="text-xs mt-1 space-y-1">
                            {tasksForDay.map((task, index) => (
                              <div
                                key={index}
                                className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-center truncate"
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Calendar
