import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { pool } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import { openapiDocument } from './config/swagger.js';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'voluntariado-ifrs-api' });
  } catch (error) {
    next(error);
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/events', eventRoutes);
app.use('/volunteers', volunteerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
