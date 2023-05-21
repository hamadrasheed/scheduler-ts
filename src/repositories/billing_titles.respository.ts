import { billing_titles } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Recurrence Ending Criteria Repository Class
 */
export class BillingTitlesRepository extends BaseRepository<billing_titles> {
    /**
     * constructor
     * @param billingTitle
     */
    public constructor(protected billingTitle: typeof billing_titles) {
        super(billingTitle);
    }

}
