import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

import { appointmentController } from '../controllers';
import { requestLoggerMiddleWare } from '../utils/middleware/request-logger';
// import { getAppointmentListForHealthApp } from '../utils/middleware/validators';
import { webHookTriggerMiddleWare } from '../utils/middleware/webhook-trigger';

/**
 * Appointment controllers (route handlers).
 */

export const appointmentRouter: Router = Router();

/**
 * GET routes
 */
appointmentRouter.get('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAll(...args), requestLoggerMiddleWare.logger);
appointmentRouter.get('/get-appointment-list-for-health-app', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentListForHealthApp(...args), requestLoggerMiddleWare.logger);
appointmentRouter.get('/get-appointment-cpt-codes', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentCptCodes(...args), requestLoggerMiddleWare.logger);
appointmentRouter.get('/get-appointment-by-id', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentModelDataById(...args), requestLoggerMiddleWare.logger);
appointmentRouter.get('/get-speciality-info', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentInfoForSpeciality(...args), requestLoggerMiddleWare.logger);

/**
 * POST routes
 */
appointmentRouter.post('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.post(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.postV1(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-count', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getCount(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/back-dated-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.createBackDatedAppointments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/back-dated-appointment-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.createBackDatedAppointmentsV1(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/info', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getinfo(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/suggest', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.suggest(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/auto-resolve', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.autoResolveAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/check-initial', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.checkInitial(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-related-info', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getRelatedInfo(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/cancel-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.cancelAppointments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/cancel-soft-patient-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.cancelSoftPatientAppointments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/is-future-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.isFutureAppointment(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/is-today-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.isTodayAppointment(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/create-with-cptCodes', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.createAppointmentWithCptCodes(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);

appointmentRouter.post('/get-appointment-list', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentList(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointment-list-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentListV1(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointment-list-v2', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentListV2(...args), requestLoggerMiddleWare.logger);

appointmentRouter.post('/get-doctor-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getDoctorAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-doctor-appointments-by-id', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getDoctorAppointmentsById(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/forward-appointments-fd', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.forwardAppointmentsToFD(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-patient-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getPatientAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-patient-appointments-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getPatientAppointmentsV1(...args), requestLoggerMiddleWare.logger);

appointmentRouter.post('/get-cancelled-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getCancelledAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-cancelled-appointments-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getCancelledAppointmentsV1(...args), requestLoggerMiddleWare.logger);

appointmentRouter.post('/resolve-doctor-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.resolveAppointmentForDoctor(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-speciality-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getSpecialityAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointment-list-by-case', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentListByCase(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-next-and-last-appointment', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getNextAndLastAppointment(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/resolve-speciality-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.resolveAppointmentForSpeciality(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-today-appointment-of-patient', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getTodayAppointmentOfPatient(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/appointments-against-availablities', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentAgainstAvailablity(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-all-doctor-speciality-appointments-v2', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllDoctorSpecialityAppointmentsV2(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-all-doctor-speciality-appointments-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllDoctorSpecialityAppointmentsV2(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-all-doctor-speciality-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllDoctorSpecialityAppointments(...args), requestLoggerMiddleWare.logger);

appointmentRouter.post('/get-all-pushed-appointment-to-front-desk', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllAppointmentPushedToFrontDesk(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-all-pushed-appointment-to-front-desk-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllAppointmentPushedToFrontDeskV1(...args), requestLoggerMiddleWare.logger);

appointmentRouter.post('/get-all-patient-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllPatientAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-all-patient-appointments-v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAllPatientAppointmentsV1(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/remove-evaluation-time', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.removeEvaluationTime(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointment-by-case', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.checkAppointmentsByCase(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/activate', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.activateAppointment(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/trigger-ios-action', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.triggerAppointmentSocket(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointment-by-id', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointmentById(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-patient-history', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getPatientHistory(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-patient-history-count', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getPatientHistoryCount(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/cancel-doctor-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.cancelAppointmentsDeleteAssignments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.post('/get-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.getAppointments(...args), requestLoggerMiddleWare.logger);
appointmentRouter.post('/create-app-session', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.createAppSession(...args), requestLoggerMiddleWare.logger);

/**
 * PUT routes
 */
appointmentRouter.put('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.put(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/v1', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.putV1(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-appointment-status', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateAppointmentStatus(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-appointment-for-ios', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateAppointmentForIos(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-appointment-and-visit-status', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateAppointmentAndVisitStatus(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-status-multiple-appointments', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateStatusMultipleAppointments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-appointment-evaluation', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateAppointmentEvaluation(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/manually-update-status', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateStatus(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
appointmentRouter.put('/update-appointment-doctor', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.updateAppointmentDoctor(...args), requestLoggerMiddleWare.logger);

/**
 * DELETE routes
 */
appointmentRouter.delete('/', (...args: [Request, Response, NextFunction]): Promise<RequestHandler> => appointmentController.deleteAppointments(...args), webHookTriggerMiddleWare.changeInAppointments, requestLoggerMiddleWare.logger);
