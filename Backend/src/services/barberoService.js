import { randomUUID } from 'node:crypto';
import Barbero from '../models/Barbero.js';
import Usuario from '../models/Usuario.js';
import barberoRepository from '../repositories/barberoRepository.js';
import usuarioRepository from '../repositories/usuarioRepository.js';
import { createPasswordData } from '../utils/password.js';
import { validateAccountData } from './authService.js';
import { BadRequestError, ConflictError, NotFoundError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

class BarberoService {
    getActive() {
        return barberoRepository.findAll().map((barbero) => ({
            id: barbero.id,
            nombre: barbero.nombre,
            apellido: barbero.apellido
        }));
    }

    getAll({ includeInactive = false } = {}) {
        return barberoRepository.findAll({ includeInactive }).map((barbero) => ({
            id: barbero.id,
            nombre: barbero.nombre,
            apellido: barbero.apellido,
            email: barbero.email,
            telefono: barbero.telefono,
            activo: barbero.activo
        }));
    }

    getById(id) {
        const barbero = barberoRepository.findById(id);
        if (!barbero) {
            throw new NotFoundError(Messages.BARBER_NOT_FOUND);
        }
        return barbero;
    }

    create(data) {
        const account = validateAccountData(data);
        if (usuarioRepository.findByEmail(account.email)) {
            throw new ConflictError(Messages.EMAIL_IN_USE);
        }

        const barbero = new Barbero(
            randomUUID(),
            account.nombre,
            account.apellido,
            account.email,
            account.telefono
        );
        barbero.activo = true;
        barberoRepository.create(barbero);

        const credentials = createPasswordData(account.password);
        const usuario = new Usuario(
            randomUUID(),
            account.nombre,
            account.apellido,
            account.email,
            'barbero',
            credentials.passwordSalt,
            credentials.passwordHash,
            null,
            barbero.id
        );
        usuarioRepository.create(usuario);

        return this.getById(barbero.id);
    }

    update(id, data) {
        const current = this.getById(id);
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new BadRequestError(Messages.INVALID_BARBER_DATA);
        }

        const allowedFields = ['nombre', 'apellido', 'telefono', 'activo'];
        if (Object.keys(data).length === 0
            || Object.keys(data).some((field) => !allowedFields.includes(field))) {
            throw new BadRequestError(Messages.INVALID_BARBER_DATA);
        }

        const changes = {};
        for (const field of ['nombre', 'apellido', 'telefono']) {
            if (!(field in data)) {
                continue;
            }
            if (typeof data[field] !== 'string' || !data[field].trim()) {
                throw new BadRequestError(Messages.INVALID_BARBER_DATA);
            }
            changes[field] = data[field].trim();
        }

        if ('activo' in data) {
            if (typeof data.activo !== 'boolean') {
                throw new BadRequestError(Messages.INVALID_BARBER_DATA);
            }
            changes.activo = data.activo;
        }

        const updated = barberoRepository.update(id, changes);
        const usuario = usuarioRepository.findAll()
            .find((item) => item.barberoId === id);
        if (usuario && (changes.nombre || changes.apellido)) {
            usuarioRepository.update(usuario.id, {
                nombre: changes.nombre ?? current.nombre,
                apellido: changes.apellido ?? current.apellido
            });
        }
        return updated;
    }

    deactivate(id) {
        this.getById(id);
        return this.update(id, { activo: false });
    }
}

export default new BarberoService();
