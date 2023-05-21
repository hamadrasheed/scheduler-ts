import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { appointmentTypeController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Appointment types controllers (route handlers).
 */

export const appointmentTypeRouter: Router = Router();

appointmentTypeRouter.get('/get-appointment-types', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentTypeController.getAppointmentTypes(...args), requestLoggerMiddleWare.logger);
