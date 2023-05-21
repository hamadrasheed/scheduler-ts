import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * Un Available Speciality Repository Class
 */
export class ActionPreferencesRepository extends BaseRepository<models.sch_action_preferences> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param ActionPreferences
     */
    public constructor(protected actionPreferences: typeof models.sch_action_preferences) {
        super(actionPreferences);
        this.joinClause = {
            update_unavailable_doctors: [
                {
                    as: 'actionPreferencesType',
                    model: models.sch_action_preferences_types,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'actionPreferencesFacilityLocations',
                    model: models.sch_action_preference_forward_facility_location,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        };
    }

    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
    this.joinClause[apiName]

}
