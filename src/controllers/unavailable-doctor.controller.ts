import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { UnAvailableDoctorService } from '../services/unavailable-doctor.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class UnAvailableDoctorController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: UnAvailableDoctorService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public delete = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.deleteUnavailableDoctor(body, authorization);

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
    public post = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.addUnavailableDoctor(body, authorization);

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
    public put = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __updateUnAvailableDoctorTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.update(body, authorization,__updateUnAvailableDoctorTransaction);

                // tslint:disable-next-line: await-promise
                await __updateUnAvailableDoctorTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            }catch(error){
                await __updateUnAvailableDoctorTransaction.rollback();
                throw error;
                
            }

        } catch (error) {
             next(error);
        }
    }

}
