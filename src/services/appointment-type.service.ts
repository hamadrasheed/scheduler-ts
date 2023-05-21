import * as Sequelize from 'sequelize';

import {
   sch_appointment_typesI
} from '../models';
import {
   appointmentTypesRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY } from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AppointmentTypeService extends Helper {
    public __http: Http;
    public __repo: typeof appointmentTypesRepository;

    /**
     *
     * @param schAppointmentType
     * @param http
     */
    public constructor(
        public schAppointmentType: typeof appointmentTypesRepository,
        public http: typeof Http

    ) {
        super();
        this.__repo = schAppointmentType;
        this.__http = new http();

    }

    /**
     *
     */
    public getAppointmentTypes = async (): Promise<sch_appointment_typesI> =>

      (this.__repo.findAll({deleted_at: null}) as unknown as sch_appointment_typesI)

}
