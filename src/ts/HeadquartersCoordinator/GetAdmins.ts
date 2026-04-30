import axios from 'axios';

// Interface for the 'sede' (location or department) object
interface Sede {
  sede_id: number;  // The ID of the 'sede'
  nombre: string;   // The name of the 'sede'
}

// Interface for the admin object
interface Admin {
  user_id: number;       // The ID of the admin user
  email: string;         // The email of the admin
  name: string;          // The name of the admin
  carnet: string;        // The admin's identification number (e.g., student number)
  active: boolean;     // Indicates if the admin is active
  sede: Sede;            // The 'sede' (location or department) where the admin belongs
  profilePhoto: string | null;  // URL or path to the profile photo (nullable)
}

// Interface for the response data containing a message and an array of admins
interface AdminsResponse {
  message: string;  // A message from the API
  admins: Admin[];  // An array of admin objects
}

// Asynchronous function to fetch the list of admins by sede_id
export const getAdmins = async (sede_id: number): Promise<Admin[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // If token is not found, throw an error
    }

    // Make the GET request to the specified URL to retrieve the list of admins
    const response = await axios.get<AdminsResponse>(`${import.meta.env.VITE_API_URL}/admins/${sede_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the authorization header
        'Content-Type': 'application/json',   // Set content type to JSON
      },
    });

    // Return the list of admins from the response data
    return response.data.admins;
  } catch (error) {
    // Error handling
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, extract the error message from the API response or use a default message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(errorMessage);
    }

    // If it's not an Axios error, throw a generic error message
    throw new Error('Error desconocido');
  }
};
