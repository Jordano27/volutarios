const statuses = ['active', 'inactive'];

export function createVolunteerSchema(body = {}) {
  const errors = [];
  if (typeof body.name !== 'string' || body.name.trim().length < 3)
    errors.push({ field: 'name', message: 'O nome deve ter pelo menos 3 caracteres.' });
  if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email))
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  if (typeof body.phone !== 'string' || body.phone.trim().length < 8)
    errors.push({ field: 'phone', message: 'Informe um telefone válido.' });
  if (typeof body.password !== 'string' || body.password.length < 6)
    errors.push({ field: 'password', message: 'A senha deve ter pelo menos 6 caracteres.' });
  if (body.status !== undefined && !statuses.includes(body.status))
    errors.push({ field: 'status', message: 'Status de voluntário inválido.' });
  return errors;
}

export function updateVolunteerSchema(body = {}) {
  const errors = [];
  const allowed = ['name', 'email', 'phone', 'status'];
  if (!allowed.some((field) => body[field] !== undefined))
    errors.push({ field: 'body', message: 'Informe ao menos um campo para atualização.' });
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 3))
    errors.push({ field: 'name', message: 'O nome deve ter pelo menos 3 caracteres.' });
  if (body.email !== undefined && (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)))
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  if (body.phone !== undefined && (typeof body.phone !== 'string' || body.phone.trim().length < 8))
    errors.push({ field: 'phone', message: 'Informe um telefone válido.' });
  if (body.password !== undefined)
    errors.push({ field: 'password', message: 'A senha não pode ser alterada pelo administrador.' });
  if (body.status !== undefined && !statuses.includes(body.status))
    errors.push({ field: 'status', message: 'Status de voluntário inválido.' });
  return errors;
}

export function updateOwnVolunteerSchema(body = {}) {
  const errors = [];
  const allowed = ['name', 'email', 'phone', 'password'];
  if (!allowed.some((field) => body[field] !== undefined))
    errors.push({ field: 'body', message: 'Informe ao menos um campo para atualização.' });
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 3))
    errors.push({ field: 'name', message: 'O nome deve ter pelo menos 3 caracteres.' });
  if (body.email !== undefined && (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)))
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  if (body.phone !== undefined && (typeof body.phone !== 'string' || body.phone.trim().length < 8))
    errors.push({ field: 'phone', message: 'Informe um telefone válido.' });
  if (body.password !== undefined && (typeof body.password !== 'string' || body.password.length < 6))
    errors.push({ field: 'password', message: 'A senha deve ter pelo menos 6 caracteres.' });
  return errors;
}

export function volunteerQuerySchema(query = {}) {
  if (query.status !== undefined && !statuses.includes(query.status))
    return [{ field: 'status', message: 'Status de voluntário inválido.' }];
  return [];
}
