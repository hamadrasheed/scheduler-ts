import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { kioskController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Kiosk controllers (route handlers).
 */

export const kioskRouter: Router = Router();

kioskRouter.get('/get-patient-info', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => kioskController.getPatient(...args), requestLoggerMiddleWare.logger);
kioskRouter.post('/get-walk_in_patients', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => kioskController.getWalkInPatients(...args), requestLoggerMiddleWare.logger);
