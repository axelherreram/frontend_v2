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
  assignedReviews: Array<{ assigned_review_id: number; user_id: number }>; // Assigned reviews with reviewer IDs
  approvalThesis: {
    status: string;             // Status of the thesis approval
  };
  approval_status: string;      // ✅ Campo adicional para usar directo en el componente
}

// Function to fetch thesis revisions in review
export const getRevisionesEnRevision = async (
  order: string = 'asc',        // Order of the results ('asc' or 'desc')
  carnet: string                // Carnet filter for the student (mandatory)
): Promise<Revision[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If the token is not found, throw an error
    }

    // Build the URL with the query parameters
    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/in-review?order=${order}&carnet=${carnet}`;

    // Make the GET request to the specified URL to fetch the thesis revisions in review
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
          user_id: revision.user.user_id,                 // Use lowercase 'user' from backend
          name: revision.user.name,                       // Assign the student's name
          carnet: revision.user.carnet,                   // Assign the student's carnet (ID)
        },
        assignedReviews: revision.AssignedReviews || [],  // Assign the assigned reviews (reviewers)
        approvalThesis: {
          status: revision.ApprovalThesis.status,        // Assign the thesis approval status
        },
        // ✅ Campo adicional traducido a español para mostrar en la tabla
        approval_status:
          revision.ApprovalThesis.status === "in revision"
            ? "En revisión"
            : revision.ApprovalThesis.status === "rejected"
              ? "Rechazado"
              : revision.ApprovalThesis.status,
      }));
    }

    // If the response does not contain valid data, throw an error
    throw new Error('La respuesta no contiene datos de revisiones en revisión válidos.');
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
