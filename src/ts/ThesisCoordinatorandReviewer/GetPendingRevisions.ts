import axios from 'axios';

// Define the interface for the "Revision" structure
interface Revision {
  revision_thesis_id: number;   // Unique identifier for the thesis revision
  date_revision: string;        // Date of the revision
  approvals: Array<{ status: string }>;  // Array containing approval status
  user: {
    user_id: number;            // ID of the user (student)
    name: string;               // Name of the student
    carnet: string;             // Carnet (ID) of the student
  };
  approvalThesis: {
    status: string;             // Status of the thesis approval
  };
}

// Function to fetch pending thesis revisions
export const getRevisionesPendientes = async (
  order: string = 'asc',        // Order of the results ('asc' or 'desc')
  carnet?: string               // Optional carnet filter for the student
): Promise<Revision[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If the token is not found, throw an error
    }

    // Build the URL with the query parameters
    let url = `${import.meta.env.VITE_API_URL}/revision-thesis/pending?order=${order}`;
    if (carnet) {
      url += `&carnet=${carnet}`;
    }

    // Make the GET request to the specified URL to fetch the pending revisions
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authorization token in the request headers
        'Content-Type': 'application/json',  // Specify that the content type is JSON
      },
    });

    // Check if the response contains the necessary data
    if (response.data && Array.isArray(response.data.data)) {
      // Map through the revisions and return them in the Revision structure
      return response.data.data.map((revision: any) => ({
        revision_thesis_id: revision.revision_thesis_id,  // Assign the thesis revision ID
        date_revision: revision.date_revision,            // Assign the revision date
        approvals: revision.approvaltheses || [],         // Use 'approvaltheses' from backend response
        user: {
          user_id: revision.user.user_id,                 // Assign the student's user ID (lowercase 'user')
          name: revision.user.name,                       // Assign the student's name
          carnet: revision.user.carnet,                   // Assign the student's carnet (ID)
        },
        approvalThesis: {
          status: revision.ApprovalThesis.status,        // Assign the thesis approval status
        },
      }));
    }

    // If the response does not contain valid data, throw an error
    throw new Error('La respuesta no contiene datos de revisiones pendientes válidos.');
  } catch (error) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)  // If the error has a response, stringify it
        : 'Error desconocido';                   // Otherwise, return a generic unknown error message
      throw new Error(`Error de la API: ${errorMessage}`);
    }

    // If the error is not an Axios error, throw a generic unknown error
    throw new Error('Error desconocido');
  }
};
