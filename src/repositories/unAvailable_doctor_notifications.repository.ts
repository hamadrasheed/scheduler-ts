import { sch_unavailable_doctor_notications } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Appointment Repository Class
 */
export class UnAvailableDoctorNotificationRepository extends BaseRepository<sch_unavailable_doctor_notications> {
    /**
     * constructor
     * @param availableDoctorNotifications
     */
    public constructor(protected unAvailableDoctorNotifications: typeof sch_unavailable_doctor_notications) {
        super(unAvailableDoctorNotifications);
    }

}
