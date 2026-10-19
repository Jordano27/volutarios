import * as eventService from '../services/eventService.js';

/**
 * Lista eventos com os filtros da query string.
 * @param {import('express').Request} req requisição HTTP com os filtros em query
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar a lista de eventos
 */
export async function list(req, res) {
  res.json({ data: await eventService.listEvents(req.query, req.user) });
}

/**
 * Busca um evento pelo ID.
 * @param {import('express').Request} req requisição HTTP com o ID em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o evento encontrado
 */
export async function getById(req, res) {
  res.json({ data: await eventService.getEvent(req.params.id, req.user) });
}

/**
 * Cadastra um novo evento.
 * @param {import('express').Request} req requisição HTTP com os dados do evento em body
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o evento criado
 */
export async function create(req, res) {
  res.status(201).json({ data: await eventService.createEvent(req.body) });
}

/**
 * Atualiza um evento existente.
 * @param {import('express').Request} req requisição HTTP com ID em params e campos em body
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar o evento atualizado
 */
export async function update(req, res) {
  res.json({ data: await eventService.updateEvent(req.params.id, req.body) });
}

/**
 * Exclui um evento.
 * @param {import('express').Request} req requisição HTTP com o ID em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após concluir a exclusão
 */
export async function remove(req, res) {
  await eventService.deleteEvent(req.params.id);
  res.status(204).send();
}

/**
 * Lista os voluntários inscritos no evento.
 * @param {import('express').Request} req requisição HTTP com o ID do evento em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após enviar os inscritos
 */
export async function listVolunteers(req, res) {
  res.json({ data: await eventService.listEventVolunteers(req.params.id) });
}

/**
 * Inscreve um voluntário em um evento.
 * @param {import('express').Request} req requisição HTTP com IDs do evento e voluntário em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após criar a inscrição
 */
export async function registerVolunteer(req, res) {
  await eventService.registerVolunteer(req.params.id, req.params.volunteerId);
  res.status(201).json({ message: 'Voluntário inscrito no evento.' });
}

/**
 * Inscreve o próprio voluntário autenticado em um evento.
 * @param {import('express').Request} req requisição com ID do evento em params e voluntário em user
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após criar a inscrição
 */
export async function registerSelf(req, res) {
  await eventService.registerVolunteer(req.params.id, req.user.volunteerId);
  res.status(201).json({ message: 'Voluntário inscrito no evento.' });
}

/**
 * Remove a inscrição do próprio voluntário autenticado.
 * @param {import('express').Request} req requisição com ID do evento e voluntário em user
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após cancelar a inscrição
 */
export async function unregisterSelf(req, res) {
  await eventService.unregisterVolunteer(req.params.id, req.user.volunteerId);
  res.status(204).send();
}

/**
 * Remove a inscrição de um voluntário.
 * @param {import('express').Request} req requisição HTTP com IDs do evento e voluntário em params
 * @param {import('express').Response} res resposta HTTP
 * @returns {Promise<void>} resolve após concluir a remoção
 */
export async function unregisterVolunteer(req, res) {
  await eventService.unregisterVolunteer(req.params.id, req.params.volunteerId);
  res.status(204).send();
}
