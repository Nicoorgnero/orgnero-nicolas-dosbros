import { randomUUID } from 'node:crypto';
import Servicio from '../models/Servicio.js';
import servicioRepository from '../repositories/servicioRepository.js';
import { BadRequestError, ConflictError, NotFoundError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

function validateServicio(data, current = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_SERVICE_DATA);
    }

    const allowedFields = ['nombre', 'descripcion', 'duracionMinutos', 'precio', 'activo'];
    if (Object.keys(data).some((field) => !allowedFields.includes(field))) {
        throw new BadRequestError(Messages.INVALID_SERVICE_DATA);
    }

    const value = (field, fallback) => field in data ? data[field] : fallback;
    const servicio = {
        nombre: value('nombre', current.nombre ?? ''),
        descripcion: value('descripcion', current.descripcion ?? ''),
        duracionMinutos: value('duracionMinutos', current.duracionMinutos ?? null),
        precio: value('precio', current.precio ?? null),
        activo: value('activo', current.activo ?? false)
    };

    if (typeof servicio.nombre !== 'string' || !servicio.nombre.trim()
        || typeof servicio.descripcion !== 'string'
        || typeof servicio.activo !== 'boolean'
        || (servicio.duracionMinutos !== null
            && (!Number.isInteger(Number(servicio.duracionMinutos)) || Number(servicio.duracionMinutos) <= 0))
        || (servicio.precio !== null
            && (!Number.isFinite(Number(servicio.precio)) || Number(servicio.precio) < 0))) {
        throw new BadRequestError(Messages.INVALID_SERVICE_DATA);
    }

    if (servicio.activo && !servicio.duracionMinutos) {
        throw new BadRequestError(Messages.SERVICE_NOT_BOOKABLE);
    }

    servicio.nombre = servicio.nombre.trim();
    servicio.descripcion = servicio.descripcion.trim();
    servicio.duracionMinutos = servicio.duracionMinutos === null
        ? null
        : Number(servicio.duracionMinutos);
    servicio.precio = servicio.precio === null ? null : Number(servicio.precio);

    return servicio;
}

class ServicioService {
    getAll({ includeInactive = false } = {}) {
        return servicioRepository.findAll({ includeInactive });
    }

    getById(id) {
        const servicio = servicioRepository.findById(id);
        if (!servicio) {
            throw new NotFoundError(Messages.SERVICE_NOT_FOUND);
        }
        return servicio;
    }

    create(data) {
        const servicioData = validateServicio(data);
        this.validateUniqueName(servicioData.nombre);
        const servicio = new Servicio(
            randomUUID(),
            servicioData.nombre,
            servicioData.descripcion,
            servicioData.duracionMinutos,
            servicioData.precio,
            servicioData.activo
        );
        return servicioRepository.create(servicio);
    }

    update(id, data) {
        const current = this.getById(id);
        const changes = validateServicio(data, current);
        this.validateUniqueName(changes.nombre, id);
        const updated = servicioRepository.update(id, changes);
        if (!updated) {
            throw new NotFoundError(Messages.SERVICE_NOT_FOUND);
        }
        return updated;
    }

    deactivate(id) {
        this.getById(id);
        return servicioRepository.update(id, { activo: false });
    }

    validateUniqueName(nombre, excludeId = null) {
        const alreadyExists = servicioRepository.findAll({ includeInactive: true })
            .some((item) => item.id !== excludeId
                && item.nombre.toLowerCase() === nombre.toLowerCase());
        if (alreadyExists) {
            throw new ConflictError('Ya existe un servicio con ese nombre.');
        }
    }
}

export default new ServicioService();
