import axios from 'axios';

// Define an interface to represent the structure of a student's task
export interface TareaEstudiante {
  task_id: number; // Unique identifier for the task
  title: string; // Title of the task
  description: string; // Description of the task
  taskStart: string; // Start date of the task
  endTask: string; // End date of the task
  startTime: string; // Start time of the task
  endTime: string; // End time of the task
  submission_complete: boolean; // Indicates if the task has been submitted
  submission_date: string; // Date when the task was submitted
}

// Function to retrieve a list of tasks assigned to a student
export const getTareasEstudiante = async (
  userId: number, // ID of the student
  year: number, // Academic year
  sedeId: number // Campus ID
): Promise<TareaEstudiante[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If the token is missing, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado'); // Authentication token not found
    }

    // Make a GET request to retrieve the student's tasks
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/submissions/student/${userId}/${year}/${sedeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the authentication token in the request headers
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
      }
    );

    // Return the list of tasks received from the API
    return response.data.tasks;
  } catch (error) {
    // Error handling: If an error occurs, return an empty array
    return [];
  }
};
