import axios from 'axios';

// Define the Catedratico (Professor) interface to specify the structure of the professor data
interface Catedratico {
  user_id: number;       // Unique ID of the professor
  email: string;         // Email address of the professor
  userName: string;      // Username or name of the professor
  professorCode: string; // Code that identifies the professor (using 'carnet' as the professor code)
  profilePhoto: string | null;  // Profile photo URL of the professor (nullable)
  active: boolean;       // Indicates whether the professor is active
}

// Function to get a professor by their "carnet" (ID number)
export const getCatedraticoPorCarnet = async (
  carnet: string // The "carnet" (ID number) of the professor
): Promise<Catedratico | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Make the GET request to the API with the carnet to get the professor data
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/professors/search?carnet=${carnet}`, // API endpoint with the carnet as a query parameter
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Check if the response contains the "formattedProfessors" property and if it's an array
    if (response.data && Array.isArray(response.data.formattedProfessors)) {
      // Return the first professor found, as we expect a single professor per carnet
      const professor = response.data.formattedProfessors[0];
      return {
        user_id: professor.user_id,
        email: professor.email,
        userName: professor.userName,
        professorCode: professor.carnet, // Use 'carnet' as 'professorCode'
        profilePhoto: professor.profilePhoto || '', // If no profile photo, return an empty string
        active: professor.active, // Indicate if the professor is active (this could be adjusted if needed)
      };
    }

    // If no professor is found, return null
    return null;
  } catch (error) {
    // Handle errors that may occur during the request
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, throw a new error with the message from the API response or a fallback message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(errorMessage);  // Rethrow the error message
    }
    // Handle general errors (non-Axios errors)
    throw new Error('Error desconocido');
  }
};
