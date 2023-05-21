import { sch_doctor_instruction_for_facility_locations } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Color Code Type Repository Class
 */
export class DoctorInstructionForFacilityLocationsRepository extends BaseRepository<sch_doctor_instruction_for_facility_locations> {
    /**
     * constructor
     * @param colorCodeTypes
     */
    public constructor(protected colorCodeTypes: typeof sch_doctor_instruction_for_facility_locations) {
        super(colorCodeTypes);
    }

}
