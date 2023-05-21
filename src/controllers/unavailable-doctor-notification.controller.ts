import { NextFunction, Request, RequestHandler, Response } from 'express';

import { UnavailableDoctorNoticationService } from '../services/unavailable-doctor-notications.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class UnAvailableDoctorNotificationController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: UnavailableDoctorNoticationService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public details = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.details(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getAll(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
