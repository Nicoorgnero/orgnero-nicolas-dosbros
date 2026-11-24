import { randomUUID } from 'node:crypto';
import Turno from '../models/Turno.js';
import { Messages } from '../enums/Messages.js';
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError
} from '../exceptions/AppError.js';
import turnoRepository from '../repositories/turnoRepository.js';
import clienteRepository from '../repositories/clienteRepository.js';
import barberoRepository from '../repositories/barberoRepository.js';
import servicioRepository from '../repositories/servicioRepository.js';
import { validateTurnoData } from '../utils/validateTurnoData.js';

const timeZone = 'America/Argentina/Buenos_Aires';
const openMinute = 10 * 60;
const closeMinute = 20 * 60;
const activeStates = ['Confirmado', 'En curso'];
const editableStates = ['Pendiente', 'Confirmado'];
const allowedTransitions = {
    Pendiente: ['Confirmado', 'Cancelado'],
    Confirmado: ['En curso', 'Cancelado', 'No asistio'],
    'En curso': ['Finalizado']
};

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

function getParts(formatter, date) {
    return Object.fromEntries(formatter.formatToParts(date)
        .filter((part) => part.type !== 'literal')
        .map(({ type, value }) => [type, value]));
}

function getLocalDate(date) {
    const parts = getParts(dateFormatter, date);
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function getLocalTime(date) {
    const parts = getParts(timeFormatter, date);
    return {
        weekday: parts.weekday,
        minute: Number(parts.hour) * 60 + Number(parts.minute)
    };
}

function getWeekday(dateString) {
    const sample = new Date(`${dateString}T12:00:00-03:00`);
    return getParts(timeFormatter, sample).weekday;
}

function getBusinessDate(dateString, minute) {
    const hours = String(Math.floor(minute / 60)).padStart(2, '0');
    const minutes = String(minute % 60).padStart(2, '0');
    return new Date(`${dateString}T${hours}:${minutes}:00-03:00`);
}

function validateDateString(dateString) {
    if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new BadRequestError(Messages.INVALID_BOOKING_DATE);
    }

    const sample = new Date(`${dateString}T12:00:00-03:00`);
    if (!Number.isFinite(sample.getTime()) || getLocalDate(sample) !== dateString) {
        throw new BadRequestError(Messages.INVALID_BOOKING_DATE);
    }
}

function isOpenDay(dateString) {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(getWeekday(dateString));
}

class TurnoService {
    getAll(user) {
        if (user.rol === 'administrador') {
            return turnoRepository.findAll().sort(this.sortByDate).map((turno) => this.decorate(turno));
        }
        if (user.rol === 'barbero') {
            return turnoRepository.findByBarberoId(user.barberoId)
                .sort(this.sortByDate).map((turno) => this.decorate(turno));
        }
        if (user.rol === 'cliente') {
            return turnoRepository.findByClienteId(user.clienteId)
                .sort(this.sortByDate).map((turno) => this.decorate(turno));
        }
        throw new ForbiddenError(Messages.FORBIDDEN);
    }

    getById(id, user) {
        this.validateId(id);
        const turno = turnoRepository.findById(id);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }
        this.validateTurnoAccess(turno, user);
        return this.decorate(turno);
    }

    getAvailability({ fecha, servicioId, barberoId, turnoId }, user) {
        validateDateString(fecha);
        const servicio = this.getBookableService(servicioId);
        this.getBookableBarber(barberoId);
        const excludeId = turnoId ? this.getById(turnoId, user).id : null;

        if (!isOpenDay(fecha)) {
            return [];
        }

        const slots = [];
        for (let minute = openMinute; minute + servicio.duracionMinutos <= closeMinute;
            minute += servicio.duracionMinutos) {
            const start = getBusinessDate(fecha, minute);
            if (start <= new Date()
                || this.hasConflict(start, servicio.duracionMinutos, barberoId, excludeId)) {
                continue;
            }

            slots.push({
                fechaHoraInicio: start.toISOString(),
                hora: `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
            });
        }

        return slots;
    }

    create(data, user) {
        if (user.rol !== 'cliente' || !user.clienteId) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        const validatedData = validateTurnoData(data);
        if (!clienteRepository.findById(user.clienteId)) {
            throw new NotFoundError(Messages.CUSTOMER_NOT_FOUND);
        }

        const servicio = this.getBookableService(validatedData.servicioId);
        this.getBookableBarber(validatedData.barberoId);
        const start = new Date(validatedData.fechaHoraInicio);
        this.validateBusinessHours(start, servicio.duracionMinutos);
        this.validateAvailableSlot(start, servicio, validatedData.barberoId);

        const turno = new Turno(
            randomUUID(),
            start.toISOString(),
            'Pendiente',
            user.clienteId,
            validatedData.barberoId,
            servicio.id,
            validatedData.observaciones || '',
            servicio.duracionMinutos,
            servicio.nombre
        );
        return this.decorate(turnoRepository.create(turno));
    }

    update(id, data, user) {
        const current = this.getById(id, user);
        if (!['administrador', 'cliente'].includes(user.rol)) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        if (user.rol === 'cliente' && current.clienteId !== user.clienteId) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        this.validateEditable(current);

        const validatedData = validateTurnoData(data, { partial: true });
        const servicio = this.getBookableService(validatedData.servicioId || current.servicioId);
        const barberoId = validatedData.barberoId || current.barberoId;
        this.getBookableBarber(barberoId);
        const start = new Date(validatedData.fechaHoraInicio || current.fechaHoraInicio);
        this.validateBusinessHours(start, servicio.duracionMinutos);
        this.validateAvailableSlot(start, servicio, barberoId, current.id);

        return this.decorate(turnoRepository.update(id, {
            fechaHoraInicio: start.toISOString(),
            servicioId: servicio.id,
            servicioNombre: servicio.nombre,
            duracionMinutos: servicio.duracionMinutos,
            barberoId,
            observaciones: validatedData.observaciones ?? current.observaciones
        }));
    }

    cancel(id, user) {
        const turno = this.getById(id, user);
        this.validateEditable(turno);
        return this.decorate(turnoRepository.update(id, { estado: 'Cancelado' }));
    }

    changeStatus(id, estado, user) {
        const turno = this.getById(id, user);
        if (!['administrador', 'barbero'].includes(user.rol)
            || (user.rol === 'barbero' && turno.barberoId !== user.barberoId)) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }

        if (typeof estado !== 'string' || !allowedTransitions[turno.estado]?.includes(estado)) {
            throw new BadRequestError(Messages.INVALID_TURNO_STATE);
        }

        const start = new Date(turno.fechaHoraInicio);
        if (['En curso', 'Finalizado', 'No asistio'].includes(estado) && start > new Date()) {
            throw new BadRequestError('Ese estado solo se puede registrar desde el horario del turno.');
        }

        if (estado === 'Finalizado'
            && start.getTime() + turno.duracionMinutos * 60 * 1000 > Date.now()) {
            throw new BadRequestError('El turno todavía no cumplió la duración configurada del servicio.');
        }

        if (estado === 'Confirmado') {
            const servicio = this.getBookableService(turno.servicioId);
            this.validateBusinessHours(start, servicio.duracionMinutos);
            this.validateAvailableSlot(start, servicio, turno.barberoId, turno.id);
        }

        const changes = { estado };
        if (estado === 'Confirmado') {
            const servicio = this.getBookableService(turno.servicioId);
            changes.duracionMinutos = servicio.duracionMinutos;
            changes.servicioNombre = servicio.nombre;
        }
        return this.decorate(turnoRepository.update(id, changes));
    }

    getBookableService(id) {
        const servicio = servicioRepository.findById(id);
        if (!servicio) {
            throw new NotFoundError(Messages.SERVICE_NOT_FOUND);
        }
        if (!servicio.activo || !Number.isInteger(servicio.duracionMinutos)
            || servicio.duracionMinutos <= 0) {
            throw new BadRequestError(Messages.SERVICE_NOT_BOOKABLE);
        }
        return servicio;
    }

    getBookableBarber(id) {
        const barbero = barberoRepository.findById(id);
        if (!barbero) {
            throw new NotFoundError(Messages.BARBER_NOT_FOUND);
        }
        if (!barbero.activo) {
            throw new BadRequestError(Messages.BARBER_NOT_BOOKABLE);
        }
        return barbero;
    }

    validateBusinessHours(start, duration) {
        if (!Number.isFinite(start.getTime()) || start <= new Date()) {
            throw new BadRequestError(Messages.INVALID_BOOKING_DATE);
        }

        const { weekday, minute } = getLocalTime(start);
        if (!['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(weekday)
            || minute < openMinute || minute + duration > closeMinute) {
            throw new BadRequestError(Messages.OUTSIDE_BUSINESS_HOURS);
        }
    }

    validateAvailableSlot(start, servicio, barberoId, excludeId = null) {
        const localDate = getLocalDate(start);
        const minute = getLocalTime(start).minute;
        if ((minute - openMinute) % servicio.duracionMinutos !== 0
            || this.hasConflict(start, servicio.duracionMinutos, barberoId, excludeId)) {
            throw new ConflictError(Messages.SLOT_NOT_AVAILABLE);
        }
        if (localDate !== getLocalDate(new Date(start.getTime()))) {
            throw new BadRequestError(Messages.INVALID_BOOKING_DATE);
        }
    }

    hasConflict(start, duration, barberoId, excludeId = null) {
        const end = start.getTime() + duration * 60 * 1000;
        return turnoRepository.findByBarberoId(barberoId)
            .filter((turno) => turno.id !== excludeId && activeStates.includes(turno.estado))
            .some((turno) => {
                const currentStart = new Date(turno.fechaHoraInicio).getTime();
                const currentService = servicioRepository.findById(turno.servicioId);
                const currentDuration = turno.duracionMinutos
                    || currentService?.duracionMinutos;
                if (!currentDuration || !Number.isFinite(currentStart)) {
                    return false;
                }
                const currentEnd = currentStart + currentDuration * 60 * 1000;
                return start.getTime() < currentEnd && end > currentStart;
            });
    }

    validateEditable(turno) {
        if (!editableStates.includes(turno.estado)
            || new Date(turno.fechaHoraInicio) <= new Date()) {
            throw new ConflictError(Messages.TURNO_NOT_EDITABLE);
        }
    }

    decorate(turno) {
        const cliente = clienteRepository.findById(turno.clienteId);
        const barbero = barberoRepository.findById(turno.barberoId);
        const servicio = servicioRepository.findById(turno.servicioId);
        return {
            ...turno,
            clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : turno.clienteId,
            barberoNombre: barbero ? `${barbero.nombre} ${barbero.apellido}` : turno.barberoId,
            servicioNombre: turno.servicioNombre || servicio?.nombre || turno.servicioId
        };
    }

    validateTurnoAccess(turno, user) {
        if (user.rol === 'administrador'
            || (user.rol === 'cliente' && turno.clienteId === user.clienteId)
            || (user.rol === 'barbero' && turno.barberoId === user.barberoId)) {
            return;
        }
        throw new ForbiddenError(Messages.FORBIDDEN);
    }

    validateId(id) {
        if (typeof id !== 'string' || !id.trim()) {
            throw new BadRequestError(Messages.INVALID_TURNO_ID);
        }
    }

    sortByDate(first, second) {
        return new Date(first.fechaHoraInicio) - new Date(second.fechaHoraInicio);
    }
}

export default new TurnoService();
