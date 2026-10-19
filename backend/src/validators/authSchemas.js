export function loginSchema(body = {}) {
  const errors = [];
  if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email))
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  if (typeof body.password !== 'string' || body.password.length < 6)
    errors.push({ field: 'password', message: 'A senha deve ter pelo menos 6 caracteres.' });
  return errors;
}
