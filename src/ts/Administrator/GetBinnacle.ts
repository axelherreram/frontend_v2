import axios from 'axios';

// Function to retrieve the bitacora (log) data for a specific sede (location)
// This function performs a GET request to fetch the log data based on the provided sedeId
export const getBitacora = async (sedeId: number): Promise<any> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Define the URL for the GET request, using the provided sedeId to specify the location
    const url = `${import.meta.env.VITE_API_URL}/bitacora/${sedeId}`;
    
    // Make the GET request to the API with the appropriate headers
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',  // Specify the content type as JSON
      },
    });

    // Return the response data, which contains the bitacora information
    return response.data; 
  } catch (error) {
    // Handle errors that may occur during the request
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, throw a new error with the message from the API response or a fallback message
      throw new Error(error.response?.data?.message || error.message || 'Error desconocido');
    } else {
      // If the error is not related to Axios, throw a general unexpected error
      throw new Error('Error inesperado');
    }
  }
};
