import axios from 'axios';

// Función para enviar un comentario de revisión
export const enviaComentario = async (commentData: {
  revision_thesis_id: number;
  title: string;
  comment: string;
  status: number;
}) => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');

    // Si no hay token, lanzar un error
    if (!token) throw new Error('Token de autenticación no encontrado');

    // Realizar la solicitud POST a la API
    await axios.post(`${import.meta.env.VITE_API_URL}/comment-revision`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en los headers
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // Extraer el mensaje de error de la respuesta de la API
      const errorMessage = error.response?.data?.message || 'Error desconocido al enviar el comentario';
      throw new Error(errorMessage);
    } else {
      // Si no es un error de Axios, relanzar el error
      throw error;
    }
  }
};
