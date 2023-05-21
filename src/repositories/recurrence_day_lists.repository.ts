import { sch_recurrence_day_lists } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Recurrence Day List Repository Repository Class
 */
export class RecurrenceDayListRepository extends BaseRepository<sch_recurrence_day_lists> {
    /**
     * constructor
     * @param dayLists
     */
    public constructor(protected dayLists: typeof sch_recurrence_day_lists) {
        super(dayLists);
    }

}
