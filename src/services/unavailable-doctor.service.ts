import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY, AppointmentsAgainstAavailablityResponseDataI, FreeSlotsI, GenericHeadersI, ModelRoleI, ResolvedDoctorAndAppointmentArrayI, ResolveDoctorAssignmentsObjI } from '../shared/common';
import * as typings from '../shared/common';
import {
    DeleteUnAvailableDoctorsReqObjI,
    UnAvailableDoctorsReqObjI,
    UnAvailableDoctorsResponseObjI,
    UpdateUnAvailableDoctorsReqObjI
} from '../shared/common/unavailable-doctor.types';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class UnAvailableDoctorService extends Helper {

    public __http: Http;
    private readonly __actionPreferencesMethodName: { [key: string]: string };

    private readonly __methodName: { [key: string]: string };

    /**
     *
     * @param __repo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.unAvailableDoctorRepository,
        public __userRepo: typeof repositories.userRepository,
        public __availableDoctorRepo: typeof repositories.availableDoctorRepository,
        public __appointmentRepo: typeof repositories.appointmentRepository,
        public __recurrenceDateListRepo: typeof repositories.recurrenceDateListRepository,
        public __actionPreferencesRepo: typeof repositories.actionPreferencesRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __modelHasRolesRepo: typeof repositories.modelHasRoleRepository,
        public __appointmentStatusRepo: typeof repositories.appointmentStatusRepository,
        public __kioskCaseRepo: typeof repositories.kioskCaseRepository,
        public __caseTypesRepo: typeof repositories.caseTypesRepository,

        public http: typeof Http
    ) {
        super();
        this.__http = new http();

        this.__methodName = {
            0: 'declineDoctorUnavailibility',
            1: 'acceptDoctorUnavailibility'
        };

        this.__actionPreferencesMethodName = {
            auto_resolve: 'autoResolveAppointments',
            cancel: 'cancelAppointments',
            forward_to_frontdesk: 'sendAppointmentsToFD'
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public addUnavailableDoctor = async (data: UnAvailableDoctorsReqObjI, _authorization: string): Promise<UnAvailableDoctorsResponseObjI> => {

        const {
            user_id: userId = Number(process.env.USERID),
            description,
            doctor_id: doctorId,
            start_date: startDateString,
            end_date: endDateString,
            subject
        } = data;
        const approvalStatus: number = null;

        const existUnavailbility =  this.shallowCopy(await this.__repo.findAll({
            doctor_id: doctorId,
            deleted_at: null,
            [Op.or]: [
                { [Op.and]: [{ start_date: { [Op.lte]: new Date(startDateString) } }, { end_date: { [Op.gte]: new Date(endDateString) } }] },
                { [Op.and]: [{ start_date: { [Op.lt]: new Date(startDateString) } }, { end_date: { [Op.gt]: new Date(endDateString) } }] },
                { [Op.and]: [{ start_date: { [Op.lt]: new Date(startDateString) } }, { end_date: { [Op.lt]: new Date(endDateString) } }, { end_date: { [Op.gt]: new Date(startDateString) } }, { start_date: { [Op.lt]: new Date(endDateString) } }   ] },
                { [Op.and]: [{ start_date: { [Op.gte]: new Date(startDateString) } }, { end_date: { [Op.lte]: new Date(endDateString) } }] },
                { [Op.and]: [{ start_date: { [Op.gt]: new Date(startDateString) } }, { end_date: { [Op.lt]: new Date(endDateString) } }] },
                { [Op.and]: [{ start_date: { [Op.gt]: new Date(startDateString) } }, { start_date: { [Op.lt]: new Date(endDateString) } }] },
            ]
        }));

        if(existUnavailbility && Object.keys(existUnavailbility).length){
            throw generateMessages('UNAVAILBILITY_SAME_TIME');
        }

        return this.__repo.create({
            approval_status: approvalStatus,
            created_by: userId,
            description,
            doctor_id: doctorId,
            end_date: endDateString,
            start_date: startDateString,
            subject,
        });

    }

    /**
     *
     * @param query
     * @param _authorization
     */
    public deleteUnavailableDoctor = async (data: DeleteUnAvailableDoctorsReqObjI, _authorization: string): Promise<models.sch_unavailable_doctorsI> => {

        const {
            id,
            user_id: userId = Number(process.env.USERID),
            comments
        } = data;

        const approvalStatus: number = null;

        return this.__repo.update(
            id,
            {
                comments,
                deleted_at: new Date(),
                updated_by: userId,
            }
        );

    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public getAppointments = async (data: ANY, _authorization: string): Promise<ANY> => {

        const {
            date_list_id: dateListId,
            start_date: startDateString,
            end_date: endDateString,
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
            {
                cancelled: 0,
                date_list_id: dateListId,
                deleted_at: null,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [startDate, endDate] },
            },
            {
                include: [
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableDoctor',
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
                        },
                        model: models.sch_available_doctors,
                        required: true,
                        where: { deleted_at: null }
                    },
                ]
            }
        ));

        if (!appointments || !appointments.length) {
            return [];
        }

        return [
            ...this.formatedAppointmentAgainstDateList(appointments),
        ];

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public update = async (data: UpdateUnAvailableDoctorsReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            approval_status: approvalStatus,
            user_id: userId = Number(process.env.USERID),
            id,
        } = data;

        const doctorUnavailibilityObj: models.sch_unavailable_doctorsI = this.shallowCopy(await this.__repo.findById(id));

        if (!doctorUnavailibilityObj || !Object.keys(doctorUnavailibilityObj).length) {

            throw generateMessages('NO_UNAVAILABILTY_FOUND');
        }

        if (doctorUnavailibilityObj.approval_status === 0 || doctorUnavailibilityObj.approval_status === 1) {
            throw generateMessages('ASSIGNMENT_NOT_FOUND');
        }

        return this[`${this.__methodName[`${approvalStatus}`]}`](doctorUnavailibilityObj, id, userId, _authorization, transaction);

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateApprovalStatus = async (id: number, status: number, userId: number, transaction: Transaction): Promise<ANY> => {
        await this.__repo.update((id), {
            approval_status: status,
            approved_by: userId,
            updated_at: new Date(),
            updated_by: userId,
            // tslint:disable-next-line: align
        }, transaction);

        const userInfo: models.usersI = this.shallowCopy(await this.__userRepo.findById(userId, {
            include: {
                as: 'userBasicInfo',
                model: models.user_basic_info,
                required: false,
                where: { deleted_at: null },
            }
        }));

        return {
            approved_by: {
                user_basic_info: userInfo.userBasicInfo,
                ...this.deleteAttributes(['userBasicInfo'], userInfo)
            }
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    // tslint:disable-next-line: no-empty
    private readonly acceptDoctorUnavailibility = async (doctorUnavailibilityObj: models.sch_unavailable_doctorsI, id: number, userId: number, _authorization: string, transaction: Transaction): Promise<ANY> => {
        const { start_date: startDate, end_date: endDate, doctor_id: doctorId } = doctorUnavailibilityObj;

        const joinClauseForActionPreferences: ANY = this.__actionPreferencesRepo.getJoinClause('update_unavailable_doctors');

        const actionPreferences: models.sch_action_preferencesI = this.shallowCopy(await this.__actionPreferencesRepo.findOne({ user_id: userId, deleted_at: null }, {
            include: [...joinClauseForActionPreferences]
        }));

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll({ doctor_id: doctorId, deleted_at: null }, {
            include: [
                {
                    as: 'dateList',
                    include: {
                        as: 'appointments',
                        model: models.sch_appointments,
                        required: false,
                        where: {
                            cancelled: false,
                            deleted_at: null,
                            pushed_to_front_desk: false,
                            scheduled_date_time: {
                                [Op.and]: [
                                    { [Op.gte]: startDate },
                                    { [Op.lt]: endDate }
                                ]
                            },
                        },
                    },
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        [Op.or]: [
                            { start_date: { [Op.lte]: startDate }, end_date: { [Op.gte]: endDate }, deleted_at: null },
                            { start_date: { [Op.gte]: startDate, [Op.lt]: endDate }, deleted_at: null },
                            { end_date: { [Op.gt]: startDate, [Op.lte]: endDate }, deleted_at: null }
                        ]
                    }
                },

            ]
        }));

        const actionSlug: string = actionPreferences?.actionPreferencesType?.slug ?? 'cancel';

        const facilityLocationType: number = actionPreferences?.facility_location_type;

        if (!availableDoctors.length) {
            return this.updateApprovalStatus(id, 1, userId, transaction);
        }

        let allAppointments: number[] = [];
        const forwardAppointments: ANY = [];
        const facility_locations: number[] = [];
        let targetFacilityLocationIds: number[] = [];

        const appointmentIdsToBeUpdated: ANY = availableDoctors.filter((d: models.sch_available_doctorsI): number => d.available_speciality_id)
            .map((f: models.sch_available_doctorsI): ANY =>
                f.dateList
            ).flat()
            .map((s: models.sch_recurrence_date_listsI): ANY =>
                s.appointments
            ).flat()
            .reduce((acc: number[], c: models.sch_appointmentsI): number[] => {
                // tslint:disable-next-line: no-parameter-reassignment
                acc = [...acc, c.id];
                return acc;
                // tslint:disable-next-line: align
            }, []);
          
       const docAssignIdsToBeDeleted: number[] = availableDoctors.filter((d: models.sch_available_doctorsI): boolean => new Date(d.start_date).getTime() >= new Date(startDate).getTime() && new Date(d.end_date).getTime() <= new Date(endDate).getTime())
           .map((f: models.sch_available_doctorsI): number => f.id);

        for (const docAssign of availableDoctors) {
            const { dateList } = docAssign;

            for (const singleValue of dateList) {

                const { appointments } = singleValue;

                if (appointments.length && docAssign.available_speciality_id !== null) {

                    const appointmentIds: number[] = appointments.map((appointment: models.sch_appointmentsI): number => appointment.id);

                    if (actionSlug === 'forward_to_frontdesk') {
                        const clinicObj: models.sch_action_preference_forward_facility_locationI = actionPreferences.actionPreferencesFacilityLocations.find((location: models.sch_action_preference_forward_facility_locationI): boolean => location.origin_id === docAssign.facility_location_id);

                        targetFacilityLocationIds = actionPreferences.actionPreferencesFacilityLocations.map((location: models.sch_action_preference_forward_facility_locationI): number => location.target_id);
                        if (clinicObj && Object.keys(clinicObj).length) {

                            // tslint:disable-next-line: no-unused-expression
                            !facility_locations.some((c: ANY): ANY => c === clinicObj.origin_id) && facility_locations.push(clinicObj.origin_id);
                            // tslint:disable-next-line: no-unused-expression
                            !facility_locations.some((c: ANY): ANY => c === clinicObj.target_id) && facility_locations.push(clinicObj.target_id);
                            //throw generateMessages('CLINIC_NOT_FOUND');
                        }
 
                        forwardAppointments.push({
                            forward_appointments: appointments,
                            origin_clinic_id: clinicObj?.origin_id ?? docAssign.facility_location_id,
                            target_clinic_id: clinicObj?.target_id ?? targetFacilityLocationIds[0]
                        });
                    }

                    allAppointments = allAppointments.concat(appointmentIds);

                }
            }
        }

        if (appointmentIdsToBeUpdated.length) {
            await this.__appointmentRepo.updateByIds(appointmentIdsToBeUpdated, { available_doctor_id: null, updated_by: userId, updated_at: new Date() }, transaction);

            const config: GenericHeadersI = {
                headers: { Authorization: _authorization },
            };

            // tslint:disable-next-line: no-floating-promises
            this.__http.post(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [appointmentIdsToBeUpdated], email_title: 'Appointment Updated' }, config);

            // tslint:disable-next-line: no-floating-promises
            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIdsToBeUpdated }, config);
            const formattedAppointmentForIOS = await this.getAppointmentById({ appointment_id: [appointmentIdsToBeUpdated], user_id: userId}, _authorization);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

            // Const config: GenericHeadersI = {
            //     Headers: { Authorization: _authorization },
            // };

            // Await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);
        }

        if (docAssignIdsToBeDeleted.length) {
            await this.__recurrenceDateListRepo.updateByReferenceIds({ available_doctor_id: { [Op.in]: docAssignIdsToBeDeleted } }, { deleted_at: new Date(), updated_by: userId }, transaction);
            return this.__availableDoctorRepo.updateByIds(docAssignIdsToBeDeleted, { deleted_at: new Date(), updated_by: userId }, transaction);
        }

        if (!allAppointments.length) {
            return this.updateApprovalStatus(id, 1, userId, transaction);
        }

        const response: ANY = await this[this.__actionPreferencesMethodName[`${actionSlug}`]]({ unavailibility_end_date: endDate, facility_location_tpye: facilityLocationType, userId, facility_locations, allAppointments, forwardAppointments, _authorization, transaction });

        if (response) {
            return this.updateApprovalStatus(id, 1, userId, transaction);
        }
    }

    private readonly autoResolveAppointments = async (data: ANY, _authorization: string): Promise<ANY> => {

        const {
            allAppointments: appointmentIds,
            available_doctor_id: availableDoctorId,
            userId,
            facility_location_tpye: facilityLocationType,
            unavailibility_end_date: unavailibilityEndDate,
        } = data;

        const appointmentsToBeResolved: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
            {
                deleted_at: null,
                id: { [Op.in]: appointmentIds },
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include:
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
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: true,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ],
                order: [
                    ['scheduled_date_time', 'ASC']
                ]
            },

        ));

        if (!appointmentsToBeResolved || !appointmentsToBeResolved.length || appointmentsToBeResolved.length !== appointmentIds.length) {
            throw generateMessages('NO_APPOINTMENT_FOUND');
        }

        const formatedRequiredArray: ResolvedDoctorAndAppointmentArrayI[] = this.formatAvailableDoctorForAutoResolve(appointmentsToBeResolved, availableDoctorId);

        const formatedAvailbleDoctor: ResolvedDoctorAndAppointmentArrayI = formatedRequiredArray[1];
        const formatedAppoinments: ResolvedDoctorAndAppointmentArrayI[] = formatedRequiredArray[0] as unknown as ResolvedDoctorAndAppointmentArrayI[];

        const startDate: Date = unavailibilityEndDate ? new Date(unavailibilityEndDate) : new Date(formatedAvailbleDoctor.end_date);
        const endDate: Date = new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));

        const facilityLocationIdsForDoctor: number[] = await this.findFacilityLocations(formatedAvailbleDoctor.doctor_id, userId);

        const whereClauseForAvailableDoctor: { [key: string]: ANY } = {
            doctor_id: formatedAvailbleDoctor.doctor_id,
            end_date: { [Op.lte]: endDate },
            facility_location_id: { [Op.in]: facilityLocationIdsForDoctor },
            start_date: { [Op.gte]: startDate },
        };

        if (availableDoctorId) {
            whereClauseForAvailableDoctor.id = { [Op.ne]: availableDoctorId };
        }

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                ...whereClauseForAvailableDoctor
            },
            {
                include: [
                    {
                        as: 'appointments',
                        model: models.sch_appointments,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        include:
                        {
                            as: 'userFacilities',
                            model: models.user_facility,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                ]
            }
        ));

        if (!availableDoctors || !availableDoctors.length) {
            throw generateMessages('NO_OTHER_ASSIGNMENTS_FOUND');
        }

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                approval_status: 1,
                doctor_id: formatedAvailbleDoctor.doctor_id,
                end_date: { [Op.lte]: endDate },
                start_date: { [Op.gte]: startDate },
            }
        ));

        let toBeResolvedAvailableDoctor: models.sch_available_doctorsI;
        let requiredArray: models.sch_appointmentsI[] = availableDoctors.map((o: models.sch_available_doctorsI): models.sch_appointmentsI[] => o.appointments).flat();

        let updatedArray: models.sch_appointmentsI[] = [];

        let counter: number = 0;

        while (formatedAppoinments.length > counter) {

            toBeResolvedAvailableDoctor = availableDoctors.find((d: models.sch_available_doctorsI): models.sch_available_doctorsI => {

                requiredArray = [...requiredArray, ...updatedArray?.filter((s: models.sch_appointmentsI): boolean => !(s.available_doctor_id !== d.id))];

                if (facilityLocationType !== 'same') {

                    const { doctor: { userFacilities } } = d;

                    for (const each of userFacilities) {

                        if (formatedAvailbleDoctor?.speciality_id === each.speciality_id) {

                            let availableFreeSlots: FreeSlotsI[] = this.getFreeSlotsForAssignment(formatedAvailbleDoctor, requiredArray, formatedAvailbleDoctor.over_booking + 1, formatedAvailbleDoctor.time_slot, 0);

                            availableFreeSlots = this.getFreeSlotsWithUnavailabilityChk(availableFreeSlots, unavailabileDoctors, formatedAvailbleDoctor.time_slot);

                            const getResolvedAppointments: ANY = this.resolveDoctorAppointmentOnFreeSlots(availableFreeSlots, formatedAppoinments, d.id, formatedAvailbleDoctor.time_slot);

                            if (getResolvedAppointments[1].length === 0) {

                                updatedArray = [...updatedArray, ...getResolvedAppointments[0]];
                                return d;
                            }

                            updatedArray = [...updatedArray, ...getResolvedAppointments[0]];

                        }
                    }

                } else {

                    if (formatedAvailbleDoctor.facility_location_id === d.facility_location_id) {

                        let availableFreeSlots: FreeSlotsI[] = this.getFreeSlotsForAssignment(formatedAvailbleDoctor, requiredArray, formatedAvailbleDoctor.over_booking + 1, formatedAvailbleDoctor.time_slot, 0);

                        availableFreeSlots = this.getFreeSlotsWithUnavailabilityChk(availableFreeSlots, unavailabileDoctors, formatedAvailbleDoctor.time_slot);

                        const getResolvedAppointments: ANY = this.resolveDoctorAppointmentOnFreeSlots(availableFreeSlots, formatedAppoinments, d.id, formatedAvailbleDoctor.time_slot);

                        if (getResolvedAppointments[1].length === 0) {

                            updatedArray = [...updatedArray, ...getResolvedAppointments[0]];
                            return d;
                        }

                        updatedArray = [...updatedArray, ...getResolvedAppointments[0]];
                    }
                }

                updatedArray = this.filterNonNull(updatedArray);

            });

            counter += 1;
        }

        if (!updatedArray.length) {
            throw generateMessages('NO_FREE_SLOTS_FOUND');
        }

        if (unavailibilityEndDate && updatedArray.length !== appointmentIds.length) {
            throw generateMessages('CANNOT_FIND_FREESLOTS');
        }

        const reScheduledStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 're_scheduled',
            }
        ));

        const requiredResolvedAppointmentsArray: models.sch_appointmentsI[] = updatedArray?.map((d: models.sch_appointmentsI): models.sch_appointmentsI => ({
            ...d,
            status_id: reScheduledStatus?.id
        }));

        const toBeResolvedAppointmentIds: number[] = appointmentsToBeResolved.map((d: models.sch_appointmentsI): number => d.id);

        await this.__repo.updateByIds(
            toBeResolvedAppointmentIds,
            {
                deleted_at: new Date(),
                updated_by: userId,
            }
        );

        const newResolvedAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.bulkCreate([...requiredResolvedAppointmentsArray]));

        const config: GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        // Await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        // Status feature is still to be handle
        return newResolvedAppointments;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    private readonly cancelAppointments = async (dataObj: ANY): Promise<ANY> => {

        const { userId, allAppointments, _authorization, transaction } = dataObj;

        const config: GenericHeadersI = {
            headers: { Authorization: `${_authorization}` }
        };

        const { status } = await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/remove-patient-sessions`, { appointment_ids: allAppointments }, config);

        if (status !== 200) {

            throw generateMessages('ERROR_FROM_KIOSK');
        }

        const updatedAppointments: models.sch_appointmentsI[] = await this.__appointmentRepo.updateByIds(allAppointments, { cancelled: 1, updated_by: userId, updated_at: new Date() }, transaction);

        // tslint:disable-next-line: no-floating-promises
        this.__http.post(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [allAppointments], email_title: 'Appointment Cancelled' }, config);

        // tslint:disable-next-line: no-floating-promises
        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: allAppointments }, config);

        const deletedAppointments = await this.getAppointmentById({ appointment_id: allAppointments, user_id: null }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: allAppointments, }, config);

        // Await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        return updatedAppointments;

    }

    private readonly checkBackDated = async (appointment: typings.ANY, config: typings.ANY): Promise<typings.ANY> => {

        const { billable, appointmentVisit } = appointment || {};

        const backDatedCheck: boolean = appointmentVisit?.document_uploaded && billable !== null ? true : false;

        return {
            back_dated_check: backDatedCheck,
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    // tslint:disable-next-line: no-empty
    private readonly declineDoctorUnavailibility = async (doctorUnavailibilityObj: models.sch_unavailable_doctorsI, id: number, userId: number, _authorization: string, transaction: Transaction): Promise<ANY> =>
        this.updateApprovalStatus(id, 0, userId, transaction)

    /**
     *
     * @param doctorId
     * @param userId
     */
    private readonly findFacilityLocations = async (doctorId: number, userId: number): Promise<number[]> => {

        const doctorLocations: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({
            deleted_at: null,
            speciality_id: { [Op.ne]: null },
            user_id: doctorId,
        }));

        if (!doctorLocations) {
            throw generateMessages('NO_PROVIDE_PARACTICE');
        }

        const doctorLocationIds: number[] = doctorLocations.map((e: models.user_facilityI): number => e.facility_location_id);

        const modelHasRoles: ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        if (!modelHasRoles || !Object.keys(modelHasRoles).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        const { role: userRole, role: { slug } } = modelHasRoles;

        if (userRole && slug === 'super_admin') {
            return doctorLocationIds;
        }

        const userLocations: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({
            deleted_at: null,
            facility_location_id: {
                [Op.in]: doctorLocationIds
            },
            user_id: userId,
        }));

        if (!userLocations) {

            throw generateMessages('NO_USER_PRACTICE');
        }

        const userLocationIds: number[] = userLocations.map((e: models.user_facilityI): number => e.facility_location_id);

        return userLocationIds.filter((x: number): boolean => doctorLocationIds.includes(x));
    }

    /**
     *
     * @param singleAppointment
     * @param appointments
     * @param getTimeSlot
     */
    private readonly formatAvailableDoctor = (singleAppointment: models.sch_appointmentsI, appointments: models.sch_appointmentsI[], getTimeSlot: number): ANY => {

        const {
            dateList: { start_date, end_date, no_of_slots: noOfSlots },
            available_doctor_id: availableDoctorId,
            availableDoctor,
            availableDoctor: { doctor: { userFacilities }, supervisor_id: supervisorId, doctor_id: doctorId },
        } = singleAppointment;

        const requiredToBeResolvedDoctor: ResolveDoctorAssignmentsObjI = {
            available_speciality_id: availableDoctor?.available_speciality_id,
            doctor_id: doctorId,
            end_date: new Date(end_date),
            facility_location_id: availableDoctor?.facility_location_id,
            id: availableDoctorId,
            no_of_slots: noOfSlots,
            over_booking: userFacilities?.find((d: models.user_facilityI): boolean => d.facility_location_id === availableDoctor.facility_location_id)?.speciality?.over_booking ?? null,
            speciality_id: userFacilities?.find((d: models.user_facilityI): boolean => d.facility_location_id === availableDoctor.facility_location_id)?.speciality_id ?? null,
            start_date: new Date(start_date),
            supervisor_id: supervisorId,
            time_slot: getTimeSlot,
        };

        const requiredArray: models.sch_appointmentsI[] = appointments.map((d: models.sch_appointmentsI): models.sch_appointmentsI =>
        ({
            appointment_title: d.appointment_title,
            available_doctor_id: d.available_doctor_id,
            available_speciality_id: d.available_speciality_id,
            case_id: d.case_id,
            comments: d.comments,
            confirmation_status: d.confirmation_status,
            evaluation_date_time: d.evaluation_date_time,
            id: d.id,
            patient_id: d.patient_id,
            priority_id: d.priority_id,
            scheduled_date_time: d.scheduled_date_time,
            status_id: d.status_id,
            time_slots: d.time_slots,
            type_id: d.type_id,
        }));

        return [requiredArray, requiredToBeResolvedDoctor];

    }

    /**
     *
     * @param appointments
     * @param isForApproval
     */
    private readonly formatAvailableDoctorForAutoResolve = (appointments: models.sch_appointmentsI[], isForApproval: boolean | number): ResolvedDoctorAndAppointmentArrayI[] => {

        let requiredArray: models.sch_appointmentsI[] = [];

        if (!isForApproval) {

            const {
                dateList: { start_date: startDateString, end_date: endDateString, no_of_slots: noOfSlots },
            } = appointments[0];

            const startDateFromDateList: Date = new Date(startDateString);
            const endDateFromDateList: Date = new Date(endDateString);

            let difference: number = endDateFromDateList.getTime() - startDateFromDateList.getTime();
            difference = difference / 60000;

            const getTimeSlot: number = difference / noOfSlots;

            return this.formatAvailableDoctor(appointments[0], appointments, getTimeSlot);
        }

        return this.filterNonNull(appointments.map((a: models.sch_appointmentsI): ANY => {

            const {
                dateList: { start_date: startDateString, end_date: endDateString, no_of_slots: noOfSlots },
                available_doctor_id: availableDoctorId,
                availableDoctor,
                availableDoctor: { doctor: { userFacilities }, supervisor_id: supervisorId, doctor_id: doctorId }
            } = a;

            const startDateFromDateList: Date = new Date(startDateString);
            const endDateFromDateList: Date = new Date(endDateString);

            let difference: number = endDateFromDateList.getTime() - startDateFromDateList.getTime();
            difference = difference / 60000;

            const getTimeSlot: number = difference / noOfSlots;

            if (!requiredArray.length) {

                return this.formatAvailableDoctor(a, appointments, getTimeSlot);

            }

            const isDuplicate: models.sch_appointmentsI = requiredArray.find((p: models.sch_appointmentsI): boolean => p?.available_doctor_id === a.available_doctor_id);

            if (isDuplicate && Object.keys(isDuplicate).length) {
                return null;
            }

            const requiredToBeResolvedDoctor: ResolveDoctorAssignmentsObjI = {
                available_speciality_id: availableDoctor?.available_speciality_id,
                doctor_id: doctorId,
                end_date: endDateFromDateList,
                facility_location_id: availableDoctor?.facility_location_id,
                id: availableDoctorId,
                no_of_slots: noOfSlots,
                over_booking: userFacilities?.find((s: models.user_facilityI): boolean => s.facility_location_id === availableDoctor.facility_location_id)?.speciality?.over_booking ?? null,
                speciality_id: userFacilities?.find((p: models.user_facilityI): boolean => p.facility_location_id === availableDoctor.facility_location_id)?.speciality_id ?? null,
                start_date: startDateFromDateList,
                supervisor_id: supervisorId,
                time_slot: getTimeSlot,
            };

            requiredArray = this.filterNonNull(appointments.map((d: models.sch_appointmentsI): models.sch_appointmentsI => {

                if (a.available_doctor_id !== d.available_doctor_id) {
                    return null;
                }
                return {
                    appointment_title: d.appointment_title,
                    available_doctor_id: d.available_doctor_id,
                    available_speciality_id: d.available_speciality_id,
                    case_id: d.case_id,
                    comments: d.comments,
                    confirmation_status: d.confirmation_status,
                    evaluation_date_time: d.evaluation_date_time,
                    id: d.id,
                    patient_id: d.patient_id,
                    priority_id: d.priority_id,
                    scheduled_date_time: d.scheduled_date_time,
                    status_id: d.status_id,
                    time_slots: d.time_slots,
                    type_id: d.type_id,
                };

            }));

            return [requiredArray, requiredToBeResolvedDoctor];

        }).flat());

    }

    /**
     *
     * @param appointment
     * @returns
     */
    private readonly formatedAppointmentAgainstDateList = (appointment: models.sch_appointmentsI[]): models.sch_appointmentsI[] =>
        appointment.map((d: models.sch_appointmentsI): AppointmentsAgainstAavailablityResponseDataI => ({
            appointment_id: d.id,
            appointment_status: d.appointmentStatus.name,
            appointment_status_slug: d.appointmentStatus.slug,
            available_doctor_id: d.available_doctor_id,
            available_speciality_id: d.available_speciality_id,
            case_id: d.case_id,
            doctor_id: d.available_doctor_id ? d.availableDoctor?.doctor_id : null,
            doctor_info: d.available_doctor_id ? d.availableDoctor?.doctor?.userBasicInfo : null,
            patient_id: d.patient_id,
            patient_info: d.patient,
            scheduled_date_time: d.scheduled_date_time,
            speciality_id: d.available_speciality_id ? d?.availableSpeciality?.speciality_id : null,
            time_slots: d.time_slots,
        }))

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
     * @param assignment
     * @param appointment
     * @param overbooking
     * @param timeSlot
     * @param wantOverBooking
     */
    private readonly getFreeSlotsForAssignment = (assignment: models.sch_available_specialitiesI | models.sch_available_doctorsI, appointment: models.sch_appointmentsI[], overbooking: number, timeSlot: number, wantOverBooking?: number): ANY => {

        if (!timeSlot) {
            return [];
        }

        const freeSlots: FreeSlotsI[] = [];

        const assignmentStartDate: Date = new Date(assignment.start_date);
        const assignmentEndDate: Date = new Date(assignment.end_date);

        while (assignmentStartDate.getTime() !== assignmentEndDate.getTime() && !(assignmentStartDate.getTime() > assignmentEndDate.getTime())) {

            const slotEnd: Date = new Date(assignmentStartDate);

            slotEnd.setMinutes(slotEnd.getMinutes() + timeSlot);

            if (slotEnd.getTime() <= assignmentEndDate.getTime()) {
                freeSlots.push({ startDateTime: new Date(assignmentStartDate), count: overbooking });
            }

            assignmentStartDate.setMinutes(assignmentStartDate.getMinutes() + timeSlot);

        }

        if (appointment && appointment.length) {

            for (const appoint of appointment) {

                const appStart: Date = new Date(appoint?.scheduled_date_time);
                const appEnd: Date = new Date(appoint?.scheduled_date_time);

                appEnd.setMinutes(appEnd.getMinutes() + appoint?.time_slots);

                freeSlots.find((a: FreeSlotsI, i: number): void => {
                    if (appStart.getTime() <= a.startDateTime.getTime() && a.startDateTime.getTime() < appEnd.getTime() && appoint?.deleted_at === null) {
                        freeSlots[i].count -= 1;
                    }
                });
            }

        }

        if (wantOverBooking === 0) {

            return freeSlots.map((o: FreeSlotsI): boolean => o.count === overbooking);
        }

        return freeSlots;

    }

    /**
     *
     * @param freeSlots
     * @param unAvails
     * @param timeSlot
     */
    private readonly getFreeSlotsWithUnavailabilityChk = (freeSlots: ANY, unAvails: models.sch_unavailable_doctorsI[], timeSlot: number): ANY => {

        if (!unAvails.length) {
            return freeSlots;
        }

        freeSlots.forEach((slot: ANY, i: number): ANY => {

            let flaag: boolean = false;
            const slotEnd: Date = new Date(slot);

            slotEnd.setMinutes(slotEnd.getMinutes() + timeSlot);
            unAvails.forEach((u: models.sch_unavailable_doctorsI, j: number): ANY => {
                if (u[j + 1]) {
                    if (Number(u[j + 1].startDate) < Number(slotEnd) && Number(slotEnd) <= Number(u[j + 1].endDate)) {
                        flaag = true;
                    }
                }
            });
            for (const oneTime of unAvails) {
                if (Number(oneTime.start_date) <= Number(slot) && Number(slot) < Number(oneTime.end_date)) {
                    flaag = true;
                }
            }
            if (flaag) {
                freeSlots.splice(i, 0);
            }
        });

        return freeSlots;
    }

    /**
     *
     * @param freeSlots
     * @param appointments
     * @param availableDoctorId
     * @param timeSlot
     */
    private readonly resolveDoctorAppointmentOnFreeSlots = (freeSlots: FreeSlotsI[], appointments: models.sch_appointmentsI[], availableDoctorId: number, timeSlot: number): ANY =>

        appointments.map((d: models.sch_appointmentsI, index: number): ANY => {

            const slotsRequired: number = Math.floor(d.time_slots / timeSlot);
            let requiredAppointment: models.sch_appointmentsI;

            const getStartTime: FreeSlotsI = freeSlots.find((o: FreeSlotsI, i: number): FreeSlotsI => {

                if (!freeSlots[i + slotsRequired - 1]?.startDateTime) {
                    return null;
                }

                const checkTime: Date = new Date(freeSlots[i + slotsRequired - 1].startDateTime);
                checkTime.setMinutes(checkTime.getMinutes() + timeSlot);

                let timeDifference: number = checkTime.getTime() - o.startDateTime.getTime();
                timeDifference = timeDifference / 60000;

                if (timeDifference === d.time_slots) {

                    requiredAppointment = d;
                    freeSlots.splice(i, slotsRequired);
                    appointments.splice(index, 1);
                    return o;

                }
            });

            const resolvedAppointments: models.sch_appointmentsI = getStartTime && requiredAppointment && Object.keys(requiredAppointment) ? {

                available_doctor_id: availableDoctorId,
                case_id: requiredAppointment?.case_id,
                case_type_id: requiredAppointment?.case_type_id,
                date_list_id: requiredAppointment?.date_list_id,
                patient_id: requiredAppointment?.patient_id,
                priority_id: requiredAppointment?.priority_id,
                scheduled_date_time: getStartTime?.startDateTime,
                time_slots: requiredAppointment?.time_slots,
                type_id: requiredAppointment?.type_id,

            } : null;

            return [[resolvedAppointments], [appointments]];

        }).flat()

    /**
     *
     * @param data
     * @param _authorization
     */
    private readonly sendAppointmentsToFD = async (dataObj: ANY): Promise<ANY> => {
        const { userId, clinics, allAppointments, forwardAppointments: appointments, _authorization, transaction } = dataObj;

        const modelHasRoles: ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles;

        if (userRole && slug !== 'super_admin') {

            const userFacilities: models.user_facility[] = this.shallowCopy(await this.__userFacilityRepo.findAll({ facility_location_id: { [Op.in]: clinics }, user_id: userId, deleted_at: null }));

            if (userFacilities.length !== clinics.length) {

                throw generateMessages('NO_SUPER_ADMIN');
            }
        }

        const config: GenericHeadersI = {
            headers: { Authorization: `${_authorization}` }
        };

        const { status } = await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/remove-patient-sessions`, { appointment_ids: allAppointments }, config);

        if (status !== 200) {

            throw generateMessages('ERROR_FROM_KIOSK');
        }

        const formatedAppointments: ANY = appointments.map((appointment: ANY): ANY => {
            const { forward_appointments: forwardAppointments } = appointment;
            return forwardAppointments.map((a: models.sch_appointmentsI): models.sch_appointmentsI => ({
                id: a.id,
                origin_facility_id: appointment.origin_clinic_id,
                pushed_to_front_desk: true,
                target_facility_id: appointment.target_clinic_id,
                updated_at: new Date(),
                updated_by: userId,
            }));
        }).flat();

        return this.__appointmentRepo.bulkUpdate(formatedAppointments, transaction, null, ['origin_facility_id', 'pushed_to_front_desk', 'target_facility_id', 'updated_by', 'updated_at']);

    }

}
