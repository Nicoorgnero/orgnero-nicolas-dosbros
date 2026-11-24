import servicioService from '../services/servicioService.js';
import { successResponse } from '../responses/apiResponse.js';

class ServicioController {
    getCatalog = (req, res) => {
        res.status(200).json(successResponse(servicioService.getAll({ includeInactive: true })));
    };

    getAll = (req, res) => {
        res.status(200).json(successResponse(servicioService.getAll({ includeInactive: true })));
    };

    create = (req, res) => {
        res.status(201).json(successResponse(servicioService.create(req.body)));
    };

    update = (req, res) => {
        res.status(200).json(successResponse(servicioService.update(req.params.id, req.body)));
    };

    deactivate = (req, res) => {
        res.status(200).json(successResponse(servicioService.deactivate(req.params.id)));
    };
}

export default new ServicioController();
