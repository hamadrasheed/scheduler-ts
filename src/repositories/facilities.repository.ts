import { facilities } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Repository Class
 */
export class FacilityRepository extends BaseRepository<facilities> {
    /**
     * constructor
     * @param _facilities
     */
    public constructor(protected _facilities: typeof facilities) {
        super(_facilities);
    }

}
