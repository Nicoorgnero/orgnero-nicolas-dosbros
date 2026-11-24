import { BadRequestError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

const requiredFields = ['fechaHoraInicio', 'barberoId', 'servicioId'];
const allowedFields = new Set([...requiredFields, 'observaciones']);

export function validateTurnoData(data, { partial = false } = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    const fields = Object.keys(data);
    if (fields.some((field) => !allowedFields.has(field))
        || (!partial && requiredFields.some((field) => !(field in data)))
        || (partial && fields.length === 0)) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    const validatedData = {};
    for (const field of ['barberoId', 'servicioId', 'observaciones']) {
        if (!(field in data)) {
            continue;
        }
        if (typeof data[field] !== 'string'
            || (field !== 'observaciones' && !data[field].trim())) {
            throw new BadRequestError(Messages.INVALID_TURNO_DATA);
        }
        validatedData[field] = data[field].trim();
    }

    if ('fechaHoraInicio' in data) {
        const timestamp = Date.parse(data.fechaHoraInicio);
        if (typeof data.fechaHoraInicio !== 'string' || !Number.isFinite(timestamp)) {
            throw new BadRequestError(Messages.INVALID_TURNO_DATA);
        }
        validatedData.fechaHoraInicio = new Date(timestamp).toISOString();
    }

    return validatedData;
}
