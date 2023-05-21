import { sch_recurrence_date_lists } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Model Has Roles Repository Class
 */
export class RecurrenceDateListRepository extends BaseRepository<sch_recurrence_date_lists> {
    /**
     * constructor
     * @param modelHasRoles
     */
    public constructor(protected recurrenceDateLists: typeof sch_recurrence_date_lists) {
        super(recurrenceDateLists);
    }

}
