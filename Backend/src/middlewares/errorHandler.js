import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/apiResponse.js';

export default function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json(errorResponse(error.message));
    }

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json(errorResponse(Messages.INVALID_JSON));
    }

    return res.status(500).json(errorResponse(Messages.INTERNAL_SERVER_ERROR));
}