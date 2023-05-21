import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { colorCodeController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';

/**
 * Colot code controllers (route handlers).
 */

export const colorCodeRouter: Router = Router();

colorCodeRouter.put('/set-to-default', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => colorCodeController.setToDefault(...args), requestLoggerMiddleWare.logger);
colorCodeRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => colorCodeController.update(...args), requestLoggerMiddleWare.logger);
