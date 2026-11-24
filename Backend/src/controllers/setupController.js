import authService from '../services/authService.js';
import { successResponse } from '../responses/apiResponse.js';

class SetupController {
    getStatus = (req, res) => {
        res.status(200).json(successResponse(authService.getSetupStatus()));
    };

    createAdministrator = (req, res) => {
        res.status(201).json(successResponse(authService.setupAdministrator(req.body)));
    };
}

export default new SetupController();
