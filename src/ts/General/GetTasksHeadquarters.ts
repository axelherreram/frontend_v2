import axios from 'axios';

// Define the structure of the task object
export interface Tarea {
  task_id: number;        // Unique identifier for the task
  asigCourse_id: number;  // ID of the assigned course
  typeTask_id: number;    // Type of the task
  title: string;          // Title of the task
  description: string;    // Description of the task
  taskStart: string;      // Start date of the task
  endTask: string;        // End date of the task
  startTime: string;      // Start time of the task
  endTime: string;        // End time of the task
  year_id: number;        // Year ID associated with the task
}

// Asynchronous function to get tasks by `sedeId` and `year`
export const getTareasSede = async (
  sedeId: number,        // The `sedeId` parameter to filter the tasks
  year: number           // The `year` parameter to filter the tasks
): Promise<Tarea[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the GET request to the API URL with the `sedeId` and `year` parameters
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/tasks/${sedeId}/${year}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Add the token in the authorization header
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Return the tasks data obtained from the response
    return response.data;
  } catch (error) {
    // If an error occurs, return an empty array
    return [];
  }
};
