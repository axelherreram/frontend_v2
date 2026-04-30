import axios from 'axios';

// Interface representing the structure of the task statistics response
export interface SedeStats {
    course_id: number;
    avgSubmissionsPerTask: string;
    totalSubmissions: number;
    completedSubmissions: number;
    pendingSubmissions: number;
    completionRate: string;
    pendingRate: string;
}

// Function to retrieve advanced task statistics for a specific sede
export const getSedeComplete = async (
    sedeId: number
): Promise<SedeStats> => {
    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('authToken');

        // If no token is found, throw an error indicating authentication failure
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        // Define the URL for the GET request, using the provided sedeId
        const url = `${import.meta.env.VITE_API_URL}/graphics/task-stats-advanced/${sedeId}`;

        // Make the GET request to the API with the appropriate headers
        const response = await axios.get<SedeStats>(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Return the data directly from the response
        return response.data;
    } catch (error) {
        // Return an empty object in case of error
        return {
            course_id: 0,
            avgSubmissionsPerTask: '',
            totalSubmissions: 0,
            completedSubmissions: 0,
            pendingSubmissions: 0,
            completionRate: '',
            pendingRate: ''
        };
    }
};
