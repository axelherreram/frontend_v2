import axios from 'axios';

// Interfaz de la estructura de datos de una entrega
export interface Submission {
  title: string;                 // Título de la entrega
  submission_complete: boolean;  // Indica si la entrega está completa
  date: string;                   // Fecha de entrega
  file_path: string;              // Ruta del archivo subido
}

// Interfaz de la información del estudiante
export interface Student {
  name: string;   // Nombre del estudiante
  email: string;  // Correo electrónico
  carnet: string; // Carné
  sede: string;   // Sede
  course: string; // Curso
}

// Interfaz de los detalles del curso
export interface CourseDetails {
  student: Student;              // Información del estudiante
  formattedSubmissions: Submission[]; // Lista de entregas
}

// Función para obtener el detalle de tareas
export const getDetalleTareas = async (
  user_id: number,
  course_id: number,
  sede_id: number,
  year: number
): Promise<CourseDetails | null> => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/students/${user_id}/courses/${course_id}/sede/${sede_id}/year/${year}/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data) {
      const { student, formattedSubmissions } = response.data;

      if (!student || !formattedSubmissions) {
        return null;
      }

      return {
        student: {
          name: student.name,
          email: student.email,
          carnet: student.carnet,
          sede: student.sede,
          course: student.course,
        },
        formattedSubmissions: formattedSubmissions.map((submission: any) => ({
          title: submission.title,
          submission_complete: submission.submission_complete,
          date: submission.date,
          file_path: submission.file_path, // Nuevo campo añadido
        })),
      };
    }

    return null;
  } catch (error) {

    return null;
  }
};
