import authService from '../services/authService.js';
import { successResponse } from '../responses/apiResponse.js';

class AuthController {
    register = (req, res) => {
        res.status(201).json(successResponse(authService.registerCustomer(req.body)));
    };

    login = (req, res) => {
        res.status(200).json(successResponse(authService.login(req.body)));
    };

    me = (req, res) => {
        res.status(200).json(successResponse(req.user));
    };

    logout = (req, res) => {
        authService.logout(req.authToken);
        res.status(200).json(successResponse({ mensaje: 'Sesión cerrada.' }));
    };
}

export default new AuthController();
