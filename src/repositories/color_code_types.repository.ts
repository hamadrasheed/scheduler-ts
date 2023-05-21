import { sch_color_code_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Color Code Type Repository Class
 */
export class ColorCodeTypeRepository extends BaseRepository<sch_color_code_types> {
    /**
     * constructor
     * @param colorCodeTypes
     */
    public constructor(protected colorCodeTypes: typeof sch_color_code_types) {
        super(colorCodeTypes);
    }

}
