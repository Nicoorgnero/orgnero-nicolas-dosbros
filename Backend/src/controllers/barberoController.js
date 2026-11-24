import barberoService from '../services/barberoService.js';
import { successResponse } from '../responses/apiResponse.js';

class BarberoController {
    getActive = (req, res) => {
        res.status(200).json(successResponse(barberoService.getActive()));
    };

    getAll = (req, res) => {
        res.status(200).json(successResponse(barberoService.getAll({ includeInactive: true })));
    };

    create = (req, res) => {
        res.status(201).json(successResponse(barberoService.create(req.body)));
    };

    update = (req, res) => {
        res.status(200).json(successResponse(barberoService.update(req.params.id, req.body)));
    };

    deactivate = (req, res) => {
        res.status(200).json(successResponse(barberoService.deactivate(req.params.id)));
    };
}

export default new BarberoController();
