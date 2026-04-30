import axios from 'axios';

// Asynchronous function to update a Thesis Coordinator
export const updateThesisCoordinator = async (
  user_id: number,
  name: string,
  email: string,
  carnet: string
): Promise<string> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make the PUT request to update the Thesis Coordinator
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/thesisCoordinator/update`,
      JSON.stringify({ user_id, name, email, carnet }),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the success message received in the response
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar el coordinador';
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
