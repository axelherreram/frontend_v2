import type React from "react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { createUserSinLogin } from "../../ts/Administrator/CreateUserWithoutLogin"

interface CreateUserWithoutLoginProps {
  onClose: () => void
  usuario?: any | null
}

const CreateUserWithoutLogin: React.FC<CreateUserWithoutLoginProps> = ({ onClose, usuario }) => {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [carnet, setCarnet] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (usuario) {




      setEmail(usuario.email || "")
      setName(usuario.name || "")
      setCarnet(usuario.carnet || "")
    } else {
      setEmail("")
      setName("")
      setCarnet("")
    }
  }, [usuario])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !name || !carnet) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor complete todos los campos.",
        confirmButtonColor: "#ef4444",
      })
      return
    }

    setIsLoading(true)
    try {
      await createUserSinLogin({ email, name, carnet })

      Swal.fire({
        title: "¡Usuario creado!",
        text: `El usuario "${name}" ha sido creado exitosamente.`,
        icon: "success",
        confirmButtonText: "De Acuerdo",
        confirmButtonColor: "#10b981",
      })
      onClose()
    } catch (error) {
      Swal.fire({
        title: "Error al crear usuario",
        text: error instanceof Error ? error.message : "Error desconocido",
        icon: "error",
        confirmButtonText: "De Acuerdo",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-2xl mt-32 md:max-w-3xl md:mt-40 lg:max-w-4xl lg:mt-35 lg:ml-[330px] transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {usuario ? "Editar Estudiante" : "Crear Estudiante"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {usuario ? "Actualiza la información del estudiante" : "Registra un nuevo estudiante en el sistema"}
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📧 Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                placeholder="ejemplo@miumg.edu.gt"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎫 Carnet</label>
              <input
                type="text"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white dark:focus:bg-gray-600
                           transition-all duration-200 outline-none"
                placeholder="Carnet del usuario"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👤 Nombre Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-md text-sm
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white dark:focus:bg-gray-600
                         transition-all duration-200 outline-none"
              placeholder="Nombre completo del usuario"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 font-medium rounded-md transition-all duration-200 text-sm
                         border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-medium rounded-md transition-all duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : usuario ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserWithoutLogin
