import { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppointmentPriorityService } from '../services/appointment-priorities.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AppointmentPriorityController {
    public __service: AppointmentPriorityService;

    /**
     *
     * @param appointmentTypeService
     */
    public constructor(appointmentTypeService: AppointmentPriorityService) {
        this.__service = appointmentTypeService;
    }

    /**
     *
     * @param __req
     * @param res
     * @param next
     */
    public getAppointmentPriority = async (__req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const response: ANY = await this.__service.getAppointmentPriority();

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
