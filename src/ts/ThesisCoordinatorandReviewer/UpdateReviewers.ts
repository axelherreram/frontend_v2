import axios from 'axios';

// Define la interfaz para la actualización de revisores
interface RevisorData {
  email: string;
  name: string;
  codigo: string;
}

// Función para actualizar un revisor
export const updateRevisor = async (userId: number, data: RevisorData): Promise<void> => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // URL de la API con el parámetro userId
    const url = `${import.meta.env.VITE_API_URL}/reviewers/${userId}`;

    // Realizar la solicitud PUT para actualizar el revisor
    await axios.put(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error instanceof Error ? error.message : 'Error desconocido');
  }
};
