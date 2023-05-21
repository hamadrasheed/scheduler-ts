import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * Available Speciality Repository Class
 */
export class AvailableDoctorRepository extends BaseRepository<models.sch_available_doctors> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param availableDoctors
     */
    public constructor(protected availableDoctors: typeof models.sch_available_doctors) {
        super(availableDoctors);
        this.joinClause = {
            get_doctor_assignments: [
                {
                    as: 'facilityLocations',
                    model: models.facility_locations,
                    required: false,
                },
                {
                    as: 'doctor',
                    attributes: { exclude: ['password'] },
                    include: [
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'userFacilities',
                            model: models.user_facility,
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.users,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'dayList',
                    model: models.sch_recurrence_day_lists,
                    required: false,
                    where: { deleted_at: null },
                }

            ]
        };
    }

    /**
     *
     * @param apiName
     */
    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
        this.joinClause[apiName]

}
