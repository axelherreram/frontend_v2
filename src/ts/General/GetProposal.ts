import axios from 'axios';

// Interface representing the structure of a thesis proposal submission
export interface Propuesta {
  thesisSubmissions_id: number; // Unique identifier for the thesis submission
  user_id: number; // Identifier of the user who submitted the proposal
  task_id: number; // Identifier of the associated task
  file_path: string; // Path of the uploaded file
  date: string; // Submission date of the proposal
  approved_proposal: number; // Status indicator (approved or not)
}

// Function to retrieve a user's thesis proposal submission
export const getPropuesta = async (userId: number): Promise<Propuesta | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make a GET request to the specified URL with the correct parameters
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/thesis-submission/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Include authentication token in the request headers
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
    });

    return response.data; // Return the data received from the API
  } catch (error) {
    return null; // Return null if an error occurs
  }
};
