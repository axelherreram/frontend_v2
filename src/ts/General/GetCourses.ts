import axios from 'axios';

// Interface representing a course structure
interface Curso {
  course_id: number; // Unique identifier for the course
  courseName: string; // Name of the course
}

// Function to get the courses available at a specific location (sede) for a given year
export const getCursos = async (sedeId: number, year: number): Promise<Curso[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make a GET request to the API to obtain the courses for the given sede and year
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/courses/by-location/${sedeId}/${year}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the authentication token in the request header
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
      }
    );

    // Verify if the response contains the "data" property and if "data" is an array
    if (response.data && Array.isArray(response.data.data)) {
      // Map the courses and return them in the appropriate format
      return response.data.data.map((curso: any) => ({
        course_id: curso.course_id, // Use 'course_id' as defined in the JSON response
        courseName: curso.courseName, // Use 'courseName' as defined in the JSON response
      }));
    }

    // If the response does not contain valid course data, throw an error
    throw new Error('La respuesta no contiene datos de cursos válidos.');
  } catch (error) {
    // Improved error handling
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || 'Error desconocido en la solicitud'; // Extract error message if available
      throw new Error(`Error de la API: ${errorMessage}`);
    }

    // In case of a non-Axios related error, throw a generic error
    throw new Error('Error desconocido');
  }
};
