import { facility_timings } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Facility Location Repository Class
 */
export class FacilityTimingsRepository extends BaseRepository<facility_timings> {
    /**
     * constructor
     * @param facilityLocations
     */
    public constructor(protected facilityTimings: typeof facility_timings) {
        super(facilityTimings);
    }

}
