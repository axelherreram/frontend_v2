import axios from 'axios';

// Interfaz para la estructura de la respuesta de la API
interface TotalesRevisionResponse {
  message: string;
  data: {
    totalRevisions: number;
    totalApprovedRevisions: number;
    totalRejectedRevisions: number;
    totalActiveRevisions: number;
    totalRevisores: number;
  };
}

// Función para obtener las estadísticas de revisiones
export const getTotalesRevision = async (): Promise<TotalesRevisionResponse> => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // URL de la API
    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/statistics`;

    // Realizar la solicitud GET
    const response = await axios.get<TotalesRevisionResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(`Error de la API: ${errorMessage}`);
    }
    throw new Error(`Error desconocido: ${error.message}`);
  }
};
