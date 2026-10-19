import { useEffect, useState } from 'react';
import { request } from '../api/http.js';
import { Feedback, Loading } from '../components/Feedback.jsx';
import { ConfirmationModal, Modal } from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { name: '', email: '', phone: '', password: '', status: 'active' };

export default function VolunteersPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  async function loadVolunteers() {
    setLoading(true);
    try {
      const result = await request('/volunteers');
      setVolunteers(result.data);
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }
  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormModalOpen(false);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ name: item.name, email: item.email, phone: item.phone, status: item.status });
    setFormModalOpen(true);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormModalOpen(true);
  }

  function cancelPendingAction() {
    const action = pendingAction;
    setPendingAction(null);
    if (action?.type === 'save') setFormModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    setFormModalOpen(false);
    setPendingAction({
      type: 'save',
      id: editingId,
      title: editingId ? 'Confirmar edição' : 'Confirmar cadastro',
      message: editingId ? `Salvar as alterações do voluntário ${form.name}?` : `Cadastrar o voluntário ${form.name}?`,
    });
  }

  async function confirmSave() {
    if (!pendingAction || pendingAction.type !== 'save') return;
    setActionLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
      };
      if (!pendingAction.id) payload.password = form.password;
      await request(pendingAction.id ? `/volunteers/${pendingAction.id}` : '/volunteers', {
        method: pendingAction.id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setFeedback({ message: pendingAction.id ? 'Voluntário atualizado.' : 'Voluntário cadastrado.', type: 'success' });
      setPendingAction(null);
      resetForm();
      await loadVolunteers();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  function remove(id) {
    const volunteer = volunteers.find((item) => item.id === id);
    setPendingAction({
      type: 'delete',
      id,
      title: 'Confirmar exclusão',
      message: `Excluir o voluntário ${volunteer?.name || ''}?`,
    });
  }

  async function confirmDelete() {
    if (!pendingAction || pendingAction.type !== 'delete') return;
    setActionLoading(true);
    try {
      await request(`/volunteers/${pendingAction.id}`, { method: 'DELETE' });
      setFeedback({ message: 'Voluntário excluído.', type: 'success' });
      setPendingAction(null);
      await loadVolunteers();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">CADASTRO</p>
          <h1>Voluntários</h1>
          <p>Cuide da rede de pessoas que faz cada ação acontecer.</p>
        </div>
        <div className="page-header-actions">
          <span className="count-pill">{volunteers.length} pessoas</span>
          {isAdmin ? (
            <button type="button" className="button button-primary" onClick={startCreate}>
              Novo voluntário
            </button>
          ) : null}
        </div>
      </header>
      <Feedback message={feedback.message} type={feedback.type} />
      {isAdmin && formModalOpen ? (
        <Modal
          eyebrow={editingId ? 'EDIÇÃO' : 'NOVO REGISTRO'}
          title={editingId ? 'Editar voluntário' : 'Cadastrar voluntário'}
          onClose={resetForm}
          className="form-modal"
        >
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
              {!editingId ? (
                <label>
                  Senha de acesso
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    required
                    minLength={6}
                    autoComplete="off"
                  />
                </label>
              ) : null}
              <label>
                Status
                <select name="status" value={form.status} onChange={updateField}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="button button-secondary" type="button" onClick={resetForm}>
                Cancelar
              </button>
              <button className="button button-primary" type="submit">
                {editingId ? 'Salvar alterações' : 'Cadastrar voluntário'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {loading ? (
        <Loading />
      ) : (
        <section className="card table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  {isAdmin ? <th>Ações</th> : null}
                </tr>
              </thead>
              <tbody>
                {volunteers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>
                      <span className={`status status-${item.status}`}>
                        {item.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    {isAdmin ? (
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="button button-small button-secondary"
                            onClick={() => startEdit(item)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="button button-small button-danger"
                            onClick={() => remove(item.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            {volunteers.length === 0 ? <div className="empty-state">Nenhum voluntário cadastrado.</div> : null}
          </div>
        </section>
      )}
      {pendingAction ? (
        <ConfirmationModal
          title={pendingAction.title}
          message={pendingAction.message}
          onConfirm={pendingAction.type === 'save' ? confirmSave : confirmDelete}
          onCancel={cancelPendingAction}
          loading={actionLoading}
        />
      ) : null}
    </div>
  );
}
