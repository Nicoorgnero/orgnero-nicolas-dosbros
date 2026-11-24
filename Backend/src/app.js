import express from 'express';
import turnoRoutes from './routes/turnoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import setupRoutes from './routes/setupRoutes.js';
import servicioRoutes from './routes/servicioRoutes.js';
import barberoRoutes from './routes/barberoRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import { Messages } from './enums/Messages.js';
import { NotFoundError } from './exceptions/AppError.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/negocio', businessRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/barberos', barberoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use((req, res, next) => next(new NotFoundError(Messages.ROUTE_NOT_FOUND)));
app.use(errorHandler);

export default app;
