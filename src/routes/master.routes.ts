import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { masterController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * User route handlers.
 */

export const masterRouter: Router = Router();

/**
 * POST routes
 */
masterRouter.post('/specialities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => masterController.getSpecialities(...args), requestLoggerMiddleWare.logger);
masterRouter.post('/facilities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => masterController.getFacilities(...args), requestLoggerMiddleWare.logger);
masterRouter.post('/doctors', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => masterController.getDoctors(...args), requestLoggerMiddleWare.logger);
