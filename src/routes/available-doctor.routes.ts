import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { availableDoctorController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * Available doctor controllers (route handlers).
 */

export const availableDoctorRouter: Router = Router();

/**
 * POST routes
 */
availableDoctorRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.post(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/automate', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.automate(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/automate-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.automateV1(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getAppointments(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/specific-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.specificAppointments(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-availabilities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getAvailabilities(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/pre-updation-check', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getPreCheckForUpdation(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-filtered-doctor', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getFilteredDoctor(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-doctor-assignments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getDoctorAssignments(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-doctor-assignments-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getDoctorAssignmentsV1(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-maunal-doctors-list', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getMaunalDoctorsList(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-maunal-doctors-list-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getMaunalDoctorsListV1(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-free-slots-of-doctors', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getFreeSlotsOfDoctors(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/resolve-past-availabilties', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.resolvePastAvailabilties(...args), requestLoggerMiddleWare.logger);
availableDoctorRouter.post('/get-partial-available-doctors', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.getPartialAvailableDoctor(...args), requestLoggerMiddleWare.logger);

/**
 * PUT routes
 */
availableDoctorRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.put(...args), requestLoggerMiddleWare.logger);

/**
 * DELETE routes
 */
availableDoctorRouter.delete('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => availableDoctorController.delete(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
