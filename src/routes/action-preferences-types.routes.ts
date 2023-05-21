import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { actionPreferenceTypesController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Action preferences type controllers (route handlers).
 */

export const actionPreferencesTypeRouter: Router = Router();

actionPreferencesTypeRouter.get('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => actionPreferenceTypesController.getAll(...args), requestLoggerMiddleWare.logger);
