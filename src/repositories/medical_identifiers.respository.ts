import { medical_identifiers } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Recurrence Ending Criteria Repository Class
 */
export class MedicalIdentifierRepository extends BaseRepository<medical_identifiers> {
    /**
     * constructor
     * @param medicalIdentifier
     */
    public constructor(protected medicalIdentifier: typeof medical_identifiers) {
        super(medicalIdentifier);
    }

}
