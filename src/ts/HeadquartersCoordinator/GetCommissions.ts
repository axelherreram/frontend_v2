import axios from 'axios';

// Define the Comision (Commission) interface to specify the structure of the commission data
interface Comision {
  id: number;      // Unique ID of the commission
  nombre: string;  // Name of the commission
  descripcion: string;  // Description of the commission
  year: number;    // Year associated with the commission
  sedeId: number;  // ID of the location (sede) associated with the commission
}

// Function to fetch the list of commissions for a specific 'sede' and 'year'
export const getComisiones = async (
    sedeId: number, // The ID of the location (sede) to fetch commissions for
    year: number    // The year to filter commissions by
  ): Promise<Comision[]> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing authentication token
    }

    // Make the GET request to the API with the 'sedeId' and 'year' as query parameters
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/group-comision?sede_id=${sedeId}&year=${year}`, // API endpoint with parameters
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authentication token in the request headers
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Check if the response contains the 'groups' property and if it's an array
    if (response.data && Array.isArray(response.data.groups)) {
      // Map the response data to the structure of the 'Comision' interface
      return response.data.groups.map((group: any) => ({
        id: group.group_id,  // The ID of the group (commission)
        nombre: `Comisión ${group.group_id}`,  // The name of the commission (adjusted based on group ID)
        descripcion: group.activeGroup ? 'Comisión activa' : 'Comisión inactiva',  // Description based on active status
        year: group.year_id,  // Year associated with the commission
        sedeId: group.sede_id,  // ID of the location (sede) associated with the commission
      }));
    }

    // If the response does not contain valid commission data, throw an error
    throw new Error('La respuesta no contiene datos de comisiones válidos.');

  } catch (error) {
    // Handle errors that may occur during the request
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, throw a new error with the message from the API response or a fallback message
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response?.data)
        : 'Error desconocido';
      throw new Error(`Error de la API: ${errorMessage}`);  // Rethrow the error message from the API
    }

    // Handle general errors (non-Axios errors)
    throw new Error('Error desconocido');  // Fallback error message for any unknown errors
  }
};
