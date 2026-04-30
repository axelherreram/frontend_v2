import axios from 'axios';

// Define interfaces to represent the structure of the JSON data
export interface Submission {
  title: string;               // Title of the task submission
  submission_complete: boolean; // Indicates whether the submission is complete
  date: string;                // Date of the task submission
}

export interface Student {
  name: string;   // Name of the student
  email: string;  // Email of the student
  carnet: string; // Unique identification number (carnet) of the student
}

export interface StudentDetails {
  student: Student;           // Contains details about the student
  submissions: Submission[];  // List of task submissions by the student
}

export interface CourseDetails {
  course: string;    // Name or ID of the course
  sede: string;      // Sede (campus) of the course
  students: StudentDetails[]; // List of students and their submissions in the course
}

// Function to get the general details of tasks for a specific course and sede
export const getDetalleTareasGeneral = async (
  course_id: number,  // ID of the course
  sede_id: number,    // ID of the sede (campus)
  year: number        // Year of the course
): Promise<CourseDetails | null> => {
  try {
    // Retrieve the authentication token from localStorage
    const token = localStorage.getItem('authToken');

    // If no token is found, throw an error indicating authentication failure
    if (!token) {
      throw new Error('Token de autenticación no encontrado');  // Error message for missing token
    }

    // Make a GET request to the specified URL with the parameters for course, sede, and year
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/courses/${course_id}/${sede_id}/${year}/details`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the authorization token in the request headers
          'Content-Type': 'application/json',  // Specify the content type as JSON
        },
      }
    );

    // Check if the response contains the expected data
    if (response.data) {
      const { course, sede, students } = response.data;

      // Validate the structure of the JSON before returning it
      if (!course || !sede || !Array.isArray(students)) {
        return null;  // If the expected structure is not found, return null
      }

      // Return the course details including sede and students' submission data
      return {
        course,  // Name or ID of the course
        sede,    // Name or ID of the sede (campus)
        students: students.map((studentDetail: any) => ({
          student: {
            name: studentDetail.student.name,           // Student's name
            email: studentDetail.student.email,         // Student's email
            carnet: studentDetail.student.carnet,       // Student's carnet (ID)
          },
          submissions: studentDetail.submissions.map((submission: any) => ({
            title: submission.title,               // Title of the task submission
            submission_complete: submission.submission_complete, // Whether the submission is complete
            date: submission.date,                 // Date of the task submission
          })),
        })),
      };
    } else {
      return null;  // If no details are found, return null
    }
  } catch (error) {
    return null;  // If an error occurs during the API request, return null
  }
};
