import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { availableSpecialityController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * Available speciality controllers (route handlers).
 */

export const availableSpecialityRouter: Router = Router();

/**
 * GET routes
 */
availableSpecialityRouter.get('/appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.getAppointments(...args), requestLoggerMiddleWare.logger);

/**
 * POST routes
 */
availableSpecialityRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.post(...args), requestLoggerMiddleWare.logger);
availableSpecialityRouter.post('/v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.postV1(...args), requestLoggerMiddleWare.logger);
availableSpecialityRouter.post('/create-doctor-assignments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.createDoctorAssignments(...args), requestLoggerMiddleWare.logger);
availableSpecialityRouter.post('/get-all', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.getAll(...args), requestLoggerMiddleWare.logger);
availableSpecialityRouter.post('/get-assignments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.getSpecialityAssignments(...args), requestLoggerMiddleWare.logger);
availableSpecialityRouter.post('/pre-updation-check', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.getPreCheckForUpdation(...args), requestLoggerMiddleWare.logger);

/**
 * PUT routes
 */
availableSpecialityRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.update(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
availableSpecialityRouter.put('/update-doctor-assignment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.updateDoctorAssignment(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);

/**
 * DELETE routes
 */
availableSpecialityRouter.delete('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableSpecialityController.delete(...args), requestLoggerMiddleWare.logger);
