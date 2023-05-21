import { kiosk_case_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class CaseTypesRepository extends BaseRepository<kiosk_case_types> {
    /**
     * Constructor
     */
    public constructor(protected caseTypes: typeof kiosk_case_types) {
        super(caseTypes);
    }

}
