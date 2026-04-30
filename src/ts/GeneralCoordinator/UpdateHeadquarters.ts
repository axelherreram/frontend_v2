import axios from 'axios';

// Asynchronous function to update the name of a 'sede' (location or department)
export const updateSede = async (sede_id: number, nameSede: string, address: string): Promise<string> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // Check if the token is missing
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Throw an error if the token is not found
    }

    // Make the PUT request to update the 'sede' with the new name
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/sedes/${sede_id}`,  // URL with the 'sede_id' parameter
      JSON.stringify({ nameSede, address }),  // The name of the 'sede' to update
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
          'Content-Type': 'application/json'   // Set Content-Type to JSON
        }
      }
    );

    // Return the success message received in the response
    return response.data;
  } catch (error: any) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // If the error is an Axios error, extract the error message from the response or use a default message
      const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar la sede';
      throw new Error(errorMessage);  // Throw the specific error message
    } else {
      // If the error is not from Axios, throw it as is
      throw error;
    }
  }
};
