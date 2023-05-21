import { case_referrals } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class CaseReferralsRepository extends BaseRepository<case_referrals> {
    /**
     * Constructor
     */
    public constructor(protected caseReferrals: typeof case_referrals) {
        super(caseReferrals);
    }

}
