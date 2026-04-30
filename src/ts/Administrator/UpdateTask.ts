import axios from 'axios';

// Function to update a task with the given data
export const updateTarea = async (
  task_id: number,  // The ID of the task to update
  tareaDataUpdate: {  // Object containing the data to update the task
    title: string;    // Title of the task
    description: string;  // Description of the task
    taskStart: string;    // Start date and time of the task
    endTask: string;      // End date and time of the task
    startTime: string;    // Start time of the task
    endTime: string;      // End time of the task
  }
): Promise<string | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Authentication token not found
    }

    // Make the PUT request to update the task with the provided task_id and data
    await axios.put(`${import.meta.env.VITE_API_URL}/tareas/${task_id}`, tareaDataUpdate, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',  // Specify the content type as JSON
      },
    });

    // Return null if there are no errors, indicating the task was updated successfully
    return null;
  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      // If the error is an Axios error, extract the error message from the response
      return error.response?.data?.message || 'Error desconocido';  // If no specific message, return 'Unknown Error'
    } else {
      // If it's not an Axios error, rethrow the error
      throw error;
    }
  }
};
