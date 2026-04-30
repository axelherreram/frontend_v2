import axios from 'axios';

// Define the Catedratico (Professor) interface to specify the structure of the professor data
interface Catedratico {
  user_id: number;       // Unique ID of the professor
  email: string;         // Email address of the professor
  userName: string;      // Username or name of the professor
  profilePhoto: string | null;  // Profile photo URL of the professor (nullable)
  active: boolean;       // Indicates whether the professor is active
}

// Function to get the list of active professors based on the given sede_id and year
export const getCatedraticosActivos = async (sede_id: number, year: number): Promise<Catedratico[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Construct the URL for the GET request to fetch active professors
    const url = `${import.meta.env.VITE_API_URL}/professors/activos?sede_id=${sede_id}&year=${year}`;
    
    // Make the GET request to the API with the appropriate headers
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
        'Content-Type': 'application/json',  // Specify the content type as JSON
      },
    });

    // Check if the response data is valid and is an array
    if (response.data && Array.isArray(response.data)) {
      // Map the response data to match the Catedratico interface and return the result
      return response.data.map((professor: any) => ({
        user_id: professor.user_id,
        email: professor.email,
        userName: professor.userName,
        profilePhoto: professor.profilePhoto,
        active: professor.active,
      }));
    }

    // If the response does not contain valid professor data, throw an error
    throw new Error('La respuesta no contiene datos válidos de catedráticos activos');
  } catch (error) {
    // Handle errors that may occur during the request
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, throw a new error with the message from the API response or a fallback message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(errorMessage);
    }
    // Handle general errors (non-Axios errors)
    throw new Error('Error desconocido');
  }
};
