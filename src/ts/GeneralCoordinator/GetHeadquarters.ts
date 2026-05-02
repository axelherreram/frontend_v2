import axios from 'axios';

// Asynchronous function to fetch the list of 'sedes' (locations or departments)
export const getSedes = async (): Promise<{ sede_id: number; nameSede: string; address: string }[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Check if the token is not found
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is missing, throw an error
    }

    // Make the GET request to the specified URL to get the list of 'sedes'
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/locations`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
        'Content-Type': 'application/json',   // Set Content-Type to JSON
      },
    });

    // Return the data received in the response
    return response.data; 
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // If the error is an Axios error, extract the error message from the response or use a default message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(errorMessage); // Throw the specific error message
    }

    // If it's not an Axios error, throw a generic error message
    throw new Error('Error desconocido');
  }
};
