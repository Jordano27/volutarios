import { useEffect, useState } from 'react';
import { request } from '../api/http.js';
import { Feedback, Loading } from './Feedback.jsx';
import { Modal } from './Modal.jsx';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export function ProfileModal({ onClose, onUserUpdated }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: 'error' });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const result = await request('/volunteers/me');
        if (mounted) {
          setForm({
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            password: '',
          });
        }
      } catch (error) {
        if (mounted) setFeedback({ message: error.message, type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ message: '', type: 'error' });
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password;
      const result = await request('/volunteers/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      onUserUpdated({ name: result.data.name, email: result.data.email });
      setForm((current) => ({ ...current, password: '' }));
      setFeedback({ message: 'Perfil atualizado com sucesso.', type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal eyebrow="MINHA CONTA" title="Editar perfil" onClose={onClose} className="profile-modal">
      <Feedback message={feedback.message} type={feedback.type} />
      {loading ? (
        <Loading />
      ) : (
        <form className="modal-form" onSubmit={submitForm}>
          <div className="form-grid">
            <label>
              Nome completo
              <input name="name" value={form.name} onChange={updateField} required minLength={3} />
            </label>
            <label>
              E-mail
              <input type="email" name="email" value={form.email} onChange={updateField} required />
            </label>
            <label>
              Telefone
              <input name="phone" value={form.phone} onChange={updateField} required />
            </label>
            <label>
              Nova senha (opcional)
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                minLength={6}
                autoComplete="new-password"
              />
            </label>
          </div>
          <div className="modal-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
