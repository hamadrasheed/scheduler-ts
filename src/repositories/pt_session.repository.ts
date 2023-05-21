import { pt_session } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class PtSessionRepository extends BaseRepository<pt_session> {
    /**
     * Constructor
     */
    public constructor(protected PtSession: typeof pt_session) {
        super(PtSession);
    }

}
