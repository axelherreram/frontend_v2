import axios from 'axios';

// Define the function to assign a professor to a commission
export const asignarCatedraticoComision = async (
  comisionId: number,  // The ID of the commission to which the professor is being assigned
  catedraticoData: { user_id: number; rol_comision_id: number }  // The data for the professor (user ID and role in the commission)
) => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado');  // Throw error if no token is found

    // Make a POST request to assign the professor to the commission
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/commissions/${comisionId}/member`,  // URL with the commission ID
      catedraticoData,  // Send the professor data as the request body
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Include the authorization token in the request header
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );
    
    // Return the data from the response if the request is successful
    return response.data;  // Return the API response
  } catch (error: any) {
    let errorMessage = 'Error desconocido al asignar catedrático a la comisión';  // Default error message if no specific message is available
    
    // Error handling for Axios-related errors
    if (axios.isAxiosError(error)) {
      // Extract the error message from the response if available
      errorMessage = error.response?.data?.message || errorMessage;  // Use the response message or the default message
    } else {
      // Capture other types of errors
      errorMessage = error.message || errorMessage;  // Use the error message or the default message
    }

    // Throw the error with the appropriate message
    throw new Error(errorMessage);
  }
};
