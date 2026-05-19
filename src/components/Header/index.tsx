import { Link } from "react-router-dom"
import DropdownNotification from "./DropdownNotification"
import DropdownUser from "./DropdownUser"
import SedeSelector from "../Selectors/HeadquartersSelector"
import LogoIcon from "../../images/logo/logo-icon.svg"
import DarkModeSwitcher from "./DarkModeSwitcher"

/**
 * Header component
 */
const Header = (props: {
  sidebarOpen: string | boolean | undefined
  setSidebarOpen: (arg0: boolean) => void
}) => {
  // Extract role from localStorage
  const role = localStorage.getItem("userRole")

  // Define role-based routes
  const roleRoutes: { [key: string]: string } = {
    "1": "/estudiantes/inicio",
    "2": "/catedratico/graficas",
    "3": "/administrador/graficas",
    "4": "/coordinadorsede/graficas",
    "5": "/coordinadorgeneral/graficas",
    "6": "/coordinadortesis/graficas",
    "7": "/revisortesis/graficas",
  }

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg dark:bg-gray-900/95 dark:border-gray-700/50">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation()
              props.setSidebarOpen(!props.sidebarOpen)
            }}
            className="z-99999 block rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm p-2 shadow-lg hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80 lg:hidden transition-all duration-300"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-700 dark:bg-gray-300 delay-[0] duration-200 ease-in-out ${!props.sidebarOpen && "!w-full delay-300"}`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-700 dark:bg-gray-300 delay-150 duration-200 ease-in-out ${!props.sidebarOpen && "delay-400 !w-full"}`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-700 dark:bg-gray-300 delay-200 duration-200 ease-in-out ${!props.sidebarOpen && "!w-full delay-500"}`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-gray-700 dark:bg-gray-300 delay-300 duration-200 ease-in-out ${!props.sidebarOpen && "!h-0 !delay-[0]"}`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-gray-700 dark:bg-gray-300 duration-200 ease-in-out ${!props.sidebarOpen && "!h-0 !delay-200"}`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
          {/* <!-- Logo --> */}
          <Link className="block flex-shrink-0 lg:hidden ml-[-25px]" to={roleRoutes[role || "1"]}>
            <img src={LogoIcon || "/placeholder.svg"} alt="Logo" width={120} />
          </Link>
          {/* <!-- Logo --> */}
        </div>

        {/* <!-- Sede selector for role 5 (Coordinador General) --> */}
        {role === "5" && (
          <SedeSelector />
        )}

        {/* <!-- Spacer when role is not 5 --> */}
        {role !== "5" && <div className="hidden sm:block flex-1"></div>}

        {/* <!-- Right side items --> */}
        <div className="flex items-center gap-2 2xsm:gap-4 md:gap-3">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Switcher --> */}
            <DarkModeSwitcher />
            {/* <!-- Notification Dropdown (only for Estudiante and Administrador) --> */}
            {/* {(role === "1" || role === "3") && <DropdownNotification />} */}
          </ul>
          {/* <!-- User Menu --> */}
          <DropdownUser />
        </div>
      </div>
    </header>
  )
}

export default Header
