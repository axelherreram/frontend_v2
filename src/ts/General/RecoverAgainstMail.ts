import axios from 'axios';

// Asynchronous function to request password recovery
export const recuperaContraCorreo = async (email: string): Promise<string> => {
  try {
    // Make a POST request to request password recovery
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/requestPasswordRecovery`,
      JSON.stringify({ email }),  // Send the email as part of the request body
      {
        headers: {
          'Content-Type': 'application/json',  // Ensure the content type is JSON
        }
      }
    );

    // Return the success message from the response
    return response.data.message;
  } catch (error: any) {
    // If it's an Axios error, get the error message
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Unknown error while recovering password';  // Default error message if one is not found in the response
      throw new Error(errorMessage);
    } else {
      // For other types of errors, rethrow the error
      throw error;
    }
  }
};
