import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { assignProviderTypesController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Assign Provider TypeRouter controllers (route handlers).
 */

export const assignProviderTypeRouter: Router = Router();

assignProviderTypeRouter.get('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => assignProviderTypesController.getAll(...args), requestLoggerMiddleWare.logger);
