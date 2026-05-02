import axios from 'axios';

interface Estudiante {
  id: number;
  userName: string;
  carnet: string;
  email: string;
  sedeId: number;
  fotoPerfil: string;
}

export const getStudents = async (
  sedeId: number,
  courseId: number,
  nameYear: number
): Promise<Estudiante[]> => {
  try {

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/locations/${sedeId}/courses/${courseId}/students/${nameYear}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && Array.isArray(response.data.users)) {
      return response.data.users.map((user: any) => ({
        id: user.user_id,
        userName: user.userName,
        carnet: user.carnet,
        email: user.email,
        sedeId: user.sede_id,
        fotoPerfil: user.profilePhoto || '',
      }));
    }

    throw new Error('La respuesta no contiene datos de estudiantes válidos.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(`Error de la API: ${errorMessage}`);
    }
    throw new Error('Error desconocido');
  }
};
