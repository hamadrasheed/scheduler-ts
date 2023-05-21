import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { MasterService } from '../services/master.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class MasterController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: MasterService
    ) { }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns
     */
    public getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getDoctors(body, authorization);

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
     * @returns
     */
    public getFacilities = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getFacilities(body, authorization);

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
    public getSpecialities = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getSpecialities(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
