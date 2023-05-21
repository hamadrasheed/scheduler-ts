import { facility_locations } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Facility Location Repository Class
 */
export class FacilityLocationRepository extends BaseRepository<facility_locations> {
    /**
     * constructor
     * @param facilityLocations
     */
    public constructor(protected facilityLocations: typeof facility_locations) {
        super(facilityLocations);
    }

}
