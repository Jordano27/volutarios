import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/events" replace />;
}
