import axios from 'axios';

// Interface para la respuesta del servidor
export interface ResponseMessage {
  message: string;  // Mensaje devuelto por la API
}

// Función asíncrona para activar o desactivar un administrador
export const ActiveAdmin = async (userId: number, active: boolean): Promise<ResponseMessage> => {
  try {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Petición PUT al endpoint correspondiente
    const response = await axios.put<ResponseMessage>(
      `${import.meta.env.VITE_API_URL}/admin/toggle-status`,
      {
        user_id: userId,
        active: active
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Retornar el mensaje de la respuesta
    return response.data;

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Captura errores provenientes de la API
      const errorMessage = error.response.data?.message || 'Error desconocido al cambiar el estado del administrador';
      throw new Error(errorMessage);
    }

    // Si no es un error de Axios, lanzar mensaje genérico
    throw new Error('Error al cambiar el estado del administrador');
  }
};
