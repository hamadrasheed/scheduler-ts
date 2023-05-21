import { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppointmentStatusService } from '../services/appointment-status.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AppointmentStatusController {
    public __service: AppointmentStatusService;

    /**
     *
     * @param appointmentTypeService
     */
    public constructor(appointmentTypeService: AppointmentStatusService) {
        this.__service = appointmentTypeService;
    }

    /**
     *
     * @param __req
     * @param res
     * @param next
     */
    public getAppointmentStatus = async (__req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const {query } = __req;
            const response: ANY = await this.__service.getAppointmentStatus(query);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
