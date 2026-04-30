import axios from 'axios';

// Define the interface for the "Review" structure
interface Review {
  date_assigned: string; // Date when the review was assigned
  date_revision: string; // Date of the revision
  active_process: boolean; // Indicates if the process is active
  approval_status: string; // Status of the thesis approval (translated)
  revision_thesis_id: number; // ID of the thesis revision
  user: {
    user_id: number;
    name: string;
    email: string;
    carnet: string;
  };
}

// Function to fetch assigned reviews for a specific user
export const getRevisionesCordinador = async (
  user_id: number,
  order: string = 'desc',
  carnet?: string
): Promise<Review[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Build the URL with the query parameters
    let url = `${import.meta.env.VITE_API_URL}/assigned-review/user/${user_id}?order=${order}`;
    if (carnet) {
      url += `&carnet=${encodeURIComponent(carnet)}`;
    }

    // Make the GET request to fetch assigned reviews
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Check if the response contains the necessary data
    if (response.data && Array.isArray(response.data.reviews)) {
      return response.data.reviews.map((review: any) => {
        const status = review.RevisionThesis?.approvaltheses?.[0]?.status || 'Desconocido';

        return {
          date_assigned: review.date_assigned,
          date_revision: review.RevisionThesis?.date_revision || 'No especificado',
          active_process: review.RevisionThesis?.active_process ?? false,

          // ✅ Campo adicional traducido a español para mostrar en la tabla
          approval_status:
            status === 'en revisión'
              ? 'En revisión'
              : status === 'rechazado'
                ? 'Rechazado'
                : status,

          revision_thesis_id: review.RevisionThesis?.revision_thesis_id || 0,
          user: {
            user_id: review.RevisionThesis?.user?.user_id || 0,
            name: review.RevisionThesis?.user?.name || 'No disponible',
            email: review.RevisionThesis?.user?.email || 'No disponible',
            carnet: review.RevisionThesis?.user?.carnet || 'No disponible',
          },
        };
      });
    }

    throw new Error('La respuesta no contiene datos de revisiones asignadas válidos.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido en la API';
      throw new Error(`Error de la API: ${errorMessage}`);
    }
    throw new Error(`Error desconocido: ${error}`);
  }
};
