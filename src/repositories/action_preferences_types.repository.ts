import { sch_action_preferences_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Un Available Speciality Repository Class
 */
export class ActionPreferencesTypesRepository extends BaseRepository<sch_action_preferences_types> {
    /**
     * constructor
     * @param ActionPreferencesTypes
     */
    public constructor(protected actionPreferencesTypes: typeof sch_action_preferences_types) {
        super(actionPreferencesTypes);
    }

}
