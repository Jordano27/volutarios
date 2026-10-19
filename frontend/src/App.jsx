import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute, { RoleRoute } from './components/ProtectedRoute.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/events" element={<EventsPage />} />
          <Route element={<RoleRoute allowedRoles={['admin', 'user']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
