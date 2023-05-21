import { sch_assign_provider_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class AssignProviderTypesRepository extends BaseRepository<sch_assign_provider_types> {
    /**
     * Constructor
     */
    public constructor(protected assignProviderTypes: typeof sch_assign_provider_types) {
        super(assignProviderTypes);
    }

}
