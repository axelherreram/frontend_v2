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

/**
 * Obtiene la propuesta de tesis de un estudiante.
 * Retorna `null` cuando el estudiante aún no ha subido nada (404).
 * Lanza un error para cualquier otro fallo (401, 500, red, etc.).
 */
export const getPropuesta = async (userId: number): Promise<Propuesta | null> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token de autenticación no encontrado');

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/thesis-submission/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; // 200 → hay propuesta
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // El estudiante aún no ha subido ninguna propuesta — es un estado válido
      return null;
    }
    // Cualquier otro error (401, 500, red) debe propagarse para que el componente pueda manejarlo
    throw error;
  }
};
