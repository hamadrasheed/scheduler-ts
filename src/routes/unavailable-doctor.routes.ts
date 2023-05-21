import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { unAvailableDoctorController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * Unavailable doctor controllers (route handlers).
 */

export const unAvailableDoctorRouter: Router = Router();

/** POST */
unAvailableDoctorRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorController.post(...args), requestLoggerMiddleWare.logger);
unAvailableDoctorRouter.post('/appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorController.getAppointments(...args), requestLoggerMiddleWare.logger);

/** PUT */
unAvailableDoctorRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorController.put(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);

/** DELETE */
unAvailableDoctorRouter.delete('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => unAvailableDoctorController.delete(...args), requestLoggerMiddleWare.logger);
