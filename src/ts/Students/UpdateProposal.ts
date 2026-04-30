import axios from 'axios';

export const updatePropuesta = async (propuestaData: { file: File; thesisSubmissions_id: number; user_id: number }) => {
  try {
    // Recuperar el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado');

    // Crear un objeto FormData para enviar el archivo y otros parámetros
    const formData = new FormData();
    formData.append('proposal', propuestaData.file); // Nombre del campo: 'proposal'
    formData.append('thesisSubmissions_id', propuestaData.thesisSubmissions_id.toString());
    formData.append('user_id', propuestaData.user_id.toString());

    // Enviar la solicitud PUT para actualizar la propuesta
    await axios.put(`${import.meta.env.VITE_API_URL}/thesis-submission/${propuestaData.thesisSubmissions_id}/${propuestaData.user_id}/update`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar la propuesta';
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
