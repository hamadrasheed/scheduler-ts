import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { userController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * User route handlers.
 */

export const userRouter: Router = Router();

/**
 * GET routes
 */
userRouter.get('/get-doctor-detail', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getDoctorsDetail(...args), requestLoggerMiddleWare.logger);

/**
 * POST routes
 */
userRouter.post('/get-doctors-info', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getDoctorsInfo(...args), requestLoggerMiddleWare.logger);
userRouter.post('/get-doctors-info-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getDoctorsInfoV1(...args), requestLoggerMiddleWare.logger);
userRouter.post('/get-user-info-by-facilities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getUserInfoByFacilities(...args), requestLoggerMiddleWare.logger);
userRouter.post('/get-user-info-by-specialities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getUserInfoBySpecialities(...args), requestLoggerMiddleWare.logger);
userRouter.post('/get-user-info-by-specialities-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getUserInfoBySpecialitiesV1(...args), requestLoggerMiddleWare.logger);
userRouter.post('/delete-all-assignment-and-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.deleteAllAssignmentAndAppointment(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
userRouter.post('/max-min-time-of-facility', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.getMaxMinOfFacility(...args), requestLoggerMiddleWare.logger);

/**
 * PUT routes
 */
userRouter.put('/update-speciality-time-slots', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => userController.updateSpecialityTimeSlots(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
