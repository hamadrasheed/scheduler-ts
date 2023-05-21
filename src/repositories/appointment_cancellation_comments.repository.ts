import { sch_appointment_cancellation_comments } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Appointment Repository Class
 */
export class AppointmentCancellationCommentRepository extends BaseRepository<sch_appointment_cancellation_comments> {
    /**
     * constructor
     * @param appointmentCancellationComments
     */
    public constructor(protected appointmentCancellationComments: typeof sch_appointment_cancellation_comments) {
        super(appointmentCancellationComments);
    }

}
