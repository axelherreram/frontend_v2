import axios from 'axios';

// Asynchronous function to create an admin user
export const createAdmin = async (adminData: { 
  email: string;        // Email of the admin
  name: string;         // Name of the admin
  carnet: string;       // Carnet or ID of the admin
  sede_id: number;       // Sede ID of the admin
}): Promise<void> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }
    // Make the POST request to the specified URL to create the admin
    await axios.post(`${import.meta.env.VITE_API_URL}/admin/create`, adminData, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
        'Content-Type': 'application/json',  // Set content type to JSON
      },
    });

    // Log success message (removed as requested)
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // Extract the error message from the API response
      const errorMessage = error.response?.data?.message;

      if (errorMessage) {
        throw new Error(errorMessage);  // Throw the specific error message
      }
    }

    // If it's not an Axios error, rethrow it
    throw error;
  }
};
