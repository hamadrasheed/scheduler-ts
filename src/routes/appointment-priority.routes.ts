import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { appointmentPriorityController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Appointment priority controllers (route handlers).
 */

export const appointmentPriorityRouter: Router = Router();

appointmentPriorityRouter.get('/get-appointment-priority', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentPriorityController.getAppointmentPriority(...args), requestLoggerMiddleWare.logger);
