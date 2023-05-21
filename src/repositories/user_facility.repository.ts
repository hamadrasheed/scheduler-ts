import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * User Facility Repository Class
 */
export class UserFacilityRepository extends BaseRepository<models.user_facility> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param userFacility
     */
    public constructor(protected userFacility: typeof models.user_facility) {
        super(userFacility);
        this.joinClause = {
            get_doctor_info: [
                {
                    as: 'speciality',
                    model: models.specialities,

                },
                {
                    as: 'users',
                    include: [
                        {
                            as: 'userBasicInfo', model: models.user_basic_info, where: { deleted_at: null }
                        },
                        {
                            as: 'userTimings', model: models.user_timings, where: { deleted_at: null }
                        }
                    ],
                    model: models.users,
                    where: { deleted_at: null }
                }
            ],
            get_filtered_doctor: {
                as: 'users',
                include: [
                    {
                        as: 'userBasicInfo', model: models.user_basic_info, required: false, where: { deleted_at: null },
                    },
                    {
                        as: 'userTimings', model: models.user_timings, required: false, where: { deleted_at: null },
                    },
                    {
                        as: 'userFacilities',
                        include: {
                            as: 'speciality',
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.user_facility,
                        required: false,
                        where: { deleted_at: null },
                    }
                ],
                model: models.users,
                required: false,
                where: { deleted_at: null },
            },

        };
    }

    /**
     *
     * @param apiName
     */
    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
    this.joinClause[apiName]

}
