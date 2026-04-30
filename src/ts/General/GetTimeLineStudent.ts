import axios from 'axios';

// Define the structure of the log object
interface Log {
  user_id: number;        // User identifier associated with the log
  typeEvent: string;      // Type of the event logged
  description: string;    // Description of the event
  task_id: number;        // Task ID related to the event
  date: string;           // Date of the event
}

// Asynchronous function to get the timeline for a specific student by `user_id`
export const getTimeLineEstudiante = async (user_id: number): Promise<Log[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Define the URL for the API request using the `user_id`
    const url = `${import.meta.env.VITE_API_URL}/timeline/user/${user_id}`;
    
    // Make the GET request to fetch the timeline data for the user
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
        'Content-Type': 'application/json',  // Set content type as JSON
      },
    });

    // Check if the response contains valid data and is an array
    if (response.data && Array.isArray(response.data)) {
      // Map the response data to the Log structure
      return response.data.map((log: any) => ({
        user_id: log.user_id,
        typeEvent: log.typeEvent,
        description: log.descripcion,  // 'descripcion' is used as it is in the response
        task_id: log.task_id,
        date: log.date,
      }));
    }

    // If the response data is invalid, throw an error
    throw new Error('La respuesta no contiene datos válidos del timeline');
  } catch (error) {
    // Handle Axios-specific errors
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error desconocido';  // Extract error message from Axios response
      throw new Error(errorMessage);
    }
    // If it's a general error, throw a generic error message
    throw new Error('Error desconocido');
  }
};
