import * as Sequelize from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY, FormattedAvailablitiesI, GetUnAvailableDoctorsNotificationResponseObjI } from '../shared/common';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class UnavailableDoctorNoticationService extends Helper {
    public __http: Http;

    /**
     *
     * @param unAvailableDoctorNotificationType
     * @param __userFacilityRepo
     * @param __facilityLocationRepo
     * @param __userRepo
     * @param __availableDoctorRepo
     * @param __appointmentRepo
     * @param __modelHasRolesRepo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.unAvailableDoctorNotificationRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __userRepo: typeof repositories.userRepository,
        public __availableDoctorRepo: typeof repositories.availableDoctorRepository,
        public __appointmentRepo: typeof repositories.appointmentRepository,
        public __modelHasRolesRepo: typeof repositories.modelHasRoleRepository,
        public __unAvailableDoctorRepo: typeof repositories.unAvailableDoctorRepository,

        public http: typeof Http

    ) {
        super();
        this.__http = new http();

    }

    public details = async (data: ANY, _authorization: string): Promise<ANY> => {

        const {
            unavailabile_doctor_id: unavailabileDoctorId,
            facility_location_ids: facilityLocationIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const unavailabileDoctorNotificaiton: models.sch_unavailable_doctorsI = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne(
            {
                deleted_at: null,
                id: unavailabileDoctorId
            },
            {
                include: [
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
                                include: {
                                    as: 'speciality',
                                    model: models.specialities,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.user_facility,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'medicalIdentifiers',
                                model: models.medical_identifiers,
                                required: false,
                                attributes: ['id'],
                                include: {
                                    as: "billingTitle",
                                    attributes: ['name'],
                                    model: models.billing_titles,
                                    where: { deleted_at: null },
                                    required: false,
                                },
                                where: {
                                    deleted_at: null,
                                },
                            },
                        ],
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'createdBy',
                        include:[
                            {
                                as: 'userBasicInfo',
                                model: models.user_basic_info,
                                required: false,
                                where: { deleted_at: null },
                            },
                             
                        
                        ],

                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'updatedBy',
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
                    },
                    {
                        as: 'approvedBy',
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
                ],
                order: [
                    ['created_at', 'DESC']
                ]
            }));

   

        const userForFacilityColor: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            },
            {
                include:
                    {
                        as: 'colorCodes',
                        include: {
                            as: 'type',
                            model: models.sch_color_code_types,
                            where: {
                                deleted_at: null,
                                slug: 'facility_location',
                            }
                        },
                        model: models.sch_color_codes,
                        where: {
                            deleted_at: null,
                        }
                }
            }
        ));

        const userForSpecialityColor: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            },
            {
                include:
                    {
                        as: 'colorCodes',
                        include: {
                            as: 'type',
                            model: models.sch_color_code_types,
                            where: {
                                deleted_at: null,
                                slug: 'speciality',
                            }
                        },
                        model: models.sch_color_codes,
                        required: false,
                        where: { deleted_at: null },
                }
            }
        ));

        if (!userForSpecialityColor && !Object.keys(userForSpecialityColor).length && !userForFacilityColor && !Object.keys(userForFacilityColor).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes: colorCodesForSpeciality } = userForSpecialityColor || {};
        const { colorCodes: colorCodesForFacility } = userForFacilityColor || {};

        const { doctor: { userFacilities, userBasicInfo: doctorBasicInfo,medicalIdentifiers, ...otherAttributes1 }, doctor, createdBy, updatedBy, approvedBy, ...otherAttributes } = unavailabileDoctorNotificaiton || {};

        const availablDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
                    {
                        deleted_at: null,
                        doctor_id: unavailabileDoctorNotificaiton.doctor_id,
                    },
                    {
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                [Op.or]: [
                                    {
                                        deleted_at: null,
                                        end_date: { [Op.gt]: unavailabileDoctorNotificaiton.start_date },
                                        start_date: { [Op.lte]: unavailabileDoctorNotificaiton.start_date },
                                    },
                                    {
                                        deleted_at: null,
                                        start_date: { [Op.and]: [
                                            { [Op.gte]: unavailabileDoctorNotificaiton.start_date },
                                            { [Op.lt]: unavailabileDoctorNotificaiton.end_date }
                                            ]
                                        }
                                    }
                                ]
                            },
                        },
                    }
                ));

        const availabileDoctorIds: number[] = availablDoctor.map((s: models.sch_available_doctorsI): number => s.id);
        const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
            {
                available_doctor_id: { [Op.in]: availabileDoctorIds },
                cancelled: 0,
                deleted_at: null,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [ unavailabileDoctorNotificaiton.start_date, unavailabileDoctorNotificaiton.end_date ] },
            }
        ));

        const numberOfAppointments: number = checkAppointments.length;

        const facilityLocationIdsFromAvailableDoctor: number[] = this.filterUnique(availablDoctor.map((e: models.sch_available_doctorsI): number => e.facility_location_id));

        const getUserFacility: models.facility_locationsI[] = this.shallowCopy(await this.__facilityLocationRepo.findAll(
            {
                deleted_at: null,
                id: { [Op.in]: facilityLocationIdsFromAvailableDoctor },
            }
        ));

        const affectedFacilities: GetUnAvailableDoctorsNotificationResponseObjI[] = getUserFacility?.map((t: models.facility_locationsI): GetUnAvailableDoctorsNotificationResponseObjI =>
            ({

                appointment_count: numberOfAppointments,
                facility_color: colorCodesForFacility?.find((fac: models.sch_color_codesI): boolean => fac.object_id === t.id)?.code ?? '#9d9d9d',
                facility_location_id: t.id,
                is_accessible: facilityLocationIds.includes(t.id) ? 1 : 0,
                ...t,
            }));

        const specialityWithColor: models.specialitiesI[] =  userFacilities.map((p: models.user_facilityI): ANY => {

            const { speciality , facility_location_id: facilityLocationId} = p;

            return {
                color:  colorCodesForSpeciality?.find((fac: models.sch_color_codesI): boolean => fac.object_id === p?.speciality?.id)?.code ?? '#9d9d9d',
                facility_location_id: facilityLocationId,
                ...speciality,
            };

        }).flat();

        return {
            affected_facilities: affectedFacilities ,
            doctor: {
                ...otherAttributes1,
                specialities: [...specialityWithColor],
                userBasicInfo: doctorBasicInfo,
                provider_title:(medicalIdentifiers)?medicalIdentifiers?.billingTitle?.name : null
            },
            ...otherAttributes,
            approved_by: approvedBy ? {
                user_basic_info: approvedBy.userBasicInfo,
                ...this.deleteAttributes(['userBasicInfo'], approvedBy)
            } : null,
            created_by: createdBy ? {
                user_basic_info: createdBy.userBasicInfo,
                ...this.deleteAttributes(['userBasicInfo'], createdBy)
            } : null,
            updated_by: updatedBy ? {
                user_basic_info: updatedBy.userBasicInfo,
                ...this.deleteAttributes(['userBasicInfo'], updatedBy)
            } : null,
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAll = async (data: ANY, _authorization: string): Promise<ANY> => {

        const {
            facility_location_ids: facilityLocationIds,
            user_id: userId = Number(process.env.USERID),
            per_page,
            page,
        } = data;

        const perPage: number = per_page ? per_page : 10;
        const pageNumber: number = page ? page : 1;

        const userFacility: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: { [Op.in]: facilityLocationIds },
                speciality_id: { [Op.ne]: null},
            }
        ));

        const doctorIds: number[] = this.filterUnique(userFacility?.map((o: models.user_facilityI): number => o?.user_id));

        const userForSpecialityColor: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            },
            {
                include:
                    {
                        as: 'colorCodes',
                        include: {
                            as: 'type',
                            model: models.sch_color_code_types,
                            where: {
                                deleted_at: null,
                                slug: 'speciality',
                            }
                        },
                        model: models.sch_color_codes,
                        required: false,
                        where: { deleted_at: null },
                }
            }
        ));

        const { colorCodes: colorCodesForSpeciality } = userForSpecialityColor || {};

        const unavailableDoctorNotication: ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.paginate(
            {
                where: {
                    deleted_at: null,
                    doctor_id: { [Op.in]: doctorIds},
                },
            },
            pageNumber,
            perPage,
            null,
            {
                include: [
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
                                include: {
                                    as: 'speciality',
                                    model: models.specialities,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.user_facility,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'medicalIdentifiers',
                                model: models.medical_identifiers,
                                attributes: ['id'],
                                required: false,
                                include: {
                                    as: 'billingTitle',
                                    attributes: ['name'],
                                    model: models.billing_titles,
                                    required: false,
                                    where: { deleted_at: null  }
                                },
                                where:  {
                                    deleted_at: null,
                              },
                            },
                        ],
                        model: models.users,
                        required: true,
                        where: { deleted_at: null },
                    },
                ],
                order: [
                    ['created_at', 'DESC']
                ]
            }
        ));

        const formatedUnavailableDoctors: ANY =  unavailableDoctorNotication.docs.map((p: models.sch_unavailable_doctorsI): ANY => {

            const { doctor } = p || {};

            return {
                provider_title: p?.doctor?.medicalIdentifiers ? doctor?.medicalIdentifiers?.billingTitle?.name : null,
                speciality_color: p?.doctor?.userFacilities?.length ? colorCodesForSpeciality?.find((fac: models.sch_color_codesI): boolean => fac.object_id === doctor?.userFacilities?.find((x) => x.speciality_id === fac.object_id)?.speciality_id)?.code ?? '#9d9d9d' : '#9d9d9d',
                ...p,
            };

        });

        return {
            docs: [ ...formatedUnavailableDoctors ],
            is_last: unavailableDoctorNotication?.is_last,
            no_of_pages: unavailableDoctorNotication?.no_of_pages,
            page_number: unavailableDoctorNotication?.page_number,
            total: unavailableDoctorNotication?.total,
        };

    }

}
