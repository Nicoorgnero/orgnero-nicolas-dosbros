import express from 'express';
import turnoRoutes from './routes/turnoRoutes.js';
import { Messages } from './enums/Messages.js';
import { NotFoundError } from './exceptions/AppError.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api/turnos', turnoRoutes);
app.use((req, res, next) => next(new NotFoundError(Messages.ROUTE_NOT_FOUND)));
app.use(errorHandler);

export default app;