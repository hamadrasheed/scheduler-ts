import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { doctorInstructionForFacilityLocationsController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Doctor instruction controllers (route handlers).
 */

export const doctorInstructionRouter: Router = Router();

doctorInstructionRouter.post('/get', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => doctorInstructionForFacilityLocationsController.get(...args), requestLoggerMiddleWare.logger);
doctorInstructionRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => doctorInstructionForFacilityLocationsController.post(...args), requestLoggerMiddleWare.logger);
doctorInstructionRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => doctorInstructionForFacilityLocationsController.put(...args), requestLoggerMiddleWare.logger);
