import { user_speciality } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Speciality Repository Class
 */
export class UserSpecialityRepository extends BaseRepository<user_speciality> {
    /**
     * constructor
     * @param userTimings
     */
    public constructor(protected userSpeciality: typeof user_speciality) {
        super(userSpeciality);
    }

}
