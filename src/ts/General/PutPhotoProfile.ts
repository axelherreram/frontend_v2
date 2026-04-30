import axios from 'axios';

// Asynchronous function to update the profile photo
export const updateProfilePhoto = async (image: File): Promise<string> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No se encontró el token de autenticación.');
    }

    // Verifica si el archivo tiene un tipo permitido
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(image.type)) {
      throw new Error('El formato de archivo no es compatible. Solo se aceptan imágenes JPEG, PNG o GIF.');
    }

    // Crear el FormData para la solicitud PUT
    const formData = new FormData();
    formData.append('profilePhoto', image);

    // Hacer la solicitud PUT para actualizar la foto de perfil
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/updateProfilePhoto`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Cambiado para usar multipart/form-data
        }
      }
    );

    // Verificar que la respuesta sea exitosa (código 200)
    if (response.status !== 200) {
      throw new Error(`Error al actualizar la foto de perfil: ${response.statusText}`);
    }

    // Retornar el mensaje de éxito desde la respuesta
    return response.data.message;

  } catch (error: any) {
    // Manejo de errores más detallado
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Si la respuesta contiene un mensaje de error
        const errorMessage = error.response.data?.message;
        throw new Error(errorMessage);
      } else {
        // Si no hay respuesta del servidor, error de conexión
        throw new Error('Error de conexión al servidor. Verifique su conexión a internet.');
      }
    } else {
      // Si no es un error de Axios, lanzar el error original
      throw error;
    }
  }
};
