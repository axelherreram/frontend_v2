import axios from 'axios';

// Función asíncrona para crear un catedrático
export const createCatedratico = async (catedraticoData: {
  email: string;
  name: string;
  carnet: string;
  sede_id: number;
  year: number;
}): Promise<void> => {
  try {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Realizar la solicitud POST para crear el catedrático
    await axios.post(`${import.meta.env.VITE_API_URL}/create/professor`, catedraticoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};