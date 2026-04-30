import axios from 'axios';

// Asynchronous function to fetch the list of headquarters coordinators
export const getHeadquartersCoordinator = async (): Promise<{
    user_id: number;
    name: string;
    email: string;
    carnet: string;
    sede_id: number;
    location: { nameSede: string };
    profilePhoto: string;
}[]> => {
    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('authToken');

        // Check if the token is not found
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        // Make the GET request to the specified URL to get the coordinators
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/coordinator/list`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Return the list of coordinators from the 'data' field
        return response.data.data;
    } catch (error) {
        // Error handling
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response?.data)
                : 'Error desconocido';
            throw new Error(errorMessage);
        }

        throw new Error('Error desconocido');
    }
};
