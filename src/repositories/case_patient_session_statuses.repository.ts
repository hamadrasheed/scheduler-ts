import { kiosk_case_patient_session_statuses } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class CasePatientSessionStatusesRepository extends BaseRepository<kiosk_case_patient_session_statuses> {
    /**
     * Constructor
     */
    public constructor(protected casePatientSessionStatuses: typeof kiosk_case_patient_session_statuses) {
        super(casePatientSessionStatuses);
    }

}
