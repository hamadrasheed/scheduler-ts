import { sch_available_specialities } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Available Speciality Repository Class
 */
export class AvailableSpecialityRepository extends BaseRepository<sch_available_specialities> {
    /**
     * constructor
     * @param availableSpecialities
     */
    public constructor(protected availableSpecialities: typeof sch_available_specialities) {
        super(availableSpecialities);
    }

}
