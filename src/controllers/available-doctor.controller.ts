import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { AvailableDoctorService } from '../services/available-doctor.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AvailableDoctorController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: AvailableDoctorService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public automate = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __automateTransaction = await sequelize.transaction();

            try {
                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.automate(body, authorization, __automateTransaction);

                // tslint:disable-next-line: await-promise
                await __automateTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
                 if (__automateTransaction) {__automateTransaction.rollback(); }
                 throw error;
            }

        } catch (error) {
            next(error);
        }
    }

    public automateV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __automateTransaction = await sequelize.transaction();

            try {
                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.automateV1(body, authorization, __automateTransaction);

                // tslint:disable-next-line: await-promise
                await __automateTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
                 if (__automateTransaction) {__automateTransaction.rollback(); }
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
    public delete = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __deleteAvailableDoctorTransaction = await sequelize.transaction();

            try {

                const { headers: { authorization }, query } = req;

                const response: ANY = await this.__service.delete(query, authorization, __deleteAvailableDoctorTransaction);

                // tslint:disable-next-line: await-promise
                await __deleteAvailableDoctorTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
                if (__deleteAvailableDoctorTransaction) {__deleteAvailableDoctorTransaction.rollback(); }
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
    public getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getAppointments(body, authorization);

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
    public getAvailabilities = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getAvailabilities(body, authorization);

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
    public getDoctorAssignments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getDoctorAssignments(body, authorization);

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
    public getDoctorAssignmentsV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getDoctorAssignmentsV1(body, authorization);

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
    public getFilteredDoctor = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getFilteredDoctor(body, authorization);

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
    public getFreeSlotsOfDoctors = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getFreeSlotsOfDoctors(body, authorization);

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
    public getMaunalDoctorsList = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;



            const response: ANY = await this.__service.getMaunalDoctorsList(body, authorization);

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
    public getMaunalDoctorsListV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getMaunalDoctorsListV1(body, authorization);

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
    public getPartialAvailableDoctor = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getPartialAvailableDoctor(body, authorization);

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
    public getPreCheckForUpdation = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getPreCheckForUpdation(body, authorization);

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

            // tslint:disable-next-line: await-promise
            const __createAvailableDoctorTransaction = await sequelize.transaction();

            try {

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.post(body, authorization, __createAvailableDoctorTransaction);

                // tslint:disable-next-line: await-promise
                await __createAvailableDoctorTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            } catch (error) {
                if (__createAvailableDoctorTransaction) {__createAvailableDoctorTransaction.rollback(); }
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
    public put = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const __updateAvailableDoctorTransaction = await sequelize.transaction();

            try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.put(body, authorization, __updateAvailableDoctorTransaction);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            await __updateAvailableDoctorTransaction.commit();

            next();

            return undefined;

            } catch (error) {
                await __updateAvailableDoctorTransaction.rollback();
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
    public resolvePastAvailabilties = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.resolvePastAvailabilties(body, authorization);

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
    public specificAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.specificAppointments(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
