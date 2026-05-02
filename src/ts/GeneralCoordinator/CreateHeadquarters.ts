import axios from 'axios';

// Asynchronous function to create a 'sede' (location or department)
export const createSede = async (nameSede: string, address: string): Promise<void> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the POST request to the specified URL to create the 'sede'
    await axios.post(
      `${import.meta.env.VITE_API_URL}/locations`,  // API endpoint for creating a 'sede'
      { nameSede, address },  // The payload containing the name of the 'sede'
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
          'Content-Type': 'application/json',   // Set content type to JSON
        },
      }
    );
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, extract the error message from the API response or use a default message
      const errorMessage = error.response?.data?.message || 'Error desconocido';
      throw new Error(errorMessage);  // Propagate the specific error message
    }

    // If it's not an Axios error, throw a generic error message
    throw new Error('Error desconocido');
  }
};
