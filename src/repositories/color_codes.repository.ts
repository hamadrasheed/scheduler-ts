import { sch_color_codes } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Color Code Repository Class
 */
export class ColorCodeRepository extends BaseRepository<sch_color_codes> {
    /**
     * constructor
     * @param colorCodes
     */
    public constructor(protected colorCodes: typeof sch_color_codes) {
        super(colorCodes);
    }

}
