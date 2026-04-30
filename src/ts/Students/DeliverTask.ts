import axios from "axios";

// Function to submit a task with PDF file
export const entregarTarea = async (taskData: { user_id: number; task_id: number; file: File }) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token de autenticación no encontrado");

    // Construir FormData
    const formData = new FormData();
    formData.append("user_id", String(taskData.user_id));
    formData.append("task_id", String(taskData.task_id));
    formData.append("file", taskData.file);

    // Hacer POST como multipart/form-data
    await axios.post(`${import.meta.env.VITE_API_URL}/task-submissions`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Error desconocido al enviar la tarea";
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};
