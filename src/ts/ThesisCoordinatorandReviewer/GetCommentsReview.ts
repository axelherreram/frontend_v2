import axios from 'axios';

// Define interfaces based on the new JSON structure
interface CommentRevision {
  title: string;
  comment: string;
  date_comment: string;
}

interface AssignedReview {
  assigned_review_id: number;
  date_assigned: string;
  user: {
    user_id: number;
    name: string;
    email: string;
  };
  commentsRevisions: CommentRevision[];
}

interface ApprovalThesis {
  status: string;
  date_approved: string | null;
  approved: boolean;
}

interface ThesisRevisionInfo {
  revision_thesis_id: number;
  active_process: boolean;
  thesis_dir: string;
  AssignedReviews: AssignedReview[];
  approvaltheses: ApprovalThesis[];
  user: {
    name: string;
    carnet: string;
    email: string;
    profilePhoto: string | null;
    profilePhoto: string | null;
    location: {
      nameSede: string;
    } | null;
    year: {
      year: number;
    } | null;
  };
}

// Function to fetch thesis revision comments for a specific user
export const getComentariosRevision = async (user_id: number): Promise<ThesisRevisionInfo[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    const url = `${import.meta.env.VITE_API_URL}/revision-thesis/info/${user_id}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map((revision: any) => ({
        revision_thesis_id: revision.revision_thesis_id,
        active_process: revision.active_process,
        thesis_dir: revision.thesis_dir,
        AssignedReviews: revision.AssignedReviews.map((assignedReview: any) => ({
          assigned_review_id: assignedReview.assigned_review_id,
          date_assigned: assignedReview.date_assigned,
          user: {
            user_id: assignedReview.User?.user_id || assignedReview.user?.user_id,
            name: assignedReview.User?.name || assignedReview.user?.name,
            email: assignedReview.User?.email || assignedReview.user?.email,
          },
          commentsRevisions: assignedReview.commentsRevisions || [],
        })),
        approvaltheses: revision.approvaltheses.map((approval: any) => ({
          status: approval.status,
          date_approved: approval.date_approved,
          approved: approval.approved,
        })),
        user: {
          name: revision.user?.name ?? 'Sin nombre',
          carnet: revision.user?.carnet ?? 'Sin carnet',
          email: revision.user?.email ?? 'Sin correo',
          profilePhoto: revision.user?.profilePhoto ?? null,
          location: revision.user?.location 
            ? { nameSede: revision.user.location.nameSede } 
            : null,
          year: revision.user?.year 
            ? { year: revision.user.year.year } 
            : null,
        },
      }));
    }

    throw new Error('La respuesta no contiene datos de revisión de tesis válidos.');
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