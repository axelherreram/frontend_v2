import axios from 'axios';

export interface TaskSubmissionResult {
  student: {
    user_id: number;
    name: string;
    email: string;
    carnet: string;
  };
  submission: {
    submission_id: number;
    task_title: string;
    submission_complete: boolean;
    date: string;
    file_url: string | null;
  };
}

/**
 * Obtiene la entrega de una tarea específica de un estudiante.
 * Endpoint: GET /api/students/:user_id/tasks/:task_id/submission
 *
 * @returns los datos de la entrega, o null si el estudiante aún no entregó (404)
 * @throws en cualquier otro error (401, 500, red)
 */
export const getSubmissionByTask = async (
  user_id: number,
  task_id: number
): Promise<TaskSubmissionResult | null> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token de autenticación no encontrado');

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/students/${user_id}/tasks/${task_id}/submission`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // El estudiante aún no ha entregado — estado válido
      return null;
    }
    throw error;
  }
};
