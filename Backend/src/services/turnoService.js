import { randomUUID } from 'node:crypto';
import Turno from '../models/Turno.js';
import { Messages } from '../enums/Messages.js';
import { BadRequestError, NotFoundError } from '../exceptions/AppError.js';
import turnoRepository from '../repositories/turnoRepository.js';
import { validateTurnoData } from '../utils/validateTurnoData.js';

class TurnoService {
    getAll() {
        return turnoRepository.findAll();
    }

    getById(id) {
        this.validateId(id);
        const turno = turnoRepository.findById(id);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }

        return turno;
    }

    create(data) {
        const validatedData = validateTurnoData(data);
        const turno = new Turno(
            randomUUID(),
            validatedData.fechaHoraInicio,
            validatedData.estado,
            validatedData.clienteId,
            validatedData.barberoId,
            validatedData.servicioId,
            validatedData.observaciones ?? ''
        );

        return turnoRepository.create(turno);
    }

    update(id, data) {
        this.validateId(id);
        const validatedData = validateTurnoData(data, { partial: true });
        const turno = turnoRepository.update(id, validatedData);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }

        return turno;
    }

    delete(id) {
        this.validateId(id);
        const turno = turnoRepository.deleteById(id);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }

        return turno;
    }

    validateId(id) {
        if (typeof id !== 'string' || !id.trim()) {
            throw new BadRequestError(Messages.INVALID_TURNO_ID);
        }
    }
}

export default new TurnoService();