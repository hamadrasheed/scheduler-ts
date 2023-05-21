import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * User Repository Class
 */
export class UserRepository extends BaseRepository<models.users> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param _users
     */
    public constructor(protected _users: typeof models.users) {
        super(_users);
        this.joinClause = {
            get_doctor_appointments: {
                as: 'colorCodes',
                include: {
                    as: 'type',
                    model: models.sch_color_code_types,
                    where: {
                        slug: 'facility_location'
                    }
                },
                model: models.sch_color_codes,
                required: false,
                where: {
                    deleted_at: null
                }
            },
            get_doctor_detail: {
                as: 'type',
                model: models.sch_color_code_types,
                required: false,
                where: {
                    deleted_at: null,
                    slug: 'speciality'
                }
            },
            get_doctor_info: {
                as: 'type',
                model: models.sch_color_code_types,
                required: true,
                where: {
                    deleted_at: null,
                    slug: 'speciality'
                }
            },
            get_filtered_doctor:             {
                as: 'colorCodes',
                include: {
                    as: 'type',
                    model: models.sch_color_code_types,
                    required: false,
                    where: {
                        deleted_at: null,
                        slug: 'speciality'
                    }
                },
                model: models.sch_color_codes,
                required: false,
                where: {
                    deleted_at: null,
                }
            }
        };
    }

    /**
     *
     * @param apiName
     */
    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
    this.joinClause[apiName]

}
