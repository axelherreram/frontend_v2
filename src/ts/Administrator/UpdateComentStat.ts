import axios from 'axios';

// Asynchronous function to deactivate a comment by its ID
export const updateComentStats = async (comentId: number): Promise<string> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the PUT request to deactivate the comment
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/comments/${comentId}/deactivate`,
      {}, // No body data is needed for deactivating, just the comment ID in the URL
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
          'Content-Type': 'application/json',   // Set content type to JSON
        }
      }
    );

    // Return the success message from the response
    return response.data.message || 'Comentario desactivado exitosamente';
  } catch (error: unknown) {
    // Safely check and extract error message
    let errorMessage = 'Hubo un error al desactivar el comentario';
    
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};
