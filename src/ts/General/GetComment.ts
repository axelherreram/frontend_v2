import axios from 'axios';

// Definition of the structure for each comment
export interface Comentario {
  comment_id: number;      // Unique ID of the comment
  comment_active: boolean; // Indicates if the comment is active
  comment: string;         // Text of the comment
  role: string;            // Role of the user who made the comment
  datecomment: string;     // Date when the comment was made
}

// Definition of the structure for the comment data
export interface ComentarioData {
  taskId: number;         // Task ID
  userId: number;         // User ID
  comments: Comentario[]; // Array of comments
}

export const getComentarios = async (task_id: number, user_id: number): Promise<ComentarioData> => {
  try {
    // Retrieve authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If the token is not found, throw an error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Make a GET request to the specified URL, passing task_id and user_id
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/comments/${task_id}/user/${user_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Adapt the response to match the expected structure,
    // iterating through each entry and mapping its versions
    const comentarioData: ComentarioData = {
      taskId: task_id,
      userId: user_id,
      comments: response.data.flatMap((entry: any) =>
        entry.versions.map((version: any) => ({
          comment_id: entry.comment_id,          // Use the comment_id from the entry
          comment_active: entry.comment_active,  // Extract the activation state of the comment
          comment: version.comment,              // Extract the comment text
          role: version.role,                    // Extract the user's role
          datecomment: version.datecomment,      // Extract the comment date
        }))
      ),
    };

    return comentarioData;
  } catch (error: any) {
    // Error handling
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Error desconocido';
      throw new Error(errorMessage);
    }
    throw new Error('Error desconocido');
  }
};
