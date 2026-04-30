import axios from 'axios';

// Define la estructura de los parámetros para enviar la revisión
interface EnviaRevisionParams {
  carnet: string;  // El carnet del estudiante que sube la revisión
  sede_id: number;  // El ID de la sede donde se sube la revisión
  approval_letter: File;  // El archivo de la carta de aprobación en formato PDF
  thesis: File;  // El archivo de la tesis en formato PDF
}

// Función para manejar el envío de la revisión de tesis
export const enviaRevision = async ({
  carnet,  // El carnet del estudiante
  sede_id,  // El ID de la sede
  approval_letter,  // El archivo de la carta de aprobación
  thesis,  // El archivo de la tesis
}: EnviaRevisionParams): Promise<{ message: string }> => {
  try {
    // Recupera el token de autenticación desde el almacenamiento local
    const token = localStorage.getItem('authToken');

    // Si no se encuentra el token, lanza un error
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Crea un objeto FormData para manejar los archivos y los datos adicionales
    const formData = new FormData();
    formData.append('carnet', carnet);  // Agrega el carnet del estudiante
    formData.append('sede_id', sede_id.toString());  // Agrega el ID de la sede
    formData.append('approval_letter', approval_letter);  // Agrega el archivo de la carta de aprobación
    formData.append('thesis', thesis);  // Agrega el archivo de la tesis

    // Realiza una solicitud POST para enviar la revisión
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/revision-thesis`,  // La URL del endpoint de la API
      formData,  // Los datos enviados (incluyendo los archivos y los parámetros)
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Incluye el token de autenticación en los encabezados
          'Content-Type': 'multipart/form-data',  // Especifica el tipo de contenido como multipart para subir archivos
        },
      }
    );

    // Si la respuesta contiene un mensaje, retorna ese mensaje
    if (response.data && response.data.message) {
      return response.data;
    }

    // Si no se encuentra un mensaje en la respuesta, lanza un error
    throw new Error('Error al enviar la revisión de tesis.');
  } catch (error) {
    // Manejo de errores de Axios
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error desconocido';
      throw new Error(errorMessage);
    }

    // Manejo de otros tipos de errores
    throw new Error('Hubo un problema al enviar la revisión de tesis.');
  }
};
