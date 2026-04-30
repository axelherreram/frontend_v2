import axios from 'axios';

export const subirPropuesta = async (propuestaData: { file: File; user_id: number; task_id: number }) => {
  try {
    // Retrieve the authentication token from local storage
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado'); // Authentication token is required

    // Create a FormData object to send the file and other parameters
    const formData = new FormData();
    formData.append('proposal', propuestaData.file); // Field name changed to 'proposal'
    formData.append('user_id', propuestaData.user_id.toString());
    formData.append('task_id', propuestaData.task_id.toString());

    // Send the POST request to upload the proposal
    await axios.post(`${import.meta.env.VITE_API_URL}/thesis/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the authentication token in the request headers
        'Content-Type': 'multipart/form-data', // Ensure proper handling of FormData
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Extract the error message from the response, if available
      const errorMessage = error.response?.data?.message || 'Error desconocido al subir la propuesta';
      throw new Error(errorMessage);
    } else {
      // Handle unexpected errors
      throw error;
    }
  }
};
