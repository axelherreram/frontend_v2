import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ClickOutside from "../Dark Mode/ClickOutside"
import { useProfile } from "../../context/UserProfileContext"
import { getNotificationsAdmin } from "../../ts/Administrator/GetNotificationsAdmin"
import { getNotificationsUser } from "../../ts/Students/GetNotificationsUser"

const DropdownNotification = () => {
  const { profile } = useProfile()
  // State hooks
  const [dropdownOpen, setDropdownOpen] = useState(false) // State to manage dropdown visibility
  const [notifying, setNotifying] = useState(true) // State to show notification indicator
  const [role, setRole] = useState<number | null>(null) // State to store the user's role
  const sedeId = profile?.sede || null // Derive sede ID from context
  const userId = profile?.user_id || null // Derive user ID from context
  const [notifications, setNotifications] = useState<{ notification_text: string; notification_date: string }[]>([]) // State to store notifications

  // Effect to load user role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") // Fetch the role from localStorage
    if (storedRole) {
      setRole(Number(storedRole)) // Set the role if it's available
    }
  }, [])



  // Function to fetch notifications based on user role
  const fetchNotifications = async () => {
    try {
      if (role === 3 && sedeId) {
        const notificationsData = await getNotificationsAdmin(sedeId) // Fetch notifications for admin if role is 3
        setNotifications(notificationsData) // Set the fetched notifications
      } else if (role === 1 && userId) {
        const notificationsData = await getNotificationsUser(userId) // Fetch notifications for student if role is 1
        setNotifications(notificationsData) // Set the fetched notifications
      }
    } catch (error) {

    }
  }

  // Effect to fetch notifications whenever role, sedeId, or userId changes
  useEffect(() => {
    if ((role === 3 && sedeId) || (role === 1 && userId)) {
      fetchNotifications() // Call the fetchNotifications function
    }
  }, [role, sedeId, userId])

  // Interval to fetch notifications every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchNotifications() // Call the fetchNotifications function every 5 minutes
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [])

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {" "}
      {/* Close dropdown when clicked outside */}
      <li>
        {/* Notification bell icon */}
        <Link
          onClick={(e) => {
            e.preventDefault() // Prevent page reload on link click
            setNotifying(false) // Set notifying to false when user clicks the bell
            setDropdownOpen(!dropdownOpen) // Toggle dropdown visibility
          }}
          to="#"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transform transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
        >
          {notifying && (
            <span className="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
              {/* Ping animation when notifying */}
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
          {/* SVG icon for notifications */}
          <svg
            className="fill-white w-5 h-5 drop-shadow-sm"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343Z"
              fill=""
            />
          </svg>
        </Link>
        {/* Dropdown notifications */}
        {dropdownOpen && (
          <div className="absolute -right-27 mt-4 flex h-90 w-75 flex-col rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/95 sm:right-0 sm:w-80 animate-in slide-in-from-top-2 duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h5 className="text-lg font-semibold text-white">🔔 Notificaciones</h5>
              </div>
            </div>
            <ul className="flex h-auto flex-col overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <li key={index}>
                    <div className="flex flex-col gap-3 border-b border-gray-200/50 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:border-gray-700/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 cursor-default transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {notification.notification_text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {/* Format notification date and time */}
                              {new Date(notification.notification_date).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              /{" "}
                              {new Date(notification.notification_date).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0v5z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center">No hay notificaciones</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  )
}

export default DropdownNotification
