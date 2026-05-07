import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart2, UserPlus, ClipboardList, X, ChevronDown } from 'lucide-react';
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
    pathname.includes('/coordinadorsede/graficas') || pathname.includes('/coordinadorsede/bitacora')
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

  const subLinkClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
    ${isActive ? 'text-white bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`;

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
    ${active
      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
      : 'text-white/60 hover:text-white hover:bg-white/8'}`;

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72 flex-col overflow-hidden
        bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d]
        duration-300 ease-linear lg:static lg:translate-x-0
        shadow-2xl border-r border-white/5
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <NavLink to="/coordinadorsede/graficas" className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-19 w-auto" />
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
          bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
          Coordinador de Sede
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Menú Principal
        </p>
        <ul className="flex flex-col gap-1">

          {/* Inicio (collapsible) */}
          <li>
            <button
              onClick={() => setInicioOpen(o => !o)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${(pathname.includes('/coordinadorsede/graficas') || pathname.includes('/coordinadorsede/bitacora'))
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/8'}`}
            >
              <BarChart2 size={20} className="flex-shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">Inicio</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${inicioOpen ? 'rotate-180' : ''}`} />
            </button>
            {inicioOpen && (
              <ul className="mt-1 ml-8 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                <li>
                  <NavLink to="/coordinadorsede/graficas" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Gráficas
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/coordinadorsede/bitacora" onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => subLinkClass(isActive)}>
                    Bitácora
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Crear Admin */}
          <li>
            <NavLink to="/coordinadorsede/crea-admin" onClick={() => setSidebarOpen(false)}
              className={() => linkClass(pathname === '/coordinadorsede/crea-admin')}>
              <UserPlus size={20} className="flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Crear Administrador</span>
              {pathname === '/coordinadorsede/crea-admin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
            </NavLink>
          </li>

          {/* Asignar PG */}
          <li>
            <NavLink to="/coordinadorsede/asignapg" onClick={() => setSidebarOpen(false)}
              className={() => linkClass(pathname === '/coordinadorsede/asignapg')}>
              <ClipboardList size={20} className="flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Asignar PG</span>
              {pathname === '/coordinadorsede/asignapg' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
            </NavLink>
          </li>

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
