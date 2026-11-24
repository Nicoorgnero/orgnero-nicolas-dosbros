import { randomBytes, randomUUID } from 'node:crypto';
import Cliente from '../models/Cliente.js';
import Usuario from '../models/Usuario.js';
import clienteRepository from '../repositories/clienteRepository.js';
import usuarioRepository from '../repositories/usuarioRepository.js';
import { createPasswordData, passwordMatches } from '../utils/password.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

const sessions = new Map();
const sessionDuration = 12 * 60 * 60 * 1000;

function validateAccount(data, { requirePhone = false } = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_ACCOUNT_DATA);
    }

    const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : '';
    const apellido = typeof data.apellido === 'string' ? data.apellido.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    const telefono = typeof data.telefono === 'string' ? data.telefono.trim() : '';
    const password = typeof data.password === 'string' ? data.password : '';

    if (!nombre || !apellido || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || password.length < 8 || (requirePhone && !telefono)) {
        throw new BadRequestError(Messages.INVALID_ACCOUNT_DATA);
    }

    return { nombre, apellido, email, telefono, password };
}

function safeUser(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        clienteId: usuario.clienteId,
        barberoId: usuario.barberoId
    };
}

class AuthService {
    getSetupStatus() {
        return { requiereAdministrador: !usuarioRepository.findAdministrator() };
    }

    setupAdministrator(data) {
        if (usuarioRepository.findAdministrator()) {
            throw new ConflictError(Messages.ADMIN_ALREADY_CONFIGURED);
        }

        const account = validateAccount(data);
        if (usuarioRepository.findByEmail(account.email)) {
            throw new ConflictError(Messages.EMAIL_IN_USE);
        }

        const credentials = createPasswordData(account.password);
        const usuario = new Usuario(
            randomUUID(),
            account.nombre,
            account.apellido,
            account.email,
            'administrador',
            credentials.passwordSalt,
            credentials.passwordHash
        );

        usuarioRepository.create(usuario);
        return this.createSession(usuario);
    }

    registerCustomer(data) {
        const account = validateAccount(data);
        if (usuarioRepository.findByEmail(account.email)) {
            throw new ConflictError(Messages.EMAIL_IN_USE);
        }

        const cliente = new Cliente(
            randomUUID(),
            account.nombre,
            account.apellido,
            account.email,
            account.telefono
        );
        clienteRepository.create(cliente);

        const credentials = createPasswordData(account.password);
        const usuario = new Usuario(
            randomUUID(),
            account.nombre,
            account.apellido,
            account.email,
            'cliente',
            credentials.passwordSalt,
            credentials.passwordHash,
            cliente.id
        );
        usuarioRepository.create(usuario);

        return this.createSession(usuario);
    }

    login(data) {
        if (!data || typeof data.email !== 'string' || typeof data.password !== 'string') {
            throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        }

        const usuario = usuarioRepository.findByEmail(data.email.trim().toLowerCase());
        if (!usuario || !passwordMatches(data.password, usuario.passwordSalt, usuario.passwordHash)) {
            throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        }

        return this.createSession(usuario);
    }

    getUser(token) {
        const session = sessions.get(token);
        if (!session || session.expiresAt <= Date.now()) {
            sessions.delete(token);
            return null;
        }

        const usuario = usuarioRepository.findById(session.userId);
        return usuario ? safeUser(usuario) : null;
    }

    logout(token) {
        sessions.delete(token);
    }

    createSession(usuario) {
        const token = randomBytes(32).toString('hex');
        sessions.set(token, {
            userId: usuario.id,
            expiresAt: Date.now() + sessionDuration
        });

        return { token, usuario: safeUser(usuario) };
    }
}

export const validateAccountData = validateAccount;
export const getSafeUser = safeUser;
export default new AuthService();
