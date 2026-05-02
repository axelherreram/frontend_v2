import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { updateProfilePhoto } from "../../ts/General/PutPhotoProfile"
import { FaCamera, FaUser, FaIdCard, FaBuilding } from "react-icons/fa"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import ofiLogo from "../../images/Login/sistemas1_11zon.png"
import Swal from "sweetalert2"

const Profile = () => {
  const { profile: profileData } = useProfile()
  const [profileImage, setProfileImage] = useState<string>()
  const [isUploading, setIsUploading] = useState(false)
  const [storedRole, setStoredRole] = useState<number | null>(null)

  useEffect(() => {
    if (!profileData) return
    if (profileData.profilePhoto) {
      setProfileImage(profileData.profilePhoto)
    } else {
      setProfileImage(profileData.userName.charAt(0).toUpperCase())
    }
    const roleStr = localStorage.getItem('userRole')
    setStoredRole(roleStr ? parseInt(roleStr) : null)
  }, [profileData])


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
      setIsUploading(true)

      try {
        await updateProfilePhoto(file)
        Swal.fire({
          title: "¡Éxito!",
          text: "La foto de perfil se ha actualizado correctamente.",
          icon: "success",
          confirmButtonText: "De Acuerdo",
          confirmButtonColor: "#10b981",
        }).then(() => {
          window.location.reload()
        })
      } catch (error: any) {
        const errorMessage = error?.message || "Hubo un problema al actualizar la foto de perfil."
        setProfileImage(profileData?.profilePhoto || " ")
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "De Acuerdo",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <>
      <Breadcrumb pageName="Mi Perfil" />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 md:h-64">
            <img src={ofiLogo || "/placeholder.svg"} alt="profile cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-20 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-2 shadow-2xl">
                  {profileData?.profilePhoto ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl">
                      {profileData?.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Camera Button */}
                <div className="absolute bottom-2 right-2">
                  <label
                    htmlFor="fileInput"
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                               rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl 
                               transition-all duration-200 transform"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <FaCamera className="text-white text-sm" />
                    )}
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            {profileData ? (
              <div className="text-center space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profileData.userName}</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{profileData.email}</p>
                </div>

                {/* Info Cards */}
                <div
                  className={`grid ${profileData?.NombreSede ? "grid-cols-3" : "grid-cols-1 md:grid-cols-2 md:mx-auto md:max-w-xl"
                    } gap-4 mt-8`}
                >
                  {/* Nivel de Acceso */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-lg" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Nivel de Acceso</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">{profileData.roleName}</p>
                  </div>

                  {/* Carnet o Código */}
                  <div
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FaIdCard className="text-white text-lg" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {storedRole === 1 ? "Carnet" : "Código"}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">{profileData.carnet}</p>
                  </div>

                  {/* Sede, solo si existe */}
                  {profileData?.NombreSede && (
                    <div
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                  rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-white text-lg" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Sede</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{profileData.NombreSede}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando datos del perfil...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
