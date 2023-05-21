import { sch_action_preference_forward_facility_location } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Un Available Speciality Repository Class
 */
export class ActionPreferenceForwardFacilityLocationRepository extends BaseRepository<sch_action_preference_forward_facility_location> {
    /**
     * constructor
     * @param ActionPreferenceForwardFacilityLocationRepository
     */
    public constructor(protected actionPreferenceForwardFacilityLocationRepository: typeof sch_action_preference_forward_facility_location) {
        super(actionPreferenceForwardFacilityLocationRepository);
    }

}
