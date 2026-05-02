import axios from 'axios';

// Interface to define the structure of the payload for creating an assignment
interface CrearAsignacionPayload {
  course_id: number;   // ID of the course to be assigned
  sede_id: number;     // ID of the 'sede' (location or department) where the course is assigned
  year_id: number;     // Year ID for the assignment
  courseActive: boolean;  // Whether the course is active or not
}

// Asynchronous function to create an assignment for a course in a specific sede (location)
export const crearAsignacionSedeCurso = async (
  payload: CrearAsignacionPayload  // The payload containing the course, sede, year, and active status
): Promise<void> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado.');  // If token is not found, throw an error
    }

    // Make the POST request to create the assignment
    await axios.post(`${import.meta.env.VITE_API_URL}/course-assignments`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
        'Content-Type': 'application/json',  // Set content type to JSON
      },
    });
  } catch (error: any) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, extract the error message from the API response or use a default message
      const errorMessage = error.response?.data?.message || 'Error desconocido al realizar la asignación';
      throw new Error(errorMessage);
    } else {
      // If it's not an Axios error, rethrow the error
      throw error;
    }
  }
};
