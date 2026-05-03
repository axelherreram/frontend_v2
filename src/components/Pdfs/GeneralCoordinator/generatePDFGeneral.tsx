import { getDetalleTareasGeneral, CourseDetails } from '../../../ts/Administrator/GetGeneralTaskDetails';
import { getDatosPerfil, PerfilData } from '../../../ts/General/GetProfileData';
import * as XLSX from 'xlsx';

/**
 * Generates an Excel report (.xlsx) for a specific year and course.
 * The report includes student task submissions and their completion status.
 */
const generateExcelGeneral = async (
  selectedAño: number,
  selectedCurso: number
) => {
  let sede_id: number;

  try {
    const perfilData: PerfilData = await getDatosPerfil();
    sede_id = Number(localStorage.getItem("selectedSedeId"))    // Obtener la sede-id desde localStorage en lugar de la API
  } catch (error) {
    return;
  }

  // Fetch course details and submissions via API
  const courseDetails: CourseDetails | null = await getDetalleTareasGeneral(selectedCurso, sede_id, selectedAño);

  if (!courseDetails) {
    return;
  }

  const { course, sede, students } = courseDetails;

  // Find all unique task titles across all students to create dynamic columns
  const taskTitlesSet = new Set<string>();
  students.forEach((studentDetail) => {
    studentDetail.submissions.forEach((sub) => {
      taskTitlesSet.add(sub.title);
    });
  });
  const taskTitles = Array.from(taskTitlesSet);

  // Headers for the table
  const headers = [
    "Nombre del Estudiante", 
    "Carnet", 
    "Correo Electrónico",
    ...taskTitles // Dinámicamente añadir los nombres de las tareas
  ];

  // Initialize Excel worksheet data
  const excelData: any[][] = [
    ["Reporte General de Estudiantes"],
    [],
    ["Curso:", course],
    ["Sede:", sede],
    ["Año Académico:", selectedAño],
    [],
    headers
  ];

  // Fill data rows: One row per student
  students.forEach((studentDetail) => {
    const { student, submissions } = studentDetail;
    
    // Create a map of task title -> status for quick lookup
    const studentTasksMap = new Map<string, string>();
    submissions.forEach((sub) => {
      studentTasksMap.set(sub.title, sub.submission_complete ? 'Completada' : 'Pendiente');
    });

    const rowData = [
      student.name, 
      student.carnet, 
      student.email
    ];

    // Append the status for each task column
    taskTitles.forEach(title => {
      rowData.push(studentTasksMap.get(title) || "No Asignada");
    });

    excelData.push(rowData);
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths for better readability
  const cols = [
    { wch: 30 }, // Nombre del Estudiante
    { wch: 15 }, // Carnet
    { wch: 30 }  // Correo
  ];
  // Add width for dynamic task columns
  taskTitles.forEach(() => {
    cols.push({ wch: 20 });
  });
  worksheet['!cols'] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Tareas");

  // Save the Excel file
  XLSX.writeFile(workbook, `Reporte_General_${course}_${selectedAño}.xlsx`);
};

export default generateExcelGeneral;
