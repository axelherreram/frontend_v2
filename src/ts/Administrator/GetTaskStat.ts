import axios from 'axios';

// Interface representing the structure of task statistics
export interface TaskStats {
  totalStudents?: number;
  task?: number;
  pendingStudents?: number;
  confirmedStudents?: number;
}

// Function to retrieve task statistics for a specific course, year, and sede
export const getTaskStats = async (
  courseId: number,
  year: number,
  sedeId: number
): Promise<TaskStats[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Define the URL for the GET request, using the provided parameters
    const url = `${import.meta.env.VITE_API_URL}/graphics/task-stats/${courseId}/${year}/${sedeId}`;
    
    // Make the GET request to the API with the appropriate headers
    const response = await axios.get<TaskStats[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Devolver directamente el array en lugar de fusionarlo en un objeto
    return response.data;
  } catch (error) {

    return [];
  }
};
