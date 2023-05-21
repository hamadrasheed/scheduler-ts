import { sch_available_doctor_notifications } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Appointment Repository Class
 */
export class AvailableDoctorNotificationRepository extends BaseRepository<sch_available_doctor_notifications> {
    /**
     * constructor
     * @param availableDoctorNotifications
     */
    public constructor(protected availableDoctorNotifications: typeof sch_available_doctor_notifications) {
        super(availableDoctorNotifications);
    }

}
