import { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppointmentTypeService } from '../services/appointment-type.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AppointmentTypeController {
    public __service: AppointmentTypeService;

    /**
     *
     * @param appointmentTypeService
     */
    public constructor(appointmentTypeService: AppointmentTypeService) {
        this.__service = appointmentTypeService;
    }

    /**
     *
     * @param __req
     * @param res
     * @param next
     */
    public getAppointmentTypes = async (__req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const response: ANY = await this.__service.getAppointmentTypes();

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
