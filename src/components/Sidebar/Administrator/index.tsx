import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart2, Users, ClipboardList, Calendar, Send, X, ChevronDown } from 'lucide-react';
import Logo from '../../../images/logo/logo.svg';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const [inicioOpen, setInicioOpen] = useState(
    pathname.startsWith('/administrador/graficas') || pathname.startsWith('/administrador/bitacora')
  );
  const [estudiantesOpen, setEstudiantesOpen] = useState(
    pathname.startsWith('/administrador/subir-estudiantes') || pathname.startsWith('/administrador/listado-estudiantes')
  );

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

  const linkClass = (active: boolean) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 group
    ${active
      ? 'bg-[#3C50E0] text-white'
      : 'text-bodydark1 hover:bg-[#333A48]'}`;

  const subLinkClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150
    ${isActive ? 'text-white bg-[#3C50E0]/80' : 'text-bodydark2 hover:text-white hover:bg-[#333A48]'}`;

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
        <NavLink to="/administrador/graficas" className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-29 w-auto" />
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
          Administrador
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-bodydark2">
          Menú Principal
        </p>
        <ul className="flex flex-col gap-1.5">

          {/* Inicio (collapsible) */}
          <li>
            <button
              onClick={() => setInicioOpen(o => !o)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200
                ${(pathname.includes('/administrador/graficas') || pathname.includes('/administrador/bitacora'))
                  ? 'bg-[#333A48] text-white'
                  : 'text-bodydark1 hover:bg-[#333A48]'}`}
            >
              <BarChart2 size={20} className="flex-shrink-0 text-bodydark2" />
              <span className="flex-1 text-left">Inicio</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${inicioOpen ? 'rotate-180' : ''}`} />
            </button>
            {inicioOpen && (
              <ul className="mt-1 ml-8 flex flex-col gap-0.5 border-l border-strokedark pl-3">
                <li>
                  <NavLink to="/administrador/graficas" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Gráficas
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/administrador/bitacora" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Bitácora
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Estudiantes (collapsible) */}
          <li>
            <button
              onClick={() => setEstudiantesOpen(o => !o)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200
                ${(pathname.includes('/administrador/subir-estudiantes') || pathname.includes('/administrador/listado-estudiantes'))
                  ? 'bg-[#333A48] text-white'
                  : 'text-bodydark1 hover:bg-[#333A48]'}`}
            >
              <Users size={20} className="flex-shrink-0 text-bodydark2" />
              <span className="flex-1 text-left">Estudiantes</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${estudiantesOpen ? 'rotate-180' : ''}`} />
            </button>
            {estudiantesOpen && (
              <ul className="mt-1 ml-8 flex flex-col gap-0.5 border-l border-strokedark pl-3">
                <li>
                  <NavLink to="/administrador/subir-estudiantes" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Subir Estudiantes
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/administrador/listado-estudiantes" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Listar Estudiantes
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Crear Tareas */}
          <li>
            <NavLink to="/administrador/crear-tareas" onClick={() => setSidebarOpen(false)}
              className={() => linkClass(pathname === '/administrador/crear-tareas')}>
              <ClipboardList size={20} className="flex-shrink-0 text-bodydark2 group-hover:text-white" />
              <span>Crear Tareas</span>
            </NavLink>
          </li>

          {/* Calendario */}
          <li>
            <NavLink to="/administrador/calendario" onClick={() => setSidebarOpen(false)}
              className={() => linkClass(pathname === '/administrador/calendario')}>
              <Calendar size={20} className="flex-shrink-0 text-bodydark2 group-hover:text-white" />
              <span>Calendario</span>
            </NavLink>
          </li>

          {/* Enviar a Revisión */}
          <li>
            <NavLink to="/administrador/enviar-revision" onClick={() => setSidebarOpen(false)}
              className={() => linkClass(pathname === '/administrador/enviar-revision')}>
              <Send size={20} className="flex-shrink-0 text-bodydark2 group-hover:text-white" />
              <span>Enviar a Revisión</span>
            </NavLink>
          </li>

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
