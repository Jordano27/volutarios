import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const isVolunteer = user?.role === 'volunteer';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">V</div>
        <div className="brand-copy">
          <strong>Voluntariado</strong>
          <span>IFRS</span>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          {!isVolunteer ? (
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Dashboard
            </NavLink>
          ) : null}
          <NavLink to="/events" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Eventos
          </NavLink>
          {!isVolunteer ? (
            <NavLink to="/volunteers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Voluntários
            </NavLink>
          ) : null}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-session-heading">
            <span className="eyebrow">Sessão atual</span>
            {isVolunteer ? (
              <button
                type="button"
                className="profile-settings-button"
                onClick={() => setProfileOpen(true)}
                aria-label="Editar meu perfil"
                title="Editar meu perfil"
              >
                <span aria-hidden="true">⚙</span>
              </button>
            ) : null}
          </div>
          <strong>{user?.name}</strong>
          <span>
            {user?.role === 'admin' ? 'Administrador' : user?.role === 'volunteer' ? 'Voluntário' : 'Usuário'}
          </span>
          <button className="button button-ghost full-width" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="content-area">
        <Outlet />
      </main>
      {isVolunteer && profileOpen ? (
        <ProfileModal onClose={() => setProfileOpen(false)} onUserUpdated={updateUser} />
      ) : null}
    </div>
  );
}
