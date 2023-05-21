import { sch_appointment_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class AppointmentTypesRepository extends BaseRepository<sch_appointment_types> {
    /**
     * Constructor
     */
    public constructor(protected appointmentTypes: typeof sch_appointment_types) {
        super(appointmentTypes);
    }

}
