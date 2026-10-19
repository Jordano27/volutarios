import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/http.js';
import { Feedback, Loading } from '../components/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/dashboard')
      .then((data) => setSummary(data.summary))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>Olá, {user?.name?.split(' ')[0]}.</h1>
          <p>Acompanhe o pulso das suas ações sociais.</p>
        </div>
        <Link className="button button-primary" to="/events">
          Ver eventos
        </Link>
      </header>
      <Feedback message={error} />
      {!summary && !error ? <Loading /> : null}
      {summary ? (
        <section className="metric-grid">
          <article className="metric-card accent-blue">
            <span className="metric-label">Eventos cadastrados</span>
            <strong>{summary.total_events}</strong>
            <span className="metric-detail">No sistema</span>
          </article>
          <article className="metric-card accent-orange">
            <span className="metric-label">Próximos eventos</span>
            <strong>{summary.upcoming_events}</strong>
            <span className="metric-detail">Eventos ativos</span>
          </article>
          <article className="metric-card accent-green">
            <span className="metric-label">Voluntários ativos</span>
            <strong>{summary.active_volunteers}</strong>
            <span className="metric-detail">Prontos para participar</span>
          </article>
          <article className="metric-card accent-purple">
            <span className="metric-label">Inscrições</span>
            <strong>{summary.total_registrations}</strong>
            <span className="metric-detail">Participações registradas</span>
          </article>
        </section>
      ) : null}
    </div>
  );
}
