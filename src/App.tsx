import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Administrator
import CreateTasks from './pages/Administrator/CreateTasks';
import UploadStudents from './pages/Administrator/Students/UploadStudents';
import ListStudents from './pages/Administrator/Students/ListStudents';
import AdminTimeLine from './pages/Administrator/Students/TimeLine';
import StudentTasks from './pages/Administrator/Students/TasksStudent';
import Proposals from './pages/Administrator/Students/Proposals';
import Chapters from './pages/Administrator/Students/Chapters';
import SubmitReview from './pages/Administrator/SubmitReview';

// General Coordinator
import CreateHeadquarters from './pages/GeneralCoordinator/CreateHeadquarters';
import CreateCoordinatorSede from './pages/GeneralCoordinator/CreateCoordinatorHeadquarters';
import CreateCoordinatorTesis from './pages/GeneralCoordinator/CreateThesisCoordinator';
import CreateTasksCoordinator from './pages/GeneralCoordinator/CreateTasks';
import ListStudentsCoordinator from './pages/GeneralCoordinator/Students/ListStudents';
import CoordinatorGeneralTimeLine from './pages/GeneralCoordinator/Students/TimeLine';
import StudentTasksCoordinator from './pages/GeneralCoordinator/Students/TasksStudent';
import ProposalsCoordinator from './pages/GeneralCoordinator/Students/Proposals';
import ChaptersCoordinator from './pages/GeneralCoordinator/Students/Chapters';
import GraphicsCoorSede from './pages/GeneralCoordinator/Graphics';

// General Pages
import Graphics from './pages/Administrator/Start/Graphics';
import Binnacle from './pages/Administrator/Start/Binnacle';
import Profile from './pages/General/Profile';
import PasswordSettings from './pages/General/Password';
import Calendar from './pages/General/Calendar';
import DefaultLayout from './layout/DefaultLayout';
import MyAssignments from './pages/General/MyAssignments';
import AssignmentDetails from './pages/General/ReviewStudentGetComments';
import AssignmentCommentDetails from './pages/General/ReviewStudentCreateComments';
import Record from './pages/General/Record';
import RecordDetails from './pages/General/ReviewStudentGetComments';

// Student
import Start from './pages/Students/Start';
import Proposal from './pages/Students/Proposal';
import Courses from './pages/Students/Courses';
import CourseInfo from './pages/Students/CourseInfo';
import ChapterInfo from './pages/Students/InfoChapter';

// Headquarters Coordinator
/* import UploadProfessors from './pages/HeadquartersCoordinator/Professors/UploadProfessors';
import ListProfessors from './pages/HeadquartersCoordinator/Professors/ListProfessors';
import CreateProfessors from './pages/HeadquartersCoordinator/Professors/CreateProfessors';
import CreateCommission from './pages/HeadquartersCoordinator/Commissions/CreateCommission';
import ListCommission from './pages/HeadquartersCoordinator/Commissions/ListCommission'; */
import CreateAdmin from './pages/HeadquartersCoordinator/CreateAdmin';
import AssignPG from './pages/HeadquartersCoordinator/AssignPG';

// Thesis Coordinator
import ThesisGraphics from './pages/ThesisCoordinator/Graphics';
import RequestReviews from './pages/ThesisCoordinator/RequestReviews';
import StudentReview from './pages/ThesisCoordinator/StudentReview';
import Reviewers from './pages/ThesisCoordinator/Reviewers';
import Assignments from './pages/ThesisCoordinator/Assignments';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<number | null>(null); // State to store the user role
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Check if localStorage is empty
    if (localStorage.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'Favor de iniciar sesión para continuar.',
        confirmButtonText: 'De Acuerdo',
        customClass: {
          confirmButton: 'bg-red-600 text-white',
        },
      }).then(() => {
        navigate('/');
      });
    } else {
      // Get the role from localStorage
      const storedRole = localStorage.getItem('userRole');
      setRole(storedRole ? parseInt(storedRole) : null);
    }
  }, [navigate]);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return null;

  return (
    <DefaultLayout>
      <Routes>
        {/* Student */}
        {role === 1 && (
          <>
            <Route path="time-line" element={<Start />} />
            <Route path="propuestas" element={<Proposal />} />
            <Route path="courses" element={<Courses />} />
            <Route path="info-curso" element={<CourseInfo />} />
            <Route path="info-capitulo" element={<ChapterInfo />} />
          </>
        )}

        {/* Professor */}
        {role === 2 && (
          <>
            <Route path="propuestas" element={<Proposals />} />
            <Route path="capitulo" element={<Chapters />} />
          </>
        )}

        {/* Administrator */}
        {role === 3 && (
          <>
            <Route path="subir-estudiantes" element={<UploadStudents />} />
            <Route path="listado-estudiantes" element={<ListStudents />} />
            <Route path="time-line" element={<AdminTimeLine />} />
            <Route path="tareas-estudiante" element={<StudentTasks />} />
            <Route path="propuestas" element={<Proposals />} />
            <Route path="capitulo" element={<Chapters />} />
            <Route path="crear-tareas" element={<CreateTasks />} />
            <Route path="enviar-revision" element={<SubmitReview />} />
          </>
        )}

        {/* Headquarters Coordinator */}
        {role === 4 && (
          <>
            {/*             <Route path="subir-catedraticos" element={<UploadProfessors />} />
            <Route path="listado-catedraticos" element={<ListProfessors />} />
            <Route path="crear-catedraticos" element={<CreateProfessors />} />
            <Route path="crear-comision" element={<CreateCommission />} />
            <Route path="listado-comision" element={<ListCommission />} /> */}
            <Route path="crea-admin" element={<CreateAdmin />} />
            <Route path="asignapg" element={<AssignPG />} />
          </>
        )}

        {/* General Coordinator */}
        {role === 5 && (
          <>
            <Route path="graficas" element={<GraphicsCoorSede />} />
            <Route path="crear-sedes" element={<CreateHeadquarters />} />
            <Route path="crear-coordinador-sede" element={<CreateCoordinatorSede />} />
            <Route path="crear-coordinador-tesis" element={<CreateCoordinatorTesis />} />
            <Route path="listado-estudiantes" element={<ListStudentsCoordinator />} />
            <Route path="time-line" element={<CoordinatorGeneralTimeLine />} />
            <Route path="tareas-estudiante" element={<StudentTasksCoordinator />} />
            <Route path="propuestas" element={<ProposalsCoordinator />} />
            <Route path="capitulo" element={<ChaptersCoordinator />} />
            <Route path="ver-tareas" element={<CreateTasksCoordinator />} />
            <Route path="historial" element={<Record />} />
            <Route path="historial/detalle" element={<RecordDetails />} />
          </>
        )}

        {/* Thesis Coordinator */}
        {role === 6 && (
          <>
            <Route path="graficas" element={<ThesisGraphics />} />
            <Route path="mis-asignaciones" element={<MyAssignments />} />
            <Route path="mis-asignaciones/detalle" element={<AssignmentDetails />} />
            <Route path="mis-asignaciones/detalle-comentario" element={<AssignmentCommentDetails />} />
            <Route path="solicitud-revisiones" element={<RequestReviews />} />
            <Route path="revision-estudiante" element={<StudentReview />} />
            <Route path="revisores" element={<Reviewers />} />
            <Route path="asignaciones" element={<Assignments />} />
            <Route path="asignaciones/detalle" element={<AssignmentDetails />} />
            <Route path="historial" element={<Record />} />
            <Route path="historial/detalle" element={<RecordDetails />} />
          </>
        )}

        {/* Reviewer */}
        {role === 7 && (
          <>
            <Route path="mis-asignaciones" element={<MyAssignments />} />
            <Route path="mis-asignaciones/detalle" element={<AssignmentDetails />} />
            <Route path="mis-asignaciones/detalle-comentario" element={<AssignmentCommentDetails />} />
            <Route path="historial" element={<Record />} />
            <Route path="historial/detalle" element={<RecordDetails />} />
          </>
        )}

        {/* General Routes for All Roles */}
        <Route path="graficas" element={<Graphics />} />
        <Route path="bitacora" element={<Binnacle />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="contraseña" element={<PasswordSettings />} />
        <Route path="calendario" element={<Calendar />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
