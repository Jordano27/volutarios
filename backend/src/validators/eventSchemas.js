const statuses = ['active', 'finished', 'cancelled'];

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function createEventSchema(body = {}) {
  const errors = [];
  if (typeof body.title !== 'string' || body.title.trim().length < 3)
    errors.push({ field: 'title', message: 'O título deve ter pelo menos 3 caracteres.' });
  if (typeof body.description !== 'string' || body.description.trim().length < 5)
    errors.push({ field: 'description', message: 'A descrição deve ter pelo menos 5 caracteres.' });
  if (!validDate(body.event_date))
    errors.push({ field: 'event_date', message: 'Use uma data válida no formato AAAA-MM-DD.' });
  if (typeof body.location !== 'string' || body.location.trim().length < 3)
    errors.push({ field: 'location', message: 'Informe o local do evento.' });
  if (!Number.isInteger(body.max_volunteers) || body.max_volunteers < 1)
    errors.push({ field: 'max_volunteers', message: 'O limite deve ser um inteiro maior que zero.' });
  if (body.status !== undefined && !statuses.includes(body.status))
    errors.push({ field: 'status', message: 'Status de evento inválido.' });
  return errors;
}

export function updateEventSchema(body = {}) {
  const errors = [];
  const allowed = ['title', 'description', 'event_date', 'location', 'max_volunteers', 'status'];
  if (!allowed.some((field) => body[field] !== undefined))
    errors.push({ field: 'body', message: 'Informe ao menos um campo para atualização.' });
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length < 3))
    errors.push({ field: 'title', message: 'O título deve ter pelo menos 3 caracteres.' });
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.trim().length < 5))
    errors.push({ field: 'description', message: 'A descrição deve ter pelo menos 5 caracteres.' });
  if (body.event_date !== undefined && !validDate(body.event_date))
    errors.push({ field: 'event_date', message: 'Use uma data válida no formato AAAA-MM-DD.' });
  if (body.location !== undefined && (typeof body.location !== 'string' || body.location.trim().length < 3))
    errors.push({ field: 'location', message: 'Informe o local do evento.' });
  if (body.max_volunteers !== undefined && (!Number.isInteger(body.max_volunteers) || body.max_volunteers < 1))
    errors.push({ field: 'max_volunteers', message: 'O limite deve ser um inteiro maior que zero.' });
  if (body.status !== undefined && !statuses.includes(body.status))
    errors.push({ field: 'status', message: 'Status de evento inválido.' });
  return errors;
}

export function eventQuerySchema(query = {}) {
  const errors = [];
  if (query.status !== undefined && !statuses.includes(query.status))
    errors.push({ field: 'status', message: 'Status de evento inválido.' });
  if (query.from !== undefined && !validDate(query.from))
    errors.push({ field: 'from', message: 'A data inicial é inválida.' });
  if (query.to !== undefined && !validDate(query.to)) errors.push({ field: 'to', message: 'A data final é inválida.' });
  return errors;
}
