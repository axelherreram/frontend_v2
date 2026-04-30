import axios from 'axios';

// Define the 'TaskData' interface to describe the structure of the task data from the API response
export interface TaskData {
  task_id: number;            // Unique identifier for the task
  asigCourse_id: number;      // ID of the assigned course
  typeTask_id: number;        // ID indicating the type of task
  title: string;              // Title of the task
  description: string;        // Description of the task
  taskStart: string;          // Start date/time of the task
  endTask: string;            // End date/time of the task
  startTime: string;          // Start time of the task (specific time)
  endTime: string;            // End time of the task (specific time)
  year_id: number;            // Year associated with the task
  CourseSedeAssignment: {     // Information about the course and its associated sede
    sede_id: number;          // ID of the sede (location) where the course is held
  };
  course_id: number;          // ID of the course
}

// Function to fetch task data by its task_id from the API
export const getDatosTarea = async (taskId: number): Promise<TaskData | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing token
    }

    // Make a GET request to the API to fetch task data using the task_id
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authorization token in the request headers
        'Content-Type': 'application/json',  // Specify the content type as JSON
      },
    });

    // Check if the response contains valid task data
    if (response.data && response.data.data) {
      return response.data.data; // Return the task data from the response
    } else {
      return null;  // If no task data is found, return null
    }
  } catch (error) {
    // Handle any errors that occur during the API request
    return null;  // In case of an error, return null
  }
};
