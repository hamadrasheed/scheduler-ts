import * as Sequelize from 'sequelize';

import * as models from '../models';
import {
    doctorInstructionForFacilityLocationsRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { AddDoctorInstructionsI, ANY, GetDoctorInstructionsI } from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class DoctorInstructionForFacilityLocationsService extends Helper {
    public __http: Http;
    public __repo: typeof doctorInstructionForFacilityLocationsRepository;

    /**
     *
     * @param doctorInstruction
     * @param http
     */
    public constructor(
        public doctorInstruction: typeof doctorInstructionForFacilityLocationsRepository,
        public http: typeof Http

    ) {
        super();
        this.__repo = doctorInstruction;
        this.__http = new http();

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public get = async (data: GetDoctorInstructionsI, _authorization: string): Promise<ANY> => {

        const {
            doctor_ids: doctorIds,
            end_date: endDateString,
            start_date: startDateString,
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        return this.__repo.findAll(
            {
                date: { [Op.and]: [
                    {[Op.lt]: endDate},
                    {[Op.gte]: startDate}
                    ]
                },
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds }
            },
            {
            include:
            {
                as: 'doctor',
                attributes: { exclude: ['password'] },
                include:
                {
                    as: 'userBasicInfo',
                    model: models.user_basic_info,
                    required: false,
                    where: { deleted_at: null },
                },
                model: models.users,
                required: false,
                where: { deleted_at: null },
            }
        });

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public post = async (data: AddDoctorInstructionsI, _authorization: string): Promise<models.sch_doctor_instruction_for_facility_locationsI> => {

        const {
            doctor_id,
            date,
            facility_location_id,
            instruction,
            user_id
        } = data;

        return this.__repo.create({
            date,
            doctor_id,
            facility_location_id,
            instruction

        });

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public put = async (data: AddDoctorInstructionsI, _authorization: string): Promise<models.sch_doctor_instruction_for_facility_locationsI> => {

        const {
            doctor_id,
            date,
            facility_location_id,
            id,
            instruction,
            user_id
        } = data;
        return this.__repo.update(
            id,
            {
                date,
                doctor_id,
                facility_location_id,
                instruction,
                updated_by: user_id,
            }
        );

    }

}
