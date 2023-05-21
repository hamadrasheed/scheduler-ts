import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { AppointmentService } from '../services/appointment.service';
import { Frozen } from '../shared';
import * as typings from '../shared/common';

/**
 * Appointment Controller Class
 */

@Frozen
export class AppointmentController {
    /**
     *
     * @param __service
     */
    public constructor(
        public __service: AppointmentService
    ) {
    }

    public createAppSession = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response = await this.__service.createAppSession(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public activateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.activateAppointment(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public autoResolveAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.autoResolveAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public cancelAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.CancelAppointmentsResponseI = await this.__service.cancelAppointments(body, authorization);

            res.locals.data = { result: { data: response.data,socketData:response.socketData }, message: response?.message ? `${response?.message}` : 'SUCCESS', status: response?.status };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public cancelSoftPatientAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
         try {
             const { headers: { authorization }, body } = req;

             const response: typings.CancelAppointmentsResponseI = await this.__service.cancelSoftPatientAppointment(body, authorization);

             res.locals.data = { result: {data: response.data }, message: response?.message ? `${response?.message}` : 'SUCCESS', status: response?.status};

             next();

             return undefined;

         } catch (error) {
             next(error);
         }
     }

    public checkAppointmentsByCase = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.checkAppointmentsByCase(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public checkInitial = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.CheckInitialResponseI = await this.__service.checkInitial(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public createBackDatedAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.createBackDatedAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public createBackDatedAppointmentsV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.createBackDatedAppointmentsV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public deleteAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.DeleteAppointmentsResponseI = await this.__service.deleteAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public forwardAppointmentsToFD = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.forwardAppointmentsToFD(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: typings.GetAllAppointmentsResponseI = await this.__service.getAll(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAllAppointmentPushedToFrontDesk = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAllAppointmentPushedToFrontDeskResponseI = await this.__service.getAllAppointmentPushedToFrontDesk(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAllDoctorSpecialityAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAllDoctorSpecialityAppointmentsResponseI = await this.__service.getAllDoctorSpecialityAppointmentsModify(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAllDoctorSpecialityAppointmentsV2 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAllDoctorSpecialityAppointmentsResponseI = await this.__service.getAllDoctorSpecialityAppointmentsV2(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAllDoctorSpecialityAppointmentsModify = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAllDoctorSpecialityAppointmentsResponseI = await this.__service.getAllDoctorSpecialityAppointmentsModify(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAllPatientAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getAllPatientAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();
            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
    *
    * @param req
    * @param res
    * @param next
    */
    public getAllPatientAppointmentsV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getAllPatientAppointmentsV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();
            return undefined;

        } catch (error) {
            next(error);
        }
    }
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentAgainstAvailablity = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentsAgainstAvailablityResponseI = await this.__service.getAppointmentAgainstAvailablity(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.CancelAppointmentsResponseI = await this.__service.getAppointmentById(body, authorization);

            res.locals.data = { result: { data: response }, message: response?.message ? `${response?.message}` : 'SUCCESS', status: response?.status };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAppointmentModelDataById = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: typings.CancelAppointmentsResponseI = await this.__service.getAppointmentModelDataById(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAppointmentInfoForSpeciality = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;
            const response: typings.CancelAppointmentsResponseI = await this.__service.getAppointmentInfoForSpeciality(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentCptCodes = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: typings.CancelAppointmentsResponseI = await this.__service.getAppointmentCptCodes(query, authorization);

            res.locals.data = { result: { data: response }, message: response?.message ? `${response?.message}` : 'SUCCESS', status: response?.status };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentList = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentListResponseI = await this.__service.getAppointmentList(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentListV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentListResponseI = await this.__service.getAppointmentListV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAppointmentListV2 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentListResponseI = await this.__service.getAppointmentListV2(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentListResponseI = await this.__service.getAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentListByCase = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getAppointmentListByCase(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAppointmentListForHealthApp = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: typings.ANY = await this.__service.getAppointmentListForHealthApp(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getCancelledAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getCancelledAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getCount = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getCount(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getDoctorAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getDoctorAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getDoctorAppointmentsById = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getDoctorAppointmentsById(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getinfo = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAppointmentsAgainstAvailablityResponseI = await this.__service.getInfo(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getNextAndLastAppointment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.getNextAndLastAppointment(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getPatientAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getPatientAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getPatientAppointmentsV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getPatientAppointmentsV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getPatientHistory = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getPatientHistory(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
    *
    * @param req
    * @param res
    * @param next
    */
    public getPatientHistoryCount = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getPatientHistoryCounts(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getRelatedInfo = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getRelatedInfo(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getSpecialityAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getSpecialityAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getTodayAppointmentOfPatient = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.getTodayAppointmentOfPatient(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public isFutureAppointment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.isFutureAppointment(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public isTodayAppointment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.isTodayAppointment(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public post = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {

        try {

            const __createAppointmentTransactions = await sequelize.transaction();

            try {

                const { headers: { authorization }, body } = req;

                const response: typings.ANY = await this.__service.post(body, authorization, __createAppointmentTransactions);

                //await __createAppointmentTransactions.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            }
            catch (error) {
                if (__createAppointmentTransactions) {__createAppointmentTransactions.rollback(); }
                throw error;
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public postV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.postV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        }
        catch (error) {
            next(error);
        }
    }

        /**
     *
     * @param req
     * @param res
     * @param next
     */
         public createAppointmentWithCptCodes = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
            try {
    
                const { headers: { authorization }, body } = req;
    
                const response: typings.ANY = await this.__service.createAppointmentWithCptCodess(body, authorization);
    
                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };
    
                next();
    
                return undefined;
    
            }
            catch (error) {
                next(error);
            }
        }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public put = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __updateAppointmentTransactions = await sequelize.transaction();

            try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.put(body, authorization, __updateAppointmentTransactions);

            await __updateAppointmentTransactions.commit();

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

            }

            catch (error) {
                await __updateAppointmentTransactions.rollback();
                throw error;
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public putV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.putV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        }
        catch (error) {
            next(error);
        }
    }

    public removeEvaluationTime = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.removeEvaluationTime(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public resolveAppointmentForDoctor = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.resolveAppointmentForDoctor(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public resolveAppointmentForSpeciality = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.resolveAppointmentForSpeciality(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public suggest = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.suggest(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public triggerAppointmentSocket = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.AutoResolveAppointmentsResponseI = await this.__service.triggerAppointmentSocket(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public updateAppointmentDoctor = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        
        try {

            const __updateAppointmentTransactions = await sequelize.transaction();

            try {

                const { headers: { authorization }, body } = req;

                const response: typings.AutoResolveAppointmentsResponseI = await this.__service.updateAppointmentDoctor(body, authorization, __updateAppointmentTransactions);

                await __updateAppointmentTransactions.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
                await __updateAppointmentTransactions.rollback();
                throw error;
            }

        } catch (error) {
            next(error);
        }

    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public updateAppointmentAndVisitStatus = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.updateAppointmentAndVisitStatus(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public updateAppointmentEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __updateAppointmentEvaluationTransaction = await sequelize.transaction();
            // tslint:disable-next-line: await-promise

            try {

                const { headers: { authorization }, body } = req;

                const response: typings.ANY = await this.__service.updateAppointmentEvaluation(body, authorization, __updateAppointmentEvaluationTransaction);

                // tslint:disable-next-line: await-promise
                await __updateAppointmentEvaluationTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
               await __updateAppointmentEvaluationTransaction.rollback();
               throw error;
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public updateAppointmentForIos = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __updateAppointmentForIosTransaction = await sequelize.transaction();

            try {

                const { headers: { authorization }, body } = req;

                // tslint:disable-next-line: await-promise

                const response: typings.ANY = await this.__service.updateAppointmentForIos(body, authorization, __updateAppointmentForIosTransaction);

                // tslint:disable-next-line: await-promise
                await __updateAppointmentForIosTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
              await __updateAppointmentForIosTransaction.rollback();
              throw error;
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            // tslint:disable-next-line: await-promise
            const response: typings.ANY = await this.__service.updateAppointmentStatus(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }

    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public updateStatusMultipleAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.updateStatusMultipleAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
     public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __updateAppointmentStatusTransaction = await sequelize.transaction();

            try {
    
                const { headers: { authorization }, body } = req;
    
                const response: typings.ANY = await this.__service.updateStatus(body, authorization, __updateAppointmentStatusTransaction);
    
                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };
    
                next();
    
                return undefined;
    
            } catch (error) {
                await __updateAppointmentStatusTransaction.rollback();
                throw error;
                
            }

        } catch (error) {
            next(error);
        }

    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public cancelAppointmentsDeleteAssignments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __cancelAppointmentsDeleteAssignmentsTransaction = await sequelize.transaction();

            try {
    
                const { headers: { authorization }, body } = req;

                const response: typings.CancelAppointmentsWithAssignmentResponseI = await this.__service.cancelAppointmentsDeleteAssignments(body, authorization, __cancelAppointmentsDeleteAssignmentsTransaction);
    
                res.locals.data = { result: { data: response.data }, message: response?.message ? `${response?.message}` : 'SUCCESS', status: response?.status };
    
                next();
    
                await __cancelAppointmentsDeleteAssignmentsTransaction.commit();
    
                return undefined;
    
            } catch (error) {
                await __cancelAppointmentsDeleteAssignmentsTransaction.rollback();
                throw error;
            }
        } catch (error) {
            next(error);
        }
    }

    public getAllAppointmentPushedToFrontDeskV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.GetAllAppointmentPushedToFrontDeskResponseI = await this.__service.getAllAppointmentPushedToFrontDeskV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getCancelledAppointmentsV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: typings.ANY = await this.__service.getCancelledAppointmentsV1(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }
}
