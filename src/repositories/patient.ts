import { kiosk_patient } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class KioskPatientRepository extends BaseRepository<kiosk_patient> {
    /**
     * Constructor
     */
    public constructor(protected KioskPatient: typeof kiosk_patient) {
        super(KioskPatient);
    }

}
