export function Feedback({ message, type = 'error' }) {
  if (!message) return null;
  return (
    <div className={`feedback ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  );
}

export function Loading() {
  return <div className="loading-state">Carregando dados...</div>;
}
