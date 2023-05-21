import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * Model Has Roles Repository Class
 */
export class ModelHasRoleRepository extends BaseRepository<models.model_has_roles> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param modelHasRoles
     */
    public constructor(protected modelHasRoles: typeof models.model_has_roles) {
        super(modelHasRoles);
        this.joinClause = {
            get_doctor_info: { model: models.roles, as: 'role', required: false },
            get_filtered_doctor: { model: models.roles, as: 'role', required: false }
        };
    }

    /**
     *
     * @param apiName
     */
    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
    this.joinClause[apiName]

}
