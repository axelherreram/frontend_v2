import axios from 'axios';

// Interface representing the structure of a note
export interface Nota {
    note: number | null; // La nota puede ser un número o null
}

// Function to retrieve a note by userId and courseId
export const getNote = async (userId: number, courseId: number): Promise<Nota> => {
    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('authToken');

        // If no token is found, throw an error
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        // Make a GET request to the specified URL with the correct parameters
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/grades/list/${userId}/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data; // Return the data received from the API
    } catch (error) {

    }
};
