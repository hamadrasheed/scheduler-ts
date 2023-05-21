import { roles } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Roles Repository Class
 */
export class RoleRepository extends BaseRepository<roles> {
    /**
     * constructor
     * @param _roles
     */
    public constructor(protected _roles: typeof roles) {
        super(_roles);
    }

}
