import { billing_codes } from '../models';
import { BaseRepository } from '../shared/base-repository';

export class BillingCodesRepository extends BaseRepository<billing_codes> {

    public constructor(protected billingCodes: typeof billing_codes) {
        super(billingCodes);
    }
}
