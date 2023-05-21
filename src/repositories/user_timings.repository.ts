import { user_timings } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Facility Repository Class
 */
export class UserTimingRepository extends BaseRepository<user_timings> {
    /**
     * constructor
     * @param userTimings
     */
    public constructor(protected userTimings: typeof user_timings) {
        super(userTimings);
    }

}
