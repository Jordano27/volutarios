import { useEffect, useState } from 'react';
import { request } from '../api/http.js';
import { Feedback, Loading } from '../components/Feedback.jsx';
import { ConfirmationModal, Modal } from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { title: '', description: '', event_date: '', location: '', max_volunteers: 20, status: 'active' };
const eventStatusLabels = { active: 'Ativo', finished: 'Finalizado', cancelled: 'Cancelado' };
const registrationStatusMessages = {
  finished: 'Este evento já foi finalizado. As inscrições estão encerradas.',
  cancelled: 'Este evento foi cancelado. As inscrições estão indisponíveis.',
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventVolunteers, setEventVolunteers] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [pendingCancellation, setPendingCancellation] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isVolunteer = user?.role === 'volunteer';
  const expandedEvent = events.find((item) => item.id === expandedEventId);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await request('/events');
      setEvents(result.data);
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEventVolunteers(eventId) {
    setRegistrationLoading(true);
    try {
      const [registrations, volunteers] = await Promise.all([
        request(`/events/${eventId}/volunteers`),
        request('/volunteers?status=active'),
      ]);
      setEventVolunteers(registrations.data);
      setAvailableVolunteers(volunteers.data);
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setRegistrationLoading(false);
    }
  }

  async function toggleEventVolunteers(eventId) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      setEventVolunteers([]);
      setAvailableVolunteers([]);
      setSelectedVolunteerId('');
      return;
    }

    setExpandedEventId(eventId);
    setSelectedVolunteerId('');
    await loadEventVolunteers(eventId);
  }

  async function registerVolunteer(eventId) {
    if (!selectedVolunteerId) return;
    setRegistrationLoading(true);
    try {
      await request(`/events/${eventId}/volunteers/${selectedVolunteerId}`, { method: 'POST' });
      setFeedback({ message: 'Voluntário inscrito no evento.', type: 'success' });
      setSelectedVolunteerId('');
      await loadEventVolunteers(eventId);
      await loadEvents();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
      setRegistrationLoading(false);
    }
  }

  async function unregisterVolunteer(eventId, volunteerId) {
    const event = events.find((item) => item.id === eventId);
    const volunteer = eventVolunteers.find((item) => item.id === volunteerId);
    setPendingAction({
      type: 'unregister',
      eventId,
      volunteerId,
      title: 'Confirmar remoção',
      message: `Remover ${volunteer?.name || 'este voluntário'} do evento ${event?.title || ''}?`,
    });
  }

  function openRegistrationModal(event) {
    if (event.status === 'active' && !event.is_registered) setPendingRegistration(event);
  }

  async function confirmRegistration() {
    if (!pendingRegistration || pendingRegistration.status !== 'active') return;
    setRegistrationLoading(true);
    try {
      await request(`/events/${pendingRegistration.id}/register`, { method: 'POST' });
      setFeedback({ message: 'Inscrição realizada com sucesso.', type: 'success' });
      setPendingRegistration(null);
      await loadEvents();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setRegistrationLoading(false);
    }
  }

  function openCancellationModal(event) {
    if (event.is_registered) setPendingCancellation(event);
  }

  async function confirmCancellation() {
    if (!pendingCancellation) return;
    setRegistrationLoading(true);
    try {
      await request(`/events/${pendingCancellation.id}/register`, { method: 'DELETE' });
      setFeedback({ message: 'Inscrição cancelada com sucesso.', type: 'success' });
      setPendingCancellation(null);
      await loadEvents();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setRegistrationLoading(false);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'max_volunteers' ? Number(value) : value }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      event_date: item.event_date,
      location: item.location,
      max_volunteers: item.max_volunteers,
      status: item.status,
    });
    setFormModalOpen(true);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormModalOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormModalOpen(false);
  }

  function cancelPendingAction() {
    const action = pendingAction;
    setPendingAction(null);
    if (action?.type === 'save') setFormModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    setFeedback({ message: '', type: 'error' });
    setFormModalOpen(false);
    setPendingAction({
      type: 'save',
      id: editingId,
      title: editingId ? 'Confirmar edição' : 'Confirmar cadastro',
      message: editingId ? `Salvar as alterações do evento ${form.title}?` : `Cadastrar o evento ${form.title}?`,
    });
  }

  async function confirmSave() {
    if (!pendingAction || pendingAction.type !== 'save') return;
    setActionLoading(true);
    try {
      await request(pendingAction.id ? `/events/${pendingAction.id}` : '/events', {
        method: pendingAction.id ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      setFeedback({ message: pendingAction.id ? 'Evento atualizado.' : 'Evento criado.', type: 'success' });
      setPendingAction(null);
      resetForm();
      await loadEvents();
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  function remove(id) {
    const event = events.find((item) => item.id === id);
    setPendingAction({
      type: 'delete',
      id,
      title: 'Confirmar exclusão',
      message: `Excluir o evento ${event?.title || ''}? As inscrições relacionadas também serão removidas.`,
    });
  }

  async function confirmDelete() {
    if (!pendingAction || !['delete', 'unregister'].includes(pendingAction.type)) return;
    setActionLoading(true);
    try {
      if (pendingAction.type === 'unregister') {
        await request(`/events/${pendingAction.eventId}/volunteers/${pendingAction.volunteerId}`, { method: 'DELETE' });
        setFeedback({ message: 'Inscrição removida.', type: 'success' });
        setPendingAction(null);
        await loadEventVolunteers(pendingAction.eventId);
        await loadEvents();
      } else {
        await request(`/events/${pendingAction.id}`, { method: 'DELETE' });
        setFeedback({ message: 'Evento excluído.', type: 'success' });
        setPendingAction(null);
        if (expandedEventId === pendingAction.id) setExpandedEventId(null);
        await loadEvents();
      }
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  function renderEnrollmentContent(item) {
    return (
      <>
        <div className="enrollment-heading">
          <div>
            <p className="eyebrow">PARTICIPANTES</p>
            <h3>Voluntários inscritos</h3>
          </div>
          <span className="muted">{eventVolunteers.length} inscritos</span>
        </div>
        {registrationLoading ? <Loading /> : null}
        {!registrationLoading && isAdmin && item.status === 'active' ? (
          <div className="registration-form">
            <select
              aria-label="Voluntário para inscrição"
              value={selectedVolunteerId}
              onChange={(event) => setSelectedVolunteerId(event.target.value)}
              disabled={
                eventVolunteers.length >= item.max_volunteers ||
                availableVolunteers.filter(
                  (volunteer) => !eventVolunteers.some((registered) => registered.id === volunteer.id),
                ).length === 0
              }
            >
              <option value="">
                {eventVolunteers.length >= item.max_volunteers
                  ? 'Evento lotado'
                  : availableVolunteers.filter(
                        (volunteer) => !eventVolunteers.some((registered) => registered.id === volunteer.id),
                      ).length === 0
                    ? 'Nenhum voluntário disponível'
                    : 'Selecione um voluntário'}
              </option>
              {availableVolunteers
                .filter((volunteer) => !eventVolunteers.some((registered) => registered.id === volunteer.id))
                .map((volunteer) => (
                  <option key={volunteer.id} value={volunteer.id}>
                    {volunteer.name} — {volunteer.email}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className="button button-small button-primary"
              onClick={() => registerVolunteer(item.id)}
              disabled={!selectedVolunteerId || eventVolunteers.length >= item.max_volunteers}
            >
              Inscrever
            </button>
          </div>
        ) : null}
        {!registrationLoading && isAdmin && registrationStatusMessages[item.status] ? (
          <p className="registration-warning">{registrationStatusMessages[item.status]}</p>
        ) : null}
        {!registrationLoading && eventVolunteers.length > 0 ? (
          <ul className="enrollment-list">
            {eventVolunteers.map((volunteer) => (
              <li key={volunteer.id}>
                <span>
                  <strong>{volunteer.name}</strong>
                  <small>{volunteer.email}</small>
                </span>
                {isAdmin ? (
                  <button
                    type="button"
                    className="button button-small button-danger"
                    onClick={() => unregisterVolunteer(item.id, volunteer.id)}
                    disabled={registrationLoading}
                  >
                    Remover
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {!registrationLoading && eventVolunteers.length === 0 ? (
          <p className="enrollment-empty">Nenhum voluntário inscrito neste evento.</p>
        ) : null}
      </>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">GESTÃO</p>
          <h1>Eventos sociais</h1>
          <p>Planeje e acompanhe as próximas ações.</p>
        </div>
        <div className="page-header-actions">
          <span className="count-pill">{events.length} eventos</span>
          {isAdmin ? (
            <button type="button" className="button button-primary" onClick={startCreate}>
              Novo evento
            </button>
          ) : null}
        </div>
      </header>
      <Feedback message={feedback.message} type={feedback.type} />
      {isAdmin && formModalOpen ? (
        <Modal
          eyebrow={editingId ? 'EDIÇÃO' : 'NOVO REGISTRO'}
          title={editingId ? 'Editar evento' : 'Cadastrar evento'}
          onClose={resetForm}
          className="form-modal"
        >
          <form className="modal-form" onSubmit={submitForm}>
            <div className="form-grid">
              <label>
                Título
                <input name="title" value={form.title} onChange={updateField} required minLength={3} />
              </label>
              <label>
                Data
                <input type="date" name="event_date" value={form.event_date} onChange={updateField} required />
              </label>
              <label className="wide">
                Descrição
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows="3"
                  required
                  minLength={5}
                />
              </label>
              <label>
                Local
                <input name="location" value={form.location} onChange={updateField} required />
              </label>
              <label>
                Limite de voluntários
                <input
                  type="number"
                  name="max_volunteers"
                  min="1"
                  value={form.max_volunteers}
                  onChange={updateField}
                  required
                />
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={updateField}>
                  <option value="active">Ativo</option>
                  <option value="finished">Finalizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="button button-secondary" type="button" onClick={resetForm}>
                Cancelar
              </button>
              <button className="button button-primary" type="submit">
                {editingId ? 'Salvar alterações' : 'Cadastrar evento'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {loading ? (
        <Loading />
      ) : (
        <section className="card-list">
          {events.map((item) => (
            <article className="data-card" key={item.id}>
              <div className="data-card-main">
                <div className="data-card-top">
                  <span className={`status status-${item.status}`}>{eventStatusLabels[item.status] || 'Ativo'}</span>
                  <span className="muted">{item.event_date}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="data-meta">
                  <span>⌖ {item.location}</span>
                  <span>
                    ◉ {item.volunteer_count}/{item.max_volunteers} voluntários
                  </span>
                </div>
                {!isAdmin && expandedEventId === item.id ? (
                  <section className="enrollment-panel" aria-label={`Inscrições de ${item.title}`}>
                    {renderEnrollmentContent(item)}
                  </section>
                ) : null}
              </div>
              {isAdmin ? (
                <div className="data-actions">
                  <button
                    type="button"
                    className="button button-small button-secondary"
                    onClick={() => toggleEventVolunteers(item.id)}
                    aria-expanded={expandedEventId === item.id}
                  >
                    {expandedEventId === item.id ? 'Fechar inscritos' : 'Inscritos'}
                  </button>
                  <button
                    type="button"
                    className="button button-small button-secondary"
                    onClick={() => startEdit(item)}
                  >
                    Editar
                  </button>
                  <button type="button" className="button button-small button-danger" onClick={() => remove(item.id)}>
                    Excluir
                  </button>
                </div>
              ) : isVolunteer ? (
                <div className="volunteer-registration-actions">
                  <div className="data-actions">
                    <button
                      type="button"
                      className="button button-small button-primary"
                      onClick={() => openRegistrationModal(item)}
                      disabled={Boolean(item.is_registered) || item.status !== 'active' || registrationLoading}
                    >
                      {item.is_registered
                        ? 'Inscrito'
                        : item.status === 'active'
                          ? 'Inscrever-se'
                          : 'Inscrição bloqueada'}
                    </button>
                    {item.is_registered ? (
                      <button
                        type="button"
                        className="button button-small button-danger"
                        onClick={() => openCancellationModal(item)}
                        disabled={registrationLoading}
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                  {!item.is_registered && registrationStatusMessages[item.status] ? (
                    <p className="registration-warning">{registrationStatusMessages[item.status]}</p>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-small button-secondary"
                  onClick={() => toggleEventVolunteers(item.id)}
                  aria-expanded={expandedEventId === item.id}
                >
                  {expandedEventId === item.id ? 'Fechar inscritos' : 'Ver inscritos'}
                </button>
              )}
            </article>
          ))}
          {events.length === 0 ? <div className="empty-state">Nenhum evento cadastrado.</div> : null}
        </section>
      )}
      {isAdmin && expandedEvent ? (
        <Modal
          eyebrow="PARTICIPANTES"
          title={`Inscritos: ${expandedEvent.title}`}
          onClose={() => toggleEventVolunteers(expandedEvent.id)}
          className="enrollment-modal"
        >
          <section
            className="enrollment-panel enrollment-modal-panel"
            aria-label={`Inscrições de ${expandedEvent.title}`}
          >
            {renderEnrollmentContent(expandedEvent)}
          </section>
        </Modal>
      ) : null}
      {pendingRegistration ? (
        <ConfirmationModal
          title="Confirmar inscrição?"
          message={
            <>
              Você deseja se inscrever no evento <strong>{pendingRegistration.title}</strong>?
            </>
          }
          onConfirm={confirmRegistration}
          onCancel={() => setPendingRegistration(null)}
          loading={registrationLoading}
        />
      ) : null}
      {pendingCancellation ? (
        <ConfirmationModal
          title="Cancelar inscrição?"
          message={
            <>
              Você deseja cancelar sua inscrição no evento <strong>{pendingCancellation.title}</strong>?
            </>
          }
          onConfirm={confirmCancellation}
          onCancel={() => setPendingCancellation(null)}
          loading={registrationLoading}
        />
      ) : null}
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
