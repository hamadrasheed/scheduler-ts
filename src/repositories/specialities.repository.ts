import { specialities } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Speciality Repository Class
 */
export class SpecialityRepository extends BaseRepository<specialities> {
    /**
     * constructor
     * @param _specialities
     */
    public constructor(protected _specialities: typeof specialities) {
        super(_specialities);
    }

}
