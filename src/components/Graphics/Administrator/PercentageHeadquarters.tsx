import type { ApexOptions } from "apexcharts"
import type React from "react"
import { useEffect, useState } from "react"
import ReactApexChart from "react-apexcharts"
import { useProfile } from "../../../context/UserProfileContext"
import { getSedeComplete, type SedeStats } from "../../../ts/Administrator/GetCompleteHeadquarters"
import { Loader2 } from "lucide-react" // Import spinner icon

/**
 * Interface to define the structure of the chart data.
 */
interface ChartData {
  series: number[] // Array of series data for the chart (percentage values)
  labels: string[] // Array of labels for the chart
}

/**
 * `PercentageHeadquarters` component displays a pie chart showing the completion and pending rates
 * for a specific 'sede' (campus) based on the user's profile information.
 * It fetches the required data from backend services and renders it dynamically.
 */
const PercentageHeadquarters: React.FC = () => {
  const { profile } = useProfile()
  // State to store chart data including series and labels
  const [chartData, setChartData] = useState<ChartData>({
    series: [],
    labels: [],
  })
  // State to manage loading status
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /**
   * Fetch data when the component mounts.
   * Retrieves the user profile and then gets the completion and pending rates
   * for the corresponding 'sede', updating the chart data accordingly.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.sede) return
      setIsLoading(true)
      try {
        // Get the current 'sede' (campus) from the profile data
        const sedeId = profile.sede
        // Fetch advanced task statistics for the given 'sedeId'
        const stats: SedeStats = await getSedeComplete(sedeId)
        // If stats are available, update the chart data
        if (stats) {
          setChartData({
            series: [
              Number.parseFloat(stats.completionRate) || 0, // Completion rate
              Number.parseFloat(stats.pendingRate) || 0, // Pending rate
            ],
            labels: ["Completado", "Pendiente"], // Labels for the chart
          })
        }
      } catch (error) {

        setChartData({
          series: [0, 0], // Default to 0 if error
          labels: ["Completado", "Pendiente"],
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData() // Call the function to fetch data
  }, [profile]) // Re-run when profile changes

  // Configuration options for the pie chart
  const options: ApexOptions = {
    colors: ["#6366F1", "#A78BFA"], // Custom colors for the chart (indigo/purple shades)
    chart: {
      type: "pie",
      height: 350,
      toolbar: { show: false }, // Hides the chart toolbar
      background: "transparent", // Ensure chart background is transparent
    },
    labels: chartData.labels, // Labels for each section of the pie
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: { radius: 99 }, // Make legend markers circular
      labels: {
        colors: "#374151", // Darker gray for legend labels
      },
    },
    fill: { opacity: 1 }, // Full opacity for chart fill
    tooltip: {
      theme: "dark", // Dark tooltip theme
      style: {
        fontSize: "12px",
        fontFamily: "Satoshi, sans-serif",
      },
      y: {
        formatter: (val) => `${val}%`, // Displays percentage symbol in tooltip
      },
    },
    dataLabels: {
      formatter: (val) => `${Number(val || 0).toFixed(2)}%`, // Format labels inside the pie chart
      style: {
        fontSize: "14px",
        fontFamily: "Satoshi, sans-serif",
        colors: ["#fff"], // White labels for better contrast
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45,
      },
    },
    stroke: {
      colors: ["#ffffff"], // White stroke for segments
      width: 2,
    },
  }

  return (
    // Container for the pie chart
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 -z-10 opacity-10 dark:opacity-20">
        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-800 dark:to-indigo-800 blur-3xl"></div>
      </div>

      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Porcentaje de Tareas 📈</h4>
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <span className="sr-only">Cargando porcentaje...</span>
        </div>
      ) : (
        /* Rendering the pie chart with dynamic options and series */
        <ReactApexChart options={options} series={chartData.series} type="pie" height={350} />
      )}
    </div>
  )
}

export default PercentageHeadquarters
