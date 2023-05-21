import * as Sequelize from 'sequelize';

import {
   sch_appointment_typesI
} from '../models';
import {
   appointmentStatusRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY } from '../shared/common';
import * as typings from '../shared/common';
// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AppointmentStatusService extends Helper {
    public __http: Http;
    public __repo: typeof appointmentStatusRepository;

    /**
     *
     * @param appointmentStatus
     * @param http
     */
    public constructor(
        public appointmentStatus: typeof appointmentStatusRepository,
        public http: typeof Http

    ) {
        super();
        this.__repo = appointmentStatus;
        this.__http = new http();

    }

    /**
     *
     */
    // public getAppointmentStatus = async (): Promise<sch_appointment_typesI> => 

    //   (this.__repo.findAll({deleted_at: null}) as unknown as sch_appointment_typesI)

    public getAppointmentStatus = async (data: typings.ANY): Promise<typings.ANY> =>{
    const {
        filter,
        pagination,
        per_page: perPage,
        page,
        specific_appointment_status,
        name
      } = data;

    if (specific_appointment_status) {
         let filters: typings.ANY = {deleted_at: null};
         if (filter && name) {
                filters.name = { [Op.like]: `%${name}%` };
        }
         if (pagination || pagination === '1') {
               return   this.__repo.paginate(
                {
                    where: { ...filters,  slug: { [Op.in]: ['scheduled', 're_scheduled', 'arrived', 'no_show', 'completed'] }, },
                },
                Number(page),
                Number(perPage),
                null,
                {
                    order: [
                        ['name', 'ASC']
                    ]
                }
            );
         }
         return (this.__repo.findAll({
             ...filters,
             slug: { [Op.in]: ['scheduled', 're_scheduled', 'arrived', 'no_show', 'completed'] },
         })  as unknown as sch_appointment_typesI);
      }

      return (this.__repo.findAll({deleted_at: null})  as unknown as sch_appointment_typesI);
    }

}
