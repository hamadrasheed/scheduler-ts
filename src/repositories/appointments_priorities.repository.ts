import { sch_appointment_priorities } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Appointment Repository Class
 */
export class AppointmentPrioritiesRepository extends BaseRepository<sch_appointment_priorities> {
    /**
     * constructor
     * @param appointmentPriorities
     */
    public constructor(protected appointmentPriorities: typeof sch_appointment_priorities) {
        super(appointmentPriorities);
    }

}
