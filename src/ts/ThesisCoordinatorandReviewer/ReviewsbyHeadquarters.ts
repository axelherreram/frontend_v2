import axios from 'axios';

// Interfaz para la estructura de la respuesta de la API
interface RevisionPorSedeResponse {
  message: string;
  data: {
    sede_id: number;
    totalRequests: number;
    sede: {
      nameSede: string;
    };
  }[];
}

// Función para obtener las solicitudes por sede
export const getRevisionesPorSede = async (): Promise<RevisionPorSedeResponse> => {
  try {
    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // URL de la API
    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/statistics-by-sede`;

    // Realizar la solicitud GET
    const response = await axios.get<RevisionPorSedeResponse>(url, {
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
