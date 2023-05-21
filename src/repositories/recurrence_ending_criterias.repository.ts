import { sch_recurrence_ending_criterias } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Recurrence Ending Criteria Repository Class
 */
export class RecurrenceEndingCriteriaRepository extends BaseRepository<sch_recurrence_ending_criterias> {
    /**
     * constructor
     * @param recurrenceEndingCriterias
     */
    public constructor(protected recurrenceEndingCriterias: typeof sch_recurrence_ending_criterias) {
        super(recurrenceEndingCriterias);
    }

}
