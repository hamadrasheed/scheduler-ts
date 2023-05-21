import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { actionPreferencesController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Action preference controllers (route handlers).
 */

export const actionPreferencesRouter: Router = Router();

actionPreferencesRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => actionPreferencesController.post(...args), requestLoggerMiddleWare.logger);
actionPreferencesRouter.get('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => actionPreferencesController.get(...args), requestLoggerMiddleWare.logger);
actionPreferencesRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => actionPreferencesController.put(...args), requestLoggerMiddleWare.logger);
