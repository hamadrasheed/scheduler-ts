import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { appointmentStatusController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Appointment status controllers (route handlers).
 */

export const appointmentStatusRouter: Router = Router();

appointmentStatusRouter.get('/get-appointment-status', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentStatusController.getAppointmentStatus(...args), requestLoggerMiddleWare.logger);
