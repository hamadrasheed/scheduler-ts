import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { appointmentCancellationCommentController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Appointment cancellation comment controllers (route handlers).
 */

export const appointmentCancellationCommentRouter: Router = Router();

appointmentCancellationCommentRouter.get('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentCancellationCommentController.getAll(...args), requestLoggerMiddleWare.logger);
