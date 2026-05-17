import axios from 'axios';

// Define the interface for the "Revision" structure
interface Revision {
  revision_thesis_id: number;
  date_revision: string;
  approvals: Array<{ status: string }>;
  user: {
    user_id: number;
    name: string;
    carnet: string;
  };
  approvalThesis: {
    status: string;
  };
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PendingRevisionsResponse {
  data: Revision[];
  pagination: PaginationMeta;
}

// Function to fetch pending thesis revisions with server-side pagination
export const getRevisionesPendientes = async (
  order: string = 'asc',
  carnet?: string,
  page: number = 1,
  limit: number = 10,
): Promise<PendingRevisionsResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Build URL with all query params
    const params = new URLSearchParams({ order, page: String(page), limit: String(limit) });
    if (carnet) params.append('carnet', carnet);

    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/pending?${params.toString()}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data.map((revision: any) => ({
          revision_thesis_id: revision.revision_thesis_id,
          date_revision: revision.date_revision,
          approvals: revision.approvaltheses || [],
          user: {
            user_id: revision.user.user_id,
            name: revision.user.name,
            carnet: revision.user.carnet,
          },
          approvalThesis: {
            status: revision.ApprovalThesis?.status ?? 'Pendiente',
          },
        })),
        pagination: response.data.pagination ?? {
          total: response.data.data.length,
          totalPages: 1,
          currentPage: page,
          limit,
        },
      };
    }

    throw new Error('La respuesta no contiene datos de revisiones pendientes válidos.');
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
