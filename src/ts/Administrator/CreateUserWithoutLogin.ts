import axios from 'axios';

// Function to create a user without login by sending a POST request with user data
export const createUserSinLogin = async (userData: { 
  email: string;
  name: string;
  carnet: string;
}) => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If the token is not found, throw an error indicating missing authentication
    if (!token) throw new Error('Token de autenticación no encontrado');

    // Make a POST request to the API to create the user
    await axios.post(`${import.meta.env.VITE_API_URL}/users/create`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`, // Include the authentication token in the request headers
        'Content-Type': 'application/json',  // Specify that the content type is JSON
      },
    });
  } catch (error: any) {
    // Error handling if the Axios request fails
    if (axios.isAxiosError(error)) {
      // Extract the error message from the API response if available
      const errorMessage = error.response?.data?.message;
      throw new Error(errorMessage);
    } else {
      // If the error is not related to Axios, rethrow it to be handled elsewhere
      throw error;
    }
  }
};