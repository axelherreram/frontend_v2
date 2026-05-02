import axios from 'axios';

// Function to create a task by sending a POST request with task data
export const createTarea = async (tareaData: {
  course_id: number;  // The ID of the course the task is associated with
  sede_id: number;    // The ID of the campus (sede) where the task will be held
  typeTask_id: number; // The ID of the task type
  title: string;      // The title of the task
  description: string; // A description of the task
  taskStart: string;  // The start date of the task
  endTask: string;    // The end date of the task
  startTime: string;  // The start time of the task
  endTime: string;    // The end time of the task
}): Promise<string | null> => {  // Returns an error message or null if no error occurs
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If the token is not found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Make the POST request to the specified URL to create the task
    await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, tareaData, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',   // Specify that the content type is JSON
      },
    });

    return null; // If there are no errors, return null to indicate success
  } catch (error) {
    // Error handling if the request fails
    if (axios.isAxiosError(error)) {
      // Extract the error message from the API response if available
      return error.response?.data?.message || 'Error desconocido';  // Use the response message or a default message if not available
    } else {
      // If the error is not related to Axios, return a generic error message
      return 'Hubo un problema con la solicitud';  // Default error message for non-Axios errors
    }
  }
};
