import axios from 'axios';

// Function to approve or reject a thesis proposal based on the thesis submission ID, user ID, and the approved proposal status
export const aprobarPropuesta = async ( 
  thesisSubmissionId: number,  // The ID of the thesis submission to be approved or rejected
  userId: number,  // The ID of the user who is approving or rejecting the thesis proposal
  approvedProposal: number  // The status of the proposal (e.g., 1 for approved, 0 for rejected)
) => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado');  // Throw error if no token is found

    // Create the request body with the approved proposal status
    const requestBody = {
      approved_proposal: approvedProposal,  // Include the proposal approval status
    };

    // Make a PUT request to update the thesis proposal approval status
    await axios.put(
      `${import.meta.env.VITE_API_URL}/thesis-submission/${thesisSubmissionId}/${userId}/update-approved-proposal`,  // URL with thesis submission ID and user ID
      requestBody,  // Send the request body with the approval status
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Include the authorization token in the request header
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );
  } catch (error: any) {
    // Error handling for Axios-related errors
    if (axios.isAxiosError(error)) {
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Error desconocido al aprobar la propuesta';  // Default error message if no message is returned
      throw new Error(errorMessage);  // Throw the error with the appropriate message
    } else {
      // Throw any other errors that are not related to Axios
      throw error;
    }
  }
};
