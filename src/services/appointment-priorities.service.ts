import * as Sequelize from 'sequelize';

import {
   sch_appointment_prioritiesI
} from '../models';
import {
   appointmentPrioritiesRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY } from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AppointmentPriorityService extends Helper {
    public __http: Http;
    public __repo: typeof appointmentPrioritiesRepository;

    /**
     *
     * @param appointmentPriority
     * @param http
     */
    public constructor(
        public appointmentPriority: typeof appointmentPrioritiesRepository,
        public http: typeof Http

    ) {
        super();
        this.__repo = appointmentPriority;
        this.__http = new http();

    }

    /**
     *
     */
    public getAppointmentPriority = async (): Promise<sch_appointment_prioritiesI> =>

      (this.__repo.findAll({deleted_at: null}) as unknown as sch_appointment_prioritiesI)

}
