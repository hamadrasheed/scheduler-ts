import { NextFunction, Request, RequestHandler, Response } from 'express';

import { KioskService } from '../services/kiosk.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

/**
 * Kiosk controller class
 */
@Frozen
export class KioskController {

    public __service: KioskService;

    public constructor(kioskService: KioskService) {
        this.__service = kioskService;
    }

    public getPatient = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { query, headers: { authorization } } = req;

            const response: ANY = await this.__service.getPatient(query, authorization);

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
    public getWalkInPatients = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { body, headers: { authorization } } = req;

            const response: ANY = await this.__service.getWalkInPatients(body, authorization);

            res.locals.data = { result: { data: response.result.data }, message_code: null, message: response.message }

            next();

            return undefined;

        } catch (err) {
            next(err);
        }
    }

}
