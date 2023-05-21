import { sch_day_lists } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Day List Repository Class
 */
export class DayListRepository extends BaseRepository<sch_day_lists> {
    /**
     * constructor
     * @param dayLists
     */
    public constructor(protected dayLists: typeof sch_day_lists) {
        super(dayLists);
    }

}
