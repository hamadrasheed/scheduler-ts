import { NextFunction, Request, RequestHandler, Response } from 'express';

import { DoctorInstructionForFacilityLocationsService } from '../services/doctor-instruction-for-facility-locations.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class DoctorInstructionForFacilityLocationsController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: DoctorInstructionForFacilityLocationsService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public get = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { body, headers: { authorization } } = req;

            const response: ANY = await this.__service.get(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (err) {
            next(err);
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

            const { body, headers: { authorization } } = req;

            const response: ANY = await this.__service.post(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (err) {
            next(err);
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

            const { body, headers: { authorization } } = req;

            const response: ANY = await this.__service.put(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (err) {
            next(err);
        }
    }

}
