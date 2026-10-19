import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Feedback } from '../components/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@ifrs.edu.br');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-panel intro-panel">
        <div className="brand-mark large">V</div>
        <p className="eyebrow light">IFRS • AÇÕES SOCIAIS</p>
        <h1>
          Pequenas ações.
          <br />
          <span>Impacto coletivo.</span>
        </h1>
        <p className="intro-text">
          Organize eventos, conecte voluntários e acompanhe cada ação da comunidade em um só lugar.
        </p>
        <div className="intro-decoration">
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className="login-panel form-panel">
        <div className="form-heading">
          <p className="eyebrow">ACESSO RESTRITO</p>
          <h2>Bem-vindo de volta</h2>
          <p>Entre para acompanhar as ações de voluntariado.</p>
        </div>
        <form onSubmit={handleSubmit} className="stack-form">
          <Feedback message={error} />
          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no sistema'}
          </button>
        </form>
        <div className="demo-hint">
          <strong>Acesso de demonstração</strong>
          <span>Admin: admin@ifrs.edu.br • 123456</span>
          <span>Voluntária: ana.souza@example.com • 123456</span>
        </div>
      </section>
    </main>
  );
}
