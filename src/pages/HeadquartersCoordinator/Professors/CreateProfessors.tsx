import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../../context/UserProfileContext"
import { createCatedratico } from "../../../ts/HeadquartersCoordinator/CreateProfessor"
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb"
import Swal from "sweetalert2"
import { UserPlus, Mail, Hash, Loader2 } from "lucide-react" // Import Lucide React icons

const CreateProfessor = () => {
  const { profile } = useProfile()
  const headquarterId = profile?.sede ?? null
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  // headquarterId is now derived directly from context

  const validateForm = () => {
    if (!name || !email || !code || headquarterId === null) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor, complete todos los campos.",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "De Acuerdo",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setLoading(true)
    try {
      await createCatedratico({
        email: email,
        name: name,
        carnet: code,
        sede_id: headquarterId!,
        year: year,
      })
      setName("")
      setEmail("")
      setCode("")
      setYear(new Date().getFullYear())
      Swal.fire({
        icon: "success",
        title: "Catedrático creado exitosamente",
        text: "El catedrático fue creado correctamente. 🎉",
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Hubo un error al crear el catedrático."
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Breadcrumb pageName="Crear Catedrático" />
      <div className="flex justify-center mt-8 px-4">
        <div className="w-full max-w-lg overflow-hidden">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Crear Catedrático Individual
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-gray-800 dark:text-white font-medium">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ingresa el nombre completo"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-5 pr-10 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      disabled={loading}
                    />
                    <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-gray-800 dark:text-white font-medium">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa el correo electrónico"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-5 pr-10 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      disabled={loading}
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="code" className="mb-2 block text-gray-800 dark:text-white font-medium">
                    Código
                  </label>
                  <div className="relative">
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ingresa el Código del Catedrático"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-5 pr-10 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      disabled={loading}
                    />
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`flex w-full justify-center items-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 p-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-3" /> Cargando...
                    </>
                  ) : (
                    "Crear Catedrático"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center text-white text-xl">
            <Loader2 className="animate-spin h-12 w-12 text-blue-400 mb-4" />
            Espere un momento en lo que se crea el Catedrático...
          </div>
        </div>
      )}
    </>
  )
}

export default CreateProfessor
