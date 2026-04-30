import axios from 'axios';

// Function to create a commission by sending a POST request with commission data
export const createComision = async (comisionData: { 
  year: number;  // The year for the commission
  sede_id: number;  // The ID of the campus (sede) for the commission
  groupData: any[];  // Data for the group(s) associated with the commission
}) => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If the token is not found, throw an error indicating missing authentication
    if (!token) throw new Error('Token de autenticación no encontrado');  // Error message for missing token

    // Make a POST request to the API to create the commission
    await axios.post(`${import.meta.env.VITE_API_URL}/comisiones/grupo`, comisionData, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',   // Specify that the content type is JSON
      },
    });
  } catch (error: any) {
    // Error handling if the Axios request fails
    if (axios.isAxiosError(error)) {
      // Extract the error message from the API response if available
      const errorMessage = error.response?.data?.message || 'Error desconocido al crear la comisión';  // Default message if no specific error message is found
      throw new Error(errorMessage);  // Throw the error with the extracted message
    } else {
      // If the error is not related to Axios, rethrow it to be handled elsewhere
      throw error;  // Rethrow other types of errors
    }
  }
};
