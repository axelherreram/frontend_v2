import axios from 'axios';

// Function to update a note with the given data
export const updateNote = async (
    notaData: {
        student_id: number;  // ID of the student
        course_id: number;   // ID of the course
        note: number;        // New note value
    }
): Promise<string | null> => {
    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('authToken');

        // If no token is found, throw an error
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        // Make the PUT request to update the note
        await axios.put(`${import.meta.env.VITE_API_URL}/grades/update`, notaData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Return null if the update was successful
        return null;
    } catch (error) {
        // Handle any errors during the request
        if (axios.isAxiosError(error)) {
            return error.response?.data?.message || 'Error desconocido';
        } else {
            throw error;
        }
    }
};
