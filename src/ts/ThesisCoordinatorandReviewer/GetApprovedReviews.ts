import axios from 'axios';

// Define the interface for the "Approved Revision" structure
interface ApprovedRevision {
  revision_thesis_id: number;   // Unique identifier for the thesis revision
  date_revision: string;        // Date of the revision
  thesis_dir: string;           // URL of the thesis document
  approvaltheses: Array<{
    status: string;
    date_approved: string;
  }>;  // Array containing approval details
  user: {
    user_id: number;            // ID of the user (student)
    name: string;               // Name of the student
    carnet: string;             // Carnet (ID) of the student
  };
  sede: {
    nameSede: string;           // Name of the associated sede
  };
}

// Function to fetch approved thesis revisions
export const getRevisionesAprobadas = async (
  order: string = 'asc',        // Order of the results ('asc' or 'desc')
  carnet?: string               // Optional carnet filter for the student
): Promise<ApprovedRevision[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If the token is not found, throw an error
    }

    // Build the URL with the query parameters
    let url = `${import.meta.env.VITE_API_URL}/revision-thesis/approved?order=${order}`;
    if (carnet) {
      url += `&carnet=${carnet}`;
    }

    // Make the GET request to the specified URL to fetch the approved revisions
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the authorization token in the request headers
        'Content-Type': 'application/json',  // Specify that the content type is JSON
      },
    });

    // Check if the response contains the necessary data
    if (response.data && Array.isArray(response.data.data)) {
      // Map through the revisions and return them in the ApprovedRevision structure
      return response.data.data.map((revision: any) => ({
        revision_thesis_id: revision.revision_thesis_id,  // Assign the thesis revision ID
        date_revision: revision.date_revision,            // Assign the revision date
        thesis_dir: revision.thesis_dir,                  // Assign the thesis document URL
        approvaltheses: revision.approvaltheses,          // Assign the approval details
        user: {
          user_id: revision.User.user_id,                 // Assign the student's user ID
          name: revision.User.name,                       // Assign the student's name
          carnet: revision.User.carnet,                   // Assign the student's carnet (ID)
        },
        sede: {
          nameSede: revision.sede.nameSede,              // Assign the associated sede name
        },
      }));
    }

    // If the response does not contain valid data, throw an error
    throw new Error('La respuesta no contiene datos de revisiones aprobadas válidos.');
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
