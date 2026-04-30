import axios from 'axios';

// Define the 'Usuario' (User) interface, representing the structure of a user object
interface Usuario {
  userId: number;        // Unique ID of the user
  email: string;         // User's email address
  nombre: string;        // User's name
  carnet: string;        // User's 'carnet' (could be an ID or student number)
  rol: string;           // User's role (e.g., "student", "teacher", etc.)
  profilePhoto: string | null;  // User's profile photo, may be null if no photo
}

// Define the 'Grupo' (Group) interface, representing a group with users
interface Grupo {
  yearId: number;       // The year associated with the group
  sedeId: number;       // The ID of the location (sede) associated with the group
  users: Usuario[];     // List of users (students, professors) in the group
}

// Define the response format from the API, which includes group data
interface GrupoResponse {
  groupId: number;      // Unique ID of the group
  groupData: Grupo;     // The data of the group, containing year, sede, and users
}

// Function to fetch detailed group data (comisiones) by groupId and year
export const getComisionesIndiv = async (
  groupId: number,    // ID of the group to fetch data for
  year: number        // Year associated with the group to filter the data
): Promise<GrupoResponse[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Make a GET request to the API with the groupId and year as URL parameters
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/comisiones/grupos/${groupId}/${year}`, // API URL with groupId and year
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Include the authorization token in the request headers
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Check if the response contains the 'groups' property and if it's an array
    if (response.data && Array.isArray(response.data.groups)) {
      // Map the response data to the 'GrupoResponse' interface structure
      return response.data.groups.map((group: any) => ({
        groupId: group.group_id,  // Extract the group ID from the response
        groupData: {
          yearId: group.year_id,  // Extract the year associated with the group
          sedeId: group.sede_id,  // Extract the sede (location) ID
          users: group.users.map((user: any) => ({
            userId: user.user_id,  // Extract user ID
            email: user.email,     // Extract user email
            nombre: user.nombre,   // Extract user name
            carnet: user.carnet,   // Extract user carnet
            rol: user.rol,         // Extract user role
            profilePhoto: user.profilePhoto,  // Extract user profile photo
          })),
        },
      }));
    }

    // If the response does not contain valid group data, throw an error
    throw new Error('La respuesta no contiene datos válidos de grupos.');

  } catch (error) {
    // Handle errors that may occur during the request
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, throw a new error with the message from the API response or a fallback message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data)  // Convert response data to a string if it exists
        : 'Error desconocido';  // Fallback error message
      throw new Error(`Error de la API: ${errorMessage}`);  // Rethrow the error with the API message
    }

    // Handle general errors (non-Axios errors)
    throw new Error('Error desconocido');  // Fallback error message for any unknown errors
  }
};
