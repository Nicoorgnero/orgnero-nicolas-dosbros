import turnoService from '../services/turnoService.js';
import { successResponse } from '../responses/apiResponse.js';

class TurnoController {
    getAll = (req, res) => {
        res.status(200).json(successResponse(turnoService.getAll(req.user)));
    };

    getById = (req, res) => {
        res.status(200).json(successResponse(turnoService.getById(req.params.id, req.user)));
    };

    getAvailability = (req, res) => {
        res.status(200).json(successResponse(turnoService.getAvailability(req.query, req.user)));
    };

    create = (req, res) => {
        res.status(201).json(successResponse(turnoService.create(req.body, req.user)));
    };

    update = (req, res) => {
        res.status(200).json(successResponse(turnoService.update(req.params.id, req.body, req.user)));
    };

    cancel = (req, res) => {
        res.status(200).json(successResponse(turnoService.cancel(req.params.id, req.user)));
    };

    changeStatus = (req, res) => {
        res.status(200).json(successResponse(
            turnoService.changeStatus(req.params.id, req.body?.estado, req.user)
        ));
    };
}

export default new TurnoController();
