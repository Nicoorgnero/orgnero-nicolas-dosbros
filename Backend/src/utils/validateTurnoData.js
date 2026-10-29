import { BadRequestError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

const requiredFields = ['fechaHoraInicio', 'estado', 'clienteId', 'barberoId', 'servicioId'];
const stringFields = ['estado', 'clienteId', 'barberoId', 'servicioId', 'observaciones'];
const allowedFields = new Set([...requiredFields, 'observaciones']);

export function validateTurnoData(data, { partial = false } = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    const hasUnknownFields = Object.keys(data).some((field) => !allowedFields.has(field));
    if (hasUnknownFields) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    if (!partial && requiredFields.some((field) => !(field in data))) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    if (partial && Object.keys(data).length === 0) {
        throw new BadRequestError(Messages.INVALID_TURNO_DATA);
    }

    const validatedData = {};

    for (const field of stringFields) {
        if (!(field in data)) {
            continue;
        }

        if (typeof data[field] !== 'string' || (field !== 'observaciones' && !data[field].trim())) {
            throw new BadRequestError(Messages.INVALID_TURNO_DATA);
        }

        validatedData[field] = data[field].trim();
    }

    if ('fechaHoraInicio' in data) {
        if (typeof data.fechaHoraInicio !== 'string' || !Number.isFinite(Date.parse(data.fechaHoraInicio))) {
            throw new BadRequestError(Messages.INVALID_TURNO_DATA);
        }

        validatedData.fechaHoraInicio = new Date(data.fechaHoraInicio).toISOString();
    }

    return validatedData;
}