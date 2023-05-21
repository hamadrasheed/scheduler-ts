import { kiosk_case_patient_session } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class CasePatientSessionRepository extends BaseRepository<kiosk_case_patient_session> {
    /**
     * Constructor
     */
    public constructor(protected casePatientSession: typeof kiosk_case_patient_session) {
        super(casePatientSession);
    }

}
