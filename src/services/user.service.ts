import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

const Seq: typeof Sequelize.Sequelize = Sequelize.Sequelize;
@Frozen
export class UserService extends Helper {

    public __http: Http;

    /**
     *
     * @param __modelHasRolesRepo
     * @param __userFacilityRepo
     * @param __repo
     * @param __facilityLocationRepo
     * @param __specialityRepo
     * @param http
     */
    public constructor(
        public __modelHasRolesRepo: typeof repositories.modelHasRoleRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __repo: typeof repositories.userRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
        public __availableDoctorRepo: typeof repositories.availableDoctorRepository,
        public __availableSpecialityRepo: typeof repositories.availableSpecialityRepository,
        public __appointmentRepo: typeof repositories.appointmentRepository,
        public __unAvailableDoctorRepo: typeof repositories.unAvailableDoctorRepository,
        public __appoitmentTypeRepo: typeof repositories.appointmentTypesRepository,
        public __appointmentStatusRepo: typeof repositories.appointmentStatusRepository,
        public __casePatientSessionStatusesRepo: typeof repositories.casePatientSessionStatusesRepository,
        public __kioskCaseRepo: typeof repositories.kioskCaseRepository,
        public __caseTypesRepo: typeof repositories.caseTypesRepository,
        public __facilityTimingRepo: typeof repositories.facilityTimingsRepository,
        public __userSpecialityRepo: typeof repositories.userSpecialityRepository,
        public __roleRepo: typeof repositories.roleRepository,
        public __technicianSupervisorsRepo: typeof repositories.technicianSupervisorsRepository,

        public http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    public deleteAllAssignmentAndAppointment = async (body: typings.DeleteAllAssignmentAndAppointmentBodyI, _authorization: string, transaction: Transaction): Promise<typings.DeleteAllAssignmentAndAppointmentResponseI> => {
        const { user_id: userId = Number(process.env.USERID), cancel, reschedule } = body;

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({ user_id: userId, deleted_at: null }, null, transaction));

        const facilityLocationIds: number[] = userFacilities.map((u: models.user_facilityI): number => u.facility_location_id);

        const availabltDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                facility_location_id: { [Op.in]: facilityLocationIds }
            },
            {
            include: [
                {
                    as: 'appointments',
                    model: models.sch_appointments,
                    required: false,
                    where: {
                        cancelled: false,
                        deleted_at: null,
                        pushed_to_front_desk: false
                    }
                }
            ]
        }, transaction));

        const appointments: models.sch_appointmentsI[] = availabltDoctors.map((a: models.sch_available_doctorsI): models.sch_appointmentsI[] => a.appointments).flat();

        const appointmentIds: number[] = appointments.map((appointment: models.sch_appointmentsI): number => appointment.id);

        const appointmentUpdateObj: typings.ANY = {};

        if (cancel) {
            appointmentUpdateObj.cancelled = true;
        } else if (reschedule) {
            appointmentUpdateObj.pushed_to_front_desk = true;
        }

        await this.__appointmentRepo.updateByIds(appointmentIds, { ...appointmentUpdateObj }, transaction);

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        // tslint:disable-next-line: no-floating-promises
        this.__http.post(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [appointmentIds], email_title: cancel ? 'Appointment Cancelled' : 'Appointment Forwarded to Frontdesk' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIds }, config);

        const deletedAppointments: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIds, user_id: null }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: appointmentIds, }, config);

        const availabltDoctorIds: number[] = availabltDoctors.map((a: models.sch_available_doctorsI): number => a.id);

        await this.__availableDoctorRepo.updateByIds(availabltDoctorIds, { deleted_at: new Date() }, transaction);

        return appointments;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getDoctorsDetail = async (query: typings.GetDoctorsDetailQueryParamI, _authorization: string): Promise<typings.ANY> => {

        const { user_id: userId = Number(process.env.USERID), doctor_id } = query;

        const { role: { has_supervisor: hasSupervisor } }: models.model_has_rolesI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: doctor_id,
            },
            {
                include: {
                    as: 'role',
                    model: models.roles,
                    where: {
                        deleted_at: null
                    }
                }
            }
        ));

        let doctorId: number[] = [doctor_id];

        if (hasSupervisor) {
            doctorId = this.shallowCopy(await this.__technicianSupervisorsRepo.findAll(
                {
                    technician_id: doctor_id,
                    deleted_at: null
                }
            )).map((x: models.technician_supervisors): number => x.supervisor_id);
        }

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne(
            {
                deleted_at: null,
                id: doctorId,
            },
            {
                include: [
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
                        where: { speciality_id: { [Op.ne]: null }, deleted_at: null },
                    },
                    {
                        as: 'userBasicInfo',
                        model: models.user_basic_info,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'userTimings',
                        model: models.user_timings,
                        required: false,
                        where: { deleted_at: null },
                    },
                ]
            }
        ));

        if (!user) {
            throw generateMessages('NO_DOCTOR_FOUND');
        }

        // if (!user.userFacilities || !user.userFacilities.length) {
        //     throw generateMessages('LOGGED_IN_NOT_PROVIDER');
        // }

        const userColor: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include: {
                as: 'colorCodes',
                deleted_at: null,
                include: this.__repo.getJoinClause('get_doctor_detail'),
                model: models.sch_color_codes,
                required: false,
                where: { deleted_at: null },
            }
        }));

        if (!userColor || !Object.keys(userColor).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        const { colorCodes } = userColor || {};

        const { userFacilities, userTimings, userBasicInfo } = user || {};

        const updatedColorCode: typings.GetUserInfoI[] = colorCodes && colorCodes?.length ? this.filterNonNull(userFacilities?.map((u: models.user_facilityI): typings.ANY => {

            const color: string = colorCodes.find((c: models.sch_color_codesI): boolean => u?.speciality_id === c?.object_id)?.code;
            const expectSpecility: models.user_facilityI = userFacilities.find((d: models.user_facilityI): models.sch_color_codesI => colorCodes.find((z: models.sch_color_codesI): boolean => d.speciality_id === z.object_id));
            const checkUserTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): boolean => u.facility_location_id === t.facility_location_id);

            if (expectSpecility && Object.keys(expectSpecility).length) {

                const { speciality, ...otherAttributes } = expectSpecility;

                return {
                    color,
                    ...otherAttributes,
                    doctor: {
                        info: { ...userBasicInfo },
                        specialities: { ...speciality },
                        user_timings: checkUserTimings
                    },
                };
            }

        })) : [];

        const updatedColorCodeIds: number[] = updatedColorCode?.map((a: typings.ANY): number => a?.id);

        const defaultColorCode: typings.GetUserInfoI[] = this.filterNonNull(userFacilities.map((u: models.user_facilityI): typings.ANY => {

            const expectSpecility: models.user_facilityI = userFacilities.find((d: models.user_facilityI, index: number): boolean => d.speciality_id !== updatedColorCodeIds[index]);
            const checkUserTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): boolean => u.facility_location_id === t.facility_location_id);

            if ((!expectSpecility || !Object.keys(expectSpecility).length) || (updatedColorCodeIds && updatedColorCodeIds.length)) {
                return null;
            }

            const { speciality, ...otherAttributes } = expectSpecility;

            return {
                color: '#9d9d9d',
                ...otherAttributes,
                doctor: {
                    info: { ...userBasicInfo },
                    specialities: { ...speciality },
                    user_timings: checkUserTimings
                },
            };

        }));

        const formatedresponse: typings.GetUserInfoI[] = [...updatedColorCode, ...defaultColorCode];
        return this.sort(formatedresponse, 'id');

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getDoctorsInfo = async (data: typings.GetDoctorsInfoI, _authorization: string): Promise<typings.GetUserInfoByFacilitiesResponseI | typings.GetUserInfoI[]> => {

        const {
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            is_provider_calendar: isProviderCalendar = false,
            user_id: userId = Number(process.env.USERID),
            facility_location_ids: facilityLocationIds,
            provider_name: providerName,
            provider_speciality: providerSpeciality,
            is_single: isSingle,
            pagination = true,
            per_page,
            page,
        } = data;

        if (!userId) {
            throw generateMessages('ID_MUST_PROVIDED');
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include: {
                as: 'colorCodes',
                deleted_at: null,
                include: this.__repo.getJoinClause('get_doctor_info'),
                model: models.sch_color_codes,
                required: false,
                where: { deleted_at: null },
            }
        }));

        const modelHasRoles: typings.ModelRoleI[] = this.shallowCopy(await this.__modelHasRolesRepo.findAll(
            {
                model_id: userId,
            },
            {
                include: this.__modelHasRolesRepo.getJoinClause('get_doctor_info')
            }
        ));

        const userRoles: typings.UserRoleI[] = modelHasRoles.map((f: typings.ModelRoleI): typings.UserRoleI => f.role);

        const role: string = Object.keys(modelHasRoles).length ? userRoles[0].slug : null;

        if (role !== 'super_admin' && !facilityLocationIds.length) {

            throw generateMessages('USER_NOT_SUPERADMIN');
        }

        let userFacility: models.user_facilityI[];

        userFacility = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: { [Op.in]: facilityLocationIds },
                speciality_id: {
                    [Op.ne]: null
                },
            },
            {
                include: this.__userFacilityRepo.getJoinClause('get_doctor_info'),
            }));

        if (providerName || providerSpeciality || isProviderCalendar) {

            const specialityWhereClause: typings.ANY = providerSpeciality ? { name: { [Op.like]: `%${providerSpeciality}%` } } : null;

            const providerWhereClause: typings.ANY = providerName ? {
                [Op.or]: [

                    Seq.where(Seq.col('first_name'), {
                        [Op.like]: `%${providerName}%`
                    }),

                    Seq.where(Seq.col('middle_name'), {
                        [Op.like]: `%${providerName}%`
                    }),

                    Seq.where(Seq.col('last_name'), {
                        [Op.like]: `%${providerName}%`
                    }),
                ]

            } : null;

            const specialityIdsFilter: typings.ANY = specialityIds?.length ? {
                speciality_id: {
                    [Op.in]: specialityIds
                }
            } : {
                speciality_id: {
                    [Op.ne]: null
                },
            };

            const doctorIdsFilter: typings.ANY = doctorIds?.length ? {
                user_id: {
                    [Op.in]: doctorIds
                }
            } : null;

            userFacility = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    facility_location_id: { [Op.in]: facilityLocationIds },
                    speciality_id: {
                        [Op.ne]: null
                    },
                    ...doctorIdsFilter,
                    ...specialityIdsFilter,
                    speciality_id_2: Sequelize.literal('`user_facility`.speciality_id = `users->userTimings`.specialty_id and `users->userTimings`.specialty_id is not null'),
                    facility_id_2: Sequelize.literal('`user_facility`.facility_location_id = `users->userTimings`.facility_location_id'),
                },
                {
                    group: isSingle ? ['user_id'] : undefined,
                    include: [
                        {
                            as: 'facilityLocation',
                            include: {
                                as: 'facility',
                                model: models.facilities,
                                required: false,
                                where: { deleted_at: null },
                            },
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'speciality',
                            model: models.specialities,
                            required: providerSpeciality ? true : false,
                            where: {
                                ...specialityWhereClause,
                                deleted_at: null,
                            }

                        },
                        {
                            as: 'users',
                            attributes: { exclude: ['password'] },
                            include: [
                                {
                                    as: 'userBasicInfo',
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { ...providerWhereClause, deleted_at: null }
                                },
                                {
                                    as: 'userTimings',
                                    model: models.user_timings,
                                    required: false,
                                    where: { deleted_at: null }
                                },
                                {
                                    as: 'medicalIdentifiers',
                                    attributes: ['id'],
                                    include: {
                                        as: 'billingTitle',
                                        attributes: ['id', 'name'],
                                        model: models.billing_titles,
                                        where: { deleted_at: null  }
                                    },
                                    model: models.medical_identifiers,
                                    where: {
                                        deleted_at: null,
                                  },
                                },
                            ],
                            model: models.users,
                            where: { deleted_at: null }
                        }
                    ],

                }));
        }

        const { colorCodes } = user;

        const formatedFacilityLocations: typings.GetUserInfoI[] = this.filterNonNull(userFacility?.map((u: models.user_facilityI): typings.GetUserInfoI => {
            const { users: relatedUsers, speciality: userSpeciality, facilityLocation, ...otherExpectedAttributes } = u;
            if (relatedUsers?.userTimings.length && userSpeciality) {
                return {
                    ...otherExpectedAttributes,
                    facility_location:facilityLocation,
                    color: colorCodes?.find((s: models.sch_color_codesI): boolean => u.speciality_id === s.object_id)?.code ?? '#9d9d9d',
                    doctor: {
                        billing_title: { ...relatedUsers?.medicalIdentifiers?.billingTitle } ?? {},
                        info: { ...relatedUsers?.userBasicInfo } ?? {},
                        specialities: userSpeciality ?? [],
                        user_timings: relatedUsers?.userTimings ?? []
                    },
                };
            }
        }));

        return pagination ? {
            docs: this.paginate(this.sort(formatedFacilityLocations, 'id'), perPage, pagenumber),
            pages: Math.ceil(formatedFacilityLocations.length / perPage),
            total: formatedFacilityLocations.length,
        } : formatedFacilityLocations;

    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public getDoctorsInfoV1 = async (data: typings.GetDoctorsInfoI, _authorization: string): Promise<typings.GetUserInfoByFacilitiesResponseI | typings.GetUserInfoI[]> => {

        const {
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            is_provider_calendar: isProviderCalendar = false,
            user_id: userId = Number(process.env.USERID),
            facility_location_ids: facilityLocationIds,
            provider_name: providerName,
            provider_speciality: providerSpeciality,
            is_single: isSingle,
            pagination = true,
            per_page,
            page,
        } = data;

        if (!userId) {
            throw generateMessages('ID_MUST_PROVIDED');
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include:[ {
                as: 'colorCodes',
                deleted_at: null,
                include: this.__repo.getJoinClause('get_doctor_info'),
                model: models.sch_color_codes,
                required: false,
                where: { deleted_at: null },
            }, 
        ]
        }));

        const modelHasRoles: typings.ModelRoleI[] = this.shallowCopy(await this.__modelHasRolesRepo.findAll(
            {
                model_id: userId,
            },
            {
                include: this.__modelHasRolesRepo.getJoinClause('get_doctor_info')
            }
        ));

        const userRoles: typings.UserRoleI[] = modelHasRoles.map((f: typings.ModelRoleI): typings.UserRoleI => f.role);

        const role: string = Object.keys(modelHasRoles).length ? userRoles[0].slug : null;

        if (role !== 'super_admin' && !Object.keys(facilityLocationIds).length) {

            throw generateMessages('USER_NOT_SUPERADMIN');
        }

        let userFacility: models.user_facilityI[];

        userFacility = this.shallowCopy(await this.__userSpecialityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: { [Op.in]: facilityLocationIds },
                specialty_id: {
                    [Op.ne]: null
                },
            },
            {
                include: this.__userFacilityRepo.getJoinClause('get_doctor_info'),
            }));

        if (providerName || providerSpeciality || isProviderCalendar) {

            const specialityWhereClause: typings.ANY = providerSpeciality ? { name: { [Op.like]: `%${providerSpeciality}%` } } : null;

            const providerWhereClause: typings.ANY = providerName ? {
                [Op.or]: [

                    Seq.where(Seq.col('first_name'), {
                        [Op.like]: `%${providerName}%`
                    }),

                    Seq.where(Seq.col('middle_name'), {
                        [Op.like]: `%${providerName}%`
                    }),

                    Seq.where(Seq.col('last_name'), {
                        [Op.like]: `%${providerName}%`
                    }),
                ]

            } : null;

            const specialityIdsFilter: typings.ANY = specialityIds?.length ? {
                specialty_id: {
                    [Op.in]: specialityIds
                }
            } : {
                specialty_id: {
                    [Op.ne]: null
                },
            };

            const doctorIdsFilter: typings.ANY = doctorIds?.length ? {
                user_id: {
                    [Op.in]: doctorIds
                }
            } : null;

            userFacility = this.shallowCopy(await this.__userSpecialityRepo.findAll(
                {
                    deleted_at: null,
                    facility_location_id: { [Op.in]: facilityLocationIds },
                    ...specialityIdsFilter,
                    ...doctorIdsFilter
                },
                {
                    group: isSingle ? ['user_id'] : undefined,
                    include: [
                        {
                            as: 'speciality',
                            model: models.specialities,
                            required: providerSpeciality ? true : false,
                            where: {
                                ...specialityWhereClause,
                                deleted_at: null,
                            }

                        },
                        {
                            as: 'users',
                            attributes: { exclude: ['password'] },
                            include: [
                                {
                                    as: 'userBasicInfo',
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { ...providerWhereClause, deleted_at: null }
                                },
                                {
                                    as: 'userTimings',
                                    model: models.user_timings,
                                    required: false,
                                    where: { deleted_at: null }
                                },
                                {
                                    as: 'medicalIdentifiers',
                                    model: models.medical_identifiers,
                                    attributes: ['id'],
                                    include: {
                                        as: 'billingTitle',
                                        attributes: ['name'],
                                        model: models.billing_titles,
                                        where: { deleted_at: null  }
                                    },
                                    where: {
                                        deleted_at: null,
                                  },
                                },
                            ],
                            model: models.users,
                            where: { deleted_at: null }
                        }
                    ],

                }));
        }

        const { colorCodes } = user;

        let expectFacilityLocation: models.user_facilityI;



    
        const facilityWithUpdateColorCode: typings.GetUserInfoI[] = colorCodes?.length ? this.filterNonNull(colorCodes?.map((s: models.sch_color_codesI): typings.GetUserInfoI => {
            expectFacilityLocation = userFacility?.find((u: models.user_facilityI): boolean => u.speciality_id === s.object_id && u.user_id === userId);
            if (expectFacilityLocation && Object.keys(expectFacilityLocation).length) {
                const { users: relatedUsers, speciality: userSpeciality, ...otherExpectedAttributes } = expectFacilityLocation;
                return {
                    ...otherExpectedAttributes,
                    color: s.code,
                    provide_title:(relatedUsers && relatedUsers.medicalIdentifiers ) ? relatedUsers?.medicalIdentifiers?.billingTitle.name: null,
                    doctor: {
                        info: { ...relatedUsers?.userBasicInfo } ?? {},
                        specialities: userSpeciality ?? [],
                        user_timings: relatedUsers?.userTimings ?? []
                    },
                };
            }
        })) : [];

        const facilityWithDefaultColorCode: typings.GetUserInfoI[] = this.filterNonNull(userFacility.map((u: models.user_facilityI): typings.ANY => {
            if (facilityWithUpdateColorCode?.find((s: typings.GetUserInfoI): boolean => u.user_id !== s?.user_id) || !facilityWithUpdateColorCode.length) {
                const { users: relatedUsers, speciality: userSpeciality, ...otherExpectedAttributes } = u;
                return {
                    ...otherExpectedAttributes,
                    color: '#9d9d9d',
                    provide_title: (relatedUsers && relatedUsers.medicalIdentifiers) ? relatedUsers?.medicalIdentifiers?.billingTitle.name: null,
                    doctor: {
                        info: { ...relatedUsers?.userBasicInfo } ?? {},
                        specialities: userSpeciality ?? [],
                        user_timings: relatedUsers?.userTimings ?? [],
                    },
                };
            }
        }));

        const formatedFacilityLocations: typings.GetUserInfoI[] = [...facilityWithUpdateColorCode, ...facilityWithDefaultColorCode];

        return pagination ? {
            docs: this.paginate(this.sort(formatedFacilityLocations, 'id'), perPage, pagenumber),
            pages: Math.ceil(formatedFacilityLocations.length / perPage),
            total: formatedFacilityLocations.length,
        } : formatedFacilityLocations;

    }

    public getMaxMinOfFacility = async (query: typings.getMaxMinOfFacilityI, _authorization: string): Promise<typings.ANY> => {

        const { facility_location_ids } = query;

        const facilityTimings: models.facility_timingsI[] = this.shallowCopy(await this.__facilityTimingRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facility_location_ids
            },
            {
                attributes: [[Sequelize.fn('max', Sequelize.col('end_time')), 'max_time'], [Sequelize.fn('min', Sequelize.col('start_time')), 'min_time'], [Sequelize.fn('min', Sequelize.col('start_time_isb')), 'start_time_isb'], [Sequelize.fn('max', Sequelize.col('end_time_isb')), 'end_time_isb']],
                raw: true,
            }));

        return facilityTimings[0];

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getUserInfoByFacilities = async (data: typings.GetUserInfoByFacilitiesBodyI, _authorization: string): Promise<typings.GetUserInfoByFacilitiesResponseI | typings.GetUserInfoI[]> => {

        const {
            user_id: userId = Number(process.env.USERID),
            facility_location_ids: facilityLocationIds,
            filters: desirefilters,
            per_page,
            page,
            facility_location_name: facilityLocationName,
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            pagination = true,
            is_provider_calendar: isProviderCalendar = false,
            created_by_ids: createdByIds,
            updated_by_ids: updatedByIds,
            created_at: createdAt,
            updated_at: updatedAt
        } = data;

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;
        const requiredFilter: string = desirefilters?.replace(/,/g, '');

        if (!userId) {
            throw generateMessages('USER_ID_MUST_PROVIDED');
        }

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    deleted_at: null,
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        where: {
                            deleted_at: null,
                            slug: 'facility_location'
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        }));

        let facilties: models.facility_locationsI[];

        const joinAndProjectionClause: typings.ANY = this.getJoinAndProjectionClause({ facilityLocationIds, facilityLocationName, desirefilters, requiredFilter, createdAt, updatedAt, createdByIds, updatedByIds });

        if (isProviderCalendar) {

            const doctorFilter: typings.ANY = doctorIds?.length ? {
                user_id: {
                    [Op.in]: doctorIds
                }
            } : null;

            const specialityFilter: typings.ANY = specialityIds?.length ? {
                speciality_id: {
                    [Op.in]: specialityIds
                }
            } : null;

            joinAndProjectionClause.join.include.push({
                as: 'userFacilities',
                include: {
                    as: 'users',
                    attributes: ['id'],
                    model: models.users,
                    where: { deleted_at: null }
                },
                model: models.user_facility,
                required: true,
                where: { ...doctorFilter, ...specialityFilter, deleted_at: null, },
            });
        }

        facilties = this.shallowCopy(await this.__facilityLocationRepo.findAll(
            {
                ...joinAndProjectionClause.where
            },
            {
                ...joinAndProjectionClause.join,

            }));

        if ((!user || !Object.keys(user).length) && (!facilties || !Object.keys(facilties).length)) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes } = user || {};

        let expectFacilityLocation: models.facility_locationsI;

        const facilityWithUpdateColorCode: typings.GetUserInfoI[] = colorCodes?.length ? this.filterNonNull(colorCodes.map((s: models.sch_color_codesI): typings.GetUserInfoI => {
            expectFacilityLocation = facilties?.find((speciality: models.facility_locationsI): boolean => speciality?.id === s?.object_id);
            if (expectFacilityLocation && Object.keys(expectFacilityLocation).length) {
                return {
                    facility_name: expectFacilityLocation?.facility?.name || null,
                    ...expectFacilityLocation,
                    color: s.code
                };
            }
        })) : [];

        const facilityWithUpdateColorCodeIds: number[] = facilityWithUpdateColorCode.map((o: typings.GetUserInfoI): number => o.id);

        const facilityWithDefaultColorCode: typings.GetUserInfoI[] = facilityWithUpdateColorCode.length ? this.filterNonNull(facilties?.map((a: models.facility_locationsI): typings.GetUserInfoI => {

            if (!(facilityWithUpdateColorCodeIds?.some((s: number): boolean => s === a.id))) {

                return {
                    facility_name: a?.facility?.name || null,
                    ...a,
                    color: '#9d9d9d'
                };
            }

        })) : this.filterNonNull(facilties?.map((a: models.facility_locationsI): typings.GetUserInfoI => ({
            facility_name: a?.facility?.name || null,
            ...a,
            color: '#9d9d9d'
        })));

        const formatedFacilityLocations: typings.GetUserInfoI[] = [...facilityWithUpdateColorCode, ...facilityWithDefaultColorCode];

        return pagination ? {
            docs: this.paginate(this.sort(formatedFacilityLocations, 'id'), perPage, pagenumber),
            pages: Math.ceil(formatedFacilityLocations.length / perPage),
            total: formatedFacilityLocations.length,
        } : formatedFacilityLocations;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    // tslint:disable-next-line: member-ordering
    public getUserInfoBySpecialities = async (query: typings.GetUserInfoBySpecialitieseI, _authorization: string): Promise<typings.GetUserInfoBySpecialitieseResponseI | typings.GetUserInfoI[]> => {

        const {
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID),
            per_page,
            speciality_name: specialityName,
            page, time_slot: timeslot,
            over_booking: overbooking,
            speciality_id: specialityId,
            pagination = true,
            is_provider_calendar: isProviderCalendar = false
        } = query;

        if (!userId) {
            throw generateMessages('UNKNOWN_QUERY_PARAMS');
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    deleted_at: null,
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        where: {
                            deleted_at: null,
                            slug: 'speciality'
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        }));

        if (!user || !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes } = user;

        let allSpecialities: models.specialitiesI[];

        let filters: typings.ANY = {};

        if (colorCodes && !timeslot && !overbooking && !specialityId && !specialityName && !isProviderCalendar) {
            allSpecialities = this.shallowCopy(await this.__specialityRepo.findAll({ deleted_at: null }));
        }

        if (colorCodes && (timeslot || overbooking || specialityId || specialityName) && !isProviderCalendar) {

            if (specialityId) {
                filters = { id: specialityId };
            }

            if (timeslot) {
                filters.time_slot = { [Op.like]: `%${timeslot}%` };
            }

            if (overbooking) {
                filters.over_booking = { [Op.like]: `%${overbooking}%` };
            }

            if (specialityName) {
                filters.name = { [Op.like]: `%${specialityName}%` };
            }

            allSpecialities = this.filterNonNull(this.shallowCopy(await this.__specialityRepo.findAll({ ...filters, deleted_at: null })));
        }

        if (isProviderCalendar || facilityLocationIds) {

            const doctorFilter: typings.ANY = doctorIds?.length ? {
                user_id: {
                    [Op.in]: doctorIds
                }
            } : {};

            const specialityFilter: typings.ANY = specialityIds?.length ? {
                id: {
                    [Op.in]: specialityIds
                }
            } : {};

            const facilityLocationsFilter: typings.ANY = facilityLocationIds?.length ? {
                facility_location_id: {
                    [Op.in]: facilityLocationIds
                }
            } : {};

            allSpecialities = this.filterNonNull(this.shallowCopy(await this.__specialityRepo.findAll(
                {
                    ...specialityFilter,
                    deleted_at: null
                },
                {
                    include: {
                        as: 'userFacilty',
                        include: {
                            as: 'users',
                            attributes: ['id'],
                            model: models.users,
                            where: { deleted_at: null }
                        },
                        model: models.user_facility,
                        required: facilityLocationIds ? true : false,
                        where: { ...doctorFilter, ...facilityLocationsFilter, deleted_at: null, },
                    },
                }
            )));

        }

        let expectSpecility: models.specialitiesI;

        const speciaityWithUpdateColorCode: typings.GetUserInfoI[] = colorCodes?.length ? this.filterNonNull(colorCodes.map((s: models.sch_color_codesI): typings.GetUserInfoI => {
            expectSpecility = allSpecialities.find((speciality: models.specialitiesI): boolean => speciality.id === s.object_id);
            if (expectSpecility && Object.keys(expectSpecility).length) {
                return {
                    ...expectSpecility,
                    color: s.code
                };
            }
        })) : [];

        const speciaityWithUpdateColorCodeIds: number[] = speciaityWithUpdateColorCode?.map((a: typings.GetUserInfoI): number => a.id);

        const speciaityWithDefaultColorCode: typings.GetUserInfoI[] = this.filterNonNull(allSpecialities.map((a: models.specialitiesI): typings.GetUserInfoI => {

            if (!(speciaityWithUpdateColorCodeIds.includes(a.id)) || !speciaityWithUpdateColorCode.length) {
                return {
                    ...a,
                    color: '#9d9d9d'
                };
            }

        }));

        const formatedSpecialities: typings.GetUserInfoI[] = [...speciaityWithUpdateColorCode, ...speciaityWithDefaultColorCode];

        return pagination ? {
            docs: this.paginate(this.sort(formatedSpecialities, 'id'), perPage, pagenumber),
            pages: Math.ceil(formatedSpecialities.length / perPage),
            total: formatedSpecialities.length,
        } : formatedSpecialities;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getUserInfoBySpecialitiesV1 = async (query: typings.GetUserInfoBySpecialitieseI, _authorization: string): Promise<typings.GetUserInfoBySpecialitieseResponseI | typings.GetUserInfoI[]> => {

        const {
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID),
            per_page,
            speciality_name: specialityName,
            page, time_slot: timeslot,
            over_booking: overbooking,
            speciality_id: specialityId,
            pagination = true,
            is_provider_calendar: isProviderCalendar = false,
            is_single: isSingle,
            created_by_ids:createdByIds,
            updated_by_ids:updatedByIds,
            created_at:createdAt,
            updated_at:updatedAt
        } = query;

        if (!userId) {
            throw generateMessages('UNKNOWN_QUERY_PARAMS');
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const user: models.usersI = this.shallowCopy(await this.__repo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    deleted_at: null,
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        where: {
                            deleted_at: null,
                            slug: 'speciality'
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        }));

        if (!user || !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes } = user;

        let allSpecialities: models.specialitiesI[];

        let filters: typings.ANY = {};
        let usersJoinClause: typings.ANY = [
            {
                model: models.users,
                as: 'created_by_user',
                attributes: ['id'],
                required: createdByIds?.length ? true : false,
                include: {
                    model: models.user_basic_info,
                    as: 'userBasicInfo',
                    attributes: ['first_name', 'middle_name', 'last_name']
                }
            },
            {
                model: models.users,
                as: 'updated_by_user',
                attributes: ['id'],
                required: updatedByIds?.length ? true : false,
                include: {
                    model: models.user_basic_info,
                    as: 'userBasicInfo',
                    attributes: ['first_name', 'middle_name', 'last_name']
                }
            }
        ]

        if (colorCodes && !timeslot && !overbooking && !specialityId && !specialityName && !isProviderCalendar) {
            allSpecialities = this.shallowCopy(await this.__specialityRepo.findAll({ deleted_at: null }));
        }

        if (colorCodes && (timeslot || overbooking || specialityId || specialityName) && !isProviderCalendar) {

            if (specialityId) {
                filters = { id: specialityId };
            }

            if (timeslot) {
                filters.time_slot = { [Op.like]: `%${timeslot}%` };
            }

            if (overbooking) {
                filters.over_booking = { [Op.like]: `%${overbooking}%` };
            }

            if (specialityName) {
                filters.name = { [Op.like]: `%${specialityName}%` };
            }

            if(createdAt){
                filters.created_at = { [Op.between]: [new Date(new Date(createdAt).setUTCHours(0, 0, 0, 0)), new Date(new Date(createdAt).setUTCHours(23, 59, 59, 59))] };
            }

            if(updatedAt){
                filters.updated_at = { [Op.between]: [new Date(new Date(updatedAt).setUTCHours(0, 0, 0, 0)), new Date(new Date(updatedAt).setUTCHours(23, 59, 59, 59))] };
            }

            if(createdByIds){
                filters.created_by = { [Op.in]: createdByIds }
            }

            if(updatedByIds){
                filters.updated_by = { [Op.in]: updatedByIds }
            }

            allSpecialities = this.filterNonNull(this.shallowCopy(await this.__specialityRepo.findAll({ ...filters, deleted_at: null })));
        }

        if (isProviderCalendar || facilityLocationIds) {

            const doctorFilter: typings.ANY = doctorIds?.length ? {
                user_id: {
                    [Op.in]: doctorIds
                }
            } : {};

            const specialityFilter: typings.ANY = {
                ...(specialityIds?.length && { id: { [Op.in]: specialityIds } }),
                ...(createdByIds?.length && { created_by: { [Op.in]: createdByIds } }),
                ...(updatedByIds?.length && { updated_by: { [Op.in]: updatedByIds } }),
                ...(createdAt && { created_at: { [Op.between]: [new Date(new Date(createdAt).setUTCHours(0, 0, 0, 0)), new Date(new Date(createdAt).setUTCHours(23, 59, 59, 59))] } }),
                ...(updatedAt && { updated_at: { [Op.between]: [new Date(new Date(updatedAt).setUTCHours(0, 0, 0, 0)), new Date(new Date(updatedAt).setUTCHours(23, 59, 59, 59))] } })
            };

            const facilityLocationsFilter: typings.ANY = facilityLocationIds?.length ? {
                facility_location_id: {
                    [Op.in]: facilityLocationIds
                }
            } : {};

            allSpecialities = this.filterNonNull(this.shallowCopy(await this.__specialityRepo.findAll(
                {
                    ...specialityFilter,
                    facility_location_id: Sequelize.literal('`userFacilty`.facility_location_id = `userFacilty->users->userTimings`.facility_location_id'),
                    speciality_id: Sequelize.literal('`userFacilty`.speciality_id = `userFacilty->users->userTimings`.specialty_id'),
                    deleted_at: null
                },
                {
                    include: [
                        {
                            as: 'userFacilty',
                            include: {
                                as: 'users',
                                attributes: ['id'],
                                model: models.users,
                                where: { deleted_at: null },
                                include: {
                                    as: 'userTimings',
                                    model: models.user_timings,
                                    required: false,
                                    where: { deleted_at: null },
                                }
                            },
                            model: models.user_facility,
                            required: facilityLocationIds ? true : false,
                            where: { ...doctorFilter, ...facilityLocationsFilter, deleted_at: null, },
                        },
                        ...usersJoinClause
                    ],
                }
            )));

        }

        let expectSpecility: models.specialitiesI;

        const speciaityWithUpdateColorCode: typings.GetUserInfoI[] = colorCodes?.length ? this.filterNonNull(colorCodes.map((s: models.sch_color_codesI): typings.GetUserInfoI => {
            expectSpecility = allSpecialities.find((speciality: models.specialitiesI): boolean => speciality.id === s.object_id);
            if (expectSpecility && Object.keys(expectSpecility).length) {
                return {
                    ...expectSpecility,
                    color: s.code
                };
            }
        })) : [];

        const speciaityWithUpdateColorCodeIds: number[] = speciaityWithUpdateColorCode?.map((a: typings.GetUserInfoI): number => a.id);

        const speciaityWithDefaultColorCode: typings.GetUserInfoI[] = this.filterNonNull(allSpecialities.map((a: models.specialitiesI): typings.GetUserInfoI => {

            if (!(speciaityWithUpdateColorCodeIds.includes(a.id)) || !speciaityWithUpdateColorCode.length) {
                return {
                    ...a,
                    color: '#9d9d9d'
                };
            }

        }));

        let formatedSpecialities: any = [...speciaityWithUpdateColorCode, ...speciaityWithDefaultColorCode];

        if (isSingle) {
            formatedSpecialities = formatedSpecialities.map((d) => ({
                    ...d,
                    userFacilty: d.userFacilty[0]
            }));
        }

        return pagination ? {
            docs: this.paginate(this.sort(formatedSpecialities, 'id'), perPage, pagenumber),
            pages: Math.ceil(formatedSpecialities.length / perPage),
            total: formatedSpecialities.length,
        } : formatedSpecialities;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateSpecialityTimeSlots = async (data: typings.UpdateSpecialityTimeSlotsBodyI, _authorization: string, _transaction: Sequelize.Transaction): Promise<typings.ANY> => {

        const { specialities, user_id: userId } = data;

        const specialityIds: number[] = specialities.map((s: typings.UpdateSpecialityTimeSlotsSpecialitiesI): number => s.id);

        const returnSpecialities: models.specialitiesI[] = this.shallowCopy(await this.__specialityRepo.findAll({ id: { [Op.in]: specialityIds } }));

        if (returnSpecialities.length !== specialityIds.length) {
            throw generateMessages('INVALID_SPECIALITY_IDS');
        }

        const currentDateTime: Date = new Date();

        /**
         * update timeslot values in specialities master table, yes i did but at the END
         */

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({
            deleted_at: null,
            speciality_id: { [Op.in]: specialityIds }
        }));

        if (!userFacilities || !userFacilities.length) {
            throw generateMessages('NO_PROVIDER_OF_SPECIALITY_FOUND');
        }

        const doctorIdsFromFacility: number[] = userFacilities.map((s: models.user_facilityI): number => s?.user_id);

        const avaialbleSpecialities: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
            {
                speciality_id: { [Op.in]: specialityIds },
            },
            {
                include:
                {
                    as: 'dateList',
                    include: {
                        as: 'appointments',
                        model: models.sch_appointments,
                        required: false,
                        where: {
                            available_doctor_id: null,
                            deleted_at: null,
                        }
                    },
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        start_date: { [Op.gt]: currentDateTime }
                    }
                },
            }
        ));

        const avaialbleSpecialityIds: number[] = avaialbleSpecialities.map((a: models.sch_available_specialitiesI): number => a.id);

        const formattedAvailablites: models.sch_available_specialitiesI[] = avaialbleSpecialities.map((i: models.sch_available_specialitiesI): models.sch_available_specialitiesI[] => {
            const { dateList: dateListOfSpeciality } = i;

            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): models.sch_available_specialitiesI => ({

                ...i,
                appointments: d.appointments,
                end_date: d.end_date,
                no_of_doctors: d.no_of_doctors,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,

            }));

        }).flat();

        const appointmentTypes: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({
            deleted_at: null,
            slug: 'initial_evaluation',
        }));

        const appointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({
            deleted_at: null,
            slug: 're_scheduled'
        }));

        const visitStatus: models.kiosk_case_patient_session_statusesI = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findOne({ slug: 're_scheduled' }));

        const toSendObj: typings.ANY = {
            appointments: [],
            status_id: visitStatus.id
        };

        const requiredAppointmentIds: number[] = [];

        let requiredSpecialityOverBooking: models.specialitiesI;

        for (const availability of formattedAvailablites) {

            const seconds: number = new Date(availability.end_date).getTime() - new Date(availability.start_date).getTime();
            const mins: number = (seconds / 1000) / 60;

            const requiredSpeciality: typings.UpdateSpecialityTimeSlotsSpecialitiesI = specialities.find((s: typings.UpdateSpecialityTimeSlotsSpecialitiesI): boolean => s.id === availability.speciality_id);

            let slots: number = mins / requiredSpeciality.time_slot; // Speciality slot time
            slots = slots * availability.no_of_doctors;

            await this.__availableSpecialityRepo.update(availability.id, { time_slots: slots });

            if (availability.appointments.length) {

                requiredSpecialityOverBooking = returnSpecialities.find((r: models.specialitiesI): boolean => r.id === availability.speciality_id);
                const getFreeSlotsOfAvailableSpeciality: typings.FreeSlotsI[][] = this.getFreeSlotsForAutoResolveAppointment(availability, [], requiredSpecialityOverBooking.over_booking + 1, requiredSpeciality.time_slot, true, []);

                if (getFreeSlotsOfAvailableSpeciality[0].length) {

                    const oldDoctortimeSlot: number = mins / (availability.no_of_slots / availability.no_of_doctors);

                    const { appointments } = availability || {};

                    const updateAppointmentsWithTimeSlot: models.sch_appointmentsI[] = appointments && appointments.length ? appointments?.map((z: models.sch_appointmentsI): models.sch_appointmentsI => {

                        const timeSlot: number = z.time_slots / oldDoctortimeSlot * requiredSpeciality.time_slot;

                        return {
                            ...z,
                            time_slots: timeSlot,
                        };
                    }) : [];

                    const formattedAppointments: typings.ANY = this.resolveAppointmentTimeSlotChange(getFreeSlotsOfAvailableSpeciality[1], updateAppointmentsWithTimeSlot, null, availability.id, requiredSpeciality.time_slot, appointmentTypes.id, appointmentStatus.id);
                    const remainingAppointments: models.sch_appointmentsI[] = formattedAppointments[1];
                    const resolvedAppointments: models.sch_appointmentsI[] = formattedAppointments[0];

                    for (const toUpdate of resolvedAppointments) {
                        requiredAppointmentIds.push(toUpdate.id);
                        toSendObj.appointments.push({
                            appointment_id: toUpdate.id,
                            case_id: toUpdate.case_id,
                        });
                        await this.__appointmentRepo.update(toUpdate.id, { ...toUpdate });
                    }

                    if (remainingAppointments && remainingAppointments.length) {

                        const appointmentsFDIds: number[] = remainingAppointments.map((z: models.sch_appointmentsI): number => z.id);

                        await this.sentAppointmentsToFD(appointmentsFDIds, userId, availability?.facility_location_id, availability?.facility_location_id, this.__modelHasRolesRepo, this.__userFacilityRepo, this.__http, this.__appointmentRepo, Op);
                    }

                }
            }
        }

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: { [Op.in]: avaialbleSpecialityIds }
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'dateList',
                        include: {
                            as: 'appointments',
                            model: models.sch_appointments,
                            required: false,
                            where: {
                                available_doctor_id: null,
                                deleted_at: null,
                            }
                        },
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            start_date: { [Op.gt]: currentDateTime }
                        }
                    }
                ]
            }));

        const formattedDoctorAvailablites: models.sch_available_doctorsI[] = availableDoctors.map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {
            const { dateList: dateListOfDoctor } = i;

            return dateListOfDoctor?.map((d: models.sch_recurrence_date_listsI): models.sch_available_specialitiesI => ({

                ...i,
                appointments: d.appointments,
                end_date: d.end_date,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,

            }));

        }).flat();

        for (const availability of formattedDoctorAvailablites) {

            const seconds: number = new Date(availability.end_date).getTime() - new Date(availability.start_date).getTime();
            const mins: number = (seconds / 1000) / 60;

            const requiredSpeciality: typings.UpdateSpecialityTimeSlotsSpecialitiesI = specialities.find((s: typings.UpdateSpecialityTimeSlotsSpecialitiesI): boolean => s.id === availability.availableSpeciality.speciality_id);
            const slots: number = mins / requiredSpeciality.time_slot; // Speciality slot time

            await this.__availableDoctorRepo.update(availability.id, { time_slots: slots });

            if (availability.appointments) {


                const getFreeSlotsOfAvailableDoctor: typings.FreeSlotsI[][] = this.getFreeSlotsForAutoResolveAppointment(availability, [], requiredSpecialityOverBooking.over_booking + 1, requiredSpeciality.time_slot, true, []);

                if (getFreeSlotsOfAvailableDoctor[0].length) {

                    const oldDoctortimeSlot: number = mins / availability.no_of_slots;

                    const { appointments } = availability || {};

                    const updateAppointmentsWithTimeSlot: models.sch_appointmentsI[] = appointments && appointments.length ? appointments?.map((z: models.sch_appointmentsI): models.sch_appointmentsI => {

                        const timeSlot: number = z.time_slots / oldDoctortimeSlot * requiredSpeciality.time_slot;

                        return {
                            ...z,
                            time_slots: timeSlot,
                        };
                    }) : [];

                    const formattedAppointments: typings.ANY = this.resolveAppointmentTimeSlotChange(getFreeSlotsOfAvailableDoctor[1], updateAppointmentsWithTimeSlot, availability.id, null, requiredSpeciality.time_slot, appointmentTypes.id, appointmentStatus.id);
                    const remainingAppointments: models.sch_appointmentsI[] = formattedAppointments[1];
                    const resolvedAppointments: models.sch_appointmentsI[] = formattedAppointments[0];

                    for (const toUpdate of resolvedAppointments) {
                        requiredAppointmentIds.push(toUpdate.id);
                        toSendObj.appointments.push(
                            {
                                appointment_id: toUpdate.id,
                                case_id: toUpdate.case_id,
                            });
                        await this.__appointmentRepo.update(toUpdate.id, { ...toUpdate });
                    }

                    if (remainingAppointments && remainingAppointments.length) {

                        const appointmentsFDIds: number[] = remainingAppointments.map((z: models.sch_appointmentsI): number => z.id);

                        await this.sentAppointmentsToFD(appointmentsFDIds, userId, availability?.facility_location_id, availability?.facility_location_id, this.__modelHasRolesRepo, this.__userFacilityRepo, this.__http, this.__appointmentRepo, Op);
                    }
                }
            }
        }

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        // tslint:disable-next-line: no-floating-promises
        this.__http.post(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [requiredAppointmentIds], email_title: 'Appointment Updated' }, config);

        // tslint:disable-next-line: no-floating-promises
        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: requiredAppointmentIds }, config);
        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: requiredAppointmentIds, user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

        const { status: newStatusAddedToKiosk } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/update-by-appointment-ids`, { ...toSendObj }, config));

        if (newStatusAddedToKiosk !== 200) {
            throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
        }

        const updatedSpecs: models.specialitiesI[] = [];

        for (const z of specialities) {

            updatedSpecs.push(await this.__specialityRepo.update(z.id, {
                time_slot: z.time_slot,
                updated_at: new Date(),
                updated_by: userId,
            }));

        }

        return updatedSpecs;

    }

    /**
     * @param data
     * @param _authorization
     *  @returns
     */
    private readonly getAppointmentById = async (data: typings.singleAppointmentBodyI, _authorization: string, transaction?: Transaction): Promise<typings.ANY> => {

        const {
            appointment_id: appointmentId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const appointment: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
            {
                id: appointmentId,
            },
            {
                include: [
                    {
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: {
                            model: models.kiosk_case_types
                        }
                    },
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: [
                                    {
                                        as: 'userBasicInfo',
                                        model: models.user_basic_info,
                                        required: false,
                                        attributes: ['id', 'first_name', 'middle_name', 'last_name'],
                                        where: { deleted_at: null },
                                    },
                                ],
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableSpeciality',
                        include: {
                            as: 'speciality',
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        attributes: ['id', 'first_name', 'middle_name', 'last_name', 'profile_avatar']
                    },
                    {
                        as: 'appointmentVisitSession',
                        model: models.visit_sessions,
                        attribute: ['deleted_at'],
                        required: false,
                        paranoid: false,
                        separate : true,
                        limit: 1,
                        order: [ ['id', 'DESC'] ],
                    },
                    {
                        as: 'appointmentVisit',
                        include: {
                            as: 'visitState',
                            model: models.visit_session_states,
                            required: false,
                            attribute: ['name', 'slug']
                        },
                        model: models.visit_sessions,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            },
            transaction
        ));

        return appointment.map((o: typings.ANY): typings.ANY => {

            const formattedSpecialityId: number = o?.available_doctor_id ? o?.availableDoctor?.availableSpeciality?.speciality_id : o?.availableSpeciality?.speciality_id;
            const formattedDoctorId: number = o?.available_doctor_id ? o?.availableDoctor?.doctor_id ?? null : null;
            const formattedFacilityLocationId: number = o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id;

            const formattedSocketId: string = o?.available_doctor_id ? `${formattedDoctorId}_${formattedSpecialityId}_${formattedFacilityLocationId}` : null;
            const formattedFacilitySpecialtyId: string = formattedFacilityLocationId && formattedSpecialityId ? `${formattedFacilityLocationId}_${formattedSpecialityId}` : null;
            let isLastVisitDeleted: boolean = false;

            if (o?.appointmentVisitSession?.length) {
                isLastVisitDeleted = o?.appointmentVisitSession[0].deleted_at === null ? false : true;
            }

            return {
                id: o?.id,
                start_date_time: o?.scheduled_date_time,
                comments: o?.comments,
                evaluation_date_time: o?.evaluation_date_time,
                available_speciality_id: o?.available_speciality_id,
                available_doctor_id: o.available_doctor_id ?? null,
                priority_id: o?.priority_id,
                patient_id: o?.patient_id,
                time_slot: o?.time_slots,
                case_id: o?.case_id,
                visit_deleted: isLastVisitDeleted,
                socket_id: formattedSocketId,
                speciality_socket_id: formattedFacilitySpecialtyId,
                appointment_title: o?.appointment_title,
                appointment_type_id: o?.type_id,
                appointment_duration: o?.time_slots,
                picture: o?.patient.profile_avatar,
                confirmation_status: o?.confirmation_status,
                speciality_id: formattedSpecialityId,
                facility_location_id: o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id,
                first_name: o?.patient.first_name,
                last_name: o?.patient?.last_name,
                middle_name: o?.patient?.middle_name,
                doctor_id: formattedDoctorId,
                doctor_last_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.middle_name ?? null : null,
                doctor_middle_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.last_name ?? null : null,
                doctor_first_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.first_name ?? null : null,
                visit_session_state_slug: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.slug : null,
                visit_session_state_name: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.name : null,
                // It 'assign_to_me' would be false by default as were checked by empty array [] with includes
                assign_to_me: false,
                case_type: o?.case?.caseType?.name ?? null,
                case_type_id: o?.case_type_id,
                back_dated_check: o?.appointmentVisit?.document_uploaded && o?.billable !== null ? true : false,
            };
        });

    }

    private readonly getDeletedAppointmentsById = async (data: typings.singleAppointmentBodyI, _authorization: string, transaction?: Transaction): Promise<typings.ANY> => {

        const {
            appointment_id: appointmentId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
            {
                id: appointmentId,

            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: false,
                            where: { deleted_at: null }
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableSpeciality',
                        include: {
                            as: 'speciality',
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                ]
            },
            transaction
        ));

        return appointments.map((o: typings.ANY): typings.ANY => {

            const formattedSpecialityId: number = o?.available_doctor_id ? o?.availableDoctor?.availableSpeciality?.speciality_id : o?.availableSpeciality?.speciality_id;
            const formattedDoctorId: number = o?.available_doctor_id ? o?.availableDoctor?.doctor_id ?? null : null;
            const formattedFacilityLocationId: number = o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id;
            const formattedSocketId: string = o?.available_doctor_id ? `${formattedDoctorId}_${formattedSpecialityId}` : null;
            const formattedFacilitySpecialtyId: string = formattedFacilityLocationId && formattedSpecialityId ? `${formattedFacilityLocationId}_${formattedSpecialityId}` : null;

            return {
                doctor_id: formattedDoctorId,
                id: o?.id,
                speciality_socket_id: formattedFacilitySpecialtyId,
                socket_id: formattedSocketId,
                speciality_id: formattedSpecialityId,
            };
        });

    }

    /**
     *
     * @param obj
     */
    private readonly getJoinAndProjectionClause = (obj: typings.ANY): typings.ANY => {

        const { facilityLocationIds, facilityLocationName, desirefilters, requiredFilter, createdAt, updatedAt, createdByIds, updatedByIds } = obj;

        let facilityLocationsWhere: typings.ANY = null;

        if (facilityLocationIds?.length) {
            facilityLocationsWhere = {
                id: { [Op.in]: facilityLocationIds },
            };
        }

        if (facilityLocationName) {
            return {
                join: {
                    include: [
                        {
                            as: 'faciltyTiming',
                            model: models.facility_timings,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'facility',
                            model: models.facilities,
                            required: false,
                            where: {
                                deleted_at: null,
                                name: { [Op.like]: `%${facilityLocationName}%` },
                            },
                        }
                    ]
                },
                where: {
                    deleted_at: null,
                    ...facilityLocationsWhere
                },
            };
        }

        if (!desirefilters) {

            return {
                join: {
                    include: [
                        {
                            as: 'facility',
                            model: models.facilities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'faciltyTiming',
                            model: models.facility_timings,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            model: models.users,
                            as: 'created_by_user',
                            attributes: ['id'],
                            required:createdByIds?.length ? true:false,
                            include: {
                                model: models.user_basic_info,
                                as: 'userBasicInfo',
                                attributes: ['first_name', 'middle_name', 'last_name']
                            }
                        },
                        {
                            model: models.users,
                            as: 'updated_by_user',
                            attributes: ['id'],
                            required: updatedByIds?.length ? true : false,
                            include: {
                                model:models.user_basic_info,
                                as: 'userBasicInfo',
                                attributes: ['first_name', 'middle_name', 'last_name']
                            }
                        }
                    ]
                },
                where: {
                    deleted_at: null,
                    ...facilityLocationsWhere
                },
            };
        }

        return {
            join: {
                include: [
                    {
                        as: 'faciltyTiming',
                        model: models.facility_timings,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'facility',
                        model: models.facilities,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]
            },
            where: {
                deleted_at: null,
                ...facilityLocationsWhere,
                [Op.or]: [

                    Seq.where(Seq.col('address'), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.col('city'), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.col('state'), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.col('zip'), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('city')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('state')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('city'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('state'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('city'), ' ', Seq.col('state')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('city'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('state'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('city'), ' ', Seq.col('state'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    }),

                    Seq.where(Seq.fn('concat', Seq.col('address'), ' ', Seq.col('city'), ' ', Seq.col('state'), ' ', Seq.col('zip')), {
                        [Op.like]: `%${requiredFilter}%`
                    })

                ]
            },
        };
    }

    private readonly resolveAppointmentTimeSlotChange = (freeSlots: typings.FreeSlotsI[], appointments: models.sch_appointmentsI[], availabilityDoctorId: number, availableSpecialityId: number, timeSlot: number, appointmentTypeId: number, appointmentStatusId: number): typings.ANY => {

        let patientWithInitialAppointments: models.sch_appointmentsI[] = appointments.filter((x: models.sch_appointmentsI): boolean => x.type_id === appointmentTypeId);
        let patientWithOutInitialAppointments: models.sch_appointmentsI[] = appointments.filter((x: models.sch_appointmentsI): boolean => x.type_id !== appointmentTypeId);
        let patientWithOtherAppointments: models.sch_appointmentsI[] = [];
        let onlyInitials: models.sch_appointmentsI[] = [];
        const resolvedAppointments: typings.ResolvedAppointmentRequiredObjectI[] = [];
        const thisAppointmentSlots: typings.FreeSlotsI[] = [];
        const initialCheckArray: typings.FreeSlotsBodyI[] = [];

        for (const singleAppointment of appointments) {

            if (singleAppointment.type_id === appointmentTypeId) {
                //
                onlyInitials = [...onlyInitials, singleAppointment];

                patientWithInitialAppointments = [...patientWithInitialAppointments, ...this.filterNonNull(appointments?.filter((z: models.sch_appointmentsI): models.sch_appointmentsI => {
                    if (singleAppointment.patient_id !== z?.patient_id && singleAppointment.case_id !== z?.case_id) {
                        return z;
                    }
                }))];

            } else {

                patientWithOutInitialAppointments = [...patientWithOutInitialAppointments, ...this.filterNonNull(appointments?.filter((d: models.sch_appointmentsI): models.sch_appointmentsI => {

                    if (patientWithInitialAppointments.find((z: models.sch_appointmentsI): boolean => singleAppointment.patient_id !== z?.patient_id && singleAppointment.case_id !== z?.case_id)) {
                        return d;
                    }

                }))];

                patientWithOtherAppointments = [...patientWithOtherAppointments, ...this.filterNonNull(appointments?.filter((d: models.sch_appointmentsI): models.sch_appointmentsI => {

                    if (patientWithInitialAppointments.find((z: models.sch_appointmentsI): boolean => singleAppointment.patient_id === z?.patient_id && singleAppointment.case_id === z?.case_id)) {
                        return d;
                    }

                }))];
            }
        }

        onlyInitials = [...onlyInitials, ...patientWithOutInitialAppointments];

        let notResolvedAppointments: models.sch_appointmentsI[] = onlyInitials.map((s: models.sch_appointmentsI): models.sch_appointmentsI => {

            const slotsRequired: number = s.time_slots / timeSlot;
            const checkResolvedAppointment: typings.FreeSlotsI = freeSlots.find((o: typings.FreeSlotsI, index: number): typings.FreeSlotsI => {

                let isSolveAble: boolean = false;

                if (!(freeSlots[index + slotsRequired]?.count > 0)) {
                    isSolveAble = true;
                }

                if (!isSolveAble) {

                    for (let k: number = 0; k < slotsRequired; k += 1) {
                        thisAppointmentSlots.push(freeSlots[index + k]);
                        freeSlots[index + k].count -= 1;
                    }

                    if (s.type_id === appointmentTypeId) {

                        const requiredObject: typings.ANY = {};
                        requiredObject.slots = thisAppointmentSlots;
                        requiredObject.patient_id = s.patient_id;
                        requiredObject.case_id = s.case_id;
                        initialCheckArray.push(requiredObject);

                    }

                    const temp: typings.ANY = {};
                    temp.id = s.id;
                    temp.scheduled_date_time = freeSlots[index].startDateTime;
                    temp.available_doctor_id = availabilityDoctorId;
                    temp.available_speciality_id = availableSpecialityId;
                    temp.status_id = appointmentStatusId;
                    temp.time_slots = s.time_slots;
                    resolvedAppointments.push(temp);

                    return o;

                }
            });

            if (!checkResolvedAppointment) {
                return {
                    ...s
                };
            }

        });

        notResolvedAppointments = this.filterNonNull([...notResolvedAppointments, ...patientWithOtherAppointments.map((s: models.sch_appointmentsI): models.sch_appointmentsI => {

            const slotsRequired: number = s.time_slots / timeSlot;
            const checkResolvedAppointment: typings.FreeSlotsI = freeSlots.find((o: typings.FreeSlotsI, index: number): typings.FreeSlotsI => {

                let isSolveAble: boolean = false;

                if (!(freeSlots[index + slotsRequired]?.count > 0)) {
                    isSolveAble = true;
                }

                if (!isSolveAble) {

                    const checkForResolvedAppointment: typings.FreeSlotsBodyI = initialCheckArray.find((z: typings.FreeSlotsBodyI): typings.FreeSlotsBodyI => {

                        if (z.case_id === s.case_id && z.patient_id === s.patient_id) {

                            const lastSlot: typings.FreeSlotsI = z.slots.pop();
                            lastSlot.startDateTime.setMinutes(lastSlot.startDateTime.getMinutes() + timeSlot);

                            if (new Date(freeSlots[index].startDateTime).getTime() >= new Date(lastSlot.startDateTime).getTime()) {
                                const temp: typings.ANY = {};
                                temp.id = s.id;
                                temp.scheduled_date_time = freeSlots[index].startDateTime;
                                temp.available_doctor_id = availabilityDoctorId;
                                temp.available_speciality_id = availableSpecialityId;
                                temp.status_id = appointmentStatusId;
                                temp.time_slots = s.time_slots;
                                resolvedAppointments.push(temp);
                                return z;
                            }

                        }
                    });

                    if (checkForResolvedAppointment && Object.keys(checkForResolvedAppointment).length) {

                        for (let c: number = 0; c < slotsRequired; c += 1) {
                            freeSlots[index + c].count -= 1;
                        }
                        return o;
                    }

                }

            });

            if (!checkResolvedAppointment || !Object.keys(checkResolvedAppointment).length) {

                return {
                    ...s
                };
            }

        })]);

        return [resolvedAppointments, notResolvedAppointments];
    }

}
