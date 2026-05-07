import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, BookOpen, Calendar, X } from 'lucide-react';
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
  { to: '/estudiantes/time-line', label: 'Inicio', icon: <Home size={20} /> },
  { to: '/estudiantes/propuestas', label: 'Propuestas', icon: <FileText size={20} /> },
  { to: '/estudiantes/courses', label: 'Cursos', icon: <BookOpen size={20} /> },
  { to: '/estudiantes/calendario', label: 'Calendario', icon: <Calendar size={20} /> },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
        bg-gradient-to-b from-[#1a1f35] to-[#0f1221]
        duration-300 ease-linear lg:static lg:translate-x-0
        shadow-2xl border-r border-white/5
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <NavLink to="/estudiantes/time-line" className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-19 w-auto" />
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
          bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wide uppercase">
          Estudiante
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Menú Principal
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                >
                  <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                    ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/90'}`}>
                    {icon}
                  </span>
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/20 text-center">Sistema de Tesis © {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
