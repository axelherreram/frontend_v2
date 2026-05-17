import axios from 'axios';

interface ApprovedRevision {
  revision_thesis_id: number;
  date_revision: string;
  thesis_dir: string;
  approvaltheses: Array<{ status: string; date_approved: string }>;
  user: { user_id: number; name: string; carnet: string };
  sede: { nameSede: string };
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApprovedRevisionsResponse {
  data: ApprovedRevision[];
  pagination: PaginationMeta;
}

// Fetch approved thesis revisions with server-side pagination
export const getRevisionesAprobadas = async (
  order: string = 'asc',
  carnet?: string,
  page: number = 1,
  limit: number = 10,
): Promise<ApprovedRevisionsResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticación no encontrado');

    const params = new URLSearchParams({ order, page: String(page), limit: String(limit) });
    if (carnet) params.append('carnet', carnet);

    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/approved?${params.toString()}`;

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
          thesis_dir: revision.thesis_dir,
          approvaltheses: revision.approvaltheses ?? [],
          user: {
            user_id: revision.User?.user_id ?? revision.user?.user_id,
            name: revision.User?.name ?? revision.user?.name,
            carnet: revision.User?.carnet ?? revision.user?.carnet,
          },
          sede: {
            nameSede: revision.sede?.nameSede ?? '',
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

    throw new Error('La respuesta no contiene datos de revisiones aprobadas válidos.');
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
