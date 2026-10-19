import { pool } from '../config/database.js';

/**
 * Retorna indicadores resumidos para o dashboard.
 * @returns {Promise<{total_events: number, upcoming_events: number, active_volunteers: number, total_registrations: number}>} indicadores agregados
 */
export async function getDashboardSummary() {
  const [[summary]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM events) AS total_events,
      (SELECT COUNT(*) FROM events WHERE status = 'active') AS upcoming_events,
      (SELECT COUNT(*) FROM volunteers WHERE status = 'active') AS active_volunteers,
      (SELECT COUNT(*) FROM event_volunteers) AS total_registrations
  `);
  return summary;
}
