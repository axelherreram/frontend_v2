import axios from 'axios';

// Asynchronous function to update the password
export const updatePassword = async (oldPassword: string, newPassword: string): Promise<string> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the PUT request to update the password
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/updatePassword`,
      JSON.stringify({ currentPassword: oldPassword, newPassword }), // Ensure to use 'currentPassword' instead of 'oldPassword'
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
          'Content-Type': 'application/json',   // Set content type to JSON
        }
      }
    );

    // Return the success message from the response
    return response.data;
  } catch (error: any) {
    // If it's an Axios error, retrieve the error message
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar la contraseña';  // Default error message if no message in response
      throw new Error(errorMessage);
    } else {
      // For other types of errors, rethrow the error
      throw error;
    }
  }
};
