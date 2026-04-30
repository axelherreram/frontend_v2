import axios from 'axios';

export const enviaComentario = async (taskId: number, commentData: { comment: string; role: string; user_id: number }) => {
  try {
    // Retrieve the authentication token from local storage
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado'); // Authentication token is required

    // Construct the API endpoint URL using the task ID
    const url = `${import.meta.env.VITE_API_URL}/comments/${taskId}`;

    // Send the POST request to submit the comment
    await axios.post(url, commentData, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the authentication token in the request headers
        'Content-Type': 'application/json', // Set the request content type to JSON
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Extract the error message from the response, if available
      const errorMessage = error.response?.data?.message || 'Error desconocido al enviar el comentario';
      throw new Error(errorMessage);
    } else {
      // Handle unexpected errors
      throw error;
    }
  }
};
