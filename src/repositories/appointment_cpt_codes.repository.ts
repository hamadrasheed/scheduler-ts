import { sch_appointment_cpt_codes } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * AppointmentCptCodes Repository Class
 */
export class AppointmentCptCodesRepository extends BaseRepository<sch_appointment_cpt_codes> {
    /**
     * constructor
     * @param AppointmentCptCodes
     */
    public constructor(protected AppointmentCptCodes: typeof sch_appointment_cpt_codes) {
        super(AppointmentCptCodes);
    }

}
