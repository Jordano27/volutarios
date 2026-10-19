const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function request(path, options = {}) {
  const token = localStorage.getItem('voluntariado_token');
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || 'Não foi possível concluir a operação.');
    error.details = payload?.details;
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function apiUrl() {
  return API_URL;
}
