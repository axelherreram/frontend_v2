import axios from 'axios';

// Define la interfaz para la creación de revisores
interface RevisorData {
  email: string;
  name: string;
  codigo: string;
}

// Función para crear un revisor
export const creaRevisor = async (data: RevisorData): Promise<void> => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // URL de la API
    const url = `${import.meta.env.VITE_API_URL}/reviewers`;

    // Realizar la solicitud POST
    await axios.post(url, data, {
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
