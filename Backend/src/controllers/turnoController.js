import turnoService from '../services/turnoService.js';
import { successResponse } from '../responses/apiResponse.js';

class TurnoController {
    getAll = (req, res) => {
        res.status(200).json(successResponse(turnoService.getAll()));
    };

    getById = (req, res) => {
        res.status(200).json(successResponse(turnoService.getById(req.params.id)));
    };

    create = (req, res) => {
        res.status(201).json(successResponse(turnoService.create(req.body)));
    };

    update = (req, res) => {
        res.status(200).json(successResponse(turnoService.update(req.params.id, req.body)));
    };

    delete = (req, res) => {
        res.status(200).json(successResponse(turnoService.delete(req.params.id)));
    };
}

export default new TurnoController();