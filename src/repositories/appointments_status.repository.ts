import { sch_appointment_statuses } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Appointment Repository Class
 */
export class AppointmentStatusRepository extends BaseRepository<sch_appointment_statuses> {
    /**
     * constructor
     * @param appointmentStatus
     */
    public constructor(protected appointmentStatus: typeof sch_appointment_statuses) {
        super(appointmentStatus);
    }

}
