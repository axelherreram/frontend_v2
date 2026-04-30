import axios from 'axios';

// Tipo para los datos de coordinadores de tesis
interface ThesisCoordinator {
  user_id: number;
  name: string;
  email: string;
  carnet: string;
  active: boolean;  
  profilePhoto: string;
}

// Asynchronous function to fetch the list of Thesis Coordinators
export const getThesisCoordinators = async (): Promise<ThesisCoordinator[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make the GET request to fetch thesis coordinators
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/thesisCoordinator/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Return the 'data' array from the response
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(errorMessage);
    }
    throw new Error('Error desconocido');
  }
};
