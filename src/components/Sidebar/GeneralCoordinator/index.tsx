import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart2, Building2, UserCheck, UserCog, Users, ClipboardList, History, X } from 'lucide-react';
import Logo from '../../../images/logo/logo.svg';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/coordinadorgeneral/graficas', label: 'Gráficas', icon: <BarChart2 size={20} /> },
  { to: '/coordinadorgeneral/crear-sedes', label: 'Crear Sedes', icon: <Building2 size={20} /> },
  { to: '/coordinadorgeneral/crear-coordinador-sede', label: 'Coordinador Sede', icon: <UserCheck size={20} /> },
  { to: '/coordinadorgeneral/crear-coordinador-tesis', label: 'Coordinador Tesis', icon: <UserCog size={20} /> },
  { to: '/coordinadorgeneral/listado-estudiantes', label: 'Estudiantes', icon: <Users size={20} /> },
  { to: '/coordinadorgeneral/ver-tareas', label: 'Tareas', icon: <ClipboardList size={20} /> },
  { to: '/coordinadorgeneral/historial', label: 'Historial', icon: <History size={20} /> },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72 flex-col overflow-hidden
        bg-[#1C2434]
        duration-300 ease-linear lg:static lg:translate-x-0
        border-r border-strokedark
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5.5 lg:py-6.5 border-b border-strokedark">
        <NavLink to="/coordinadorgeneral/graficas" className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-19 w-auto" />
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-bodydark hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
          bg-[#3C50E0]/20 text-[#818CF8] border border-[#3C50E0]/30 tracking-wide uppercase">
          Coordinador General
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-bodydark2">
          Menú Principal
        </p>
        <ul className="flex flex-col gap-1.5">
          {navItems.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-sm text-sm font-medium
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#3C50E0] text-white'
                      : 'text-bodydark1 hover:bg-[#333A48]'}`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-bodydark2 group-hover:text-white'}`}>
                    {icon}
                  </span>
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-strokedark">
        <p className="text-[10px] text-bodydark2 text-center">Sistema de Tesis © {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
