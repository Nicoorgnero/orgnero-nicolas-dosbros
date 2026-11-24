import businessService from '../services/businessService.js';
import { successResponse } from '../responses/apiResponse.js';

class BusinessController {
    getInfo = (req, res) => {
        res.status(200).json(successResponse(businessService.getInfo()));
    };
}

export default new BusinessController();
