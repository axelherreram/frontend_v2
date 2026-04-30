import axios from 'axios';

// Interface representing the structure of a task
export interface Tarea {
  task_id: number; // Unique identifier for the task
  asigCourse_id: number; // Identifier for the assigned course
  typeTask_id: number; // Identifier for the type of task
  title: string; // Title of the task
  description: string; // Description of the task
  taskStart: string; // Start date of the task
  endTask: string; // End date of the task
  startTime: string; // Start time of the task
  endTime: string; // End time of the task
  year_id: number; // Identifier for the academic year
}

// Function to retrieve tasks based on location, course, and year
export const getTareas = async (sedeId: number, courseId: number, yearId: number): Promise<Tarea[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make a GET request to the specified URL with the correct parameters
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/tareas/curso/${sedeId}/${courseId}/${yearId}`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Include authentication token in the request headers
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
    });

    return response.data; // Return the data received from the API
  } catch (error) {
    return []; // Return an empty array if an error occurs
  }
};
