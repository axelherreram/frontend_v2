import axios from 'axios';

// Define la interfaz para la asignación de revisor
interface AsignacionRevisor {
  revision_thesis_id: number;
  user_id: number;
}

// Función para asignar un revisor a una tesis
export const asignaRevisor = async (data: AsignacionRevisor): Promise<void> => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // URL de la API
    const url = `${import.meta.env.VITE_API_URL}/assigned-review`;

    // Realizar la solicitud POST
    await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const apiError = error.response.data;
      const message = apiError.message;
      const details = apiError.details ? ` Detalles: ${apiError.details}` : '';
      throw new Error(`${message}.${details}`);
    }
    throw new Error('Ocurrió un error inesperado.');
  }
};
