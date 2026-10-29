class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace?.(this, new.target);
    }
}

export class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

export default AppError;