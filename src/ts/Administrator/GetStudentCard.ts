import axios from 'axios';

// Define the interface for the "Estudiante" (student) structure
interface Estudiante {
  id: number;         // Unique identifier for the student
  userName: string;   // Student's username
  carnet: string;     // Student's carnet (ID)
  curso: string;      // Course the student is enrolled in (empty in this case)
  año: number;        // Year of enrollment
  fotoPerfil: string; // Profile photo URL or empty string if no photo is available
}

// Function to fetch student details by their carnet (ID) number, sede, and year
export const getEstudiantePorCarnet = async (
  sedeId: number,     // Sede (campus) ID where the student is located
  year: number,       // Year of enrollment
  carnet: string      // Student's carnet (ID) to search for
): Promise<Estudiante | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If no token is found, throw an error
    }

    // Make a GET request to fetch student details based on carnet, sede, and year
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users/search?sede_id=${sedeId}&year=${year}&carnet=${carnet}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authorization token in the request headers
          'Content-Type': 'application/json',  // Specify that the request content is JSON
        },
      }
    );

    // Verify if the response contains a "formattedUsers" array with student data
    if (response.data && Array.isArray(response.data.formattedUsers)) {
      // Return the first user found, since we expect a single student for the given carnet
      const user = response.data.formattedUsers[0];
      return {
        id: user.user_id,              // Assign the user's unique ID
        userName: user.userName,       // Assign the username
        carnet: user.carnet,           // Assign the carnet (ID)
        curso: '',                     // Assuming no explicit 'course' field, leave it empty
        año: user.year || 0,           // Assign the year if available, or 0 if not
        fotoPerfil: user.profilePhoto || '', // Assign the profile photo URL or an empty string if unavailable
      };
    }

    // If no user is found, return null
    return null;
  } catch (error) {
    // Error handling for the API request
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)  // If the error has a response, stringify it
        : 'Error desconocido';                   // Otherwise, indicate an unknown error
      throw new Error(`Error de la API: ${errorMessage}`);
    }
    // If the error is not an Axios error, throw a generic unknown error
    throw new Error('Error desconocido');
  }
};
