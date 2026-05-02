import axios from 'axios';

// Interface representing the structure of profile data
export interface PerfilData {
  user_id: number; // Unique identifier for the user
  email: string; // User's email address
  userName: string; // User's name
  profilePhoto: string | null; // URL of the user's profile photo (nullable)
  carnet: string; // User's identification number (carnet)
  sede: number; // ID of the user's location (sede)
  NombreSede: string; // New field representing the name of the sede
  roleName: string; // Role name assigned to the user
}

// Function to retrieve the user's profile data
export const getDatosPerfil = async (): Promise<PerfilData> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make a GET request to the specified URL to fetch profile data
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Include authentication token in the request headers
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
    });

    // Adjust the response data to match the expected format
    const perfilData: PerfilData = {
      user_id: response.data.user_id, // Extract user_id from the response
      email: response.data.email, // Extract email from the response
      userName: response.data.userName, // Extract userName from the response
      profilePhoto: response.data.profilePhoto, // Extract profilePhoto from the response
      carnet: response.data.carnet, // Extract carnet from the response
      sede: response.data.sede, // Extract sede from the response
      NombreSede: response.data.NombreSede, // Extract NombreSede from the response
      roleName: response.data.roleName, // Extract roleName from the response
    };

    return perfilData; // Return the formatted profile data
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data) // Convert error response data to a string if available
        : 'Error desconocido'; // Default unknown error message
      throw new Error(errorMessage);
    }

    throw new Error('Error desconocido'); // Throw a generic unknown error
  }
};
