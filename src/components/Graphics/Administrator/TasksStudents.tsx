import type { ApexOptions } from "apexcharts"
import type React from "react"
import { useEffect, useState } from "react"
import ReactApexChart from "react-apexcharts"
import { useProfile } from "../../../context/UserProfileContext"
import { getTaskStats } from "../../../ts/Administrator/GetTaskStat"
import { Loader2 } from "lucide-react" // Import spinner icon

interface ChartData {
  series: { name: string; data: number[] }[]
  categories: string[]
}

const TasksStudents: React.FC = () => {
  const { profile } = useProfile()
  const [chartData, setChartData] = useState<ChartData>({
    series: [
      { name: "Estudiantes Pendientes", data: [] },
      { name: "Estudiantes Confirmados", data: [] },
    ],
    categories: [],
  })

  // ✅ Cambio aplicado aquí:
  const [courseId, setCourseId] = useState<number>(() => {
    const month = new Date().getMonth() + 1
    return month <= 6 ? 1 : 2
  })

  const [maxYValue, setMaxYValue] = useState<number>(30)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.sede) return
      setIsLoading(true)
      try {
        const currentYear = new Date().getFullYear()
        const sedeId = profile.sede
        const stats = await getTaskStats(courseId, currentYear, sedeId)
        const totalStudents = stats.find((s) => s.totalStudents !== undefined)?.totalStudents || 10
        setMaxYValue(totalStudents)

        let categories = stats.filter((s) => s.task !== undefined).map((s) => `T${s.task}`)
        let pendingStudents = stats.filter((s) => s.task !== undefined).map((s) => s.pendingStudents || 0)
        let confirmedStudents = stats.filter((s) => s.task !== undefined).map((s) => s.confirmedStudents || 0)

        if (categories.length === 0) {
          categories = ["Sin Datos"]
          pendingStudents = [0]
          confirmedStudents = [0]
        }

        setChartData({
          series: [
            { name: "Estudiantes Pendientes", data: pendingStudents },
            { name: "Estudiantes Confirmados", data: confirmedStudents },
          ],
          categories,
        })
      } catch (error) {

        setChartData({
          series: [
            { name: "Estudiantes Pendientes", data: [0] },
            { name: "Estudiantes Confirmados", data: [0] },
          ],
          categories: ["Sin Datos"],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [courseId, profile])

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCourseId(Number(event.target.value))
  }

  const options: ApexOptions = {
    colors: ["#6366F1", "#A78BFA"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "25%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "#6B7280",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      max: maxYValue,
      labels: {
        style: {
          colors: "#6B7280",
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: { radius: 99 },
      labels: {
        colors: "#374151",
      },
    },
    fill: { opacity: 1 },
    grid: {
      show: true,
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "Satoshi, sans-serif",
      },
    },
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="absolute inset-0 -z-10 opacity-10 dark:opacity-20">
        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-800 dark:to-purple-800 blur-3xl"></div>
      </div>

      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Estadísticas de Tareas 📊</h4>
        </div>
        <div>
          <select
            className="py-1.5 pl-4 pr-10 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
            value={courseId}
            onChange={handleCourseChange}
          >
            <option value="1">PG1</option>
            <option value="2">PG2</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="sr-only">Cargando estadísticas...</span>
        </div>
      ) : (
        <ReactApexChart options={options} series={chartData.series} type="bar" height={350} />
      )}
    </div>
  )
}

export default TasksStudents
