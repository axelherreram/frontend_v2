import axios from 'axios';

// Define the expected notification type
interface UserNotification {
  notification_text: string;
  notification_date: string;
  task_id: number;
  sede_id: number;
}

// Asynchronous function to get notifications data for a user from the API
export const getNotificationsUser = async (user_id: number): Promise<UserNotification[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the GET request to the specified URL to get the notifications data for the user
    const response = await axios.get<UserNotification[]>(`${import.meta.env.VITE_API_URL}/student/notifications/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
        'Content-Type': 'application/json',  // Set the content type as JSON
      },
    });

    // Return the transformed data
    return response.data;
  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, extract and throw the error message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)  // If response contains data, stringify it
        : 'Error desconocido';  // Otherwise, use a default error message
      throw new Error(errorMessage);
    }

    // If it's a general error, throw a generic error message
    throw new Error('Error desconocido');
  }
};
