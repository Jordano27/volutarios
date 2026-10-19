import * as eventModel from '../models/eventModel.js';
import { AppError } from '../utils/AppError.js';

/**
 * Normaliza os campos textuais de um evento antes da persistência.
 * @param {Object} data dados recebidos para o evento
 * @returns {Object} dados com textos sem espaços excedentes
 */
function normalizeEvent(data) {
  return {
    ...data,
    title: data.title?.trim(),
    description: data.description?.trim(),
    location: data.location?.trim(),
  };
}

/**
 * Lista eventos com os filtros enviados pela API.
 * @param {Object} [filters={}] filtros de busca e período
 * @param {Object} [viewer={}] usuário autenticado que consulta os eventos
 * @returns {Promise<Array<Object>>} eventos encontrados
 */
export async function listEvents(filters, viewer) {
  return eventModel.findAllEvents(filters, viewer);
}

/**
 * Busca um evento ou informa 404.
 * @param {number|string} id identificador do evento
 * @param {Object} [viewer={}] usuário autenticado que consulta o evento
 * @returns {Promise<Object>} evento encontrado
 * @throws {AppError} quando o evento não existe
 */
export async function getEvent(id, viewer) {
  const event = await eventModel.findEventById(id, viewer);
  if (!event) throw new AppError('Evento não encontrado.', 404);
  return event;
}

/**
 * Cria um evento.
 * @param {Object} data dados validados do evento
 * @returns {Promise<Object>} evento criado
 */
export async function createEvent(data) {
  return eventModel.createEvent(normalizeEvent(data));
}

/**
 * Atualiza um evento sem permitir capacidade inferior às inscrições existentes.
 * @param {number|string} id identificador do evento
 * @param {Object} data campos validados para atualização
 * @returns {Promise<Object>} evento atualizado
 * @throws {AppError} quando a capacidade informada é menor que as inscrições atuais
 */
export async function updateEvent(id, data) {
  const current = await getEvent(id);
  const normalized = normalizeEvent(data);
  if (normalized.max_volunteers !== undefined && normalized.max_volunteers < current.volunteer_count) {
    throw new AppError('O limite não pode ser menor que o número de voluntários já inscritos.', 422);
  }
  return eventModel.updateEvent(id, normalized);
}

/**
 * Exclui um evento.
 * @param {number|string} id identificador do evento
 * @returns {Promise<void>} resolve após excluir o evento
 * @throws {AppError} quando o evento não existe
 */
export async function deleteEvent(id) {
  await getEvent(id);
  await eventModel.deleteEvent(id);
}

/**
 * Lista inscrições de um evento.
 * @param {number|string} id identificador do evento
 * @returns {Promise<Array<Object>>} voluntários inscritos
 * @throws {AppError} quando o evento não existe
 */
export async function listEventVolunteers(id) {
  await getEvent(id);
  return eventModel.findEventVolunteers(id);
}

/**
 * Inscreve voluntário respeitando capacidade e status ativo.
 * @param {number|string} eventId identificador do evento
 * @param {number|string} volunteerId identificador do voluntário
 * @returns {Promise<void>} resolve após criar a inscrição
 * @throws {AppError} quando evento, voluntário ou capacidade são inválidos
 */
export async function registerVolunteer(eventId, volunteerId) {
  const result = await eventModel.registerVolunteer(eventId, volunteerId);
  if (result.type === 'event-not-found') throw new AppError('Evento não encontrado.', 404);
  if (result.type === 'event-closed') throw new AppError('As inscrições estão encerradas para este evento.', 422);
  if (result.type === 'volunteer-not-found') throw new AppError('Voluntário ativo não encontrado.', 404);
  if (result.type === 'capacity') throw new AppError('O evento atingiu o limite máximo de voluntários.', 422);
}

/**
 * Remove uma inscrição.
 * @param {number|string} eventId identificador do evento
 * @param {number|string} volunteerId identificador do voluntário
 * @returns {Promise<void>} resolve após remover a inscrição
 * @throws {AppError} quando a inscrição ou o evento não existem
 */
export async function unregisterVolunteer(eventId, volunteerId) {
  await getEvent(eventId);
  const removed = await eventModel.unregisterVolunteer(eventId, volunteerId);
  if (!removed) throw new AppError('Inscrição não encontrada.', 404);
}
