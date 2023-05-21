import { visit_sessions } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Facility Repository Class
 */
export class VisitSessionRepository extends BaseRepository<visit_sessions> {
    /**
     * constructor
     * @param visitSessions
     */
    public constructor(protected visitSessions: typeof visit_sessions) {
        super(visitSessions);
    }

}
