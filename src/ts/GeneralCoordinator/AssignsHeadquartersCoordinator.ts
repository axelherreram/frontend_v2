import axios from 'axios';

/**
 * Asynchronous function to assign a coordinator to a specific headquarters (sede)
 */
export const assignsHeadquartersCoordinator = async (user_id: number, sede_id: number): Promise<void> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Authentication token not found'); // If token is not found, throw an error
    }

    // Make the POST request to assign the coordinator
    await axios.post(
      `${import.meta.env.VITE_API_URL}/coordinator/assign`, // API endpoint for assigning a coordinator
      { user_id, sede_id }, // Payload containing user and headquarters IDs
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the authorization header
          'Content-Type': 'application/json', // Set content type to JSON
        },
      }
    );
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Unknown error';
      throw new Error(errorMessage);
    }

    throw new Error('Unknown error');
  }
};
