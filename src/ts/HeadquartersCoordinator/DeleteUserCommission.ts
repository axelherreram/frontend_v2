import axios from 'axios';

// Define the response interface to standardize the expected response data
export interface ResponseMessage {
  message: string;  // The message returned in the response
}

// Function to delete a user from a commission (group) by making a DELETE request
export const deleteUserComision = async (groupId: number, userId: number): Promise<ResponseMessage> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Make the DELETE request to the API endpoint, passing the groupId and userId
    const response = await axios.delete(`${import.meta.env.VITE_API_URL}/comisiones/${groupId}/usuario/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',  // Specify the content type as JSON
      },
    });

    // Return the response data if the request is successful
    return response.data;  
  } catch (error: any) {
    // Handle errors if the request fails
    if (axios.isAxiosError(error) && error.response) {
      // Extract the error message from the API response if available
      const errorMessage = error.response.data?.message || 'Error desconocido al eliminar el usuario';  // Use the response message or a default message if not available
      throw new Error(errorMessage);
    }

    // If the error is not related to Axios, throw a general error message
    throw new Error('Error al eliminar el usuario');  // Default error message for general errors
  }
};
