import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { unAvailableDoctorNotificationController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Unavailable doctor notification controllers (route handlers).
 */

export const unAvailableDoctorNotificationRouter: Router = Router();

unAvailableDoctorNotificationRouter.post('/get-all', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorNotificationController.getAll(...args), requestLoggerMiddleWare.logger);
unAvailableDoctorNotificationRouter.post('/detail', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorNotificationController.details(...args), requestLoggerMiddleWare.logger);
