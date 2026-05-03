import { useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { useState } from "react"
import type React from "react"
import Swal from "sweetalert2"
import umgLogo from "../../images/Login/logo3.png"
import ofiLogo from "../../images/Login/sistemas1_11zon.png"
import axios from "axios"
import { useSedes } from "../../components/ReloadPages/HeadquarterSelectContext"
import { useProfile } from "../../context/UserProfileContext"

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { reloadSedes } = useSedes()
  const { reloadProfile } = useProfile()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor, complete todos los campos.",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "De acuerdo",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Correo inválido",
        text: "Ingrese un correo electrónico válido.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }

    if (password.length < 4) {
      Swal.fire({
        icon: "error",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 4 caracteres.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_AUTH_URL}/login`, { email, password })
      localStorage.setItem("authToken", response.data.token)
      localStorage.setItem("userRole", response.data.rol)

      // Actualizamos el estado global del perfil inmediatamente
      await reloadProfile()

      const rolePaths: { [key: number]: string } = {
        7: "/revisortesis/mis-asignaciones",
        6: "/coordinadortesis/graficas",
        5: "/coordinadorgeneral/graficas",
        4: "/coordinadorsede/graficas",
        3: "/administrador/graficas",
        1: "/estudiantes/time-line",
      }

      if (response.data.passwordUpdate === false) {
        Swal.fire({
          icon: "warning",
          title: "Cambio de contraseña requerido",
          text: "Primero favor de cambiar contraseña temporal.",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "De Acuerdo",
        }).then(() => {
          navigate("/cambia/contraseña")
        })
      } else {
        if (response.data.rol === 5) {
          await reloadSedes()
        }

        Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: "Inicio de sesión exitoso.",
          confirmButtonColor: "#10b981",
          confirmButtonText: "De Acuerdo",
        }).then(() => {
          const validRoles = [1, 3, 4, 5, 6, 7]
          const rolePath = validRoles.includes(response.data.rol)
            ? rolePaths[response.data.rol]
            : "/"
          navigate(rolePath)
        })
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: error?.response?.data?.message || "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${ofiLogo})` }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <div className="inline-block p-2 rounded-2xl mb-4">
              <img src={umgLogo || "/placeholder.svg"} alt="UMG Logo" className="w-48 h-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Accede a tu cuenta institucional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                📧 Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                  placeholder="tu.correo@miumg.edu.gt"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <FaEnvelope className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🔒 Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <FaLock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-medium rounded-xl transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/recuperar-contraseña"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                       text-sm font-medium transition-colors duration-200 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
