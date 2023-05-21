import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

/**
 * Master service class
 */
@Frozen
export class MasterService extends Helper {
    public __http: Http;

    /**
     *
     * @param http
     */
    public constructor(
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
        public __userRepo: typeof repositories.userRepository,
        http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    /**
     *
     * @param data
     * @param authorization
     * @returns
     */
    public getDoctors = async (data: typings.GetMasterReqI, authorization: string): Promise<models.usersI[]> => {

        const {
            user_id: userId = Number(process.env.USERID),
            speciality_id: specialityId,
            facility_location_id: facilityLocationId,
            doctor_id: doctorId,
        } = data;

        const whereClause: { [key: string]: typings.ANY } = { deleted_at: null };

        if (doctorId) {
            whereClause.id = doctorId;
        }

        const facilityLocationFilter: { [key: string]: number } = facilityLocationId ? { facility_location_id: facilityLocationId } : {};

        const specialityFilter: { [key: string]: number } = specialityId ? { speciality_id: specialityId  } : {};

        return this.__userRepo.findAll(
            { ...whereClause },
            {
                include: [
                    {
                        as: 'userFacilities',
                        model: models.user_facility,
                        required: specialityId || facilityLocationId ? true : false,
                        where: { ...facilityLocationFilter, ...specialityFilter, deleted_at: null, },
                    },
                    {
                        as: 'userBasicInfo',
                        model: models.user_basic_info,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]
            }
        );

    }

    /**
     *
     * @param data
     * @param authorization
     * @returns
     */
    public getFacilities = async (data: typings.GetMasterReqI, authorization: string): Promise<models.facility_locationsI[]> => {

        const {
            user_id: userId = Number(process.env.USERID),
            speciality_id: specialityId,
            facility_location_id: facilityLocationId,
            doctor_id: doctorId,
        } = data;

        const whereClause: { [key: string]: typings.ANY } = { deleted_at: null };

        if (facilityLocationId) {
            whereClause.id = facilityLocationId;
        }

        const doctorFilter: { [key: string]: number } = doctorId ? { user_id: doctorId } : {};

        const specialityFilter: { [key: string]: number } = specialityId ? { speciality_id: specialityId } : {};

        return this.__facilityLocationRepo.findAll(
            { ...whereClause },
            {
                include: [
                    {
                        as: 'userFacilities',
                        model: models.user_facility,
                        required: specialityId || doctorId ? true : false,
                        where: { ...doctorFilter, ...specialityFilter, deleted_at: null, },
                    },
                    {
                        as: 'facility',
                        model: models.facilities,
                        required: false,
                        where: { deleted_at: null },
                    },
                ]
            }
        );

    }

    /**
     *
     * @param data
     * @param authorization
     * @returns
     */
    public getSpecialities = async (data: typings.GetMasterReqI, authorization: string): Promise<models.specialitiesI[]> => {

        const {
            user_id: userId = Number(process.env.USERID),
            speciality_id: specialityId,
            facility_location_id: facilityLocationId,
            doctor_id: doctorId,
        } = data;

        const whereClause: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityId) {
            whereClause.id = specialityId;
        }

        const doctorFilter: { [key: string]: number } = doctorId ? { user_id: doctorId } : {};

        const facilityLocationsFilter: { [key: string]: number } = facilityLocationId ? { facility_location_id: facilityLocationId } : {};

        return this.__specialityRepo.findAll(
            { ...whereClause },
            {
                include: {
                    as: 'userFacilty',
                    model: models.user_facility,
                    required: facilityLocationId || doctorId ? true : false,
                    where: { ...doctorFilter, ...facilityLocationsFilter, deleted_at: null, },
                },
            }
        );

    }

}
