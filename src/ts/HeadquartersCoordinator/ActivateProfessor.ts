import axios from 'axios';

// Define the structure of the response from the API when activating a professor
interface ActivarCatedraticoResponse {
  message: string;
}

// Function to activate or deactivate a professor based on their user ID and the active status
export const activaUsuario = async (
  userId: number,  // The ID of the professor to be activated or deactivated
  active: boolean  // The new active status for the professor (true for active, false for inactive)
): Promise<ActivarCatedraticoResponse> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Check if the token is not found in localStorage
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Throw error if no token is found
    }

    // Make a PATCH request to the specified URL to update the professor's active status
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/professors/${userId}/active`,  // The URL with the professor's user ID to be updated
      {
        active,  // Send the active status as a parameter in the request body
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authorization token in the request header
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Return only the message from the response data if the request is successful
    return { message: response.data.message };
  } catch (error) {
    // Error handling for Axios-related errors
    if (axios.isAxiosError(error)) {
      // Check if the error has a response and extract the error message
      const errorMessage = error.response?.data?.message || 'Error desconocido'; // Extract only the 'message' field
      throw new Error(errorMessage);  // Throw the error with the appropriate message
    }

    // Throw a generic error if the error is not related to Axios
    throw new Error('Error desconocido');
  }
};
