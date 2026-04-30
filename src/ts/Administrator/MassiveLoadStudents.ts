import axios from 'axios';

// Define the structure of the parameters for bulk upload
interface CargaMasivaParams {
  archivo: File;  // The Excel file to be uploaded
  sede_id: number;  // The ID of the campus where the upload is being performed
  rol_id: number;  // The ID of the role for the users being uploaded
  course_id?: number;  // The optional course ID (if applicable)
}

// Function to handle the bulk upload of users with their role and campus information
export const cargaMasiva = async ({
  archivo,  // The file to be uploaded
  sede_id,  // The campus ID
  rol_id,   // The role ID
  course_id,  // The optional course ID
}: CargaMasivaParams): Promise<{ message: string }> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If the token is not found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Create a FormData object to handle the file and additional data
    const formData = new FormData();
    formData.append('archivo', archivo);  // Append the file to the form data
    formData.append('sede_id', sede_id.toString());  // Append the campus ID to the form data
    formData.append('rol_id', rol_id.toString());  // Append the role ID to the form data
    if (course_id !== undefined) {
      formData.append('course_id', course_id.toString());  // Append the course ID if provided
    }

    // Make a POST request to upload the file to the specified API endpoint
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/usuarios/cargaMasiva`,  // The URL for the bulk upload endpoint
      formData,  // Send the form data containing the file and other parameters
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authorization token in the request header
          'Content-Type': 'multipart/form-data',  // Specify the content type as multipart form data for file uploads
        },
      }
    );

    // If the response contains a message, return the message
    if (response.data && response.data.message) {
      return response.data;  // Return the success message from the response
    }

    // If no message is found in the response, throw an error
    throw new Error('Error al procesar la carga masiva.');  // Default error message for failure
  } catch (error) {
    // Error handling for Axios-related errors
    if (axios.isAxiosError(error)) {
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Error desconocido';  // Use the response message or a default message
      throw new Error(errorMessage);  // Throw the error with the appropriate message
    }

    // Error handling for other types of errors
    throw new Error('Hubo un problema al realizar la carga masiva.');  // General error message for other issues
  }
};
