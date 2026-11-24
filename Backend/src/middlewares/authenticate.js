import authService from '../services/authService.js';
import { ForbiddenError, UnauthorizedError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

export function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];
    const user = token ? authService.getUser(token) : null;

    if (!user) {
        return next(new UnauthorizedError(Messages.UNAUTHORIZED));
    }

    req.user = user;
    req.authToken = token;
    return next();
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return next(new ForbiddenError(Messages.FORBIDDEN));
        }
        return next();
    };
}
