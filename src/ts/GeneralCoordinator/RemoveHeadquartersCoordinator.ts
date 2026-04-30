import axios from 'axios';

/**
 * Asynchronous function to remove a coordinator from a specific headquarters (sede)
 */
export const removeHeadquartersCoordinator = async (user_id: number, sede_id: number): Promise<void> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Authentication token not found');  // If token is not found, throw an error
    }

    // Make the POST request to the specified URL to remove the coordinator
    await axios.post(
      `${import.meta.env.VITE_API_URL}/coordinator/remove`,  // API endpoint for removing a coordinator
      { user_id, sede_id },  // The payload containing the user and headquarters IDs
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
      const errorMessage = error.response?.data?.message || 'Unknown error';
      throw new Error(errorMessage);  // Propagate the specific error message
    }

    // If it's not an Axios error, throw a generic error message
    throw new Error('Unknown error');
  }
};
