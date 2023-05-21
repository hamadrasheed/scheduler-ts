import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import * as moment from 'moment';
import * as Sequelize from 'sequelize';
import { col, fn, Transaction } from 'sequelize';
import * as workerpool from 'workerpool';

import { sequelize } from '../config/database';
import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

import { AppointmentHelperService } from './appointment-helper.service';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;
const lodash = require('lodash');

/**
 * Appointment Service Class
 */

@Frozen
export class AppointmentService extends AppointmentHelperService {

    public __http: Http;

    private readonly __appointmentsHistoryChecks: { [key: string]: string };
    private readonly __formatDatesCriteriaMethod: { [key: string]: string };
    private readonly __genericAppointmentListing: { [key: string]: string };
    private readonly __getAppointmentForAssignments: { [key: string]: string };
    private readonly __getAssigmentMethod: { [key: string]: string };
    private readonly __getCount: { [key: string]: string };
    private readonly __getSpecialityEnvironment: { [key: string]: string };
    private readonly __getSpecialityName: { [key: string]: string };
    private readonly __getKioskCreationSource: { [key: string]: string };

    /**
     *
     * @param __repo
     * @param __userRepo
     * @param __userFacilityRepo
     * @param __modelHasRolesRepo
     * @param __appoitmentTypeRepo
     * @param __appointmentStatusRepo
     * @param __casePatientSessionStatusesRepo
     * @param __specialityRepo
     * @param __availableSpecialityRepo
     * @param __unAvailableDoctorRepo
     * @param __facilityLocationRepo
     * @param __availableDoctorRepo
     * @param __caseTypesRepo
     * @param __medicalIdentifierRepo
     * @param __recurrenceEndingCriteriaRepo
     * @param __colorCodeRepo
     * @param __recurrenceDateListRepo
     * @param __appointmentPrioritiesRepo
     * @param __visitSessionRepo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.appointmentRepository,
        public __userRepo: typeof repositories.userRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __modelHasRolesRepo: typeof repositories.modelHasRoleRepository,
        public __appoitmentTypeRepo: typeof repositories.appointmentTypesRepository,
        public __appointmentStatusRepo: typeof repositories.appointmentStatusRepository,
        public __casePatientSessionStatusesRepo: typeof repositories.casePatientSessionStatusesRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
        public __availableSpecialityRepo: typeof repositories.availableSpecialityRepository,
        public __unAvailableDoctorRepo: typeof repositories.unAvailableDoctorRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __availableDoctorRepo: typeof repositories.availableDoctorRepository,
        public __caseTypesRepo: typeof repositories.caseTypesRepository,
        public __medicalIdentifierRepo: typeof repositories.medicalIdentifierRepository,
        public __recurrenceEndingCriteriaRepo: typeof repositories.recurrenceEndingCriteriaRepository,
        public __colorCodeRepo: typeof repositories.colorCodeRepository,
        public __recurrenceDateListRepo: typeof repositories.recurrenceDateListRepository,
        public __appointmentPrioritiesRepo: typeof repositories.appointmentPrioritiesRepository,
        public __visitSessionRepo: typeof repositories.visitSessionRepository,
        public __kioskContactPersonRepo: typeof repositories.kioskContactPersonRepository,
        public __kioskContactPersonTypesRepo: typeof repositories.kioskContactPersonTypesRepository,
        public __casePatientSessionRepo: typeof repositories.casePatientSessionRepository,
        public __kioskCaseRepo: typeof repositories.kioskCaseRepository,
        public __transportationsRepo: typeof repositories.transportationsRepository,
        public __schAppointmentCptCodesRepo: typeof repositories.appointmentCptCodesRepository,
        public __ptSessionRepo: typeof repositories.ptSessionRepository,
        public __billingCodesRepo: typeof repositories.billingCodesRepository,
        public http: typeof Http
    ) {
        super();
        this.__http = new http();
        this.__getKioskCreationSource = {
            1 : 'Web',
            2 : 'Kiosk',
            3 : 'Health App'
        };
        this.__appointmentsHistoryChecks = {
            completed: 'getCompletedAppointments',
            no_show: 'getNoShowAppointments',
            cancel: 'getCancelAppointments',
            today: 'getTodayAppointments'
        };
        this.__formatDatesCriteriaMethod = {
            false: 'formatDatesCriteriaWithOutEndDate',
            true: 'formatDatesCriteriaWithEndDate'
        };
        this.__genericAppointmentListing = {
            SCHEDULED: 'appointmentListQuery',
            CANCELLED: 'cancelledListQuery',
            RESCHEDULED: 'rescheduledListQuery',
            PATIENT: 'patientAppointmentQuery',
        };
        this.__getAppointmentForAssignments = {
            dateList: 'appointmentWithDateListId',
            doctor: 'appointmentWithAvailableDoctorId',
            speciality: 'appointmentWithAvailableSpecialityId',
        };
        this.__getAssigmentMethod = {
            doctor: '__availableDoctorRepo',
            speciality: '__availableSpecialityRepo',
        };
        this.__getCount = {
            appointmentList: 'getWaitingListCount',
            waitingList: 'getApointmentListCountV1'
        };
        this.__getSpecialityEnvironment = {
            accu: 'ACCU_URL',
            chiro: 'CHIRO_URL',
            pt: 'PT_URL',
        };
        this.__getSpecialityName = {
            accu: 'ACCU_URL',
            chiro: 'CHIRO_URL',
            pt: 'PT_URL',
        };
    }

    public createAppSession = async (data: typings.ANY, _authorization: string) => {

        const {
            speciality_key: specialityKey,
            case_id: caseId,
            doctor_id: doctorId,
            patient_id: patientId,
            visit_session_id: visitSessionId,
        } = data

        const specialityEnvironment: string = this.__getSpecialityEnvironment[specialityKey];
        
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        
        if (specialityEnvironment){
            await this.__http.post(`${process.env[specialityEnvironment]}/medical-session/create-appointment-session`,
            {
                case_id: caseId,
                doctor_id: doctorId,
                patient_id: patientId,
                session_type: 1,
                visit_session_id: visitSessionId,
            }, config);
        }   
        return true
    }

    public activateAppointment = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            case_id: caseId,
            patient_id: patientId,
            user_id: userId,
        } = data;

        const activeAppointments: number = this.shallowCopy(await this.__repo.updateByColumnMatched(
            {
                cancelled: false,
                case_id: caseId,
                deleted_at: null,
                is_active: false,
                patient_id: patientId,
                pushed_to_front_desk: false,
            },
            {
                is_active: true,
                updated_at: new Date(),
                updated_by: userId,
            }
        )) as unknown as number;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-soft-patient-listing`, {}, config);

        return activeAppointments;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public autoResolveAppointments = async (data: typings.AutoResolveAppointmentsBodyI, _authorization: string): Promise<typings.AutoResolveAppointmentsResponseI> => {

        const {
            appointment_ids: appointmentIds,
            user_id: userId = Number(process.env.USERID),
            unavailibility_end_date: unavailibilityEndDate,
            same_clinic: sameClinic
        } = data;

        const toBeResolvedAssignments: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                deleted_at: null
            },
            {
                include: [
                    {
                        as: 'appointments',
                        model: models.sch_appointments,
                        where: {
                            cancelled: null,
                            deleted_at: null,
                            id: {
                                [Op.in]: appointmentIds,
                            },
                            pushed_to_front_desk: null
                        }
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        model: models.users,
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
                    }
                ]
            }));

        const appointmentsLength: number = toBeResolvedAssignments.map((a: models.sch_available_doctorsI): typings.ANY => a.appointments
            .reduce((acc: number, c: models.sch_appointmentsI): number => {
                // tslint:disable-next-line: no-parameter-reassignment
                acc = acc + 1;
                return acc;
                // tslint:disable-next-line: align
            }, 0))
            .reduce((acc: number, c: typings.ANY): typings.ANY => {
                // tslint:disable-next-line: no-parameter-reassignment
                acc = acc + c;
                return acc;
                // tslint:disable-next-line: align
            }, 0);

        if (!toBeResolvedAssignments || appointmentIds.length !== appointmentsLength) {

            throw generateMessages('NO_SAME_APPOINTMENT');
        }

        const { doctor_id: doctorId } = toBeResolvedAssignments[0];

        const doctLocations: typings.ANY = this.shallowCopy(await this.__userFacilityRepo.findAll({
            deleted_at: null,
            user_id: doctorId,
            [Op.or]: [
                {
                    speciality_id: {
                        [Op.ne]: 0
                    }
                },
                {
                    speciality_id: {
                        [Op.ne]: null
                    }
                },
            ]
        }));

        const clinics: number[] = await this.findFacilityLocations(doctorId, userId);

        const startDate: Date = unavailibilityEndDate ? new Date(unavailibilityEndDate) : new Date(toBeResolvedAssignments[toBeResolvedAssignments.length - 1].end_date);
        const endDate: Date = new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));

        const doctAvailibilties: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                deleted_at: null,
                doctor_id: doctorId,
                end_date: endDate,
                facility_location_id: {
                    [Op.in]: clinics
                },
                start_date: startDate,
            },
            {
                include: [
                    {
                        as: 'appointments',
                        model: models.sch_appointments,
                        where: {
                            cancelled: null,
                            deleted_at: null,
                            id: {
                                [Op.in]: appointmentIds,
                            },
                            pushed_to_front_desk: null
                        }
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        model: models.users,
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
                    }
                ],
                order: [
                    ['start_date', 'ASC']
                ]
            }));

        if (!doctAvailibilties.length) {

            throw generateMessages('NO_OTHER_ASSIGNMENTS_FOUND');
        }

        let availableSlots: typings.ANY = [];

        for (const doctAvailibility of doctAvailibilties) {

            for (const assignments of toBeResolvedAssignments) {

                availableSlots = this.findAvailableSlots(sameClinic, doctAvailibility, assignments);
                // Continue from here
            }
        }

        return {
            clinics,
            endDate,
            location: doctLocations,
            startDate,
            toBeResolvedAssignments
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public cancelAppointments = async (data: typings.CancelAppointmentsBodyI, _authorization: string): Promise<typings.CancelAppointmentsResponseI> => {

        const {
            appointment_ids: appointmentIds,
            cancelled_comments: comments,
            user_id: userId = Number(process.env.USERID),
            request_from_php: requestFromphp,
            trigger_socket: triggerSocket = false,
            is_redo,
        } = data;
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        let appointmentsIdsWithOutVist: number[];

        let visitWithAppointments: number[];

        let isRedo: number = 1;

        const reqObject: typings.ANY = {
            appointment_ids: [...appointmentIds]
        };

        let IncludeClause: { [key: string]: typings.ANY };

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const appointmentStatuesIds: number[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll({
            [Op.or]: [
                { slug: 'scheduled' },
                { slug: 're_scheduled' },
                { slug: 'arrived' },
                { slug: 'completed' },
            ]
        })).map((x: models.sch_appointment_statusesI): number => x.id);

        const appointmens: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                id: appointmentIds,
                type_id: appointmentType.id
            },
            {
                include: {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                }
            }));

        if (appointmens && appointmens.length) {

            const specialityIds: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.availableSpeciality.speciality_id);
            const caseId: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.case_id);
            const patientIds: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.patient_id);

            const previousAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    id: { [Op.ne]: appointmentIds },
                    case_id: caseId,
                    patient_id: patientIds,
                    deleted_at: null,
                    cancelled: false,
                    pushed_to_front_desk: false,
                    status_id: appointmentStatuesIds,
                    type_id: { [Op.ne]: appointmentType.id },
                },
                {
                    include: [
                        {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: true,
                            where: {
                                deleted_at: null,
                                speciality_id: specialityIds
                            }
                        },
                        {
                            as: 'case',
                            attributes: ['id', 'is_transferring_case'],
                            model: models.kiosk_cases,
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                }
            ));

            if (previousAppointment && Object.keys(previousAppointment).length && !previousAppointment.case?.is_transferring_case) {
                throw generateMessages('PATIENT_APPOINTMENT_EXIST');
            }

        }

        if (!requestFromphp) {

            const responseArr: typings.ANY = await this.__http.post(`${process.env.VISIT_DESK_URL}vd/visit_session/appointment-exists`, { ...reqObject }, config);
            visitWithAppointments = responseArr.result.data;

            appointmentsIdsWithOutVist = appointmentIds.filter((w) => !visitWithAppointments.includes(w));

            IncludeClause = {
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: ['id'],
                                include: {
                                    as: 'userBasicInfo',
                                    attributes: ['first_name', 'last_name'],
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                attributes: ['id'],
                                include: {
                                    as: 'speciality',
                                    attributes: ['id', 'name'],
                                    model: models.specialities,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.sch_available_specialities,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'patient',
                        attributes: ['first_name', 'last_name'],
                        model: models.kiosk_patient,
                        required: true,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'caseType',
                        attributes: ['name', 'slug'],
                        model: models.kiosk_case_types,
                        required: true,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableSpeciality',
                        attributes: ['id'],
                        include: {
                            as: 'speciality',
                            attributes: ['id', 'name'],
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['name', 'slug'],
                        model: models.sch_appointment_types,
                    },
                    {
                        as: 'appointmentVisit',
                        attributes: ['visit_date'],
                        model: models.visit_sessions
                    },
                    {
                        as: 'case',
                        model: models.kiosk_cases,
                        include: [
                            {
                                as: 'casePurposeOfVisit',
                                model: models.kiosk_case_purpose_of_visit
                            },
                            {
                                as: 'caseAccidentInformation',
                                attributes: [[fn('datediff', fn('NOW'), col('accident_date')), 'no_of_days']],
                                model: models.kiosk_case_accident_informations
                            }
                        ]
                    }
                ]

            };

        } else {

            appointmentsIdsWithOutVist = [...appointmentIds];

            isRedo = 0;

        }

        if (appointmentsIdsWithOutVist && appointmentsIdsWithOutVist.length) {

            const { status } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/remove-patient-sessions`, { appointment_ids: appointmentsIdsWithOutVist, trigger_socket: true, request_from_sch: true }, config));

            if (status !== 200) {

                throw generateMessages('ERROR_FROM_KIOSK');
            }

            await this.__repo.updateByIds(
                appointmentsIdsWithOutVist,
                {
                    cancelled: 1,
                    cancelled_comments: comments,
                    origin_facility_id: null,
                    pushed_to_front_desk: 0,
                    target_facility_id: null,
                    updated_at: new Date(),
                    updated_by: userId,
                    is_redo: isRedo,
                }
            );

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentsIdsWithOutVist, email_title: 'Appointment Cancelled' }, config);

            const deletedAppointments: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentsIdsWithOutVist, user_id: userId }, _authorization);

            if (!triggerSocket) {
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: appointmentsIdsWithOutVist }, config);
            }
        }

        const allAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                id: appointmentIds
            },
            {
                ...IncludeClause
            },

        ));

        const requiredCaseIds: number[] = allAppointments.map((d: models.sch_appointmentsI): number => d.case_id);

        return visitWithAppointments && visitWithAppointments.length ? {
            data: allAppointments,
            socketData: allAppointments,
            message: `Case No. ${String(requiredCaseIds)} have visits, Please delete first`
        } : {
            data: null,
            socketData: allAppointments,
            message: 'Appointment Cancelled Successfully!',
            status: true,
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public cancelAppointmentsDeleteAssignments = async (data: typings.CancelAppointmentsWithAssignmentBodyI, _authorization: string, transaction: Transaction): Promise<typings.CancelAppointmentsWithAssignmentResponseI> => {

        const {
            appointment_ids: appointmentIds,
            available_doctor_ids: availableDoctorIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        await Promise.all([
            this.__repo.updateByIds(
                appointmentIds,
                {
                    cancelled: 1,
                    updated_at: new Date(),
                    updated_by: userId,
                    is_redo: 0
                },
                transaction
            ),
            this.__recurrenceDateListRepo.updateByColumnMatched(
                {
                    available_doctor_id: availableDoctorIds,
                    deleted_at: null
                },
                {
                    deleted_at: new Date(),
                    updated_by: userId
                    // tslint:disable-next-line: align
                }, 
                transaction
            ),
            this.__availableDoctorRepo.updateByIds(
                availableDoctorIds,
                { deleted_at: new Date(), updated_by: userId },
                transaction
            )
        ]);
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        const deletedAppointments: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIds, user_id: userId }, _authorization, transaction);
        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: appointmentIds }, config);
        return {
            data: null,
            message: 'Appointments cancelled Successfully!',
            status: true,
        };
    }
    /**
     *
     * @param data
     * @param _authorization
     */
    public cancelSoftPatientAppointment = async (data: typings.CancelSoftPatientAppointmentsBodyI, _authorization: string): Promise<typings.CancelAppointmentsResponseI> => {
        const {
            patient_ids: patientIds,
            user_id: userId,

        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        const appointments = this.shallowCopy(await this.__repo.findAll({
            patient_id: patientIds,
            deleted_at: null,
            cancelled: 0,
            pushed_to_front_desk: 0

        }));
        const appointmentIds: number[] = appointments.map((d: models.sch_appointmentsI): number => d.id);

        const obj: typings.CancelAppointmentsBodyI = {
            appointment_ids: appointmentIds,
            user_id: userId,
            request_from_php: true
        };

        return this.cancelAppointments(obj, _authorization);

    }

    public checkAppointmentsByCase = async (data: typings.ANY, _authorization: string): Promise<number[]> => {

        const {
            case_ids: caseIds,
        } = data;

        const appointmentByCaseIds: number[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                case_id: { [Op.in]: [...caseIds] },
                deleted_at: null,
                pushed_to_front_desk: false
            },
            {
                attributes: ['case_id']
            }
        )).map((x: models.sch_appointmentsI): number => x.case_id);

        return this.filterUnique(appointmentByCaseIds);

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public checkInitial = async (data: typings.CheckInitialBodyI, _authorization: string): Promise<typings.CheckInitialResponseI> => {

        const {
            patient_id: patientId,
            case_id: caseId,
            speciality_id: specialityId
        } = data;

        const initialAppointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));
        const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

        const initialAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                cancelled: false,
                case_id: caseId,
                deleted_at: null,
                patient_id: patientId,
                pushed_to_front_desk: false,
                status_id: { [Op.ne]: noShowId },
                type_id: initialAppointmentType.id,
            },
            {
                attributes: ['available_doctor_id'],
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'availableSpeciality',
                                attributes: ['speciality_id'],
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'availableSpeciality',
                        attributes: ['speciality_id'],
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            }));

        const { available_doctor_id: availableDoctorId, availableDoctor, availableSpeciality } = initialAppointment || {};

        if ((availableDoctorId && availableDoctor?.availableSpeciality?.speciality_id === specialityId) || (availableSpeciality?.speciality_id === specialityId)) {
            return { initial_check: true };
        }

        return { initial_check: false };
    }

    /**
     *
     * @param data
     * @param _authorization
     * @param transaction
     * @returns
     */
    public createBackDatedAppointments = async (data: typings.AddAppointmentBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            appointment_type_id: appointmentTypeId,
            case_id: caseId,
            case_type_id: caseTypeId,
            comments,
            billable,
            confirmation_status: confirmationStatus,
            doctor_id: doctorId,
            is_speciality_base: isSpecialityBase,
            facility_location_id: facilityLocationId,
            patient_id: patientId,
            priority_id: priorityId,
            speciality_id: specialityId,
            start_date_time: startDateTime,
            time_slot: timeSlot,
            user_id: userId = Number(process.env.USERID),
            days,
            end_date_for_recurrence: endDateForRecurrence,
            recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
            end_after_occurences: endAfterOccurences,
            is_soft_registered,
            cd_image: cdImage,
            reading_provider_id: readingProviderId
        } = data;

        if (!doctorId) {
            throw generateMessages('APPOINTMENT_WITHOUT_DOCTOR');
        }

        const { is_active }: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findById(caseId));

        if (!is_active) {
            throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
        }

        const isSoftRegistered: boolean = is_soft_registered ? is_soft_registered : false;

        let contactPersonType: models.kiosk_contact_person_typesI = null;

        let selfContactPerson: models.kiosk_contact_personI = null;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const { slug: caseType }: models.kiosk_case_typesI = this.shallowCopy(await this.__caseTypesRepo.findById(caseTypeId));

        const appointmentTypes: models.sch_appointment_typesI[] = this.shallowCopy(await this.__appoitmentTypeRepo.findAll(
            {
                deleted_at: null
            },
            {}
        ));

        const appointmentTypeIdsForCheck: number[] = appointmentTypes.map((u: models.sch_appointment_typesI): number => u.id);

        const checkingAppointmentPriority: boolean = appointmentTypeIdsForCheck?.includes(appointmentTypeId);

        if (!checkingAppointmentPriority) {
            throw generateMessages('INVALID_APPOINTMENT_TYPE_ID');
        }

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const checkForReccurence: boolean = days || endDateForRecurrence || recurrenceEndingCriteriaId || endAfterOccurences ? true : false;

        if (checkForReccurence && appointmentTypeId === appointmentType.id) {

            throw generateMessages('NO_APPOINTMENT_CREATED_RECCURENCE');

        }

        const appointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 'completed'
            }
        ));

        const speciality: models.specialities = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId,
            }
        ));

        if (!speciality && !Object.keys(speciality).length) {
            throw generateMessages('NO_SPECIALITY_FOUND');
        }

        let endingCriteriaObj: models.sch_recurrence_ending_criteriasI;
        let endingCriteria: string;

        if (recurrenceEndingCriteriaId) {

            endingCriteriaObj = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(recurrenceEndingCriteriaId)) as unknown as models.sch_recurrence_ending_criteriasI;
            const { slug: endingCriteriaString } = endingCriteriaObj;
            endingCriteria = endingCriteriaString ?? '';
        }

        const { time_slot: specialityTimeSlot, } = speciality || {};

        const checkForDateCriteria: boolean = endDateForRecurrence ? true : false;
        const daysList: number[] = days && days.length ? days : [0, 1, 2, 3, 4, 5, 6];

        const requiredDates: Date[] = (await this[this.__formatDatesCriteriaMethod[`${checkForDateCriteria}`]]({

            daysList,
            endDateString: new Date(startDateTime),
            endingCriteria,
            numberOfRecurrsion: endAfterOccurences,
            recurrenceEndDateString: endDateForRecurrence,
            startDateString: startDateTime,

        }));

        const formatDates: Date[] = requiredDates && requiredDates.length ? requiredDates : [new Date(startDateTime)];
        const desiredTimeSlot: number = timeSlot ? timeSlot : specialityTimeSlot;
        const slotsForThisAppointment: number = timeSlot ? timeSlot / specialityTimeSlot : 1;

        const { is_transferring_case: isTransferringCase }: { is_transferring_case: boolean } = this.shallowCopy(await this.__kioskCaseRepo.findOne(
            {
                id: caseId
            },
            {
                attributes: ['is_transferring_case']
            }
        ));

        return Promise.all(formatDates.map(async (requiredStartDate: Date): Promise<models.sch_appointmentsI> => {

            const appointmentEndTime: Date = new Date(requiredStartDate);

            appointmentEndTime?.setMinutes(appointmentEndTime?.getMinutes() + desiredTimeSlot);

            const findInitialIncludeClause: { [key: string]: typings.ANY } = {
                include: [
                    {
                        as: 'availableDoctor',
                        include:
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include:
                            {
                                as: 'userFacilities',
                                model: models.user_facility,
                                required: false,
                                where: {
                                    deleted_at: null,
                                    speciality_id: specialityId
                                },
                            },
                            model: models.users,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null, speciality_id: specialityId },
                    },
                ]
            };

            const findInitialWhereFilter: typings.InitialWhereFilterI = {
                cancelled: false,
                case_id: caseId,
                deleted_at: null,
                patient_id: patientId,
                pushed_to_front_desk: false,
                type_id: 1
            };

            let initialDone: boolean = false;
            let initialDoneBefore: boolean = false;

            const initialAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({ ...findInitialWhereFilter }, { ...findInitialIncludeClause }));

            const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

            const initialAppointment: models.sch_appointmentsI = initialAppointments.find((app: models.sch_appointmentsI): typings.ANY => (app.availableSpeciality || app.availableDoctor?.doctor?.userFacilities.length) && app.status_id !== noShowId);

            if (initialAppointment && Object.keys(initialAppointment).length && (initialAppointment.availableSpeciality || initialAppointment.availableDoctor?.doctor?.userFacilities)) {

                const {

                    available_doctor_id: availableDoctorId,
                    availableDoctor,
                    scheduled_date_time: scheduledDateTime,
                    availableSpeciality,

                } = { ...initialAppointment };

                const specialityIds: number[] = availableDoctor?.doctor?.userFacilities?.map((a: models.user_facilityI): number => a?.speciality_id);

                const checkSpecialityId: boolean = specialityIds?.includes(specialityId);

                initialDone = ((availableDoctorId && checkSpecialityId) || (availableSpeciality?.speciality_id === specialityId)) && initialAppointment.evaluation_date_time !== null ? true : false;
                initialDone = initialAppointment.status_id !== noShowId ? true : false;

                initialDoneBefore = initialDone && new Date(scheduledDateTime).getTime() < new Date(requiredStartDate).getTime() ? true : false;

            }

            if (appointmentTypeId === appointmentType.id && initialDone) {
                throw generateMessages('PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT');
            }

            if (appointmentTypeId !== appointmentType.id && !initialDone && !isTransferringCase) {
                throw generateMessages('NO_INITIAL_EVALUATION_ASSIGNMENT');
            }

            if ((appointmentTypeId === appointmentType.id && !initialDone) || (appointmentTypeId !== appointmentType.id && initialDone) || isTransferringCase) {

                const checkForDoneBefore: boolean = initialDone ? false : !initialDone && !initialDoneBefore ? false : true;

                if (checkForDoneBefore && !isTransferringCase) {
                    throw generateMessages('APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION');
                }

                const appointmentExit: boolean = await this.checkExitAppointment(caseId, speciality, appointmentTypeId, startDateTime, timeSlot, noShowId);

                if (appointmentExit) {
                    throw generateMessages('APPOINTMENT_ALREADY_EXIST');
                }

                const doctorHasWcbAuth: models.medical_identifiersI = this.shallowCopy(await this.__medicalIdentifierRepo.findOne({
                    deleted_at: null,
                    user_id: doctorId,
                    wcb_auth: true,
                }));

                if ((caseType === 'worker_compensation') && (!doctorHasWcbAuth || !Object.keys(doctorHasWcbAuth).length)) {
                    throw generateMessages('PROVIDER_DOES_NOT_HAVE_WC_AUTH');
                }

                const getAvailableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                    {
                        deleted_at: null,
                        doctor_id: doctorId,
                        facility_location_id: facilityLocationId,
                    },
                    {
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gte]: appointmentEndTime },
                                start_date: { [Op.lte]: requiredStartDate }
                            },
                        },
                    }
                ));

                if (!getAvailableDoctor || !Object.keys(getAvailableDoctor).length) {
                    throw generateMessages('ASSIGNMENT_NOT_FOUND');
                }

                const { dateList: dateListOfDoctor } = getAvailableDoctor || {};

                const availableDoctor: typings.AvailableDoctorFromDateList = {
                    available_speciality_id: getAvailableDoctor?.available_speciality_id,
                    date_list_id: dateListOfDoctor[0].id,
                    end_date: dateListOfDoctor[0].end_date,
                    id: getAvailableDoctor.id,
                    no_of_slots: getAvailableDoctor.no_of_slots,
                    start_date: dateListOfDoctor[0].start_date,
                };

                const endDateTimeWithDoctor: Date = new Date(requiredStartDate);
                const assignmentTimeSlotWithDoctor: number = this.getTimeSlotOfAssignment(availableDoctor);

                endDateTimeWithDoctor.setMinutes(endDateTimeWithDoctor.getMinutes() + (assignmentTimeSlotWithDoctor * slotsForThisAppointment));

                const appointmentsOfDoctor: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
                    available_doctor_id: availableDoctor.id,
                    cancelled: false,
                    deleted_at: null,
                    pushed_to_front_desk: false,
                }));

                const availableFreeSlotsWithDoctor: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(availableDoctor, appointmentsOfDoctor, (speciality.over_booking + 1), assignmentTimeSlotWithDoctor);

                const freeSlot: typings.FreeSlotsI = availableFreeSlotsWithDoctor?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                    const slotStart: Date = new Date(s.startDateTime);
                    const slotEnd: Date = new Date(s.startDateTime);

                    slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlotWithDoctor);

                    if (slotStart.getTime() <= requiredStartDate.getTime() && requiredStartDate.getTime() < slotEnd.getTime()) {
                        if (s.count > 0) {
                            return s;
                        }
                    }

                });

                if (!freeSlot || !Object.keys(freeSlot).length) {
                    // await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId,speciality)
                    throw generateMessages('NO_SLOTS_REMAINING');
                }

                const doctorUnavailability: typings.ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
                    [Op.or]: [
                        {
                            [Op.and]: [
                                {
                                    approval_status: 1,
                                    deleted_at: null,
                                    doctor_id: doctorId,
                                    end_date: { [Op.gt]: endDateTimeWithDoctor },
                                    start_date: { [Op.lte]: requiredStartDate }
                                },
                            ]
                        },
                        {
                            [Op.and]: [
                                {
                                    approval_status: 1,
                                    deleted_at: null,
                                    doctor_id: doctorId,
                                    start_date: { [Op.gte]: requiredStartDate, [Op.lt]: endDateTimeWithDoctor }
                                },
                            ]
                        }
                    ]
                }));

                if (doctorUnavailability && Object.keys(doctorUnavailability).length) {

                    throw generateMessages('NO_PROVIDER_AVAILABLE');

                }

                const createdAppointmentWithDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.create({
                    available_doctor_id: availableDoctor?.id,
                    available_speciality_id: availableDoctor?.available_speciality_id,
                    billable,
                    case_id: caseId,
                    case_type_id: caseTypeId,
                    chartNo: patientId,
                    comments,
                    confirmation_status: confirmationStatus,
                    created_by: userId,
                    date_list_id: availableDoctor?.date_list_id,
                    is_speciality_base: isSpecialityBase,
                    patient_id: patientId,
                    priority_id: priorityId ? priorityId : null,
                    scheduled_date_time: requiredStartDate,
                    status_id: appointmentStatus.id,
                    time_slots: assignmentTimeSlotWithDoctor * slotsForThisAppointment,
                    type_id: appointmentTypeId,
                    is_soft_registered: isSoftRegistered,
                    is_active: isSoftRegistered ? false : true,
                    cd_image: cdImage ?? null,
                    reading_provider: readingProviderId
                }));

                let casePatientSession: typings.ANY;

                try {
                    const patientSessionStatusWithDoctor: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: 'checked_out' } }));

                    const { result: { data: responseData } } = patientSessionStatusWithDoctor || {};

                    casePatientSession = await this.__http.post(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: responseData[0]?.id, appointment_id: createdAppointmentWithDoctor.id, trigger_socket: true }, config);

                } catch (error) {
                    await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                    throw error;
                }

                const { result: { data: kioskData } } = casePatientSession;

                const dataForVisitSession: typings.ANY = {
                    appointment_id: createdAppointmentWithDoctor.id,
                    appointment_type_id: appointmentTypeId,
                    case_id: caseId,
                    created_by: userId,
                    doctor_id: doctorId,
                    facility_location_id: facilityLocationId,
                    patient_id: patientId,
                    speciality_id: specialityId,
                    visit_date: new Date(startDateTime),
                    visit_session_state_id: 1,
                };

                let visitData: typings.ANY;

                try {

                    visitData = await this.__http.post(`${process.env.VISIT_DESK_URL}vd/visit_session/create`, { ...dataForVisitSession }, config);

                } catch (error) {
                    await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                    await this.deleteKioskSessionByAppointmentId(kioskData.id, userId);

                    throw error;
                }

                const { result: { data: { id: visitSessionId } } } = visitData;

                const { speciality_key: specialtyName }: models.specialitiesI = await this.__specialityRepo.findOne({
                    deleted_at: null,
                    id: specialityId,
                });

                const specialityEnvironment: string = this.__getSpecialityName[specialtyName];

                if (specialityEnvironment) {
                    await this.__http.post(`${process.env[specialityEnvironment]}/medical-session/create-backdate-appointment-session`,
                        {
                            appointment_type_id: createdAppointmentWithDoctor?.type_id,
                            case_id: caseId,
                            doctor_id: doctorId,
                            patient_id: patientId,
                            session_type: 1,
                            visit_session_id: visitSessionId,
                            // tslint:disable-next-line: align
                        }, config);
                }

                const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                    {
                        id: createdAppointmentWithDoctor.id
                    },
                    {
                        include: [
                            {
                                as: 'appointmentStatus',
                                model: models.sch_appointment_statuses,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            {
                                as: 'patient',
                                model: models.kiosk_patient,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            {
                                as: 'caseType',
                                model: models.kiosk_case_types,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                        ]
                    }
                ));

                const endTime: Date = new Date(newAppointment.scheduled_date_time);
                endTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);

                contactPersonType = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));

                selfContactPerson = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
                    case_id: newAppointment.case_id,
                    contact_person_type_id: contactPersonType.id,
                    deleted_at: null
                }));

                // If (selfContactPerson && selfContactPerson.email) {
                //     // tslint:disable-next-line: no-floating-promises
                //     This.sentEmailForAppointment({
                //         AppointmentId: newAppointment.id,
                //         AppointmentStatus: newAppointment.appointmentStatus.name,
                //         CaseId: newAppointment.case_id,
                //         CaseType: newAppointment.caseType.name,
                //         ConfirmationStatus: newAppointment.confirmation_status,
                //         Email: selfContactPerson.email,
                //         EmailTitle: 'Create Appointment',
                //         EndDateTime: new Date(endTime),
                //         PatientLastName: newAppointment.patient.last_name,
                //         Reason: 'created',
                //         ScheduledDateTime: new Date(newAppointment.scheduled_date_time),
                //         TimeSlot: newAppointment.time_slots,
                //     });
                // }

                // tslint:disable-next-line: no-floating-promises
                // This.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [newAppointment.id], email_title: 'Appointment Created' }, config);

                const formattedAppointmentForIOS = await this.getAppointmentById({ appointment_id: [newAppointment.id], user_id: userId }, _authorization);

                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [newAppointment.id] }, config);

                return createdAppointmentWithDoctor;

            }
            throw Error('Something went wrong');
        }));

    }

    /**
     *
     * @param data
     * @param _authorization
     * @param transaction
     * @returns
     */
    public createBackDatedAppointmentsV1 = async (data: typings.AddAppointmentBodyI, _authorization: string, ): Promise<typings.ANY> => {

        const {
            appointment_type_id: appointmentTypeId,
            case_id: caseId,
            case_type_id: caseTypeId,
            comments,
            billable,
            confirmation_status: confirmationStatus,
            doctor_id: doctorId,
            is_speciality_base: isSpecialityBase,
            facility_location_id: facilityLocationId,
            patient_id: patientId,
            priority_id: priorityId,
            speciality_id: specialityId,
            start_date_time: startDateTime,
            time_slot: timeSlot,
            user_id: userId,
            is_soft_registered,
            cpt_codes: cptCodes,
            transportation,
            technician_id: technicianId,
            template_id: templateId,
            template_type: templateType,
            is_transportation: isTransportation,
            physician_id: physicianId,
            reading_provider_id: readingProviderId,
            cd_image: cdImage,
            time_zone
        } = data;

        if (!doctorId) {
            throw generateMessages('APPOINTMENT_WITHOUT_DOCTOR');
        }

        const { is_active }: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findById(caseId));

        if (!is_active) {
            throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
        }

        const isSoftRegistered: boolean = is_soft_registered ? is_soft_registered : false;

        let contactPersonType: models.kiosk_contact_person_typesI = null;

        let selfContactPerson: models.kiosk_contact_personI = null;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const { slug: caseType }: models.kiosk_case_typesI = this.shallowCopy(await this.__caseTypesRepo.findById(caseTypeId));

        const appointmentType: models.sch_appointment_typesI = await this.__appoitmentTypeRepo.findOne(
            {
                deleted_at: null,
                id: appointmentTypeId
            },
            {}
        );

        if(!appointmentType){
            throw generateMessages('INVALID_APPOINTMENT_TYPE_ID');
        }

        const appointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 'completed'
            }
        ));

        const speciality: models.specialities = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId,
            },
            {
                include:[
                    {
                        as: "specialityVisitType",
                        model: models.speciality_visit_types,
                        where:{
                            speciality_id: specialityId,
                            appointment_type_id: appointmentTypeId,
                            deleted_at: null
                        }
                    }
                ]
            }
        ));

        if (!speciality && !Object.keys(speciality).length) {
            throw generateMessages('NO_SPECIALITY_FOUND');
        }

        const { is_transferring_case: isisTransferringCase }: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findOne(
            {
                id: caseId
            },
            {
                attributes: ['is_transferring_case']
            }
        ));

        const { time_slot: specialityTimeSlot, } = speciality || {};

        let createdAppointmentWithDoctor: models.sch_appointmentsI;
        let createdAppointmentsWithDoctor: models.sch_appointmentsI[] = [];
        const desiredTimeSlot: number = timeSlot ? timeSlot : specialityTimeSlot;
        const slotsForThisAppointment: number = timeSlot ? timeSlot / specialityTimeSlot : 1;
        const formatDates: Date[] = [new Date(startDateTime)];

        const createAppointmentObject: typings.CreateMultipleCptAppointmentI = {
            formatDates,
            startDateTime,
            cptCodes,
            desiredTimeSlot,
            doctorId,
            specialityId,
            caseId,
            patientId,
            time_zone,
            speciality,
            facilityLocationId
        };

        const multipleAppointments:typings.CreateMultipleCptAppointmentI[] = await this.multipleAppointmentsAgainstCptCode(createAppointmentObject);

        for(const appointmentData of multipleAppointments){
            const {
                startDateTime,
                cptCodes,
            } = appointmentData

            const requiredStartDate: Date = new Date(startDateTime);

            try {

                const __transaction: Transaction = await sequelize.transaction();
    
                try {
    
                    const appointmentEndTime: Date = new Date(requiredStartDate);
    
                    appointmentEndTime?.setMinutes(appointmentEndTime?.getMinutes() + desiredTimeSlot);
    
                    const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));
    
                    const checkSameDayAppointmentAllowed: boolean = await this.checkExitAppointment(caseId, speciality, appointmentTypeId, startDateTime, timeSlot, noShowId);
    
                    const doctorHasWcbAuth: models.medical_identifiersI = this.shallowCopy(await this.__medicalIdentifierRepo.findOne({
                        deleted_at: null,
                        user_id: doctorId,
                        wcb_auth: true,
                    }));
    
                    if ((caseType === 'worker_compensation') && (!doctorHasWcbAuth || !Object.keys(doctorHasWcbAuth).length)) {
                        throw generateMessages('PROVIDER_DOES_NOT_HAVE_WC_AUTH');
                    }
    
                    const getAvailableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                        {
                            deleted_at: null,
                            doctor_id: doctorId,
                            facility_location_id: facilityLocationId,
                        },
                        {
                            include: [
                                {
                                    as: 'dateList',
                                    model: models.sch_recurrence_date_lists,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        end_date: { [Op.gte]: appointmentEndTime },
                                        start_date: { [Op.lte]: requiredStartDate }
                                    },
                                },
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        speciality_id: specialityId,
                                        deleted_at: null,
                                    }
                                }
                            ]
                        }
                    ));
    
                    if (!getAvailableDoctor || !Object.keys(getAvailableDoctor).length) {
                        throw generateMessages('ASSIGNMENT_NOT_FOUND');
                    }
    
                    const { dateList: dateListOfDoctor } = getAvailableDoctor || {};
    
                    const availableDoctor: typings.AvailableDoctorFromDateList = {
                        available_speciality_id: getAvailableDoctor?.available_speciality_id,
                        date_list_id: dateListOfDoctor[0].id,
                        end_date: dateListOfDoctor[0].end_date,
                        id: getAvailableDoctor.id,
                        no_of_slots: dateListOfDoctor[0].no_of_slots,
                        start_date: dateListOfDoctor[0].start_date,
                    };
    
                    const endDateTimeWithDoctor: Date = new Date(requiredStartDate);
                    const assignmentTimeSlotWithDoctor: number = this.getTimeSlotOfAssignment(availableDoctor);
    
                    endDateTimeWithDoctor.setMinutes(endDateTimeWithDoctor.getMinutes() + (assignmentTimeSlotWithDoctor * slotsForThisAppointment));
    
                    const appointmentsOfDoctor: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
                        available_doctor_id: availableDoctor.id,
                        cancelled: false,
                        deleted_at: null,
                        pushed_to_front_desk: false,
                    }));
    
                    const availableFreeSlotsWithDoctor: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(availableDoctor, appointmentsOfDoctor, (speciality.over_booking + 1), assignmentTimeSlotWithDoctor);
    
                    const freeSlot: typings.FreeSlotsI = availableFreeSlotsWithDoctor?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {
    
                        const slotStart: Date = new Date(s.startDateTime);
                        const slotEnd: Date = new Date(s.startDateTime);
    
                        slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlotWithDoctor);
    
                        if (slotStart.getTime() <= requiredStartDate.getTime() && requiredStartDate.getTime() < slotEnd.getTime()) {
                            if (s.count > 0) {
                                return s;
                            }
                        }
    
                    });
    
                    if (!freeSlot || !Object.keys(freeSlot).length) {
                        throw generateMessages('NO_SLOTS_REMAINING');
                    }
    
                    const doctorUnavailability: typings.ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
                        [Op.or]: [
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        end_date: { [Op.gt]: endDateTimeWithDoctor },
                                        start_date: { [Op.lte]: requiredStartDate }
                                    },
                                ]
                            },
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        start_date: { [Op.gte]: requiredStartDate, [Op.lt]: endDateTimeWithDoctor }
                                    },
                                ]
                            }
                        ]
                    }));
    
                    if (doctorUnavailability && Object.keys(doctorUnavailability).length) {
    
                        throw generateMessages('NO_PROVIDER_AVAILABLE');
    
                    }
    
                    const visitMap: typings.ANY = { caseId, patientId, appointmentTypeId, specialityId, noShowId, config };
    
                    await this.checkVisitTypes(visitMap, isisTransferringCase, checkSameDayAppointmentAllowed);
    
                    createdAppointmentWithDoctor = this.shallowCopy(await this.__repo.create({
                        available_doctor_id: availableDoctor?.id,
                        available_speciality_id: availableDoctor?.available_speciality_id,
                        billable,
                        case_id: caseId,
                        case_type_id: caseTypeId,
                        chartNo: patientId,
                        comments,
                        confirmation_status: confirmationStatus,
                        created_by: userId,
                        date_list_id: availableDoctor?.date_list_id,
                        is_speciality_base: isSpecialityBase,
                        patient_id: patientId,
                        priority_id: priorityId ? priorityId : null,
                        scheduled_date_time: requiredStartDate,
                        status_id: appointmentStatus.id,
                        time_slots: assignmentTimeSlotWithDoctor * slotsForThisAppointment,
                        type_id: appointmentTypeId,
                        is_soft_registered: isSoftRegistered,
                        is_active: isSoftRegistered ? false : true,
                        is_transportation: isTransportation ?? null,
                        physician_id: physicianId ?? null,
                        reading_provider_id: readingProviderId,
                        cd_image: cdImage
                    }, __transaction));
    
                    if (transportation && transportation.length) {
                        await this.addTransportations(createdAppointmentWithDoctor.id, transportation, __transaction);
                    }
    
                    if (cptCodes && cptCodes.length) {
                        await this.addAppointmentsCptCodes(createdAppointmentWithDoctor.id, cptCodes, __transaction);
                    }
    
                    await __transaction.commit();
    
                } catch (error) {
                    await __transaction.rollback();
                    throw error;
                }
    
                let casePatientSession: typings.ANY;
    
                try {
                    const patientSessionStatusWithDoctor: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: 'checked_out' } }));
    
                    const { result: { data: responseData } } = patientSessionStatusWithDoctor || {};
    
                    casePatientSession = await this.__http.post(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: responseData[0]?.id, appointment_id: createdAppointmentWithDoctor.id, trigger_socket: true }, config);
    
                } catch (error) {
    
                    await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                    throw error;
                }
    
                const { result: { data: kioskData } } = casePatientSession;
    
                let visitData: typings.ANY;
    
                try {
    
                    const dataForVisitSession: typings.ANY = {
                        appointment_id: createdAppointmentWithDoctor.id,
                        appointment_type_id: appointmentTypeId,
                        case_id: caseId,
                        created_by: userId,
                        doctor_id: doctorId,
                        facility_location_id: facilityLocationId,
                        patient_id: patientId,
                        speciality_id: specialityId,
                        visit_date: new Date(startDateTime),
                        visit_session_state_id: 1,
                        technician_id: technicianId,
                        template_id: templateId,
                        template_type: templateType,
                    };
    
                    visitData = await this.__http.post(`${process.env.VISIT_DESK_URL}vd/visit_session/create`, { ...dataForVisitSession }, config);
    
                } catch (error) {
    
                    await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                    await this.deleteKioskSessionByAppointmentId(kioskData.id, userId);
    
                    throw error;
                }
    
                const { result: { data: { id: visitSessionId } } } = visitData;
    
                const { speciality_key: specialtyName, name: specName }: models.specialitiesI = await this.__specialityRepo.findOne({
                    deleted_at: null,
                    id: specialityId,
                });
    
                const specialityEnvironment: string = this.__getSpecialityName[specialtyName];
    
                if (specialityEnvironment) {
    
                    await this.__http.post(`${process.env[specialityEnvironment]}/medical-session/create-backdate-appointment-session`,
                        {
                            appointment_type_id: createdAppointmentWithDoctor?.type_id,
                            case_id: caseId,
                            doctor_id: doctorId,
                            patient_id: patientId,
                            session_type: 1,
                            visit_session_id: visitSessionId,
                            // tslint:disable-next-line: align
                        }, config);
                }
    
                if(specialtyName == 'medical_doctor'){
                    await this.__http.post(`${process.env.FRONT_DESK_URL}md/medical_sessions/save`, {
                        appointment_id: createdAppointmentWithDoctor.id,
                        doctorId: doctorId,
                        provider_id: doctorId,
                        patientId: patientId,
                        caseId: caseId,
                        speciality: specName,
                        speciality_id: specialityId,
                        facility_location_id: facilityLocationId,
                        finalize_visit: false,
                        technician_id: technicianId ?? null,
                        template_id: templateId,
                        template_type: templateType,
                        appointment_type_id: createdAppointmentWithDoctor?.type_id,
                    }, config);
                }

                const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                    {
                        id: createdAppointmentWithDoctor.id
                    },
                    {
                        include: [
                            {
                                as: 'appointmentStatus',
                                model: models.sch_appointment_statuses,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            {
                                as: 'patient',
                                model: models.kiosk_patient,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            {
                                as: 'caseType',
                                model: models.kiosk_case_types,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                        ]
                    }
                ));
    
                const endTime: Date = new Date(newAppointment.scheduled_date_time);
                endTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);
    
                contactPersonType = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));
    
                selfContactPerson = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
                    case_id: newAppointment.case_id,
                    contact_person_type_id: contactPersonType.id,
                    deleted_at: null
                }));
    
                if (selfContactPerson && selfContactPerson.email) {
                    // tslint:disable-next-line: no-floating-promises
                    this.sentEmailForAppointment({
                        appointmentId: newAppointment.id,
                        appointmentStatus: newAppointment.appointmentStatus.name,
                        caseId: newAppointment.case_id,
                        caseType: newAppointment.caseType.name,
                        confirmationStatus: newAppointment.confirmation_status,
                        email: selfContactPerson.email,
                        emailTitle: 'Create Appointment',
                        endDateTime: new Date(endTime),
                        patientLastName: newAppointment.patient.last_name,
                        reason: 'created',
                        scheduledDateTime: new Date(newAppointment.scheduled_date_time),
                        timeSlot: newAppointment.time_slots,
                    });
                }
    
                this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [newAppointment.id], email_title: 'Appointment Created' }, config);
    
                const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [newAppointment.id], user_id: userId }, _authorization);
    
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [newAppointment.id] }, config);
    
                createdAppointmentsWithDoctor.push(createdAppointmentWithDoctor);
    
            } catch (error) {
                throw error;
            }
        }
        let message = await this.checkErrorMultipleCptAppointments(cptCodes, multipleAppointments, true,doctorId,speciality);

        return {
            msg_alert_1:message,
            ...createdAppointmentsWithDoctor[0] , 
            other_appointments:(createdAppointmentsWithDoctor.length>1) ? createdAppointmentsWithDoctor.slice(1,createdAppointmentsWithDoctor.length):[]
        }
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public deleteAppointments = async (data: typings.DeleteAppointmentsBodyI, _authorization: string): Promise<typings.DeleteAppointmentsResponseI> => {

        const {
            appointment_ids: appointmentIds,
            comments,
            case_ids: caseIds,
            from_kiosk: fromKiosk,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const updatedAppointments: models.sch_appointmentsI[] = await this.__repo.updateByIds(
            appointmentIds,
            {
                cancelled: 0,
                comments,
                deleted_at: new Date(),
                origin_facility_id: null,
                pushed_to_front_desk: 0,
                target_facility_id: null,
                updated_at: new Date(),
                updated_by: userId,
            }
        );

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIds, email_title: 'Appointment Deleted' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIds }, config);

        const deletedAppointments: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIds, user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: appointmentIds, }, config);

        await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        return updatedAppointments;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public forwardAppointmentsToFD = async (data: typings.ForwardAppointmentsToFDBodyI, _authorization: string): Promise<typings.ForwardAppointmentsToFDResponseI> => {

        const {
            appointment_ids: appointmentIds,
            user_id: userId,
            origin_clinic_id: originClinicId,
            target_clinic_id: targetClinicId,
            pushed_to_front_desk_comments: comments
        } = data;

        const facilityLocationIds: number[] = [];

        const clinicIds: number[] = [];

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const appointmentStatuesIds: number[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll(
            {
                [Op.or]: [
                    { slug: 'scheduled' },
                    { slug: 're_scheduled' },
                    { slug: 'arrived' },
                    { slug: 'completed' },
                ]
            },
            {
                attributes: ['id'],
            }
        )).map((x: models.sch_appointment_statusesI): number => x.id);

        const appointmens: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                id: appointmentIds,
                type_id: appointmentType.id
            },
            {
                include: {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                }
            }));

        if (appointmens && appointmens.length) {

            const specialityIds: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.availableSpeciality.speciality_id);
            const caseId: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.case_id);
            const patientIds: number[] = appointmens.map((x: models.sch_appointmentsI): number => x.patient_id);

            const previousAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    id: { [Op.ne]: appointmentIds },
                    case_id: caseId,
                    patient_id: patientIds,
                    deleted_at: null,
                    cancelled: false,
                    pushed_to_front_desk: false,
                    status_id: appointmentStatuesIds,
                    type_id: { [Op.ne]: appointmentType.id },
                },
                {
                    include: {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityIds
                        }
                    }
                }
            ));

            if (previousAppointment && Object.keys(previousAppointment).length) {
                throw generateMessages('PATIENT_APPOINTMENT_EXIST');
            }

        }

        if (originClinicId && targetClinicId) {
            clinicIds.push(originClinicId);
            // tslint:disable-next-line: no-unused-expression
            originClinicId !== targetClinicId && facilityLocationIds.push(targetClinicId);
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles;

        if (userRole && slug !== 'super_admin') {

            const userFacilities: models.user_facility[] = this.shallowCopy(await this.__userFacilityRepo.findAll({ facility_location_id: { [Op.in]: facilityLocationIds }, user_id: userId, deleted_at: null }, { logging: true }));

            if (userFacilities.length !== facilityLocationIds.length) {

                throw generateMessages('NO_SUPER_ADMIN');

            }
        }

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const { status } = await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/remove-patient-sessions`, { appointment_ids: appointmentIds, trigger_socket: true }, config);

        if (status !== 200) {

            throw generateMessages('ERROR_FROM_KIOSK');

        }

        const updatedAppoitments: models.sch_appointmentsI[] = await this.__repo.updateByIds(
            appointmentIds,
            { origin_facility_id: originClinicId, target_facility_id: targetClinicId, pushed_to_front_desk: 1, pushed_to_front_desk_comments: comments, updated_by: userId, updated_at: new Date(), cancelled: 0 }
        );

        const deletedAppointments: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIds, user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: appointmentIds, }, config);

        this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIds, email_title: 'Appointment Forwarded to Frontdesk' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIds }, config);

        return updatedAppoitments;

    }

    /**
     *
     * @param params
     * @param _authorization
     */
    public getAll = async (query: typings.GetAllAppointmentsBodyI, _authorization: string): Promise<typings.GetAllAppointmentsResponseI> => {

        const { page, per_page, id } = query || {};

        if (id) {
            return this.__repo.findById(id, {
                include: [
                    {
                        as: 'dateList',
                        include: [
                            {
                                as: 'availableDoctor',
                                include: [
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
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'facilityLocations',
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
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include: {
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
                                model: models.sch_available_doctors,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                include: [
                                    {
                                        as: 'speciality',
                                        model: models.specialities,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'facilityLocation',
                                        include: {
                                            as: 'facility',
                                            model: models.facilities,
                                            required: false
                                        },
                                        model: models.facility_locations,
                                        required: false,
                                        where: { deleted_at: null },
                                    }
                                ],
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'appointmentType',
                        model: models.sch_appointment_types,
                        required: false,
                        where: { deleted_at: null }
                    },
                ]
            }
            );
        }
        const pageNumber: number = page ?? 1;
        const perPage: number = per_page ?? 20;

        return this.__repo.customAppointmentpaginate({}, pageNumber, perPage, {});
    }

    public getAppointments = async (data: typings.GetAppointmentsBodyI, _authorization: string): Promise<typings.GetAllAppointmentsResponseI> => {
        
        const {
            appointment_type,
            filters,
            page,
            paginate,
            user_id: userId = Number(process.env.USERID),
            per_page: perPage
        } = data;

        const {
            end_date: endDate,
            patient_ids: patientId,
            patient_name: patientName,
            case_ids: caseIds,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds,
            created_by_ids:createdByIds,
            updated_by_ids:updatedByIds,
            created_at:createdAt,
            updated_at:updatedAt,
            comments,
            filter_with_or: filterWithOr,
        } = filters;

        const appointmentListingType: string = appointment_type?.toUpperCase();

        const validatedAppointmentType: string[] = ['CANCELLED', 'SCHEDULED', 'RESCHEDULED', 'PATIENT']; // 'DOCTOR', 'SPECIALITY',
        
        if (!validatedAppointmentType.includes(appointmentListingType)) {
            throw new Error('Invalid Listing type provided!');
        }

        const filterType: string = filterWithOr ? 'or' : 'and';

        const dynamicQueryClause: typings.DynamicQueryClausesForAppointmentsI = this[this.__genericAppointmentListing[`${appointmentListingType}`]]({});

        const whereClause: typings.GenericWhereClauseForAppointmentsReturnObjectsI = this.generateWhereClauseForGenericAPI({
            createdAt,
            createdByIds,
            updatedAt,
            updatedByIds,
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            appointmentListingType,
            comments,
            filterType,
            page,
            perPage,
            paginate
        });

        const count: string = this.generateGenericAppointmentRawQueryCount(whereClause);
        const [countData]: typings.ANY = this.shallowCopy(await sequelize.query(count));
        const [countResult] = countData;

        const rawQuery: string = this.generateGenericAppointmentRawQuery({
            ...whereClause,
            dynamicQueryClause,
        });

        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (caseIds && caseIds.length) {
            this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);
        }

        if (paginate) {

            return {
                docs: rawQueryResult,
                page_number: page,
                pages: Math.ceil(countResult.total_count / perPage),
                total: countResult.total_count,
            };
        }

        return rawQueryResult;

    }

    /**
     *
     * @param data
     * @param _authorization
     */

    public getAllAppointmentPushedToFrontDesk = async (data: typings.GetAllAppointmentPushedToFrontDeskBodyI, _authorization: string): Promise<typings.GetAllAppointmentPushedToFrontDeskResponseI> => {

        const {
            facility_location_ids: facilityLocationIds,
            start_date: startDateString,
            appointment_type_ids: appointmentTypeIds,
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            end_date: endDateString,
            user_id: userId = Number(process.env.USERID),
            per_page,
            page,
            case_ids: caseIds
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const whereClause: { [key: string]: typings.ANY } = {
            deleted_at: null,
            pushed_to_front_desk: true,
            target_facility_id: { [Op.in]: facilityLocationIds },
            updated_at: { [Op.gte]: startDate, [Op.lte]: endDate },
        };

        if (caseIds && caseIds.length) {
            whereClause.case_id = { [Op.in]: caseIds };

            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }

        }

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereClause.type_id = { [Op.in]: appointmentTypeIds };
        }

        const specialityFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityIds?.length) {
            specialityFilters.id = { [Op.in]: specialityIds };
        }

        const caseTypeFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (caseTypeIds?.length) {
            caseTypeFilters.id = { [Op.in]: caseTypeIds };
        }

        const doctorFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (doctorIds?.length) {
            doctorFilters.id = { [Op.in]: doctorIds };
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const allToBeScheduledAppointments: typings.ANY = this.shallowCopy(await this.__repo.customAppointmentpaginate(
            {
                where: {
                    ...whereClause
                }
            },
            pagenumber,
            perPage,
            null,
            {
                include: [
                    {
                        as: 'dateList',
                        include: [
                            {
                                as: 'availableDoctor',
                                include: [
                                    {
                                        as: 'availableSpeciality',
                                        include:
                                        {
                                            as: 'speciality',
                                            model: models.specialities,
                                            required: specialityIds && specialityIds.length ? true : false,
                                            where: { ...specialityFilters },
                                        },
                                        model: models.sch_available_specialities,
                                        required: specialityIds && specialityIds.length ? true : false,
                                        where: { deleted_at: null }
                                    },
                                    {
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include: [
                                            {
                                                as: 'userBasicInfo',
                                                attributes: ['id', 'first_name', 'last_name', 'middle_name', 'user_id'],
                                                model: models.user_basic_info,
                                                required: false,
                                                where: { deleted_at: null },
                                            },
                                            {
                                                model: models.medical_identifiers,
                                                attributes: ['id'],
                                                required: false,
                                                include: {
                                                    as: 'billingTitle',
                                                    required: false,
                                                    attributes: ['id', 'name'],
                                                    model: models.billing_titles,
                                                    where: { deleted_at: null }
                                                },
                                                where: {
                                                    deleted_at: null,
                                                },
                                            }
                                        ],
                                        model: models.users,
                                        required: true,
                                        where: { ...doctorFilters },
                                    },
                                ],
                                model: models.sch_available_doctors,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                include:
                                {
                                    as: 'speciality',
                                    model: models.specialities,
                                    required: specialityIds && specialityIds.length ? true : false,
                                    where: { ...specialityFilters },
                                },
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            }
                        ],
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'caseType',
                        model: models.kiosk_case_types,
                        required: true,
                        where: { ...caseTypeFilters }
                    },
                    {
                        as: 'targetFacility',
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
                        as: 'originFacility',
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
                        as: 'patient',
                        attributes: ['id', 'first_name', 'last_name', 'middle_name', 'profile_avatar', 'dob'],
                        model: models.kiosk_patient,
                        required: false,
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['id', 'name', 'slug', 'qualifier'],
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentStatus',
                        attributes: ['id', 'name', 'slug'],
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
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
                        required: true,
                        where: { deleted_at: null },
                    },

                ],
                order: [
                    ['updated_at', 'DESC']
                ]
            }
        ));

        const { docs, no_of_pages, total, page_number, is_last } = allToBeScheduledAppointments || {};

        if (!docs || !docs.length) {
            return [];
        }

        return {
            docs,
            page_number,
            is_last,
            pages: no_of_pages,
            total,
        };
    }

    public getAllAppointmentPushedToFrontDeskV1 = async (data: typings.GetAllAppointmentPushedToFrontDeskBodyI, _authorization: string): Promise<typings.GetAllAppointmentPushedToFrontDeskResponseI> => {

        const {
            facility_location_ids: facilityLocationIds,
            start_date: startDateString,
            appointment_type_ids: appointmentTypeIds,
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            end_date: endDateString,
            user_id: userId = Number(process.env.USERID),
            per_page: perPage,
            page,
            paginate,
            case_ids: caseIds
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        if (caseIds && caseIds.length) {
            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }

        }
        const count: typings.ANY = this.rawQueryForAppointmentPushedToFrontDeskCount({caseIds, facilityLocationIds, startDateString, endDateString, appointmentTypeIds, doctorIds, specialityIds, caseTypeIds, page, perPage, paginate: false});

        const [countResult]: typings.ANY = this.shallowCopy(await sequelize.query(count));
        const total: number = countResult.length;
        const rawQuery: typings.ANY = this.rawQueryForAppointmentPushedToFrontDesk({caseIds, facilityLocationIds, startDateString, endDateString, appointmentTypeIds, doctorIds, specialityIds, caseTypeIds, page, perPage, paginate});

        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));

        const finalAppointments: typings.ANY[] = this.filterNonNull(rawQueryResult?.map((o: typings.ANY): typings.ANY => {

            let availableSpeciality: typings.ANY = {};
            let availableSpecialityDoctor: typings.ANY = {};
            let facilityLocation: typings.ANY = {};
            let facility: typings.ANY = {};
            let doctor: typings.ANY = {};
            let speciality: typings.ANY = {};
            let appointment: typings.ANY = {};
            let doctorBasicInfo: typings.ANY = {};
            let updatedBy: typings.ANY = {};
            let updatedByUserbasicInfo: typings.ANY = {};
            let patient: typings.ANY = {};
            let appointmentType: typings.ANY = {};
            let appointmentStatus: typings.ANY = {};
            let caseTypes: typings.ANY = {};
            let targetFacilityLocation: typings.ANY = {};
            let targetFacilities: typings.ANY = {};
            let originFacilityLocation: typings.ANY = {};
            let originFacilities: typings.ANY = {};
            let medicalIdentifier: typings.ANY = {};
            let billingTitles: typings.ANY = {};

            if(o.medicalIdentifier_id) {
                medicalIdentifier = {
                    id : o.medicalIdentifier_id,
                    clinic_name : o.medicalIdentifier_clinic_name,
                }
            }
            if(o.billingTitles_id) {
                billingTitles = {
                    id : o.billingTitles_id,
                    name : o.billingTitles_name,
                    description : o.billingTitles_description,
                } 
            }
            if (o?.updatedBy_id) {
                updatedBy = {
                    created_at: o?.updatedBy_created_at,
                    created_by: o?.updatedBy_created_by,
                    deleted_at: o?.updatedBy_deleted_at,
                    email: o?.updatedBy_email,
                    id: o?.updatedBy_id,
                    is_loggedin: o?.updatedBy_is_loggedIn,
                    remember_token: o?.updatedBy_remember_token,
                    reset_key: o?.updatedBy_reset_key,
                    status: o?.updatedBy_status,
                    updated_at: o?.updatedBy_updated_at,
                    updated_by: o?.updatedBy_updated_by,
                };
            }

            if (o?.updatedByUserBasicInfo_id) {
                updatedByUserbasicInfo = {
                    address: o?.updatedByUserBasicInfo_address,
                    apartment_suite: o?.updatedByUserBasicInfo_apartment_suite,
                    area_id: o?.updatedByUserBasicInfo_area_id,
                    biography: o?.updatedByUserBasicInfo_biography,
                    cell_no: o?.updatedByUserBasicInfo_cell_no,
                    city: o?.updatedByUserBasicInfo_city,
                    created_at: o?.updatedByUserBasicInfo_created_at,
                    created_by: o?.updatedByUserBasicInfo_created_by,
                    date_of_birth: o?.updatedByUserBasicInfo_date_of_birth,
                    deleted_at: o?.updatedByUserBasicInfo_deleted_at,
                    department_id: o?.updatedByUserBasicInfo_department_id,
                    designation_id: o?.updatedByUserBasicInfo_designation_id,
                    emergency_phone: o?.updatedByUserBasicInfo_emergency_phone,
                    employed_by_id: o?.updatedByUserBasicInfo_employed_by_id,
                    employment_type_id: o?.updatedByUserBasicInfo_employment_type_id,
                    extension: o?.updatedByUserBasicInfo_extension,
                    fax: o?.updatedByUserBasicInfo_fax,
                    file_id: o?.updatedByUserBasicInfo_file_id,
                    first_name: o?.updatedByUserBasicInfo_first_name,
                    from: o?.updatedByUserBasicInfo_from,
                    gender: o?.updatedByUserBasicInfo_gender,
                    hiring_date: o?.updatedByUserBasicInfo_hiring_date,
                    id: o?.updatedByUserBasicInfo_id,
                    last_name: o?.updatedByUserBasicInfo_last_name,
                    middle_name: o?.updatedByUserBasicInfo_middle_name,
                    profile_pic: o?.updatedByUserBasicInfo_profile_pic,
                    profile_pic_url: o?.updatedByUserBasicInfo_profile_pic_url,
                    social_security: o?.updatedByUserBasicInfo_social_security,
                    state: o?.updatedByUserBasicInfo_state,
                    title: o?.updatedByUserBasicInfo_title,
                    to: o?.updatedByUserBasicInfo_to,
                    updated_at: o?.updatedByUserBasicInfo_updated_at,
                    updated_by: o?.updatedByUserBasicInfo_updated_by,
                    user_id: o?.updatedByUserBasicInfo_user_id,
                    work_phone: o?.updatedByUserBasicInfo_work_phone,
                    zip: o?.updatedByUserBasicInfo_zip
                };
            }

            if (o?.doctorBasicInfo_id) {
                doctorBasicInfo = {
                    id: o?.doctorBasicInfo_id,
                    first_name: o?.doctorBasicInfo_first_name,
                    middle_name: o?.doctorBasicInfo_middle_name,
                    last_name: o?.doctorBasicInfo_last_name,
                    date_of_birth: o?.doctorBasicInfo_date_of_birth,
                    gender: o?.doctorBasicInfo_gender,
                    user_id: o?.doctorBasicInfo_user_id,
                    area_id: o?.doctorBasicInfo_area_id,
                    title: o?.doctorBasicInfo_title,
                    cell_no: o?.doctorBasicInfo_cell_no,
                    address: o?.doctorBasicInfo_address,
                    work_phone: o?.doctorBasicInfo_work_phone,
                    fax: o?.doctorBasicInfo_fax,
                    extension: o?.doctorBasicInfo_extension,
                    home_phone: o?.doctorBasicInfo_home_phone,
                    emergency_name: o?.doctorBasicInfo_emergency_name,
                    emergency_phone: o?.doctorBasicInfo_emergency_phone,
                    biography: o?.doctorBasicInfo_biography,
                    hiring_date: o?.doctorBasicInfo_hiring_date,
                    from: o?.doctorBasicInfo_from,
                    to: o?.doctorBasicInfo_to,
                    profile_pic: o?.doctorBasicInfo_profile_pic,
                    city: o?.doctorBasicInfo_city,
                    state: o?.doctorBasicInfo_state,
                    zip: o?.doctorBasicInfo_zip,
                    social_security: o?.doctorBasicInfo_social_security,
                    profile_pic_url: o?.doctorBasicInfo_profile_pic_url,
                    apartment_suite: o?.doctorBasicInfo_apartment_suite,
                };
            }
            if (o?.appointment_id) {
                appointment = {
                    id: o?.appointment_id,
                    key: o?.appointment_key,
                    scheduled_date_time: o?.appointment_scheduled_date_time,
                    evaluation_date_time: o?.appointment_evaluation_date_time,
                    time_slots: o?.appointment_time_slot,
                    appointment_title: o?.appointment_title,
                    action_performed: o?.appointment_action_performed,
                    confirmation_status: o?.appointment_confirmation_status,
                    cancelled: o?.appointment_cancelled,
                    pushed_to_front_desk: o?.appointment_pushed_to_front_dest,
                    comments: o?.appointment_comments,
                    by_health_app: o?.appointment_by_health_app,
                    date_list_id: o?.appointment_date_list_id,
                    target_facility_id: o?.appointment_target_facility_id,
                    origin_facility_id: o?.appointment_origin_facility_id,
                    case_id: o?.appointment_case_id,
                    case_type_id: o?.appointment_case_type_id,
                    patient_id: o?.appointment_patient_id,
                    type_id: o?.appointment_type_id,
                    status_id: o?.appointment_status_id,
                    priority_id: o?.appointment_priority_id,
                    available_doctor_id: o?.appointment_available_doctor_id,
                    available_speciality_id: o?.appointment_available_speciality_id,
                    billable: o?.appointment_billable,
                    pushed_to_front_desk_comments: o?.appointment_pushed_to_front_desk_comments,
                    cancelled_comments: o?.appointment_cancelled_comments,
                    is_speciality_base: o?.appointment_is_speciality_base,
                    created_by: o?.appointment_created_by,
                    updated_by: o?.appointment_updated_by,
                    created_at: o?.appointment_created_at,
                    updated_at: o?.appointment_updated_at,
                    deleted_at: o?.appointment_deleted_at,
                    is_redo: o?.appointment_is_redo,
                    is_active: o?.appointment_is_active,
                    is_soft_registered: o?.appointment_is_soft_registered,
                    physician_id: o?.appointment_physician_id,
                    technician_id: o?.appointment_technician_id,
                    reading_provider_id: o?.appointment_reading_provider_id,
                    cd_image: o?.appointment_cd_image,
                    is_transportation: o?.appointment_is_transportation,
                };
            }

            if (o?.patient_id) {
                patient = {
                    age: o?.patient_age,
                    cell_phone: o?.patient_cell_phone,
                    created_at: o?.patient_created_at,
                    created_by: o?.patient_created_by,
                    deleted_at: o?.patient_deleted_at,
                    dob: o?.patient_dob,
                    first_name: o?.patient_first_name,
                    gender: o?.patient_gender,
                    height_ft: o?.patient_height_ft,
                    height_in: o?.patient_height_in,
                    home_phone: o?.patient_home_phone,
                    id: o?.patient_id,
                    is_law_enforcement_agent: o?.patient_is_law_enforcement_agent,
                    is_pregnant: o?.patient_is_pregnant,
                    key: o?.patient_key,
                    language: o?.patient_language,
                    last_name: o?.patient_last_name,
                    meritial_status: o?.patient_meritial_status,
                    middle_name: o?.patient_middle_name,
                    need_translator: o?.patient_need_translator,
                    notes: o?.patient_notes,
                    profile_avatar: o?.patient_profile_avatar,
                    ssn: o?.patient_ssn,
                    status: o?.patient_status,
                    updated_at: o?.patient_updated_at,
                    updated_by: o?.patient_updated_by,
                    weight_kg: o?.patient_weight_kg,
                    weight_lbs: o?.patient_weight_lbs,
                    work_phone: o?.patient_work_phone,
                };
            }

            if (o?.appointmentStatus_id) {
                appointmentStatus = {
                    created_at: o?.appointmentStatus_created_at,
                    created_by: o?.appointmentStatus_created_by,
                    deleted_at: o?.appointmentStatus_deleted_at,
                    id: o?.appointmentStatus_id,
                    name: o?.appointmentStatus_name,
                    slug: o?.appointmentStatus_slug,
                    updated_at: o?.appointmentStatus_updated_at,
                    updated_by: o?.appointmentStatus_updated_by,
                };
            }

            if (o?.availableSpeciality_id) {
                availableSpeciality = {
                    id: o?.availableSpeciality_id,
                    key: o?.availableSpeciality_key,
                    start_date: o?.availableSpeciality_start_date,
                    end_date: o?.availableSpeciality_end_date,
                    end_date_for_recurrence: o?.availableSpeciality_end_date_for_recurrence,
                    no_of_doctors: o?.availableSpeciality_no_of_doctors,
                    no_of_slots: o?.availableSpeciality_no_of_slots,
                    end_after_occurences: o?.availableSpeciality_end_after_occurences,
                    number_of_entries: o?.availableSpeciality_number_of_entries,
                    speciality_id: o?.availableSpeciality_speciality_id,
                    facility_location_id: o?.availableSpeciality_facility_location_id,
                    recurrence_ending_criteria_id: o?.availableSpeciality_recurrence_ending_criteria_id,
                    deleted_at: o?.availableSpeciality_deleted_at,
                };
            }

            if (o?.availableSpecialityDoctor_id) {
                availableSpecialityDoctor = {
                    id: o?.availableSpecialityDoctor_id,
                    key: o?.availableSpecialityDoctor_key,
                    start_date: o?.availableSpecialityDoctor_start_date,
                    end_date: o?.availableSpecialityDoctor_end_date,
                    no_of_slots: o?.availableSpecialityDoctor_no_of_slots,
                    doctor_id: o?.availableSpecialityDoctor_doctor_id,
                    facility_location_id: o?.availableSpecialityDoctor_facility_location_id,
                    available_speciality_id: o?.availableSpecialityDoctor_available_speciality_id,
                    supervisor_id: o?.availableSpecialityDoctor_supervisor_id,
                    is_provider_assignment: o?.availableSpecialityDoctor_is_provider_assignment
                };
            }

            if (o?.doctor_id) {
                doctor = {
                    id: o?.doctor_id,
                    email: o?.doctor_email,
                    reset_key: o?.doctor_reset_key,
                    status: o?.doctor_status,
                    is_loggedIn: o?.doctor_is_loggedIn,
                    remember_token: o?.doctor_remember_token,
                };
            }

            if (o?.facilityLocation_id) {
                facilityLocation = {
                    id: o?.facilityLocation_id,
                    facility_id: o?.facilityLocation_facility_id,
                    name: o?.facilityLocation_name,
                    city: o?.facilityLocation_city,
                    state: o?.facilityLocation_state,
                    zip: o?.facilityLocation_zip,
                    region_id: o?.facilityLocation_region_id,
                    address: o?.facilityLocation_address,
                    phone: o?.facilityLocation_phone,
                    fax: o?.facilityLocation_fax,
                    email: o?.facilityLocation_email,
                    office_hours_start: o?.facilityLocation_office_hours_start,
                    office_hours_end: o?.facilityLocation_office_hours_end,
                    lat: o?.facilityLocation_lat,
                    long: o?.facilityLocation_long,
                    day_list: o?.facilityLocation_day_list,
                    floor: o?.facilityLocation_floor,
                    place_of_service_id: o?.facilityLocation_place_of_service_id,
                    qualifier: o?.facilityLocation_qualifier,
                    ext_no: o?.facilityLocation_ext_no,
                    cell_no: o?.facilityLocation_cell_no,
                    is_main: o?.facilityLocation_is_main,
                    same_as_provider: o?.facilityLocation_same_as_provider,
                    dean: o?.facilityLocation_dean,
                    // State_id: o?.facilityLocation_state_id,
                };
            }

            if (o?.specialities_id) {
                speciality = {
                    id: o?.specialities_id,
                    name: o?.specialities_name,
                    description: o?.specialities_description,
                    time_slot: o?.specialities_time_slot,
                    over_booking: o?.specialities_over_booking,
                    has_app: o?.specialities_has_app,
                    speciality_key: o?.specialities_speciality_key,
                    comments: o?.specialities_comments,
                    default_name: o?.specialities_default_name,
                    qualifier: o?.specialities_qualifier,
                    is_defualt: o?.specialities_is_defualt,
                    is_available: o?.specialities_is_available,
                    is_create_appointment: o?.specialities_is_create_appointment,
                    is_editable: o?.specialities_is_editable,
                };
            }

            if (o?.facilities_id) {
                facility = {
                    created_at: o?.facilities_created_at,
                    created_by: o?.facilities_created_by,
                    deleted_at: o?.facilities_deleted_at,
                    id: o?.facilities_id,
                    name: o?.facilities_name,
                    slug: o?.facilities_slug,
                    qualifier: o?.facilities_qualifier,
                    updated_at: o?.facilities_updated_at,
                    updated_by: o?.facilities_updated_by,
                };
            }

            if (o?.caseTypes_id) {
                caseTypes = {
                    id: o?.caseTypes_id,
                    key: o?.caseTypes_key,
                    name: o?.caseTypes_name,
                    slug: o?.caseTypes_slug,
                    description: o?.caseTypes_description,
                    comments: o?.caseTypes_comments,
                    remainder_days: o?.caseTypes_remainder_days,
                    created_by: o?.caseTypes_created_by,
                    updated_by: o?.caseTypes_udpated_by,
                    created_at: o?.caseTypes_created_at,
                    updated_at: o?.caseTypes_updated_at,
                    deleted_at: o?.caseTypes_deleted_at,
                };
            }

            if (o?.targetFacilityLocation_id) {
                targetFacilityLocation = {
                    id: o?.targetFacilityLocation_id,
                    facility_id: o?.targetFacilityLocation_facility_id,
                    name: o?.targetFacilityLocation_name,
                    city: o?.targetFacilityLocation_city,
                    state: o?.targetFacilityLocation_state,
                    zip: o?.targetFacilityLocation_zip,
                    region_id: o?.targetFacilityLocation_region_id,
                    address: o?.targetFacilityLocation_address,
                    phone: o?.targetFacilityLocation_phone,
                    fax: o?.targetFacilityLocation_fax,
                    email: o?.targetFacilityLocation_email,
                    office_hours_start: o?.targetFacilityLocation_office_hours_start,
                    office_hours_end: o?.targetFacilityLocation_office_hours_end,
                    lat: o?.targetFacilityLocation_lat,
                    long: o?.targetFacilityLocation_long,
                    day_list: o?.targetFacilityLocation_day_list,
                    floor: o?.targetFacilityLocation_floor,
                    place_of_service_id: o?.targetFacilityLocation_place_of_service_id,
                    qualifier: o?.targetFacilityLocation_qualifier,
                    ext_no: o?.targetFacilityLocation_ext_no,
                    cell_no: o?.targetFacilityLocation_cell_no,
                    is_main: o?.targetFacilityLocation_is_main,
                    same_as_provider: o?.targetFacilityLocation_same_as_provider,
                    created_by: o?.targetFacilityLocation_created_by,
                    updated_by: o?.targetFacilityLocation_updated_by,
                    created_at: o?.targetFacilityLocation_created_at,
                    updated_at: o?.targetFacilityLocation_updated_at,
                    deleted_at: o?.targetFacilityLocation_deleted_at,
                    dean: o?.targetFacilityLocation_dean,
                };
            }

            if (o?.targetFacilities_id) {
                targetFacilities = {
                    created_at: o?.targetFacilities_created_at,
                    created_by: o?.targetFacilities_created_by,
                    deleted_at: o?.targetFacilities_deleted_at,
                    id: o?.targetFacilities_id,
                    name: o?.targetFacilities_name,
                    slug: o?.targetFacilities_slug,
                    qualifier: o?.targetFacilities_qualifier,
                    updated_at: o?.targetFacilities_updated_at,
                    updated_by: o?.targetFacilities_updated_by,
                };
            }

            if (o?.originFacilityLocation_id) {
                originFacilityLocation = {
                    id: o?.originFacilityLocation_id,
                    facility_id: o?.originFacilityLocation_facility_id,
                    name: o?.originFacilityLocation_name,
                    city: o?.originFacilityLocation_city,
                    state: o?.originFacilityLocation_state,
                    zip: o?.originFacilityLocation_zip,
                    region_id: o?.originFacilityLocation_region_id,
                    address: o?.originFacilityLocation_address,
                    phone: o?.originFacilityLocation_phone,
                    fax: o?.originFacilityLocation_fax,
                    email: o?.originFacilityLocation_email,
                    office_hours_start: o?.originFacilityLocation_office_hours_start,
                    office_hours_end: o?.originFacilityLocation_office_hours_end,
                    lat: o?.originFacilityLocation_lat,
                    long: o?.originFacilityLocation_long,
                    day_list: o?.originFacilityLocation_day_list,
                    floor: o?.originFacilityLocation_floor,
                    place_of_service_id: o?.originFacilityLocation_place_of_service_id,
                    qualifier: o?.originFacilityLocation_qualifier,
                    ext_no: o?.originFacilityLocation_ext_no,
                    cell_no: o?.originFacilityLocation_cell_no,
                    is_main: o?.originFacilityLocation_is_main,
                    same_as_provider: o?.originFacilityLocation_same_as_provider,
                    created_by: o?.originFacilityLocation_created_by,
                    updated_by: o?.originFacilityLocation_updated_by,
                    created_at: o?.originFacilityLocation_created_at,
                    updated_at: o?.originFacilityLocation_updated_at,
                    deleted_at: o?.originFacilityLocation_deleted_at,
                    dean: o?.originFacilityLocation_dean,
                };
            }

            if (o?.originFacilities_id) {
                originFacilities = {
                    created_at: o?.originFacilities_created_at,
                    created_by: o?.originFacilities_created_by,
                    deleted_at: o?.originFacilities_deleted_at,
                    id: o?.originFacilities_id,
                    name: o?.originFacilities_name,
                    slug: o?.originFacilities_slug,
                    qualifier: o?.originFacilities_qualifier,
                    updated_at: o?.originFacilities_updated_at,
                    updated_by: o?.originFacilities_updated_by,
                };
            }

            if (o?.appointmentType_id) {
                appointmentType = {
                    id: o?.appointmentType_id,
                    name: o?.appointmentType_name,
                    slug: o?.appointmentType_slug,
                    description: o?.appointmentType_description,
                    is_all_cpt_codes: o?.appointmentType_is_all_cpt_codes,
                    enable_cpt_codes: o?.appointmentType_enable_cpt_codes,
                    qualifier: o?.appointmentType_qualifier,
                    created_by: o?.appointmentType_created_by,
                    updated_by: o?.appointmentType_updated_by,
                    created_at: o?.appointmentType_created_at,
                    updated_at: o?.appointmentType_updated_at,
                    deleted_at: o?.appointmentType_deleted_at,
                    is_editable: o?.appointmentType_is_editable,
                    avoid_checkedin: o?.appointmentType_avoid_checkedin,
                    is_reading_provider: o?.appointmentType_is_reading_provider,
                };
            }

            return {
                ...appointment,
                availableSpeciality: o.availableSpeciality_id ? {
                    ...availableSpeciality,
                    availableSpecialityDoctor: o.availableSpecialityDoctor_id ? {
                        ...availableSpecialityDoctor,
                        doctor: o.doctor_id ? {
                            billingTitles: o.billingTitles_id ? billingTitles : null,
                            ...doctor,
                            doctorBasicInfo: o.doctorBasicInfo_id ? doctorBasicInfo : null,
                            medicalIdentifier: o.medicalIdentifier_id ? medicalIdentifier : null,
                        } : null,
                    } : null,
                    facilityLocation: o.facilityLocation_id ? {
                        ...facilityLocation,
                        facility: o.facilities_id ? facility : null
                    } : null,
                    speciality: o.specialities_id ? speciality : null
                } : null,
                caseTypes: o.caseTypes_id ? caseTypes : null,
                targetFacility: o.targetFacilityLocation_id ? {
                    ...targetFacilityLocation,
                    facility: o.targetFacilities_id ? targetFacilities : null,
                } : null,
                originFacility: o.originFacilityLocation_id ? {
                    ...originFacilityLocation,
                    facility: o.originFacilities_id ? originFacilities : null,
                } : null,
                patient: o.patient_id ? patient : null,
                appointmentType: o.appointmentType_id ? appointmentType : null,
                appointmentStatus: o.appointmentStatus_id ? appointmentStatus : null,
                updatedBy: o.updatedBy_id ? {
                    ...updatedBy,
                    userBasicInfo: o.updatedByUserBasicInfo_id ? {
                        ...updatedByUserbasicInfo
                    } : null,
                } : null,

            };

        }));

        if (paginate) {

            return {
                docs: finalAppointments,
                page_number: page,
                pages: Math.ceil(total / perPage),
                total,
            };

        }

        return finalAppointments;
    }

    public getAllDoctorSpecialityAppointments = async (data: typings.GetAllDoctorSpecialityAppointmentsBodyI, _authorization: string): Promise<typings.GetAllDoctorSpecialityAppointmentsResponseI> => {

        const {
            date_time_range: dateTimeRange,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            doctor_ids: doctorIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const availableSpecialities: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
            {
                facility_location_id: { [Op.in]: facilityLocationIds },
                speciality_id: { [Op.in]: specialityIds },
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
                                end_date: { [Op.gte]: dateTimeRange[0] },
                                start_date: { [Op.lte]: dateTimeRange[0] },
                            },
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: dateTimeRange[0], [Op.lte]: dateTimeRange[1] },
                            }
                        ]
                    }
                }
            }));

        const availableSpecialityIds: number[] = availableSpecialities.map((s: models.sch_available_specialitiesI): number => s.id);

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
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
                                end_date: { [Op.gte]: dateTimeRange[0] },
                                start_date: { [Op.lte]: dateTimeRange[0] },

                            },
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: dateTimeRange[0], [Op.lte]: dateTimeRange[1] },
                            }
                        ]
                    }
                }
            }));

        const availableDoctorIds: number[] = availableDoctors.map((d: models.sch_available_doctorsI): number => d.id);

        const facilityLocations: models.facility_locationsI[] = this.shallowCopy(await this.__facilityLocationRepo.findAll({
            deleted_at: null,
            id: { [Op.in]: facilityLocationIds },
        }));

        const facilityLocationsIds: number[] = facilityLocations.map((s: models.facility_locationsI): number => s.id);

        if (!facilityLocations || !facilityLocations.length) {
            throw generateMessages('NO_PRACTICES_FOUND');
        }

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId }, {
            include: {
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
            }
        }));

        if (!user || !Object.keys(user).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        const { colorCodes } = user || {};

        const formattedAvailabledDoctors: typings.FormattedAvailablitiesI[] = availableDoctors.map((i: models.sch_available_doctorsI): typings.FormattedAvailablitiesI[] => {

            const { dateList: dateListOfSpeciality } = i;

            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): typings.ANY => ({

                date_list_id: d.id,
                doctor_id: i.doctor_id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                id: i.id,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
                supervisor_id: i.supervisor_id

            }));

        }).flat();

        const formattedAvailableSpecialities: typings.FormattedAvailablitiesI[] = availableSpecialities.map((i: models.sch_available_specialitiesI): typings.FormattedAvailablitiesI[] => {

            const { dateList: dateListOfSpeciality } = i;

            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): typings.ANY => ({

                date_list_id: d.id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                id: i.id,
                no_of_doctors: d.no_of_doctors,
                no_of_slots: d.no_of_slots,
                speciality_id: i.speciality_id,
                start_date: d.start_date,

            }));

        }).flat();

        const formattedAvailablites: typings.FormattedAvailablitiesI[] = [...formattedAvailableSpecialities, ...formattedAvailabledDoctors];

        const facilityWiseMapping: typings.FacilityWiseMappedI[] = formattedAvailablites.map((d: typings.FormattedAvailablitiesI): typings.FacilityWiseMappedI[] => {

            const requiredObject: typings.FormattedAvailablitiesI[] = [];

            if (facilityLocationIds.includes(d.facility_location_id)) {
                requiredObject.push(
                    {
                        date_list_id: d.date_list_id,
                        doctor_id: d?.doctor_id,
                        end_date: d?.end_date,
                        id: d?.id,
                        speciality_id: d?.speciality_id,
                        start_date: d?.start_date,
                        supervisor_id: d?.supervisor_id,
                    });
            }

            return facilityLocations.map((p: models.facility_locationsI): typings.FacilityWiseMappedI => ({
                assignments: requiredObject,
                color: colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === p.id)?.code ?? '#9d9d9d',
                facility_location_id: p.id,
                facility_location_name: p.name,
            }));

        }).flat();

        const visitSessions: models.visit_sessionsI[] = this.shallowCopy(await this.__visitSessionRepo.findAll({
            deleted_at: null,
            doctor_id: { [Op.notIn]: doctorIds },
            speciality_id: { [Op.in]: specialityIds },
        }));

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                deleted_at: null,
                id: { [Op.notIn]: visitSessions?.map((v: models.visit_sessionsI): number => v.appointment_id) },
                pushed_to_front_desk: false,
                scheduled_date_time: { [Op.between]: [dateTimeRange[0], dateTimeRange[1]] },
                [Op.or]: [
                    {
                        available_speciality_id: { [Op.in]: availableSpecialityIds }
                    },
                    {
                        available_doctor_id: { [Op.in]: availableDoctorIds }
                    }
                ]
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
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
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: [
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
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'priority',
                        model: models.sch_appointment_priorities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
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
                    },
                    {
                        as: 'kioskCasePatientSessions',
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentType',
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
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
                        as: 'priority',
                        model: models.sch_appointment_priorities,
                        required: false,
                    },
                    {
                        as: 'appointmentVisit',
                        include: {
                            as: 'visitState',
                            model: models.visit_session_states,
                            required: false,
                        },
                        model: models.visit_sessions,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            }));

        return appointments.map((o: typings.ANY): typings.ANY => ({
            id: o?.id,
            start_date_time: o?.scheduled_date_time,
            comments: o?.comments,
            evaluation_date_time: o?.evaluation_date_time,
            available_speciality_id: o?.available_speciality_id,
            available_doctor_id: o.available_doctor_id ?? null,
            priority_id: o?.priority_id,
            patient_id: o?.patient_id,
            dob: (o?.patient?.dob) ? moment(o?.patient?.dob).format('MM-DD-YYYY') : null,
            time_slot: o?.time_slots,
            case_id: o?.case_id,
            appointment_title: o?.appointment_title,
            appointment_type_id: o?.type_id,
            appointment_duration: o?.time_slots,
            picture: o?.patient.profile_avatar,
            confirmation_status: o?.confirmation_status,
            speciality_id: o?.available_doctor_id ? o?.availableDoctor?.availableSpeciality?.speciality_id : o?.availableSpeciality?.speciality_id,
            facility_location_id: o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id,
            first_name: o?.patient.first_name,
            last_name: o?.patient?.last_name,
            middle_name: o?.patient?.middle_name,
            doctor_id: o?.available_doctor_id ? o?.availableDoctor?.doctor_id ?? null : null,
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
        }));

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAllDoctorSpecialityAppointmentsModify = async (data: typings.GetAllDoctorSpecialityAppointmentsBodyI, _authorization: string): Promise<typings.GetAllDoctorSpecialityAppointmentsResponseI> => {

        const {
            date_time_range: dateTimeRange,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            doctor_ids: doctorIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const facilityLocations: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: { [Op.in]: facilityLocationIds },
            }
        ));

        if (!facilityLocations || !Object.keys(facilityLocations).length) {
            throw generateMessages('NO_PRACTICES_FOUND');
        }

        const startDate: Date = new Date(new Date(dateTimeRange[0]).setUTCHours(0, 0, 0, 0));
        const endDate: Date = new Date(new Date(dateTimeRange[1]).setUTCHours(23, 59, 59, 999));

        const availableSpecialityIds: number[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
            {
                facility_location_id: { [Op.in]: facilityLocationIds },
                speciality_id: { [Op.in]: specialityIds },
            },
            {
                attributes: { exclude: ['key', 'number_of_entries', 'no_of_doctors', 'no_of_slots', 'created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'] },
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        [Op.or]: [
                            {
                                deleted_at: null,
                                end_date: { [Op.gte]: startDate },
                                start_date: { [Op.lte]: startDate },
                            },
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: startDate, [Op.lte]: endDate },
                            }
                        ]
                    }
                }
            })).map((s: models.sch_available_specialitiesI): number => s.id);

        const availableDoctorIds: number[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
            },
            {
                attributes: { exclude: ['key', 'no_of_slots', 'created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'] },
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gte]: startDate },
                                    start_date: { [Op.lte]: startDate },

                                },
                                {
                                    deleted_at: null,
                                    start_date: { [Op.gte]: startDate, [Op.lte]: endDate },
                                }
                            ]
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: specialityIds && specialityIds.length ? {
                            deleted_at: null,
                            speciality_id: specialityIds,
                        } : { deleted_at: null }
                    }
                ]
            })).map((d: models.sch_available_doctorsI): number => d.id);

        const visitSessionsIds: number[] = this.shallowCopy(await this.__visitSessionRepo.findAll({
            deleted_at: null,
            doctor_id: { [Op.notIn]: doctorIds },
            speciality_id: { [Op.in]: specialityIds },
        })).map((v: models.visit_sessionsI): number => v.appointment_id);

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                deleted_at: null,
                id: { [Op.notIn]: visitSessionsIds },
                pushed_to_front_desk: false,
                scheduled_date_time: { [Op.between]: [startDate, endDate] },
                [Op.or]: [
                    {
                        available_speciality_id: { [Op.in]: availableSpecialityIds }
                    },
                    {
                        available_doctor_id: { [Op.in]: availableDoctorIds }
                    }
                ]
            },
            {
                attributes: { exclude: ['updated_by', 'created_at', 'updated_at', 'deleted_at'] },
                include: [
                    {
                        attributes: ['id', 'case_type_id'],
                        include: {
                            attributes: ['id', 'name'],
                            model: models.kiosk_case_types,
                        },
                        model: models.kiosk_cases,
                    },
                    {
                        as: 'availableDoctor',
                        attributes: ['id', 'doctor_id', 'available_speciality_id', 'facility_location_id'],
                        include: [
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'doctor',
                                attributes: ['id'],
                                include: [
                                    {
                                        as: 'userBasicInfo',
                                        attributes: ['id', 'first_name', 'last_name', 'middle_name', 'profile_pic'],
                                        model: models.user_basic_info,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'medicalIdentifiers',
                                        include: {
                                            as: 'billingTitle',
                                            model: models.billing_titles,
                                            required: false,
                                            where: { deleted_at: null },
                                        },
                                        model: models.medical_identifiers,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            wcb_auth: 1,
                                        }
                                    }
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
                            include: {
                                as: 'specialityVisitType',
                                model: models.speciality_visit_types,
                                where:{
                                    speciality_id:  { [Op.in]: specialityIds }
                                }
                            },
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
                        attributes: ['id', 'first_name', 'last_name', 'middle_name', 'profile_avatar'],
                        model: models.kiosk_patient,
                        required: false,
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['id', 'name', 'slug'],
                        include: {
                            as: 'specialityVisitType',
                            model: models.speciality_visit_types,
                            where:{
                                speciality_id:  { [Op.in]: specialityIds }
                            }
                        },
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentStatus',
                        attributes: ['id', 'name', 'slug'],
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'priority',
                        attributes: ['id', 'name', 'slug'],
                        model: models.sch_appointment_priorities,
                        required: false,
                    },
                    {
                        as: 'appointmentVisit',
                        attributes: ['id', 'appointment_id', 'appointment_type_id', 'document_uploaded'],
                        include: {
                            as: 'visitState',
                            attributes: ['id', 'name', 'slug'],
                            model: models.visit_session_states,
                            required: false,
                        },
                        model: models.visit_sessions,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentVisitSession',
                        model: models.visit_sessions,
                        attribute: ['deleted_at'],
                        required: false,
                        paranoid: false,
                        separate: true,
                        limit: 1,
                        order: [['id', 'DESC']],
                    },
                    {
                        as: 'patientSessions',
                        attribute: ['id', 'date_of_check_in', 'time_of_check_in'],
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: { deleted_at: null }
                    }
                ]
            }));

            
        return appointments.map((o: models.sch_appointmentsI): typings.ANY => {

            let dateOfCheckIn: string = null;
            let isLastVisitDeleted: boolean = false;

            if (o?.appointmentVisitSession?.length) {
                isLastVisitDeleted = o?.appointmentVisitSession[0].deleted_at === null ? false : true;
            }
            
            if (o?.patientSessions) {
                dateOfCheckIn = o?.patientSessions?.date_of_check_in ? `${String(o?.patientSessions?.date_of_check_in)}T${String(o?.patientSessions?.time_of_check_in ?? '00:00:00')}.000Z` : null;
            }

            return {
                date_of_check_in: dateOfCheckIn,
                id: o?.id,
                start_date_time: o?.scheduled_date_time,
                comments: o?.comments,
                visit_deleted: isLastVisitDeleted,
                evaluation_date_time: o?.evaluation_date_time,
                available_speciality_id: o?.available_speciality_id,
                priority_id: o?.priority_id,
                patient_id: o?.patient_id,
                time_slot: o?.time_slots,
                case_id: o?.case_id,
                available_doctor_id: o.available_doctor_id ?? null,
                appointment_title: o?.appointment_title,
                appointment_type_id: o?.type_id,
                appointment_duration: o?.time_slots,
                picture: o?.patient.profile_avatar,
                confirmation_status: o?.confirmation_status,
                speciality_id: o?.available_doctor_id ? o?.availableDoctor?.availableSpeciality?.speciality_id : o?.availableSpeciality?.speciality_id,
                facility_location_id: o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id,
                first_name: o?.patient.first_name,
                last_name: o?.patient?.last_name,
                middle_name: o?.patient?.middle_name,
                doctor_id: o?.available_doctor_id ? o?.availableDoctor?.doctor_id ?? null : null,
                doctor_last_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.last_name ?? null : null,
                doctor_middle_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.middle_name ?? null : null,
                doctor_first_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.first_name ?? null : null,
                medical_identifiers_id: o?.available_doctor_id ? o?.availableDoctor?.doctor?.medicalIdentifiers?.id ?? null : null,
                billing_title_id: o?.available_doctor_id ? o?.availableDoctor?.doctor?.medicalIdentifiers?.billingTitle?.id ?? null : null,
                billing_title_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.medicalIdentifiers?.billingTitle?.name ?? null : null,
                visit_session_state_slug: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.slug : null,
                visit_session_state_name: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.name : null,
                assign_to_me: doctorIds.includes(o?.availableDoctor?.doctor_id) ? true : false,
                case_type: o?.case?.caseType?.name ?? null,
                case_type_id: o?.case_type_id,
                back_dated_check: o?.appointmentVisit?.document_uploaded && o?.billable !== null ? true : false,
                allow_multiple_cpt_codes: o?.appointmentType?.specialityVisitType[0]?.allow_multiple_cpt_codes
            };
        });
    }

    public getAllDoctorSpecialityAppointmentsV2 = async (data: typings.GetAllDoctorSpecialityAppointmentsBodyI, _authorization: string): Promise<typings.GetAllDoctorSpecialityAppointmentsResponseI> => {

        const {
            date_time_range: dateTimeRange,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            doctor_ids: doctorIds,
            user_id: userId = Number(process.env.USERID),
        } = data;


        const startDate: Date = new Date(new Date(dateTimeRange[0]).setUTCHours(0, 0, 0, 0));
        const endDate: Date = new Date(new Date(dateTimeRange[1]).setUTCHours(23, 59, 59, 999));

        const rawQuery = this.getAllDoctorSpecialityAppointmentsRawQuery({
            facilityLocationIds,
            specialityIds,
            doctorIds,
            endDate,
            startDate
        });

        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));
        
        return rawQueryResult?.map((x: typings.GetAllDoctorSpecialityAppointmentsI) => ({
            ...x,
            appointment_duration: x?.time_slot,
            assign_to_me: doctorIds.includes(x?.doctor_id) ? true : false,
            back_dated_check: x?.document_uploaded && x?.billable !== null ? true : false,
            date_of_check_in:  x?.date_of_check_in ? `${String(x?.date_of_check_in)}T${String(x?.time_of_check_in ?? '00:00:00')}.000Z` : null,
            visit_deleted: x?.last_visit_session_deleted === null ? false : true
        }));

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAllPatientAppointments = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            page = 1,
            per_page: perPage = 10,
            patient_id: patientId,
            is_cancelled_appointments: isCancelledAppointments,
            appointment_status_id: appointmentStatusId,
            end_date: endDateString,
            start_date: startDateString,
            practice_location_id: practiceLocationId,
            speciality_id: specialityId,
            case_id: caseId,
            visit_status_id: visitStatusId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const whereClause: { [key: string]: typings.ANY } = {
            deleted_at: null,
            patient_id: patientId,
            pushed_to_front_desk: 0,
        };

        if (isCancelledAppointments) {
            whereClause.cancelled = isCancelledAppointments;
        }

        if (startDateString && endDateString) {
            whereClause.scheduled_date_time = { [Op.between]: [startDate, endDate] };
        }

        if (caseId) {
            whereClause.case_id = caseId;
        }

        if (appointmentStatusId) {
            whereClause.status_id = appointmentStatusId;
        }

        const whereClauseForSpecialityFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityId) {
            whereClauseForSpecialityFilter.id = specialityId;
        }

        const whereClauseForFacilityLocationFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        if (practiceLocationId) {
            whereClauseForFacilityLocationFilter.facility_location_id = practiceLocationId;
        }

        const whereClauseForVisitSessionFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        if (visitStatusId) {
            whereClauseForVisitSessionFilter.id = visitStatusId;
        }

        const paginatedAppointments: typings.ANY = this.shallowCopy(await this.__repo.appointmentpaginate(
            {
                where: { ...whereClause },
            },
            Number(page),
            Number(perPage),
            null,
            {
                include: [
                    {
                        model: models.kiosk_case_types,
                        as: 'caseType',
                        attributes: ['name'],
                        required: false,
                        where: {
                            deleted_at: null
                        }
                    },
                    {
                        as: 'dateList',
                        include: [
                            {
                                as: 'availableDoctor',
                                include: [
                                    {
                                        as: 'facilityLocations',
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
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include: [
                                            {
                                                as: 'userBasicInfo',
                                                attributes: ['id', 'last_name', 'middle_name', 'profile_pic'],
                                                model: models.user_basic_info,
                                                required: false,
                                                where: { deleted_at: null },
                                            },
                                            {
                                                as: 'medicalIdentifiers',
                                                include: {
                                                    as: 'billingTitle',
                                                    model: models.billing_titles,
                                                    required: false,
                                                    where: { deleted_at: null },
                                                },
                                                model: models.medical_identifiers,
                                                required: true,
                                                where: {
                                                    deleted_at: null,
                                                    wcb_auth: 1,
                                                }
                                            }
                                        ],
                                        model: models.users,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'availableSpeciality',
                                        include: {
                                            as: 'speciality',
                                            model: models.specialities,
                                            required: specialityId ? true : false,
                                            where: { ...whereClauseForSpecialityFilter },
                                        },
                                        model: models.sch_available_specialities,
                                        required: false,
                                        where: { ...whereClauseForFacilityLocationFilter },
                                    }
                                ],
                                model: models.sch_available_doctors,
                                required: false,
                                where: { ...whereClauseForFacilityLocationFilter },
                            },
                            {
                                as: 'availableSpeciality',
                                include: [
                                    {
                                        as: 'speciality',
                                        model: models.specialities,
                                        required: specialityId ? true : false,
                                        where: { ...whereClauseForSpecialityFilter },
                                    },
                                    {
                                        as: 'facilityLocation',
                                        include: {
                                            as: 'facility',
                                            model: models.facilities,
                                            required: false
                                        },
                                        model: models.facility_locations,
                                        required: false,
                                        where: { deleted_at: null },
                                    }
                                ],
                                model: models.sch_available_specialities,
                                required: false,
                                where: { ...whereClauseForFacilityLocationFilter },
                            }

                        ],
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentStatus',
                        attributes: ['name', 'slug'],
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            attributes: ['name', 'slug'],
                            model: models.kiosk_case_patient_session_statuses,
                            required: visitStatusId ? true : false,
                            where: { ...whereClauseForVisitSessionFilter },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false
                    }
                ]
            }
        ));

        const { docs, ...otherAtt } = paginatedAppointments || {};

        const appointments: typings.ANY = !paginatedAppointments || !docs || !docs?.length ? [] : docs.map((a: models.sch_appointmentsI): typings.ANY => {

            const {
                caseType,
                dateList,
                patientSessions,
                appointmentStatus,
                scheduled_date_time: scheduledDateTime,
                available_doctor_id: availableDoctorId,
                available_speciality_id: availableSpecialityId,
                action_performed: actionPerformed,
            } = a;

            const { availableDoctor, availableSpeciality } = dateList || {};

            return {
                action_performed: actionPerformed,
                appointment_status: appointmentStatus?.name,
                appointment_status_slug: appointmentStatus?.slug,
                available_doctor: availableDoctorId ? availableDoctor : null,
                available_speciality: availableSpecialityId ? availableSpeciality : null,
                cancelled: a?.cancelled,
                cancelled_comments: a?.cancelled_comments,
                case_type_name: caseType?.name,
                id: a?.id,
                pushed_to_front_desk: a?.pushed_to_front_desk,
                pushed_to_front_desk_comments: a?.pushed_to_front_desk_comments,
                scheduled_date_time: scheduledDateTime,
                visit_status_name: patientSessions?.visitStatus?.name,
                visit_status_slug: patientSessions?.visitStatus?.slug,

            };
        });

        return {
            docs: appointments,
            ...otherAtt
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAllPatientAppointmentsV1 = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            page = 1,
            per_page: perPage = 10,
            paginate,
            patient_id: patientId,
            is_cancelled_appointments: isCancelledAppointments,
            appointment_status_id: appointmentStatusId,
            end_date: endDateString,
            start_date: startDateString,
            practice_location_id: practiceLocationId,
            speciality_id: specialityId,
            case_id: caseId,
            visit_status_id: visitStatusId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const count: typings.ANY = this.rawQueryForGetAllPatientAppointmentsCount({patientId, visitStatusId, caseId , startDateString, endDateString, specialityId, practiceLocationId, appointmentStatusId, isCancelledAppointments, page, perPage, paginate : false});

        const [countResult]: typings.ANY = this.shallowCopy(await sequelize.query(count));
        const total: number = countResult.length;
        const rawQuery: typings.ANY = this.rawQueryForGetAllPatientAppointments({patientId , visitStatusId, caseId , startDateString, endDateString, specialityId, practiceLocationId, appointmentStatusId, isCancelledAppointments, page, perPage, paginate});

        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));

        const finalAppointments: typings.ANY[] = this.filterNonNull(rawQueryResult?.map((o: typings.ANY): typings.ANY => {

            let availableSpeciality: typings.ANY = {};
            let availableSpecialityDoctor: typings.ANY = {};
            let facilityLocation: typings.ANY = {};
            let facility: typings.ANY = {};
            let doctor: typings.ANY = {};
            let speciality: typings.ANY = {};
            let appointment: typings.ANY = {};
            let doctorBasicInfo: typings.ANY = {};
            let appointmentStatus: typings.ANY = {};
            let caseTypes: typings.ANY = {};
            let patientSessions: typings.ANY = {};
            let visitStatus: typings.ANY = {};
            let medicalIdentifier: typings.ANY = {};
            let billingTitles: typings.ANY = {};

            if(o.medicalIdentifier_id) {
                medicalIdentifier = {
                    id : o.medicalIdentifier_id,
                    clinic_name : o.medicalIdentifier_clinic_name,
                }
            }
            if(o.billingTitles_id) {
                billingTitles = {
                    id : o.billingTitles_id,
                    name : o.billingTitles_name,
                    description : o.billingTitles_description,
                } 
            }
            if (o?.appointment_id) {
                appointment = {
                    id: o?.appointment_id,
                    key: o?.appointment_key,
                    scheduled_date_time: o?.appointment_scheduled_date_time,
                    evaluation_date_time: o?.appointment_evaluation_date_time,
                    time_slots: o?.appointment_time_slot,
                    appointment_title: o?.appointment_title,
                    action_performed: o?.appointment_action_performed,
                    confirmation_status: o?.appointment_confirmation_status,
                    cancelled: o?.appointment_cancelled,
                    pushed_to_front_desk: o?.appointment_pushed_to_front_dest,
                    comments: o?.appointment_comments,
                    by_health_app: o?.appointment_by_health_app,
                    date_list_id: o?.appointment_date_list_id,
                    target_facility_id: o?.appointment_target_facility_id,
                    origin_facility_id: o?.appointment_origin_facility_id,
                    case_id: o?.appointment_case_id,
                    case_type_id: o?.appointment_case_type_id,
                    patient_id: o?.appointment_patient_id,
                    type_id: o?.appointment_type_id,
                    status_id: o?.appointment_status_id,
                    priority_id: o?.appointment_priority_id,
                    available_doctor_id: o?.appointment_available_doctor_id,
                    available_speciality_id: o?.appointment_available_speciality_id,
                    billable: o?.appointment_billable,
                    pushed_to_front_desk_comments: o?.appointment_pushed_to_front_desk_comments,
                    cancelled_comments: o?.appointment_cancelled_comments,
                    is_speciality_base: o?.appointment_is_speciality_base,
                    created_by: o?.appointment_created_by,
                    updated_by: o?.appointment_updated_by,
                    created_at: o?.appointment_created_at,
                    updated_at: o?.appointment_updated_at,
                    deleted_at: o?.appointment_deleted_at,
                    is_redo: o?.appointment_is_redo,
                    is_active: o?.appointment_is_active,
                    is_soft_registered: o?.appointment_is_soft_registered,
                    physician_id: o?.appointment_physician_id,
                    technician_id: o?.appointment_technician_id,
                    reading_provider_id: o?.appointment_reading_provider_id,
                    cd_image: o?.appointment_cd_image,
                    is_transportation: o?.appointment_is_transportation,
                };
            }

            if (o?.doctorBasicInfo_id) {
                doctorBasicInfo = {
                    id: o?.doctorBasicInfo_id,
                    first_name: o?.doctorBasicInfo_first_name,
                    middle_name: o?.doctorBasicInfo_middle_name,
                    last_name: o?.doctorBasicInfo_last_name,
                    date_of_birth: o?.doctorBasicInfo_date_of_birth,
                    gender: o?.doctorBasicInfo_gender,
                    user_id: o?.doctorBasicInfo_user_id,
                    area_id: o?.doctorBasicInfo_area_id,
                    title: o?.doctorBasicInfo_title,
                    cell_no: o?.doctorBasicInfo_cell_no,
                    address: o?.doctorBasicInfo_address,
                    work_phone: o?.doctorBasicInfo_work_phone,
                    fax: o?.doctorBasicInfo_fax,
                    extension: o?.doctorBasicInfo_extension,
                    home_phone: o?.doctorBasicInfo_home_phone,
                    emergency_name: o?.doctorBasicInfo_emergency_name,
                    emergency_phone: o?.doctorBasicInfo_emergency_phone,
                    biography: o?.doctorBasicInfo_biography,
                    hiring_date: o?.doctorBasicInfo_hiring_date,
                    from: o?.doctorBasicInfo_from,
                    to: o?.doctorBasicInfo_to,
                    profile_pic: o?.doctorBasicInfo_profile_pic,
                    city: o?.doctorBasicInfo_city,
                    state: o?.doctorBasicInfo_state,
                    zip: o?.doctorBasicInfo_zip,
                    social_security: o?.doctorBasicInfo_social_security,
                    profile_pic_url: o?.doctorBasicInfo_profile_pic_url,
                    apartment_suite: o?.doctorBasicInfo_apartment_suite,
                };
            }
            if (o?.caseTypes_id) {
                caseTypes = {
                    id: o?.caseTypes_id,
                    key: o?.caseTypes_key,
                    name: o?.caseTypes_name,
                    slug: o?.caseTypes_slug,
                    description: o?.caseTypes_description,
                    comments: o?.caseTypes_comments,
                    remainder_days: o?.caseTypes_remainder_days,
                    created_by: o?.caseTypes_created_by,
                    updated_by: o?.caseTypes_udpated_by,
                    created_at: o?.caseTypes_created_at,
                    updated_at: o?.caseTypes_updated_at,
                    deleted_at: o?.caseTypes_deleted_at,
                };
            }
            if (o?.appointmentStatus_id) {
                appointmentStatus = {
                    created_at: o?.appointmentStatus_created_at,
                    created_by: o?.appointmentStatus_created_by,
                    deleted_at: o?.appointmentStatus_deleted_at,
                    id: o?.appointmentStatus_id,
                    name: o?.appointmentStatus_name,
                    slug: o?.appointmentStatus_slug,
                    updated_at: o?.appointmentStatus_updated_at,
                    updated_by: o?.appointmentStatus_updated_by,
                };
            }

            if (o?.availableSpeciality_id) {
                availableSpeciality = {
                    id: o?.availableSpeciality_id,
                    key: o?.availableSpeciality_key,
                    start_date: o?.availableSpeciality_start_date,
                    end_date: o?.availableSpeciality_end_date,
                    end_date_for_recurrence: o?.availableSpeciality_end_date_for_recurrence,
                    no_of_doctors: o?.availableSpeciality_no_of_doctors,
                    no_of_slots: o?.availableSpeciality_no_of_slots,
                    end_after_occurences: o?.availableSpeciality_end_after_occurences,
                    number_of_entries: o?.availableSpeciality_number_of_entries,
                    speciality_id: o?.availableSpeciality_speciality_id,
                    facility_location_id: o?.availableSpeciality_facility_location_id,
                    recurrence_ending_criteria_id: o?.availableSpeciality_recurrence_ending_criteria_id,
                    deleted_at: o?.availableSpeciality_deleted_at,
                };
            }

            if (o?.availableSpecialityDoctor_id) {
                availableSpecialityDoctor = {
                    id: o?.availableSpecialityDoctor_id,
                    key: o?.availableSpecialityDoctor_key,
                    start_date: o?.availableSpecialityDoctor_start_date,
                    end_date: o?.availableSpecialityDoctor_end_date,
                    no_of_slots: o?.availableSpecialityDoctor_no_of_slots,
                    doctor_id: o?.availableSpecialityDoctor_doctor_id,
                    facility_location_id: o?.availableSpecialityDoctor_facility_location_id,
                    available_speciality_id: o?.availableSpecialityDoctor_available_speciality_id,
                    supervisor_id: o?.availableSpecialityDoctor_supervisor_id,
                    is_provider_assignment: o?.availableSpecialityDoctor_is_provider_assignment
                };
            }

            if (o?.doctor_id) {
                doctor = {
                    id: o?.doctor_id,
                    email: o?.doctor_email,
                    reset_key: o?.doctor_reset_key,
                    status: o?.doctor_status,
                    is_loggedIn: o?.doctor_is_loggedIn,
                    remember_token: o?.doctor_remember_token,
                };
            }

            if (o?.facilityLocation_id) {
                facilityLocation = {
                    id: o?.facilityLocation_id,
                    facility_id: o?.facilityLocation_facility_id,
                    name: o?.facilityLocation_name,
                    city: o?.facilityLocation_city,
                    state: o?.facilityLocation_state,
                    zip: o?.facilityLocation_zip,
                    region_id: o?.facilityLocation_region_id,
                    address: o?.facilityLocation_address,
                    phone: o?.facilityLocation_phone,
                    fax: o?.facilityLocation_fax,
                    email: o?.facilityLocation_email,
                    office_hours_start: o?.facilityLocation_office_hours_start,
                    office_hours_end: o?.facilityLocation_office_hours_end,
                    lat: o?.facilityLocation_lat,
                    long: o?.facilityLocation_long,
                    day_list: o?.facilityLocation_day_list,
                    floor: o?.facilityLocation_floor,
                    place_of_service_id: o?.facilityLocation_place_of_service_id,
                    qualifier: o?.facilityLocation_qualifier,
                    ext_no: o?.facilityLocation_ext_no,
                    cell_no: o?.facilityLocation_cell_no,
                    is_main: o?.facilityLocation_is_main,
                    same_as_provider: o?.facilityLocation_same_as_provider,
                    dean: o?.facilityLocation_dean,
                    // State_id: o?.facilityLocation_state_id,
                };
            }

            if (o?.specialities_id) {
                speciality = {
                    id: o?.specialities_id,
                    name: o?.specialities_name,
                    description: o?.specialities_description,
                    time_slot: o?.specialities_time_slot,
                    over_booking: o?.specialities_over_booking,
                    has_app: o?.specialities_has_app,
                    speciality_key: o?.specialities_speciality_key,
                    comments: o?.specialities_comments,
                    default_name: o?.specialities_default_name,
                    qualifier: o?.specialities_qualifier,
                    is_defualt: o?.specialities_is_defualt,
                    is_available: o?.specialities_is_available,
                    is_create_appointment: o?.specialities_is_create_appointment,
                    is_editable: o?.specialities_is_editable,
                };
            }

            if (o?.facilities_id) {
                facility = {
                    created_at: o?.facilities_created_at,
                    created_by: o?.facilities_created_by,
                    deleted_at: o?.facilities_deleted_at,
                    id: o?.facilities_id,
                    name: o?.facilities_name,
                    slug: o?.facilities_slug,
                    qualifier: o?.facilities_qualifier,
                    updated_at: o?.facilities_updated_at,
                    updated_by: o?.facilities_updated_by,
                };
            }
            if(o?.patientSessions_id) {
                patientSessions = {
                    id: o?.patientSessions_id,
                    key: o?.patientSessions_key,
                    status_id: o?.patientSessions_status_id,
                    case_id: o?.patientSessions_case_id,
                    appointment_id: o?.patientSessions_appointment_id,
                    date_of_check_in: o?.patientSessions_date_of_check_in,
                    time_of_check_in: o?.patientSessions_time_of_check_in,
                    date_of_check_out: o?.patientSessions_date_of_check_out,
                    time_of_check_out: o?.patientSessions_time_of_check_out,
                    created_by: o?.patientSessions_created_by,
                    updated_by: o?.patientSessions_updated_by,
                    created_at: o?.patientSessions_created_at,
                    updated_at: o?.patientSessions_updated_at,
                    deleted_at: o?.patientSessions_deleted_at,
                }
            }

            if(o?.visitStatus_id) {
                visitStatus = {
                    id : o?.visitStatus_id,
                    name : o?.visitStatus_name,
                    slug : o?.visitStatus_slug
                };
            }
            return {
                ...appointment,
                appointmentStatus: o.appointmentStatus_id ? appointmentStatus : null,
                available_doctor: o.availableSpecialityDoctor_id ? {
                    ...availableSpecialityDoctor,
                    doctor: o.doctor_id ? {
                        billingTitles: o.billingTitles_id ? billingTitles : null,
                        ...doctor,
                        doctorBasicInfo: o.doctorBasicInfo_id ? doctorBasicInfo : null,
                        medicalIdentifier: o.medicalIdentifier_id ? medicalIdentifier : null,
                    } : null,
                } : null,
                available_speciality: o.availableSpeciality_id ? {
                    ...availableSpeciality,
                    facilityLocation: o.facilityLocation_id ? {
                        ...facilityLocation,
                        facility: o.facilities_id ? facility : null
                    } : null,
                    speciality: o.specialities_id ? speciality : null
                } : null,
                caseTypes: o.caseTypes_id ? caseTypes : null,
                patientSessions: o.patientSessions_id ? {
                    ...patientSessions,
                    visitStatus: o.visitStatus_id ? visitStatus : null
                } : null,
            };

        }));
        if (paginate) {
            return {
                docs: finalAppointments,
                page_number: page,
                pages: Math.ceil(total / perPage),
                total,
            };
        }
        return finalAppointments;
    }
    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointmentAgainstAvailablity = async (data: typings.GetAppointmentsAgainstAvailablityBodyI, _authorization: string): Promise<typings.GetAppointmentsAgainstAvailablityResponseI> => {

        const {
            available_doctor_ids: availableDoctorId,
            available_speciality_id: availableSpecialityId,
            date_list_ids: dateListId,
            availablity_check: availabilityCheck,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const checkMethod: string = availabilityCheck ? availabilityCheck : 'none';

        if (checkMethod === 'none') {
            return [];
        }

        return this[this.__getAppointmentForAssignments[`${checkMethod}`]]({
            availableDoctorId,
            availableSpecialityId,
            dateListId
        });

    }
    /**
     * @param data
     * @param _authorization
     *  @returns
     */
    public getAppointmentById = async (data: typings.singleAppointmentBodyI, _authorization: string, __transaction?: Transaction): Promise<typings.ANY> => {

        const {
            appointment_id: appointmentId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const transaction: Transaction = __transaction ? __transaction : null;
        const appointment: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                id: appointmentId
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
                                    {
                                        as: 'medicalIdentifiers',
                                        model: models.medical_identifiers,
                                        attributes: ['id'],
                                        required: false,
                                        include: {
                                            as: 'billingTitle',
                                            required: false,
                                            attributes: ['id', 'name'],
                                            model: models.billing_titles,
                                            where: { deleted_at: null }
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
                            include: {
                                as: 'specialityVisitType',
                                model: models.speciality_visit_types
                            },
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
                        separate: true,
                        limit: 1,
                        order: [['id', 'DESC']],
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

            const formattedSpecialityId: number = o?.availableDoctor ? o?.availableDoctor?.availableSpeciality?.speciality_id : o?.availableSpeciality?.speciality_id;
            const formattedDoctorId: number = o?.availableDoctor ? o?.availableDoctor?.doctor_id ?? null : null;
            const formattedFacilityLocationId: number = o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id;

            const formattedSocketId: string = o?.availableDoctor ? `${formattedDoctorId}_${formattedSpecialityId}_${formattedFacilityLocationId}` : null;
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
                billable: o?.billable,
                picture: o?.patient.profile_avatar,
                confirmation_status: o?.confirmation_status,
                speciality_id: formattedSpecialityId,
                facility_location_id: o?.availableDoctor ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id,
                first_name: o?.patient.first_name,
                last_name: o?.patient?.last_name,
                middle_name: o?.patient?.middle_name,
                doctor_id: formattedDoctorId,
                doctor_last_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.middle_name ?? null : null,
                doctor_middle_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.last_name ?? null : null,
                doctor_first_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.first_name ?? null : null,
                billing_title_id: o?.available_doctor_id ? o?.availableDoctor?.doctor?.medicalIdentifiers?.billingTitle?.id ?? null : null,
                billing_title_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.medicalIdentifiers?.billingTitle?.name ?? null : null,
                visit_session_state_slug: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.slug : null,
                visit_session_state_name: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.name : null,
                // It 'assign_to_me' would be false by default as were checked by empty array [] with includes
                assign_to_me: false,
                case_type: o?.case?.caseType?.name ?? null,
                case_type_id: o?.case_type_id,
                back_dated_check: o?.appointmentVisit?.document_uploaded && o?.billable !== null ? true : false,
                allow_multiple_cpt_codes: o?.availableSpeciality?.speciality?.specialityVisitType.allow_multiple_cpt_codes
            };
        });

    }

    public getAppointmentCptCodes = async (data: typings.ANY, _authorization: string, transaction?: Transaction): Promise<typings.ANY> => {

        const { appointment_id: appointmentId } = data;

        const appointmentCptCodesData: models.sch_appointment_cpt_codesI[] = this.shallowCopy(await this.__schAppointmentCptCodesRepo.findAll(
            {
                appointment_id: appointmentId
            },
            {
                include: {
                    model: models.billing_codes,
                    as: 'billingCode',
                    required: false,
                    where: { deleted_at: null },
                },
            }
        ));

        return {
            cpt_code: appointmentCptCodesData.map((c: models.sch_appointment_cpt_codesI): typings.AppointmentCptCodesI =>
            ({
                id: c.billing_code_id,
                name: c?.billingCode?.name,
                type: c?.billingCode?.type,
                code_type_id: c?.billing_code_id,
                description: c?.billingCode?.description,
                short_description: c?.billingCode?.short_description,
                medium_description: c?.billingCode?.medium_description,
                long_description: c?.billingCode?.long_description,
                comments: c?.billingCode?.comments,
                created_by: c.created_by,
                updated_by: c.updated_by,
                deleted_at: c.deleted_at,
            }))
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointmentList = async (data: typings.GetAppointmentListBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            end_date: endDate,
            patient_id: patientId,
            case_ids: caseIds,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds,
            paginate,
            page,
            per_page: perPage
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            }
        ));

        if (!user && !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }
        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(

            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles || {};

        if (userRole && slug === 'kiosk') {

            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const checkUserFacility: models.user_facilityI[] = userFacilities.filter((u: models.user_facilityI): boolean => facilityLocationIds.includes(u.facility_location_id));

            if (!checkUserFacility.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

        }

        let doctorId: number;

        if (!Object.keys(userRole).length || slug !== 'super_admin') {
            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    speciality_id: { [Op.ne]: null },
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('NO_APPOINTMENT_TO_SHOW');
            }

            doctorId = userId;
        }

        const whereClause: { [key: string]: typings.ANY } = {
            cancelled: 0,
            deleted_at: null,
            pushed_to_front_desk: 0,
            ...(patientId && { patient_id: patientId }),
            scheduled_date_time: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        };

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereClause.type_id = { [Op.in]: appointmentTypeIds };
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereClause.status_id = { [Op.in]: appointmentStatusIds };
        }

        if (caseTypeIds && caseTypeIds.length) {
            whereClause.case_type_id = { [Op.in]: caseTypeIds };
        }
        if (caseIds && caseIds.length) {
            whereClause.case_id = { [Op.in]: caseIds };

            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }
        }

        const joinClause: typings.ANY = this.formatJoinClauseForAppointmentList(facilityLocationIds, specialityIds, doctorIds, patientStatusIds, doctorId);

        let appointment: models.sch_appointmentsI[] = [];
        let noOfPages: number;
        let totalNumber: number;
        let pageNumber: number;
        let isLast: boolean;
        console.log('start', new Date());

        if (paginate) {

            const paginatedAppointments: typings.ANY = this.shallowCopy(await this.__repo.getPaginate(
                {
                    where: {
                        ...whereClause
                    },
                },
                page || 1,
                perPage || 10,
                null,
                {
                    distinct: true,
                    include: [...joinClause],
                    order: [
                        ['scheduled_date_time', 'DESC']
                    ],
                }
            ));

            ({ docs: appointment, no_of_pages: noOfPages, total: totalNumber, page_number: pageNumber, is_last: isLast } = paginatedAppointments || {});

        } else {

            appointment = this.shallowCopy(await this.__repo.findAll(
                {
                    ...whereClause
                },
                {
                    include: [
                        ...joinClause
                    ],
                    order: [
                        ['scheduled_date_time', 'DESC']
                    ]
                }
            ));
        }
        console.log('end', new Date());

        if (!appointment.length) {
            return [];
        }

        const finalAppointments: typings.GetAppointmentListResponseI[] = this.filterNonNull(appointment?.map((o: models.sch_appointmentsI): typings.ANY => {

            const {
                availableSpeciality,
                physicianClinic,
                patient
            } = o;

            const { availableSpecialityDoctor } = availableSpeciality || {};
            const { userBasicInfo } = availableSpecialityDoctor?.doctor || {};
            const { medicalIdentifiers } = availableSpecialityDoctor?.doctor || {};
            const { billingTitle } = medicalIdentifiers || {};
            const formattedPhysicianClinicResponse: typings.ANY = physicianClinic ? {
                // ...physicianClinic,
                physician: physicianClinic?.physician ? {
                    clinic_location_id: physicianClinic?.clinicLocation?.id,
                    physician_clinic_id: physicianClinic?.id,
                    ...physicianClinic?.clinic,
                    ...physicianClinic?.clinicLocation,
                    ...physicianClinic?.physician,
                } : null
            } : null;

            return {
                appointment_cpt_codes: o?.appointmentCptCodes,
                appointment_comments: o?.comments,
                appointment_confirmation_status: o?.confirmation_status,
                appointment_id: o?.id,
                appointment_status: o?.appointmentStatus?.name,
                appointment_status_id: o?.status_id,
                appointment_status_slug: o?.appointmentStatus?.slug,
                appointment_time: o?.scheduled_date_time,
                appointment_title: o?.appointment_title,
                appointment_type_id: o?.type_id,
                billable: o?.billable,
                case_id: o?.case_id,
                case_type_id: o?.case_type_id,
                case_type_name: o?.caseType?.name,
                cd_image: o?.cd_image,
                doctor_first_name: userBasicInfo?.first_name,
                doctor_id: userBasicInfo?.user_id,
                doctor_last_name: userBasicInfo?.last_name,
                doctor_middle_name: userBasicInfo?.middle_name,
                medicalIdentifiers_id : medicalIdentifiers.id,
                billingTitle_id : billingTitle.id,
                billingTitle_name : billingTitle.name,
                duration: o?.time_slots,
                facility: availableSpeciality?.facilityLocation?.facility,
                facility_location_id: availableSpeciality?.facility_location_id,
                facility_location_name: availableSpeciality?.facilityLocation.name,
                facility_location_qualifier: availableSpeciality?.facilityLocation.qualifier,
                is_transportation: o?.is_transportation,
                patient_first_name: patient?.first_name,
                patient_id: o?.patient_id,
                patient_last_name: patient?.last_name,
                patient_middl_name: patient?.middle_name,
                patient_picture: patient?.profile_avatar,
                patient_session: o?.patientSessions,
                patient_status: o?.patientSessions?.visitStatus?.name,
                patient_status_slug: o?.patientSessions?.visitStatus?.slug,
                priority_id: o?.priority_id,
                reading_provider_id: o?.reading_provider_id,
                reading_provider: o?.readingProvider,
                speciality_id: availableSpeciality?.speciality_id,
                speciality_name: availableSpeciality?.speciality.name,
                speciality_qualifier: availableSpeciality?.speciality.qualifier,
                time_slot: availableSpeciality?.speciality.time_slot,
                visit_type: o?.appointmentType?.name,
                visit_type_qualifier: o?.appointmentType?.qualifier,
                visit_type_id: o?.type_id,
                case_status: o?.case?.caseStatus?.name,
                physician_clinic: formattedPhysicianClinicResponse,
                transportations: o?.transportations
            };

        }));

        if (paginate) {
            return {
                docs: finalAppointments,
                pages: noOfPages,
                total: totalNumber,
                is_last: isLast,
                page_number: pageNumber
            };
        }

        return finalAppointments;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointmentListByCase = async (data: typings.GetAppointmentListByCaseBodyI, _authorization: string): Promise<typings.GetAppointmentListSpecialityObjI[]> => {

        const {
            case_id: caseId,
            facility_location_id: facilityLocationId,
            scheduled_date_time: scheduledDateTime,
            status_id: appointmentStatusId,
            speciality_id: specialityId,
        } = data;

        const whereClause: { [key: string]: typings.ANY } = {};

        if (caseId) {
            whereClause.case_id = caseId;
        }

        if (appointmentStatusId) {
            whereClause.status_id = appointmentStatusId;
        }

        if (scheduledDateTime) {
            whereClause.scheduled_date_time = scheduledDateTime;
        }

        const facilityLocationFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (facilityLocationId) {
            facilityLocationFilters.id = facilityLocationId;
        }

        const specialityFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityId) {
            specialityFilters.id = specialityId;
        }

        return this.__repo.findAll(
            {
                ...whereClause,
                deleted_at: null
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        include: [
                            {
                                as: 'facilityLocation',
                                model: models.facility_locations,
                                required: facilityLocationId ? true : false,
                                where: { ...facilityLocationFilters },
                            },
                            {
                                as: 'speciality',
                                model: models.specialities,
                                required: specialityId ? true : false,
                                where: { ...specialityFilters },
                            }
                        ],
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'availableSpeciality',
                                include: {
                                    as: 'speciality',
                                    model: models.specialities,
                                    required: specialityId ? true : false,
                                    where: { ...specialityFilters },
                                },
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'facilityLocations',
                                model: models.facility_locations,
                                required: facilityLocationId ? true : false,
                                where: { ...facilityLocationFilters },
                            },
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                model: models.users,
                                required: true,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_doctors,
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
     * @param _authorization
     */
    public getAppointmentListForHealthApp = async (data: typings.GetAppointmentListForHealthAppBodyI, _authorization: string): Promise<models.sch_appointmentsI[]> => {

        const {
            patient_id: patientId,
            case_id: caseId,
            paginate,
            date,
            page,
            per_page: perPage,
            check,
        } = data;

        const whereClause: typings.ANY = { patient_id: patientId, by_health_app: true };

        if (date && check === 'daily') {
            const startOfDay: typings.ANY = moment(date).startOf('day');
            const endOfDay: typings.ANY = moment(date).endOf('day');
            whereClause.scheduled_date_time = {
                [Op.between]: [startOfDay.format(), endOfDay.format()]
            };
        }

        if (date && check === 'weekly') {
            const startOfWeek: typings.ANY = moment(date).startOf('week');
            const endOfWeek: typings.ANY = moment(date).endOf('week');
            whereClause.scheduled_date_time = {
                [Op.between]: [startOfWeek.format(), endOfWeek.format()]
            };
        }

        if (check === 'previous') {
            const previousDate: string = moment().subtract(1, 'days').endOf('day').format();
            whereClause.scheduled_date_time = {
                [Op.lt]: previousDate
            };
        }

        if (check === 'upcomming') {
            const upcommingDate: string = moment().add(1, 'days').startOf('day').format();
            whereClause.scheduled_date_time = {
                [Op.gt]: upcommingDate
            };
        }

        if (caseId) {
            whereClause.case_id = caseId;
        }

        if (paginate === 'true') {

            return this.__repo.paginate(
                {
                    where: { ...whereClause },
                },
                Number(page),
                Number(perPage),
                null,
            );

        }

        return this.__repo.findAll(
            {
                ...whereClause
            }
        );

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointmentListV1 = async (data: typings.GetAppointmentListBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            end_date: endDate,
            patient_id: patientId,
            patient_name: patientName,
            case_ids: caseIds,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds,
            paginate,
            page,
            per_page: perPage
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            }
        ));

        if (!user || !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(

            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles || {};

        if (userRole && slug === 'kiosk') {

            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    user_id: userId
                }
            ));

            if (!userFacilities || !userFacilities.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const checkUserFacility: models.user_facilityI[] = userFacilities.filter((u: models.user_facilityI): boolean => facilityLocationIds.includes(u.facility_location_id));

            if (!checkUserFacility.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

        }

        let doctorId: number;

        if (!Object.keys(userRole).length || slug !== 'super_admin') {
            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    speciality_id: { [Op.ne]: null },
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('NO_APPOINTMENT_TO_SHOW');
            }

            doctorId = userId;
        }

        if (caseIds && caseIds.length) {

            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }
        }

        const count: typings.ANY = this.generateAppointmentListCountV1({patientStatusIds, facilityLocationIds, specialityIds, doctorIds, patientId,patientName, appointmentTypeIds, appointmentStatusIds, caseTypeIds, caseIds, startDate, endDate , page, perPage});

        const [countData]: typings.ANY = this.shallowCopy(await sequelize.query(count));

        const [countResult] = countData;

        const rawQuery: typings.ANY = this.generateAppointmentListRawQuery({ patientStatusIds, facilityLocationIds, specialityIds, doctorIds, patientId, patientName, appointmentTypeIds, appointmentStatusIds, caseTypeIds, caseIds, startDate, endDate, paginate, page, perPage });
        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));

        const appointmentIds: number[] = rawQueryResult.map((x: typings.ANY): number => x.appointment_id);

        const appointmentWithOtherRequiredData: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                id: appointmentIds,
            },
            {
                include: [
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    }
                ]
            }
        ));

        const result = this.appointmentListResultMapping(rawQueryResult, appointmentWithOtherRequiredData);

        if (paginate) {

            return {
                docs: result,
                page_number: page,
                pages: Math.ceil(countResult.total_count / perPage),
                total: countResult.total_count,
            };
        }

        return result;

    }

    public getAppointmentListV2 = async (data: typings.GetAppointmentListBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            end_date: endDate,
            patient_id: patientId,
            patient_name: patientName,
            case_ids: caseIds,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds,
            paginate,
            page,
            per_page: perPage
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            }
        ));

        if (!user || !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(

            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles || {};

        if (userRole && slug === 'kiosk') {

            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    user_id: userId
                }
            ));

            if (!userFacilities || !userFacilities.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const checkUserFacility: models.user_facilityI[] = userFacilities.filter((u: models.user_facilityI): boolean => facilityLocationIds.includes(u.facility_location_id));

            if (!checkUserFacility.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

        }

        let doctorId: number;

        if (!Object.keys(userRole).length || slug !== 'super_admin') {
            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    speciality_id: { [Op.ne]: null },
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('NO_APPOINTMENT_TO_SHOW');
            }

            doctorId = userId;
        }

        if (caseIds && caseIds.length) {
            await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);
        }

        const count: typings.ANY = this.generateAppointmentListCountV1({patientStatusIds, facilityLocationIds, specialityIds, doctorIds, patientId,patientName, appointmentTypeIds, appointmentStatusIds, caseTypeIds, caseIds, startDate, endDate , page, perPage});
        const [countData]: typings.ANY = this.shallowCopy(await sequelize.query(count));

        const [countResult] = countData;

        const rawQuery: typings.ANY = this.generateAppointmentListRawQueryV1({ patientStatusIds, facilityLocationIds, specialityIds, doctorIds, patientId, patientName, appointmentTypeIds, appointmentStatusIds, caseTypeIds, caseIds, startDate, endDate, paginate, page, perPage });

        const [rawQueryResult]: typings.ANY = this.shallowCopy(await sequelize.query(rawQuery));

        if (paginate) {

            return {
                docs: rawQueryResult,
                page_number: page,
                pages: Math.ceil(countResult.total_count / perPage),
                total: countResult.total_count,
            };
        }

        return rawQueryResult;

    }

    public getAppointmentModelDataById = async (data: typings.GetSingleAppointmentBodyI, _authorization: string, ): Promise<typings.ANY> => {

        const {
            id: appointmentId,
            appointment_type
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        const appointmentListingType: string = appointment_type ? appointment_type?.toUpperCase() : 'SCHEDULED';

        const validatedAppointmentType: string[] = ['CANCELLED', 'SCHEDULED', 'RESCHEDULED']; // 'DOCTOR', 'SPECIALITY', 'PATIENT',
        
        if (!validatedAppointmentType.includes(appointmentListingType)) {
            throw new Error('Invalid listing type provided!');
        }

        const joinClause = [];

        if (appointmentListingType === 'SCHEDULED') {
            joinClause.push(
                {
                    as: 'patientSessions',
                    attributes: ['id'],
                    include: {
                        as: 'visitStatus',
                        attributes: ['id', 'name', 'slug'],
                        model: models.kiosk_case_patient_session_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.users,
                    as: 'readingProvider',
                    required: false,
                    attributes: ['id', 'email'],
                    include: {
                        attributes: ['first_name', 'middle_name', 'last_name'],
                        model: models.user_basic_info,
                        required: false,
                    },
                    deleted_at: null
                },
                {
                    model: models.sch_transportations,
                    attributes: ['city', 'comments', 'is_pickup', 'is_dropoff', 'phone', 'state', 'street_address', 'suit', 'zip', 'type'],
                    as: 'transportations',
                    required: false,
                    where: { deleted_at: null }
                },
                {
                    model: models.sch_appointment_cpt_codes,
                    as: 'appointmentCptCodes',
                    attributes: ['id'],
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_codes,
                        as: 'billingCode',
                        attributes: ['id', 'name', 'description'],
                        required: false,
                        where: { deleted_at: null },
                    },
                },
                {
                    model: models.physician_clinics,
                    as: 'physicianClinic',
                    attributes: ['clinic_locations_id', 'id', 'physician_id', 'clinic_id'],
                    required: false,
                    where: { deleted_at: null },
                    include: [
                        {
                            model: models.physicians,
                            as: 'physician',
                            attributes: ['first_name', 'last_name', 'middle_name'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        {
                            model: models.clinics,
                            as: 'clinic',
                            attributes: ['name'],
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        },
                        {
                            model: models.clinic_locations,
                            as: 'clinicLocation',
                            attributes: ['city', 'floor', 'street_address', 'zip', 'state'],
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                },
                {
                    as: 'appointmentType',
                    attributes: ['id', 'name', 'slug', 'qualifier'],
                    include: {
                        as: 'specialityVisitType',
                        model: models.speciality_visit_types,
                        where: { deleted_at: null }
                    },
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentStatus',
                    attributes: ['id', 'name', 'slug'],
                    model: models.sch_appointment_statuses,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'priority',
                    attributes: ['id', 'name', 'slug'],
                    model: models.sch_appointment_priorities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            )
        } else if (appointmentListingType === 'CANCELLED') {

            joinClause.push(
                {
                    as: 'updatedBy',
                    attributes: ['id'],
                    include:
                    {
                        attributes: ['first_name', 'middle_name', 'last_name'],
                        as: 'userBasicInfo',
                        model: models.user_basic_info,
                        required: false,
                        where: { deleted_at: null },
                    },
                    model: models.users,
                    required: false,
                    where: { deleted_at: null },
                },

            )

        } else if (appointmentListingType === 'RESCHEDULED') {

            joinClause.push(
                {
                    as: 'updatedBy',
                    attributes: ['id'],
                    include:
                    {
                        attributes: ['first_name', 'middle_name', 'last_name'],
                        as: 'userBasicInfo',
                        model: models.user_basic_info,
                        required: false,
                        where: { deleted_at: null },
                    },
                    model: models.users,
                    required: false,
                    where: { deleted_at: null },
                },

            )
        }

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(
            appointmentId,
            {
                //attributes: ['patient_id', 'is_redo', 'updated_at', 'case_id', 'cancelled_comments', 'is_transportation', 'scheduled_date_time', 'comments', 'id', 'time_slots', 'billable', 'cd_image', 'confirmation_status'],
                include: [
                    // {
                    //     model: models.kiosk_case_types,
                    //     attributes: ['id', 'name', 'name'],
                    //     as: 'caseType',
                    //     required: false,
                    //     where: {
                    //         deleted_at: null
                    //     }
                    // },
                    {
                        as: 'case',
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: [
                            {
                                model: models.billing_case_status,
                                as: 'caseStatus',
                                attributes: ['id', 'name'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.kiosk_case_types,
                                as: 'caseType',
                                attributes: ['id', 'name'],
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ],
                    },
                    {
                        as: 'availableDoctor',
                        include: {
                            as: 'doctor',
                            attributes: ['id'],
                            include: [
                                {
                                    as: 'userBasicInfo',
                                    model: models.user_basic_info,
                                    required: false,
                                    attributes: ['first_name', 'middle_name', 'last_name'],
                                    where: { deleted_at: null },
                                },
                                {
                                    as:'medicalIdentifiers',
                                    model: models.medical_identifiers,
                                    attributes: ['id'],
                                    required: false,
                                    include: {
                                        as: 'billingTitle',
                                        required: false,
                                        attributes: ['id', 'name'],
                                        model: models.billing_titles,
                                        where: { deleted_at: null }
                                    },
                                    where: {
                                        deleted_at: null,
                                    },
                                }
                            ],
                            model: models.users,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableSpeciality',
                        include: [
                            {
                                as: 'speciality',
                                model: models.specialities,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'facilityLocation',
                                attributes: ['id', 'name', 'qualifier'],
                                include: {
                                    as: 'facility',
                                    attributes: ['id', 'name', 'qualifier', 'slug'],
                                    model: models.facilities,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.facility_locations,
                                required: false,
                            }
                        ],
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        attributes: ['first_name', 'middle_name', 'last_name']
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.visit_sessions,
                        as: 'appointmentVisit',
                        required: false,
                        include: {
                            model: models.visit_session_states
                        },
                        where: {deleted_at: null}
                    },
                    ...joinClause
                ]
            }
        ));
        const formattedPatient: models.sch_appointmentsI[] = this.formattedPatient([appointment], config);
        const {
            case: caseI,
            availableDoctor,
            availableSpeciality,
            patientSessions,
            readingProvider,
            appointmentCptCodes,
            physicianClinic,
            appointmentStatus,
            appointmentType,
            updatedBy,
            ...otherAtt
        } = appointment || {};
    
        const doctorInfo: typings.ANY = availableDoctor && availableDoctor?.doctor?.userBasicInfo ? {
            doctor_id: availableDoctor?.doctor?.id,
            ...availableDoctor?.doctor?.userBasicInfo,
            billingTitle : availableDoctor?.doctor?.medicalIdentifiers?.billingTitle?.name
         } : null;

        return {
            speciality: availableSpeciality?.speciality ? availableSpeciality?.speciality : null,
            facility_location: availableSpeciality?.facilityLocation ? availableSpeciality?.facilityLocation : null,
            visit_status: patientSessions?.visitStatus ? patientSessions?.visitStatus : null,
            patient_session: patientSessions ?? null,
            reading_provider: readingProvider?.userBasicInfo ? {
                id: readingProvider?.id, 
                ...readingProvider?.userBasicInfo
            } : null,
            appointment_cpt_codes: appointmentCptCodes?.length ? appointmentCptCodes.map((x: models.sch_appointment_cpt_codesI): models.billing_codesI => x.billingCode) : null,
            physician_clinic: physicianClinic ? {
                id: physicianClinic?.id,
                clinic_id: physicianClinic?.clinic_id,
                clinic_locations_id: physicianClinic?.clinic_locations_id,
                physician_id: physicianClinic?.physician_id,
                ...physicianClinic?.clinic,
                ...physicianClinic?.clinicLocation,
                ...physicianClinic?.physician,
            } : null,
            doctor_info: doctorInfo,
            case_type: caseI?.caseType ?? null,            
            appointment_type: appointmentType ?? null,
            appointment_status: appointmentStatus ?? null,
            updated_by: updatedBy && updatedBy?.userBasicInfo ? {
                ...updatedBy?.userBasicInfo
            } : null,
            ...otherAtt,
            formated_data: formattedPatient
        };

    }

    public getAppointmentInfoForSpeciality = async (data: typings.ANY, _authorization: string, ): Promise<typings.ANY> => {

        const {
            id: appointmentId,
            speciality_id,
        } = data;


        // HAMAD
        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(
            appointmentId,
            {
                attributes: ['id', 'case_id', 'patient_id', 'case_type_id', 'billable'],
                include: [
                    {
                        model: models.sch_appointment_cpt_codes,
                        attributes: ['billing_code_id'],
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            attributes: ['name', 'code_type_id', 'type','description','short_description','medium_description','long_description','comments'],
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        model: models.kiosk_case_types,
                        as: 'caseType',
                        attributes: ['slug', 'name'],
                        required: false,
                        where: {
                            deleted_at: null
                        }
                    },
                    {
                        as: 'case',
                        attributes: ['category_id', 'case_type_id', 'creation_source', 'date_of_admission' ],
                        include: [
                            { 
                                model: models.kiosk_case_categories,
                                attributes: ['slug', 'name'],
                                as: 'category',
                                required: false
                            },
                            {
                                as: 'caseAccidentInformation',
                                attributes: ['id', 'accident_date'],
                                model: models.kiosk_case_accident_informations,
                                required: false
                            },
                            {
                                model: models.kiosk_case_insurances,
                                as: 'caseInsurances',
                                where: { deleted_at: null },
                                required: false,
                                include: { 
                                    model: models.billing_insurances,
                                    attributes: ['insurance_name', 'insurance_code', 'is_verified'],
                                    as: 'insurance',
                                    required: false,
                                    where: { deleted_at: null },
                                },
                            },
                            {
                                as: 'casePurposeOfVisit',
                                attributes: ['slug', 'name'],
                                required: false,
                                model: models.kiosk_case_purpose_of_visit
                            },
                            {
                                model: models.kiosk_case_employers, 
                                attributes: ['occupation'],
                                as: 'caseEmployers',
                                where: { deleted_at: null },
                                required: false,
                                include: [
                                    {
                                        model: models.kiosk_case_employer_types, 
                                        as: 'caseEmployerType',
                                        attributes: ['id'],
                                        where: { slug: 'primary' }
                                    },
                                ]
                            }
                        ],   
                        model: models.kiosk_cases,
                        required: false
                    },
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        attributes: ['first_name', 'middle_name', 'last_name', 'dob','age','gender','ssn','height_in','height_ft','weight_lbs','weight_kg','meritial_status']
                    },
                    {
                        as: 'patientSessions',
                        attributes: ['date_of_check_in', 'time_of_check_in'],
                        model: models.kiosk_case_patient_session,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            }
        ));

        const {
            patient,
            case: appointmentCase,
            caseType,
            patientSessions,
            appointmentCptCodes,
        } = appointment;


        const chartId = 1000000000 + appointment.patient_id;

        let chartIdString = chartId.toString();
        chartIdString = chartIdString.substring(1, 10);
        chartIdString = `${chartIdString.substring(0, 3)}-${chartIdString.substring(3, 5)}-${chartIdString.substring(5, 9)}`;
        
        const rawQueryForVisitSession = ` SELECT visit_sessions.visit_date
        FROM visit_sessions
        WHERE visit_sessions.deleted_at IS NULL and 
        visit_sessions.speciality_id = ${speciality_id} and 
        visit_sessions.case_id = ${appointment.case_id} and 
        visit_sessions.appointment_type_id = 1 
        limit 1;`

        const [rawQueryForVisitResult]: any = this.shallowCopy(await sequelize.query(rawQueryForVisitSession));

        return {
            id: appointment.case_id,
            category_id: appointmentCase.category_id,
            case_type_id: appointment.case_type_id,
            creation_source: appointmentCase.creation_source,
            creation_source_string: this.__getKioskCreationSource[`${appointmentCase.creation_source}`],
            date_of_admission: appointmentCase?.date_of_admission ? moment(appointmentCase?.date_of_admission).format('MM-DD-YYYY') : null,
            occupation: appointmentCase?.caseEmployers?.length ? appointmentCase.caseEmployers[0].occupation : null,
            category: appointmentCase?.category,
            patient_id: appointment?.patient_id,
            first_name: patient?.first_name,
            middle_name: patient?.middle_name,
            last_name: patient?.last_name,
            dob: patient?.dob ? moment(patient?.dob).format('MM-DD-YYYY') : null,
            age: patient?.age,
            gender: patient?.gender,
            ssn: patient?.ssn,
            height_in: patient?.height_in,
            height_ft: patient?.height_ft,
            weight_lbs: patient?.weight_lbs,
            weight_kg: patient?.weight_kg,
            meritial_status: patient?.meritial_status,
            case_type: caseType?.name,
            case_type_slug: caseType?.slug,
            chart_id: chartIdString,
            caseInsurances: appointmentCase?.caseInsurances ? appointmentCase.caseInsurances : null,
            initial_evalutation_date: rawQueryForVisitResult && rawQueryForVisitResult.length ? rawQueryForVisitResult[0].visit_date : null,
            accident_date: appointmentCase?.caseAccidentInformation?.accident_date ? moment(appointmentCase?.caseAccidentInformation?.accident_date).format('MM-DD-YYYY') : null,
            purpose_of_visit: appointmentCase?.casePurposeOfVisit,
            check_in_date: patientSessions?.date_of_check_in ? moment(patientSessions?.date_of_check_in).format('MM-DD-YYYY') : null,
            check_in_time: patientSessions?.time_of_check_in,
            cpt_codes: appointmentCptCodes?.map((c: models.sch_appointment_cpt_codesI): typings.AppointmentCptCodesI =>
            ({
                id: c.billing_code_id,
                name: c?.billingCode?.name,
                type: c?.billingCode?.type,
                code_type_id: c?.billingCode?.code_type_id,
                description: c?.billingCode?.description,
                short_description: c?.billingCode?.short_description,
                medium_description: c?.billingCode?.medium_description,
                long_description: c?.billingCode?.long_description,
                comments: c?.billingCode?.comments,
            }))
        };
    }

    /**
     *
     * @param params
     * @param _authorization
     */
    public getCancelledAppointments = async (query: typings.GetCancelledAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            page,
            per_page,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            provider_ids: providerIds,
            start_date_time: dateFrom,
            end_date_time: dateTo,
            case_ids: caseIds,
            comments: comments
        } = query;

        const filters: typings.GetCancelledAppointmentFilterI = {};

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (dateFrom && !dateTo) {
            Object.assign(filters, { updated_at: { [Op.gte]: new Date(dateFrom) } });
        }

        if (!dateFrom && dateTo) {
            Object.assign(filters, { updated_at: { [Op.lte]: new Date(dateTo) } });
        }

        if (dateFrom && dateTo) {
            Object.assign(filters, { updated_at: { [Op.between]: [new Date(dateFrom), new Date(dateTo)] } });
        }

        if (caseIds && caseIds.length) {

            Object.assign(filters, { case_id: { [Op.in]: caseIds } });

            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }
        }

        if (comments && comments.length) {
            Object.assign(filters, { cancelled_comments: { [Op.like]: '%' + comments + '%' } });

        }

        const providerFilters: { [key: string]: typings.ANY } = { deleted_at: null };
        const facilityLocationFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (facilityLocationIds && facilityLocationIds.length) {
            facilityLocationFilters.id = { [Op.in]: facilityLocationIds };
        }

        if (providerIds && providerIds.length) {
            providerFilters.id = { [Op.in]: providerIds };
        }

        const specialityFilters: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityIds && specialityIds.length) {
            specialityFilters.id = { [Op.in]: specialityIds };
        }

        const perPage: number = per_page ? per_page : 10;
        const pagenumber: number = page ? page : 1;

        const allToBeScheduledAppointments: typings.ANY = this.shallowCopy(await this.__repo.customAppointmentpaginate(
            {
                where: {
                    cancelled: true,
                    deleted_at: null,
                    ...filters
                }
            },
            pagenumber,
            perPage,
            null,
            {
                include: [
                    {
                        as: 'dateList',
                        include: [
                            {
                                as: 'availableDoctor',
                                include: [
                                    {
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include: [
                                            {
                                                as: 'userBasicInfo',
                                                attributes: ['id', 'first_name', 'last_name', 'middle_name', 'user_id'],
                                                model: models.user_basic_info,
                                                required: false,
                                                where: { deleted_at: null },
                                            },
                                            {
                                                as: 'medicalIdentifiers',
                                                attributes: ['id'],
                                                include: {
                                                    as: 'billingTitle',
                                                    attributes: ['id', 'name'],
                                                    model: models.billing_titles,
                                                    required: false,
                                                    where: { deleted_at: null }
                                                },
                                                model: models.medical_identifiers,
                                                required: false,
                                                where: {
                                                    deleted_at: null,
                                                },
                                            }
                                        ],
                                        model: models.users,
                                        required: true,
                                        where: { ...providerFilters },
                                    },
                                    {
                                        as: 'facilityLocations',
                                        include: {
                                            as: 'facility',
                                            model: models.facilities,
                                            required: false,
                                            where: { deleted_at: null },
                                        },
                                        model: models.facility_locations,
                                        required: facilityLocationIds && facilityLocationIds.length ? true : false,
                                        where: { ...facilityLocationFilters },
                                    },
                                    {
                                        as: 'availableSpeciality',
                                        include: {
                                            as: 'speciality',
                                            model: models.specialities,
                                            required: false,
                                            where: { ...specialityFilters },
                                        },
                                        model: models.sch_available_specialities,
                                        required: false,
                                        where: { deleted_at: null },
                                    }
                                ],
                                model: models.sch_available_doctors,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            {
                                as: 'availableSpeciality',
                                include: [
                                    {
                                        as: 'speciality',
                                        model: models.specialities,
                                        required: false,
                                        where: { ...specialityFilters },
                                    },
                                    {
                                        as: 'facilityLocation',
                                        include: {
                                            as: 'facility',
                                            model: models.facilities,
                                            required: false
                                        },
                                        model: models.facility_locations,
                                        required: facilityLocationIds && facilityLocationIds.length ? true : false,
                                        where: { ...facilityLocationFilters },
                                    },
                                ],
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: (specialityIds && specialityIds.length) ? true : false,
                        where: { deleted_at: null },
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
                        as: 'updatedBy',
                        include:
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.users,
                        required: (specialityIds && specialityIds.length) ? true : false,
                        where: { deleted_at: null },
                    },
                ],
                order: [
                    ['updated_at', 'DESC']
                ]
            }
        ));

        const { docs, no_of_pages, total, page_number, is_last } = allToBeScheduledAppointments || {};

        return {
            docs,
            page_number,
            is_last,
            pages: no_of_pages,
            total,
        };
    }

    public getCancelledAppointmentsV1 = async (query: typings.GetCancelledAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            page,
            per_page: perPage,
            paginate,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            provider_ids: providerIds,
            start_date_time: dateFrom,
            end_date_time: dateTo,
            case_ids: caseIds,
            comments: comments
        } = query;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (caseIds && caseIds.length) {
            const { status: caseStatus } = await this.__http.put(`${process.env.KIOSK_URL}case/search-count`, { ids: caseIds }, config);

            if (caseStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }
        }

        const count: typings.ANY = this.rawQueryForCancelledAppointmentCount({facilityLocationIds, specialityIds, providerIds, dateFrom, dateTo, comments, page, perPage, caseIds, paginate: false});

        const [countResult]: typings.ANY = this.shallowCopy(await sequelize.query(count));

        const total: number = countResult.length;
        const rawQuery = this.rawQueryForCancelledAppointment({facilityLocationIds, specialityIds, providerIds, dateFrom, dateTo, comments, page, perPage, caseIds, paginate});

        const [rawQueryResult]: typings.ANY = await sequelize.query(rawQuery);

        const finalAppointments: typings.ANY[] = this.filterNonNull(rawQueryResult?.map((o: typings.ANY): typings.ANY => {

            let availableSpeciality = {};
            let availableSpecialityDoctor = {};
            let doctorBasicInfo = {};
            let appointment = {};
            let patient = {};
            let appointmentStatus = {};
            let updatedBy = {};
            let userBasicInfo = {};
            let doctor = {};
            let facilityLocation = {};
            let speciality = {};
            let facility = {};
            let medicalIdentifier = {};
            let billingTitles = {};

            if(o.medicalIdentifier_id) {
                medicalIdentifier = {
                    id : o.medicalIdentifier_id,
                    clinic_name : o.medicalIdentifier_clinic_name,
                }
            }
            if(o.billingTitles_id) {
                billingTitles = {
                    id : o.billingTitles_id,
                    name : o.billingTitles_name,
                    description : o.billingTitles_description,
                } 
            }
            if (o?.doctorBasicInfo_id) {
                doctorBasicInfo = {
                    id: o?.doctorBasicInfo_id,
                    first_name: o?.doctorBasicInfo_first_name,
                    middle_name: o?.doctorBasicInfo_middle_name,
                    last_name: o?.doctorBasicInfo_last_name,
                    date_of_birth: o?.doctorBasicInfo_date_of_birth,
                    gender: o?.doctorBasicInfo_gender,
                    user_id: o?.doctorBasicInfo_user_id,
                    area_id: o?.doctorBasicInfo_area_id,
                    title: o?.doctorBasicInfo_title,
                    cell_no: o?.doctorBasicInfo_cell_no,
                    address: o?.doctorBasicInfo_address,
                    work_phone: o?.doctorBasicInfo_work_phone,
                    fax: o?.doctorBasicInfo_fax,
                    extension: o?.doctorBasicInfo_extension,
                    home_phone: o?.doctorBasicInfo_home_phone,
                    emergency_name: o?.doctorBasicInfo_emergency_name,
                    emergency_phone: o?.doctorBasicInfo_emergency_phone,
                    biography: o?.doctorBasicInfo_biography,
                    hiring_date: o?.doctorBasicInfo_hiring_date,
                    from: o?.doctorBasicInfo_from,
                    to: o?.doctorBasicInfo_to,
                    profile_pic: o?.doctorBasicInfo_profile_pic,
                    city: o?.doctorBasicInfo_city,
                    state: o?.doctorBasicInfo_state,
                    zip: o?.doctorBasicInfo_zip,
                    social_security: o?.doctorBasicInfo_social_security,
                    profile_pic_url: o?.doctorBasicInfo_profile_pic_url,
                    apartment_suite: o?.doctorBasicInfo_apartment_suite,
                };
            }

            if (o?.appointment_id) {
                appointment = {
                    id: o?.appointment_id,
                    key: o?.appointment_key,
                    scheduled_date_time: o?.appointment_scheduled_date_time,
                    evaluation_date_time: o?.appointment_evaluation_date_time,
                    time_slots: o?.appointment_time_slot,
                    appointment_title: o?.appointment_title,
                    action_performed: o?.appointment_action_performed,
                    confirmation_status: o?.appointment_confirmation_status,
                    cancelled: o?.appointment_cancelled,
                    pushed_to_front_desk: o?.appointment_pushed_to_front_dest,
                    comments: o?.appointment_comments,
                    by_health_app: o?.appointment_by_health_app,
                    date_list_id: o?.appointment_date_list_id,
                    target_facility_id: o?.appointment_target_facility_id,
                    origin_facility_id: o?.appointment_origin_facility_id,
                    case_id: o?.appointment_case_id,
                    case_type_id: o?.appointment_case_type_id,
                    patient_id: o?.appointment_patient_id,
                    type_id: o?.appointment_type_id,
                    status_id: o?.appointment_status_id,
                    priority_id: o?.appointment_priority_id,
                    available_doctor_id: o?.appointment_available_doctor_id,
                    available_speciality_id: o?.appointment_available_speciality_id,
                    billable: o?.appointment_billable,
                    pushed_to_front_desk_comments: o?.appointment_pushed_to_front_desk_comments,
                    cancelled_comments: o?.appointment_cancelled_comments,
                    is_speciality_base: o?.appointment_is_speciality_base,
                    created_by: o?.appointment_created_by,
                    updated_by: o?.appointment_updated_by,
                    created_at: o?.appointment_created_at,
                    updated_at: o?.appointment_updated_at,
                    deleted_at: o?.appointment_deleted_at,
                    is_redo: o?.appointment_is_redo,
                    is_active: o?.appointment_is_active,
                    is_soft_registered: o?.appointment_is_soft_registered,
                    physician_id: o?.appointment_physician_id,
                    technician_id: o?.appointment_technician_id,
                    reading_provider_id: o?.appointment_reading_provider_id,
                    cd_image: o?.appointment_cd_image,
                    is_transportation: o?.appointment_is_transportation,
                };
            }

            if (o?.patient_id) {
                patient = {
                    age: o?.patient_age,
                    cell_phone: o?.patient_cell_phone,
                    created_at: o?.patient_created_at,
                    created_by: o?.patient_created_by,
                    deleted_at: o?.patient_deleted_at,
                    dob: o?.patient_dob,
                    first_name: o?.patient_first_name,
                    gender: o?.patient_gender,
                    height_ft: o?.patient_height_ft,
                    height_in: o?.patient_height_in,
                    home_phone: o?.patient_home_phone,
                    id: o?.patient_id,
                    is_law_enforcement_agent: o?.patient_is_law_enforcement_agent,
                    is_pregnant: o?.patient_is_pregnant,
                    key: o?.patient_key,
                    language: o?.patient_language,
                    last_name: o?.patient_last_name,
                    meritial_status: o?.patient_meritial_status,
                    middle_name: o?.patient_middle_name,
                    need_translator: o?.patient_need_translator,
                    notes: o?.patient_notes,
                    profile_avatar: o?.patient_profile_avatar,
                    ssn: o?.patient_ssn,
                    status: o?.patient_status,
                    updated_at: o?.patient_updated_at,
                    updated_by: o?.patient_updated_by,
                    weight_kg: o?.patient_weight_kg,
                    weight_lbs: o?.patient_weight_lbs,
                    work_phone: o?.patient_work_phone,

                };
            }

            if (o?.appointmentStatus_id) {
                appointmentStatus = {
                    created_at: o?.appointmentStatus_created_at,
                    created_by: o?.appointmentStatus_created_by,
                    deleted_at: o?.appointmentStatus_deleted_at,
                    id: o?.appointmentStatus_id,
                    name: o?.appointmentStatus_name,
                    slug: o?.appointmentStatus_slug,
                    updated_at: o?.appointmentStatus_updated_at,
                    updated_by: o?.appointmentStatus_updated_by,
                };
            }

            if (o?.updatedBy_id) {
                updatedBy = {
                    created_at: o?.updatedBy_created_at,
                    created_by: o?.updatedBy_created_by,
                    deleted_at: o?.updatedBy_deleted_at,
                    email: o?.updatedBy_email,
                    id: o?.updatedBy_id,
                    is_loggedin: o?.updatedBy_is_loggedIn,
                    password: o?.updatedBy_password,
                    remember_token: o?.updatedBy_remember_token,
                    reset_key: o?.updatedBy_reset_key,
                    status: o?.updatedBy_status,
                    updated_at: o?.updatedBy_updated_at,
                    updated_by: o?.updatedBy_updated_by,
                };
            }

            if (o?.updatedByUserBasicInfo_id) {
                userBasicInfo = {
                    address: o?.updatedByUserBasicInfo_address,
                    apartment_suite: o?.updatedByUserBasicInfo_apartment_suite,
                    area_id: o?.updatedByUserBasicInfo_area_id,
                    biography: o?.updatedByUserBasicInfo_biography,
                    cell_no: o?.updatedByUserBasicInfo_cell_no,
                    city: o?.updatedByUserBasicInfo_city,
                    created_at: o?.updatedByUserBasicInfo_created_at,
                    created_by: o?.updatedByUserBasicInfo_created_by,
                    date_of_birth: o?.updatedByUserBasicInfo_date_of_birth,
                    deleted_at: o?.updatedByUserBasicInfo_deleted_at,
                    department_id: o?.updatedByUserBasicInfo_department_id,
                    designation_id: o?.updatedByUserBasicInfo_designation_id,
                    emergency_phone: o?.updatedByUserBasicInfo_emergency_phone,
                    employed_by_id: o?.updatedByUserBasicInfo_employed_by_id,
                    employment_type_id: o?.updatedByUserBasicInfo_employment_type_id,
                    extension: o?.updatedByUserBasicInfo_extension,
                    fax: o?.updatedByUserBasicInfo_fax,
                    file_id: o?.updatedByUserBasicInfo_file_id,
                    first_name: o?.updatedByUserBasicInfo_first_name,
                    from: o?.updatedByUserBasicInfo_from,
                    gender: o?.updatedByUserBasicInfo_gender,
                    hiring_date: o?.updatedByUserBasicInfo_hiring_date,
                    id: o?.updatedByUserBasicInfo_id,
                    last_name: o?.updatedByUserBasicInfo_last_name,
                    middle_name: o?.updatedByUserBasicInfo_middle_name,
                    profile_pic: o?.updatedByUserBasicInfo_profile_pic,
                    profile_pic_url: o?.updatedByUserBasicInfo_profile_pic_url,
                    social_security: o?.updatedByUserBasicInfo_social_security,
                    state: o?.updatedByUserBasicInfo_state,
                    title: o?.updatedByUserBasicInfo_title,
                    to: o?.updatedByUserBasicInfo_to,
                    updated_at: o?.updatedByUserBasicInfo_updated_at,
                    updated_by: o?.updatedByUserBasicInfo_updated_by,
                    user_id: o?.updatedByUserBasicInfo_user_id,
                    work_phone: o?.updatedByUserBasicInfo_work_phone,
                    zip: o?.updatedByUserBasicInfo_zip
                };
            }

            if (o?.availableSpeciality_id) {
                availableSpeciality = {
                    id: o?.availableSpeciality_id,
                    key: o?.availableSpeciality_key,
                    start_date: o?.availableSpeciality_start_date,
                    end_date: o?.availableSpeciality_end_date,
                    end_date_for_recurrence: o?.availableSpeciality_end_date_for_recurrence,
                    no_of_doctors: o?.availableSpeciality_no_of_doctors,
                    no_of_slots: o?.availableSpeciality_no_of_slots,
                    end_after_occurences: o?.availableSpeciality_end_after_occurences,
                    number_of_entries: o?.availableSpeciality_number_of_entries,
                    speciality_id: o?.availableSpeciality_speciality_id,
                    facility_location_id: o?.availableSpeciality_facility_location_id,
                    recurrence_ending_criteria_id: o?.availableSpeciality_recurrence_ending_criteria_id,
                    deleted_at: o?.availableSpeciality_deleted_at,
                };
            }

            if (o?.availableSpecialityDoctor_id) {
                availableSpecialityDoctor = {
                    id: o?.availableSpecialityDoctor_id,
                    key: o?.availableSpecialityDoctor_key,
                    start_date: o?.availableSpecialityDoctor_start_date,
                    end_date: o?.availableSpecialityDoctor_end_date,
                    no_of_slots: o?.availableSpecialityDoctor_no_of_slots,
                    doctor_id: o?.availableSpecialityDoctor_doctor_id,
                    facility_location_id: o?.availableSpecialityDoctor_facility_location_id,
                    available_speciality_id: o?.availableSpecialityDoctor_available_speciality_id,
                    supervisor_id: o?.availableSpecialityDoctor_supervisor_id,
                    is_provider_assignment: o?.availableSpecialityDoctor_is_provider_assignment
                };
            }

            if (o?.doctor_id) {
                doctor = {
                    id: o?.doctor_id,
                    email: o?.doctor_email,
                    reset_key: o?.doctor_reset_key,
                    status: o?.doctor_status,
                    is_loggedIn: o?.doctor_is_loggedIn,
                    remember_token: o?.doctor_remember_token,
                };
            }

            if (o?.facilityLocation_id) {
                facilityLocation = {
                    id: o?.facilityLocation_id,
                    facility_id: o?.facilityLocation_facility_id,
                    name: o?.facilityLocation_name,
                    city: o?.facilityLocation_city,
                    state: o?.facilityLocation_state,
                    zip: o?.facilityLocation_zip,
                    region_id: o?.facilityLocation_region_id,
                    address: o?.facilityLocation_address,
                    phone: o?.facilityLocation_phone,
                    fax: o?.facilityLocation_fax,
                    email: o?.facilityLocation_email,
                    office_hours_start: o?.facilityLocation_office_hours_start,
                    office_hours_end: o?.facilityLocation_office_hours_end,
                    lat: o?.facilityLocation_lat,
                    long: o?.facilityLocation_long,
                    day_list: o?.facilityLocation_day_list,
                    floor: o?.facilityLocation_floor,
                    place_of_service_id: o?.facilityLocation_place_of_service_id,
                    qualifier: o?.facilityLocation_qualifier,
                    ext_no: o?.facilityLocation_ext_no,
                    cell_no: o?.facilityLocation_cell_no,
                    is_main: o?.facilityLocation_is_main,
                    same_as_provider: o?.facilityLocation_same_as_provider,
                    dean: o?.facilityLocation_dean,
                };
            }

            if (o?.specialities_id) {
                speciality = {
                    id: o?.specialities_id,
                    name: o?.specialities_name,
                    description: o?.specialities_description,
                    time_slot: o?.specialities_time_slot,
                    over_booking: o?.specialities_over_booking,
                    has_app: o?.specialities_has_app,
                    speciality_key: o?.specialities_speciality_key,
                    comments: o?.specialities_comments,
                    default_name: o?.specialities_default_name,
                    qualifier: o?.specialities_qualifier,
                    is_defualt: o?.specialities_is_defualt,
                    is_available: o?.specialities_is_available,
                    is_create_appointment: o?.specialities_is_create_appointment,
                    is_editable: o?.specialities_is_editable,
                };
            }

            if (o?.facilities_id) {
                facility = {
                    created_at: o?.facilities_created_at,
                    created_by: o?.facilities_created_by,
                    deleted_at: o?.facilities_deleted_at,
                    id: o?.facilities_id,
                    name: o?.facilities_name,
                    slug: o?.facilities_slug,
                    qualifier: o?.facilities_qualifier,
                    updated_at: o?.facilities_updated_at,
                    updated_by: o?.facilities_updated_by,
                };
            }

            return {
                ...appointment,
                availableSpeciality: availableSpeciality ? {
                    ...availableSpeciality,
                    availableSpecialityDoctor: availableSpecialityDoctor ? {
                        ...availableSpecialityDoctor,
                        doctor: doctor ? {
                            billingTitles: o.billingTitles_id ? billingTitles : null,
                            ...doctor,
                            doctorBasicInfo: doctorBasicInfo ? doctorBasicInfo : null,
                            medicalIdentifier: o.medicalIdentifier_id ? medicalIdentifier : null,
                        } : null,
                    } : null,
                    facilityLocation: facilityLocation ? {
                        ...facilityLocation,
                        facility: facility ? facility : null
                    } : null,
                    speciality: speciality ? speciality : null
                } : null,
                patient,
                appointmentStatus,
                updatedBy: updatedBy ? {
                    ...updatedBy,
                    userBasicInfo: userBasicInfo ? {
                        ...userBasicInfo
                    } : null,
                } : null,

            };

        }));

        if (paginate) {

            return {
                docs: finalAppointments,
                page_number: page,
                pages: Math.ceil(total / perPage),
                total,
            };
        }

        return finalAppointments;
    }

    public getCount = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            count_for: countFor,
            end_date: endDate,
            patient_id: patientId,
            case_id: caseId,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds,
            case_ids: caseIds,
            current_date: currentDate,
        } = data;

        return this[this.__getCount[`${countFor}`]]({
            ...data
        });

    }
    /**
     *
     * @param data
     * @param _authorization
     */
    public getDoctorAppointments = async (data: typings.GetDoctorAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            facility_location_ids: facilityLocationIds,
            doctor_ids: doctorIds,
            end_date: endDateString,
            start_date: startDateString,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
            },
            {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gte]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                },
                                {
                                    deleted_at: null,
                                    start_date: {
                                        [Op.lte]: endDate,
                                        [Op.gte]: startDate
                                    }
                                }
                            ]
                        },
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: specialityIds && specialityIds.length ? true : false,
                        where: {
                            deleted_at: null,
                            ...(specialityIds && { speciality_id: specialityIds })
                        },
                        include: {
                            model: models.specialities,
                            as: 'speciality',
                            required: specialityIds && specialityIds.length ? true : false,
                            where: { deleted_at: null }
                        },
                    }
                ],
            }
        ));

        const unAvaiableDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                [Op.or]: [
                    {
                        [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gte]: startDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }]
                    },
                    {
                        [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lte]: endDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }]
                    }
                ]
            }
        ));

        if (!availableDoctor || !availableDoctor.length) {
            return {
                facility: [],
                unavailabilities: unAvaiableDoctor,
            };
        }
        const userJoinClause: { [key: string]: typings.ANY } = this.__userRepo.getJoinClause('get_doctor_appointments');
        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId }, {
            include: userJoinClause
        }));

        const { colorCodes } = user;
        const facilityLocations: models.facility_locationsI[] = this.shallowCopy(await this.__facilityLocationRepo.findAll(
            {
                deleted_at: null,
                id: { [Op.in]: facilityLocationIds },
            },
            {
                include: {
                    as: 'facility',
                    model: models.facilities,
                    required: false
                }
            }
        ));

        if ((!user || !Object.keys(user).length) && (!facilityLocations || !facilityLocations.length)) {
            throw generateMessages('NO_RECORD_FOUND');
        }
        const availableDoctorIds: number[] = availableDoctor.map((o: models.sch_available_doctorsI): number => o.id);

        const checkAppointmentJoinClause: typings.ANY = this.__repo.getJoinClause('get_doctor_appointments');

        const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_doctor_id: { [Op.in]: availableDoctorIds },
                cancelled: 0,
                deleted_at: null,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [startDate, endDate] },
            },
            {
                include: [
                    ...checkAppointmentJoinClause,
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: {
                                    as: 'userBasicInfo',
                                    attributes: ['id', 'first_name', 'last_name', 'middle_name', 'profile_pic', 'user_id'],
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                include: {
                                    model: models.specialities,
                                    as: 'speciality',
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                        ...(specialityIds && { id: specialityIds })
                                    }
                                },
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        include: {
                            model: models.specialities,
                            as: 'speciality',
                            required: specialityIds && specialityIds.length ? true : false,
                            where: {
                                deleted_at: null,
                                ...(specialityIds && { id: specialityIds })
                            }
                        },
                        model: models.sch_available_specialities,
                        required: specialityIds && specialityIds.length ? true : false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'case',
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: [
                            {
                                model: models.billing_case_status,
                                as: 'caseStatus',
                                attributes: ['id', 'name'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.kiosk_case_types,
                                as: 'caseType',
                                attributes: ['id', 'name'],
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ],
                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        where: { deleted_at: null },
                        include: [
                            {
                                model: models.physicians,
                                as: 'physician',
                                attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.clinics,
                                as: 'clinic',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            },
                            {
                                model: models.clinic_locations,
                                as: 'clinicLocation',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ]
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['id', 'name', 'slug'],
                        include: {
                            as: 'specialityVisitType',
                            model: models.speciality_visit_types,
                            where:{
                                speciality_id:  { [Op.in]: specialityIds }
                            }
                        },
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ],
                order: [
                    ['scheduled_date_time', 'ASC']
                ]
            }

        ));

        const facilityMappedObject: typings.ANY = this.facilityWiseMapping(availableDoctor, facilityLocations, colorCodes);

        if (!checkAppointments || !checkAppointments.length) {
            return {
                facility: [...facilityMappedObject],
                unavailabilities: [...unAvaiableDoctor],
            };
        }

        const currentDate: string = new Date().toISOString().slice(0, 10);

        const patientCaseIds: number[] = checkAppointments.map((o: models.sch_appointmentsI): number => o.case_id);

        const patientCaseObj: typings.PatientCaseObjI = {
            case_ids: patientCaseIds,
            current_date: currentDate,
        };

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const checkedInPatientsFromKiosk: typings.ANY = await this.__http.post(`${process.env.KIOSK_URL}case-patient-session/checked-in-patient`, { ...patientCaseObj }, { ...config });
        const { data: patientInfo } = checkedInPatientsFromKiosk?.result;

        if (!patientInfo || !Object.keys(patientInfo).length) {
            throw generateMessages('CANNOT_GET_VISIT_STATUS');
        }

        const checkDescription: typings.ConfirmDescriptionI[] = this.confirmDescriptionsOfPatient(checkAppointments);

        const checkPatientStatus: typings.ConfirmDescriptionI[] = this.confirmStatusFromKiosk(checkDescription, patientInfo);

        const formattedPatient: models.sch_appointmentsI[] = this.formattedPatient(checkPatientStatus.flat(), config);

        return {
            facility: [...this.availibilityWiseMapping(formattedPatient, facilityMappedObject)],
            unavailabilities: [...unAvaiableDoctor],
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getDoctorAppointmentsById = async (data: typings.GetDoctorAppointmentsByIdBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            doctor_id: doctorId,
        } = data;

        const todayDate: string = (new Date()).toISOString().slice(0, 10);

        const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: 0,
                deleted_at: null,
                evaluation_date_time: null,
                scheduled_date_time: { [Op.gte]: todayDate },
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        model: models.sch_available_doctors,
                        required: true,
                        where: {
                            doctor_id: doctorId,
                            deleted_at: null,
                        }
                    },

                ]
            }
        ));
        return checkAppointments;
    }

    /**
     *
     * @param query
     * @param _authorization
     * @returns
     */
    public getInfo = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            id: appointmentId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                cancelled: 0,
                deleted_at: null,
                id: appointmentId,
                pushed_to_front_desk: 0,
            },
            {
                attributes: ['available_doctor_id'],
                include: [
                    {
                        as: 'availableSpeciality',
                        include:
                        {
                            as: 'facilityLocation',
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableDoctor',
                        include:
                        {
                            as: 'facilityLocations',
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                ]
            }));

        if (appointment.available_doctor_id) {
            return [{ facility_location: appointment.availableDoctor.facilityLocations }];
        }

        return [{ facility_location: appointment?.availableSpeciality.facilityLocation }];

    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public getNextAndLastAppointment = async (data: typings.GetNextAndLastAppointmentBodyI, _authorization: string): Promise<typings.AutoResolveAppointmentsResponseI> => {

        const { case_ids: caseIds } = data;

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
            case_id: { [Op.in]: caseIds },
            deleted_at: null
        }));

        if (!appointments?.length) {
            return [];
        }

        const appointmentStatuses: models.sch_appointment_statusesI[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll());

        const completedAppointmentStatusId: number = (appointmentStatuses?.find((s: models.sch_appointment_statusesI): boolean => s.slug === 'completed')).id;

        const scheduledAppointmentStatusId: number = (appointmentStatuses?.find((s: models.sch_appointment_statusesI): boolean => s.slug === 'scheduled')).id;

        const reScheduledAppointmentStatusId: number = (appointmentStatuses?.find((s: models.sch_appointment_statusesI): boolean => s.slug === 're_scheduled')).id;

        const groupedAppointments: typings.GroupedAppointmentI = appointments.map((a: models.sch_appointmentsI): models.sch_appointmentsI => a)
            ?.reduce((acc: typings.ANY, a: models.sch_appointmentsI): typings.GroupedAppointmentI => {
                const foundCaseIndex: number = acc.findIndex((ac: typings.GroupedAppointmentI): boolean => ac.case_id === a.case_id);
                if (foundCaseIndex === -1) {
                    // tslint:disable-next-line: no-parameter-reassignment
                    acc = [...acc, {
                        appointments: [a],
                        case_id: a.case_id
                    }];
                    return acc;
                }

                acc[foundCaseIndex].appointments = [
                    ...acc[foundCaseIndex].appointments,
                    a
                ];
                return acc;
                // tslint:disable-next-line: align
            }, [])
            ?.map((a: typings.GroupedAppointmentI): typings.ANY => {
                const { appointments: formatedAppointments, ...otherAttributes } = a;

                const completedAppointments: models.sch_appointmentsI[] = formatedAppointments.filter((appointment: models.sch_appointmentsI): typings.ANY => appointment.status_id === completedAppointmentStatusId);

                const scheduledAppointments: models.sch_appointmentsI[] = formatedAppointments
                    // tslint:disable-next-line: strict-comparisons
                    .filter((appointment: models.sch_appointmentsI): typings.ANY => new Date(appointment.scheduled_date_time) > new Date() && (appointment.status_id === scheduledAppointmentStatusId || appointment.status_id === reScheduledAppointmentStatusId));

                return {
                    ...otherAttributes,
                    last_appointment: completedAppointments[0],
                    next_appointment: scheduledAppointments[0]
                };
            });

        return groupedAppointments;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getPatientAppointments = async (data: typings.GetPatientAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            appointment_status_id: appointmentStatusId,
            end_date: endDateString,
            start_date: startDateString,
            patient_id: patientId,
            practice_location_id: practiceLocationId,
            speciality_id: specialityId,
            case_id: caseId,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const whereClauseForCancelledAppointments: { [key: string]: typings.ANY } = startDateString && endDateString ?
            {
                cancelled: 1,
                deleted_at: null,
                patient_id: patientId,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [startDate, endDate] },
            } :
            {
                cancelled: 1,
                deleted_at: null,
                patient_id: patientId,
                pushed_to_front_desk: 0,
            };

        appointmentStatusId ? whereClauseForCancelledAppointments.status_id = appointmentStatusId : null;

        const whereClauseForSpecialityFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        if (specialityId) {
            whereClauseForSpecialityFilter.id = specialityId;
        }

        const cancelledAppointmentsWithAvailableSpecialities: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                ...whereClauseForCancelledAppointments,
                available_doctor_id: null,
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        include: [
                            {
                                as: 'speciality',
                                model: models.specialities,
                                required: specialityId ? true : false,
                                where: { ...whereClauseForSpecialityFilter },
                            },
                            {
                                as: 'facilityLocation',
                                include: {
                                    as: 'facility',
                                    model: models.facilities,
                                    required: false
                                },
                                model: models.facility_locations,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: { [Op.ne]: null },
                        },
                        order: [
                            ['deleted_at', 'DESC']
                        ]
                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        include: {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                ],

            }
        ));

        const cancelledAppointmentsWithAvailableDoctors: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                ...whereClauseForCancelledAppointments,
                id: { [Op.notIn]: cancelledAppointmentsWithAvailableSpecialities?.map((x) => x.id) },

            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'facilityLocations',
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
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: [
                                    {
                                        as: 'userBasicInfo',
                                        attributes: ['id', 'first_name', 'last_name', 'middle_name', 'user_id'],
                                        model: models.user_basic_info,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'medicalIdentifiers',
                                        attributes: ['id'],
                                        include: {
                                            as: 'billingTitle',
                                            attributes: ['id', 'name'],
                                            model: models.billing_titles,
                                            required: false,
                                            where: { deleted_at: null }
                                        },
                                        model: models.medical_identifiers,
                                        required: false,
                                        where: {
                                            deleted_at: null,
                                        },
                                    }
                                ],
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        include: [
                            {
                                as: 'speciality',
                                model: models.specialities,
                                required: specialityId ? true : false,
                                where: { ...whereClauseForSpecialityFilter },
                            }
                        ],
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: { [Op.ne]: null },
                        },
                        order: [
                            ['deleted_at', 'DESC']
                        ]

                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        include: {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                ],

            }
        ));

        const cancelledAppointments: models.sch_appointmentsI[] = [...cancelledAppointmentsWithAvailableSpecialities, ...cancelledAppointmentsWithAvailableDoctors];

        const formattedCancelledAppointments: typings.ANY = cancelledAppointments && cancelledAppointments.length ? cancelledAppointments.map((x: models.sch_appointmentsI): typings.ANY => {

            const { appointmentStatus, availableDoctor, availableSpeciality, patientSessions, physicianClinic, ...otherAttributes } = x;

            const formattedPhysicianClinicResponse: typings.ANY = physicianClinic ? {
                ...physicianClinic,
                physician: physicianClinic?.physician ? {
                    physician_clinic_id: physicianClinic?.id,
                    ...physicianClinic?.physician,
                    ...physicianClinic?.clinic,
                    ...physicianClinic?.clinicLocation,
                } : null
            } : null;

            return {
                appointment_status: appointmentStatus?.name,
                appointment_status_slug: appointmentStatus?.slug,
                available_doctor: availableDoctor,
                available_speciality: availableSpeciality,
                physician_clinic: formattedPhysicianClinicResponse,
                visit_status_name: patientSessions?.visitStatus?.name,
                visit_status_slug: patientSessions?.visitStatus?.slug,
                ...otherAttributes
            };
        }) : [];

        let whereClauseForAppointments: { [key: string]: string | number | boolean | typings.ANY } = { cancelled: 0, pushed_to_front_desk: 0, patient_id: patientId, deleted_at: null };

        if (startDateString && endDateString) {
            whereClauseForAppointments = {
                ...whereClauseForAppointments,
                scheduled_date_time: { [Op.between]: [startDate, endDate] }
            };
        }

        if (caseId) {
            whereClauseForAppointments.case_id = caseId;
        }

        appointmentStatusId ? whereClauseForAppointments.status_id = appointmentStatusId : null;

        const appointmentsWithAvailableSpecialities: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_doctor_id: null,
                ...whereClauseForAppointments,
            },
            {
                include: [
                    {
                        as: 'caseType',
                        attributes: ['name', 'slug'],
                        model: models.kiosk_case_types,
                        required: true,
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
                        include: [
                            {
                                as: 'speciality',
                                model: models.specialities,
                                required: specialityId ? true : false,
                                where: { ...whereClauseForSpecialityFilter },
                            },
                            {
                                as: 'facilityLocation',
                                include: {
                                    as: 'facility',
                                    model: models.facilities,
                                    required: false
                                },
                                model: models.facility_locations,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'priority',
                        model: models.sch_appointment_priorities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentType',
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        include: {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    }
                ]
            }));

        const appointmentsWithAvailableDoctors: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                ...whereClauseForAppointments,
                id: { [Op.notIn]: appointmentsWithAvailableSpecialities?.map((x) => x.id) },
            },
            {
                include: [
                    {
                        as: 'caseType',
                        attributes: ['name', 'slug'],
                        model: models.kiosk_case_types,
                        required: true,
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
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'availableSpeciality',
                                include: [
                                    {
                                        as: 'facilityLocation',
                                        model: models.facility_locations,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        as: 'speciality',
                                        model: models.specialities,
                                        required: false,
                                        where: { deleted_at: null },
                                    }
                                ],
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'facilityLocations',
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
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: [
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
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'priority',
                        model: models.sch_appointment_priorities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'appointmentType',
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        include: {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    }
                ]
            }));

        let appointments: models.sch_appointmentsI[] = [...appointmentsWithAvailableSpecialities, ...appointmentsWithAvailableDoctors];

        const colorCodes: models.sch_color_codesI[] = this.shallowCopy(await this.__colorCodeRepo.findAll({ deleted_at: null, user_id: userId }));
        appointments = appointments && appointments.length ? appointments.map((a: models.sch_appointmentsI): typings.ANY => {
            const {
                caseType,
                appointmentStatus,
                appointmentCptCodes,
                availableDoctor,
                availableSpeciality,
                appointmentType,
                patientSessions,
                scheduled_date_time: scheduledDateTime,
                available_doctor_id: availableDoctorId,
                time_slots: timeSlots,
                ...otherAttributes
            } = a;

            let facility_location_code: string;
            let speciality_code: string;

            if (availableDoctor && Object.keys(availableDoctor).length) {
                facility_location_code = colorCodes?.find((c: models.sch_color_codesI): boolean => c.object_id === availableSpeciality?.speciality?.id)?.code ?? '#9d9d9d';
            } else if (availableSpeciality && Object.keys(availableSpeciality).length) {
                speciality_code = (colorCodes?.find((c: models.sch_color_codesI): boolean => c.object_id === availableSpeciality.speciality?.id))?.code ?? '#9d9d9d';
            }

            // Hmd
            return {
                appointmentType,
                appointment_cpt_codes: appointmentCptCodes,
                appointment_status: appointmentStatus?.name,
                appointment_status_slug: appointmentStatus?.slug,
                appointment_type_id: a?.type_id,
                available_doctor: availableDoctor,
                available_doctor_id: availableDoctorId,
                available_speciality: availableSpeciality,
                billingTitles: availableDoctorId ? availableDoctor?.doctor?.medicalIdentifiers?.billingTitle : null,
                case_type_name: caseType?.name,
                cd_image: a?.cd_image,
                doctor_info: availableDoctorId ? availableDoctor?.doctor?.userBasicInfo : null,
                facility_location_code,
                medicalIdentifiers: availableDoctorId ? availableDoctor?.doctor?.medicalIdentifiers : null,
                reading_provider: a?.readingProvider,
                reading_provider_id: a?.reading_provider_id,
                scheduled_date_time: scheduledDateTime,
                speciality_code,
                speciality_id: a?.availableSpeciality ? a?.availableSpeciality?.speciality_id : a?.availableDoctor?.availableSpeciality?.speciality_id,
                speciality_key: a?.availableSpeciality ? a?.availableSpeciality?.speciality?.speciality_key : a?.availableDoctor?.availableSpeciality?.speciality?.speciality_key,
                speciality_name: a?.availableSpeciality ? a?.availableSpeciality?.speciality?.name : a?.availableDoctor?.availableSpeciality?.speciality?.name,
                speciality_qualifier: a?.availableSpeciality ? a?.availableSpeciality?.speciality?.qualifier : a?.availableDoctor?.availableSpeciality?.speciality?.qualifier,
                time_slots: timeSlots,
                visit_status_name: patientSessions?.visitStatus?.name,
                visit_status_slug: patientSessions?.visitStatus?.slug,
                ...otherAttributes
            };
        }) : [];

        return {
            appointments,
            cancelled_appointments: formattedCancelledAppointments
        };
    }

    public getPatientAppointmentsV1 = async (data: typings.GetPatientAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            appointment_status_id: appointmentStatusId,
            end_date: endDateString,
            start_date: startDateString,
            patient_id: patientId,
            practice_location_id: practiceLocationId,
            speciality_id: specialityId,
            case_id: caseId,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const pateintCancelledAppointmentRawQuery: string = this.generateGetSinglePatientAppointmentsRawQuery({
            facilityLocationIds: practiceLocationId,
            specialityIds: specialityId,
            patientId,
            appointmentStatusIds: appointmentStatusId,
            startDate: startDateString,
            endDate: endDateString,
        });

        const [pateintAppointments]: typings.ANY = this.shallowCopy(await sequelize.query(pateintCancelledAppointmentRawQuery));
        const appointmentIds: number[] = pateintAppointments.map((x: typings.ANY): number => x.appointment_id);

        const appointmentWithOtherData: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                id: appointmentIds,
            },
            {
                include: [
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    }
                ]
            }
        ));

        const colorCodes: models.sch_color_codesI[] = this.shallowCopy(await this.__colorCodeRepo.findAll(
            {
                deleted_at: null,
                user_id: userId,
            },
            {
                include: {
                    as: 'type',
                    model: models.sch_color_code_types,
                }
            }));

        const formattedAppointments: typings.ANY = this.getGetPatientCancelledAppointmentsMapping(pateintAppointments, appointmentWithOtherData, colorCodes);

        const cancelledAppointments: models.sch_appointmentsI[] = [];
        const patientAppointments: models.sch_appointmentsI[] = [];

        formattedAppointments.forEach((app: typings.ANY): void => {
            if (app.cancelled) {
                cancelledAppointments.push(app);
            } else {
                patientAppointments.push(app);
            }
        });

        return {
            appointments: caseId ? patientAppointments.filter(x => x.case_id === caseId) : patientAppointments,
            cancelled_appointments: cancelledAppointments
        };
    }

    public getPatientHistory = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            case_id: caseId,
            type,
            pagination,
            per_page,
            page
        } = data;

        if (!caseId) {
            throw generateMessages('CASE_ID_REQUIRED');
        }

        const appointmentTypes: typings.ANY = ['cancel', 'no_show', 'completed', 'today'];

        if (!appointmentTypes.includes(type)) {
            throw generateMessages('VALID_APPOINTMENT_NAME_ERROR');
        }

        const patientHistoryJoinClause: typings.ANY = this.__repo.getJoinClause('get_patient_history_appointments');

        let allAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                case_id: caseId
            },
            {
                include: [...patientHistoryJoinClause]
            }
        ));

        allAppointments = this[this.__appointmentsHistoryChecks[`${type}`]](allAppointments);

        allAppointments = allAppointments.map((a: models.sch_appointmentsI): typings.ANY => {

            const { physicianClinic } = a;

            const formattedPhysicianClinicResponse: typings.ANY = physicianClinic ? {
                // ...physicianClinic,
                physician: physicianClinic?.physician ? {
                    clinic_location_id: physicianClinic?.clinicLocation?.id,
                    physician_clinic_id: physicianClinic?.id,
                    ...physicianClinic?.clinic,
                    ...physicianClinic?.clinicLocation,
                    ...physicianClinic?.physician,
                } : null
            } : null;

            return {
                ...a,
                physicianClinic: formattedPhysicianClinicResponse
            };
        });

        const pageNumber: number = page ?? 1;
        const perPage: number = per_page ?? 10;

        const responseObj = pagination ? {
            docs: this.paginate(allAppointments, perPage, pageNumber),
            pages: Math.ceil(allAppointments.length / perPage),
            total: allAppointments.length,
        } : allAppointments;

        return responseObj;
    }

    public getPatientHistoryCounts = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            case_id: caseId
        } = data;

        if (!caseId) {
            throw generateMessages('CASE_ID_REQUIRED');
        }

        let todayAppointmentsCount: number;
        let cancelledAppointmentsCount: number;
        let noShowAppointmentsCount: number;
        let completedAppointmentsCount: number;

        const allAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                case_id: caseId
            },
            {
                include: {
                    model: models.sch_appointment_statuses,
                    as: 'appointmentStatus',
                    where: {
                        deleted_at: null,
                    }
                },
            }
        ));

        todayAppointmentsCount = allAppointments.filter((t: models.sch_appointmentsI) => {
            const formattedSchduledDateTime: string = format(new Date(t.scheduled_date_time), 'MM-dd-yyyy');
            const formattedCurrentDateTime: string = format(new Date(), 'MM-dd-yyyy');
            if (!t.cancelled && t.deleted_at === null && formattedSchduledDateTime === formattedCurrentDateTime) {
                return t;
            }
        }).length;

        cancelledAppointmentsCount = allAppointments.filter((c: models.sch_appointmentsI): boolean => c.cancelled && c.deleted_at === null).length;

        noShowAppointmentsCount = allAppointments.filter((n: models.sch_appointmentsI): boolean => !n.cancelled && n.deleted_at === null && n?.appointmentStatus?.slug === 'no_show').length;

        completedAppointmentsCount = allAppointments.filter((c: models.sch_appointmentsI): boolean => !c.cancelled && c.deleted_at === null && c?.appointmentStatus?.slug === 'completed').length;

        return {
            todayAppointments: todayAppointmentsCount,
            cancelledAppointments: cancelledAppointmentsCount,
            noShowAppointments: noShowAppointmentsCount,
            completedAppointments: completedAppointmentsCount
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getRelatedInfo = async (data: typings.GetRelatedInfoBodyI, _authorization: string): Promise<typings.ANY> => {

        const { id, case_id: caseId, speciality_key: specialityKey } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id, {
            include: [
                {
                    as: 'availableDoctor',
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'caseType',
                    model: models.kiosk_case_types,
                    required: false,
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                },
                {
                    as: 'patient',
                    model: models.kiosk_patient,
                    required: false,
                },
                {
                    as: 'appointmentVisit',
                    model: models.visit_sessions,
                    required: false,
                },
                {
                    as: 'case',
                    attributes: ['id'],
                    include: {
                        as: 'caseAccidentInformation',
                        attributes: ['id', 'accident_date', 'accident_time'],
                        model: models.kiosk_case_accident_informations,
                        required: false
                    },
                    model: models.kiosk_cases,
                    required: false
                },
                {
                    as: 'appointmentType',
                    attributes: ['id', 'name', 'slug'],
                    model: models.sch_appointment_types,
                    requires: false,
                }
            ]
        }));
      
        if (!appointment || !Object.keys(appointment).length) {
            throw generateMessages('NO_APPOINTMENT_FOUND');
        }
    
        const appointmentStatus: models.sch_appointment_typesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'completed' }));
        const lastCompletedAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne({ case_id: caseId, deleted_at: null, status_id: appointmentStatus.id }));
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        let sessionForScheduler: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session/session-for-scheduler`, {
            ...config,
            params: {
                appointment_id: id,
                case_id: caseId,
            }
        }));

        sessionForScheduler = sessionForScheduler?.result?.data;

        let checkedVisitSession: boolean = false;

        if (appointment?.appointmentVisit  && Object.keys(appointment?.appointmentVisit).length) {
            checkedVisitSession = true;
        }

        const responseObj: typings.ANY = {
            appointment_status: appointment.appointmentStatus.name,
            case_id: caseId,
            case_type: appointment?.caseType?.name,
            dob: new Date(appointment.patient.dob),
            evaluation_started: (appointment.evaluation_date_time || checkedVisitSession) ? true : false,
            last_appointment: lastCompletedAppointment,
        };

        responseObj.insurance_name = sessionForScheduler?.company_name ?? null;
        responseObj.visit_status = sessionForScheduler?.sessionStatus?.name ?? null;
        responseObj.checked_in_time = sessionForScheduler?.sessionStatus?.updated_at ?? null;

        const { available_doctor_id: availableDoctorId, billable } = appointment;

        const { back_dated_check: backDatedCheck } = this.checkBackDated(appointment, config);

        responseObj.back_dated_check = backDatedCheck;
        responseObj.billable = billable;

        responseObj.accident_date = appointment?.case?.caseAccidentInformation?.accident_date ? `${String(appointment?.case?.caseAccidentInformation?.accident_date)}T${String(appointment?.case?.caseAccidentInformation?.accident_time ?? '00:00:00')}.000Z` : null;
        
        responseObj.accident_time = appointment?.case?.caseAccidentInformation?.accident_time;

        responseObj.file_id = null;

        const visitSession: models.visit_sessionsI = this.shallowCopy(await this.__visitSessionRepo.findOne({ case_id: appointment?.case_id, appointment_id: appointment?.id, deleted_at: null }, {
            include: {
                as: 'visitState',
                model: models.visit_session_states
            }
        }));

        const { visitState } = visitSession || {};

        responseObj.template_id = visitSession?.template_id ?? null;
        responseObj.template_type = visitSession?.template_type ?? null;
        responseObj.visit_session_id = visitSession?.id ?? null;
        responseObj.appointment_type = appointment?.appointmentType?.slug;

        if (availableDoctorId && appointment.evaluation_date_time && (visitState?.slug === 'finalized' || visitState?.slug === 'bill_created')) {
            const specialityExists: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne({ speciality_key: specialityKey }));

            if (!specialityExists || !Object.keys(specialityExists).length) {
                throw generateMessages('NO_SPECIALITY_FOUND_FOR_KEY');
            }

            const specialityEnvironment: string = this.__getSpecialityEnvironment[specialityKey];

            const getFileInformationScheduler: typings.ANY = this.shallowCopy(await this.__http.post(`${process.env[specialityEnvironment]}/medical-session-pdf/get-file-info-scheduler`, {
                appointment_id: appointment?.id,
                appointment_type_id: appointment?.type_id,
                case_id: appointment?.case_id,
                doctor_id: appointment?.availableDoctor?.doctor_id,
                patient_id: appointment?.patient_id
                // tslint:disable-next-line: align
            }, config));

            const { result: { data: pdfFileDate } } = getFileInformationScheduler || {};

            responseObj.file_id = pdfFileDate && pdfFileDate.length ? pdfFileDate : null;

        }

        return responseObj;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getSpecialityAppointments = async (data: typings.getSpecialityAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            end_date: endDateString,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds,
            start_date: startDateString,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableSpeciality: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
            {
                [Op.or]: [
                    {
                        deleted_at: null,
                        facility_location_id: { [Op.in]: facilityLocationIds },
                        speciality_id: { [Op.in]: specialityIds },
                    },
                    {
                        deleted_at: null,
                        facility_location_id: { [Op.in]: facilityLocationIds },
                        speciality_id: { [Op.in]: specialityIds },
                    }
                ]

            },
            {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    start_date: { [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }] },
                                },
                                {

                                    deleted_at: null,
                                    end_date: { [Op.gte]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                }
                            ]
                        },
                    },
                    {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null },
                    },
                ]
            }
        ));

        if (!availableSpeciality || !availableSpeciality.length) {
            return [];
        }

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId }, {
            include: [
                {
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
                }
            ]
        }));

        const { colorCodes } = user;

        const facilityLocations: models.facility_locationsI[] = this.shallowCopy(await this.__facilityLocationRepo.findAll(
            {
                deleted_at: null,
                id: { [Op.in]: facilityLocationIds },
            },
            {
                include: {
                    as: 'facility',
                    model: models.facilities,
                    required: false
                }
            }
        ));

        if ((!user || !Object.keys(user).length) && (!facilityLocations || !facilityLocations.length)) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const availableSpecialityIds: number[] = availableSpeciality.map((o: models.sch_available_specialitiesI): number => o.id);

        const checkAppointmentJoinClause: typings.ANY = this.__repo.getJoinClause('get_speciality_appointments');

        const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_speciality_id: { [Op.in]: availableSpecialityIds },
                available_doctor_id: null,
                cancelled: 0,
                deleted_at: null,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [startDate, endDate] },
            },
            {
                include: [
                    ...checkAppointmentJoinClause,
                    {
                        as: 'case',
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: [
                            {
                                model: models.billing_case_status,
                                as: 'caseStatus',
                                attributes: ['id', 'name'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.kiosk_case_types,
                                as: 'caseType',
                                attributes: ['id', 'name'],
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ],
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['id', 'name', 'slug'],
                        include: {
                            as: 'specialityVisitType',
                            model: models.speciality_visit_types,
                            where:{
                                speciality_id:  { [Op.in]: specialityIds }
                            }
                        },
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ],
                order: [
                    ['scheduled_date_time', 'ASC']
                ]
            }

        ));
        const facilityMappedObject: typings.ANY = this.facilityWiseMapping(availableSpeciality, facilityLocations, colorCodes);

        if (!checkAppointments || !checkAppointments.length) {
            return facilityMappedObject;
        }

        const currentDate: string = new Date().toISOString().slice(0, 10);

        const patientCaseIds: number[] = checkAppointments.map((o: models.sch_appointmentsI): number => o.case_id);

        const patientCaseObj: typings.PatientCaseObjI = {
            case_ids: patientCaseIds,
            current_date: currentDate,
        };

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        const checkedInPatientsFromKiosk: typings.ANY = await this.__http.post(`${process.env.KIOSK_URL}case-patient-session/checked-in-patient`, { ...patientCaseObj }, { ...config });
        const { data: patientInfo } = checkedInPatientsFromKiosk?.result;

        const checkDescription: typings.ANY[] = this.confirmDescriptionsOfPatient(checkAppointments);
        const checkPatientStatus: typings.ANY[] = this.confirmStatusFromKiosk(checkDescription, patientInfo);
        const formattedPatient: models.sch_appointmentsI[] = this.formattedPatient(checkPatientStatus.flat(), config);
        return this.availibilityWiseMapping(formattedPatient, facilityMappedObject);

    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public getTodayAppointmentOfPatient = async (data: typings.GetTodayAppointmentOfPatientBodyI, _authorization: string): Promise<typings.GetTodayAppointmentOfPatientResponseI> => {
        const { start_date: startDate, end_date: endDate, case_id: caseId } = data;
        const completedAppointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'completed' }));
        const inSessionAppointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'in_session' }));
        return this.shallowCopy(await this.__repo.findAll(
            {
                case_id: caseId,
                deleted_at: null,
                scheduled_date_time: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                },
                status_id: { [Op.and]: [{ [Op.ne]: completedAppointmentStatus.id }, { [Op.ne]: inSessionAppointmentStatus.id }] },
            },
            {
                attributes: ['id']
            }
        )).map((a: models.sch_appointmentsI): number => a.id);
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public isFutureAppointment = async (data: typings.IsTodayAppointmentBodyI, _authorization: string): Promise<typings.IsTodayAppointmentResponseI> => {
        const { appointment_id: appointmentId } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(appointmentId));

        if (!appointment || !Object.keys(appointment).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { scheduled_date_time: scheduledDateTime } = appointment;

        const startDate: Date = new Date();
        const endDate: Date = new Date();

        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(0);

        // tslint:disable-next-line: strict-comparisons
        if (new Date(startDate) < new Date(scheduledDateTime) && new Date(endDate) < new Date(scheduledDateTime)) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public isTodayAppointment = async (data: typings.IsTodayAppointmentBodyI, _authorization: string): Promise<typings.IsTodayAppointmentResponseI> => {
        const { appointment_id: appointmentId } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(appointmentId));

        if (!appointment || !Object.keys(appointment).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { scheduled_date_time: scheduledDateTime } = appointment;

        const startDate: Date = new Date();
        const endDate: Date = new Date();

        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(0);

        // tslint:disable-next-line: strict-comparisons
        if (new Date(startDate) <= new Date(scheduledDateTime) && new Date(scheduledDateTime) < new Date(endDate)) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public post = async (data: typings.AddAppointmentBodyI, _authorization: string, __transactions: Transaction): Promise<models.sch_appointmentsI[]> => {

        const {
            appointment_type_id: appointmentTypeId,
            case_id: caseId,
            case_type_id: caseTypeId,
            comments,
            confirmation_status: confirmationStatus,
            doctor_id: doctorId,
            is_speciality_base: isSpecialityBase,
            facility_location_id: facilityLocationId,
            patient_id: patientId,
            priority_id: priorityId,
            speciality_id: specialityId,
            start_date_time: startDateTime,
            time_slot: timeSlot,
            user_id: userId = Number(process.env.USERID),
            days,
            end_date_for_recurrence: endDateForRecurrence,
            recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
            end_after_occurences: endAfterOccurences,
            time_zone,
            is_soft_registered,
            physician_id: physicianId,
            transportation,
            technician_id: technicianId,
            cpt_codes: cptCodes
        } = data;

        const isSoftRegistered: boolean = is_soft_registered ? is_soft_registered : false;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (new Date(startDateTime).getTime() < new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()) {
            throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
        }

        const { slug: caseType }: models.kiosk_case_typesI = this.shallowCopy(await this.__caseTypesRepo.findById(caseTypeId));

        const appointmentTypes: models.sch_appointment_typesI[] = this.shallowCopy(await this.__appoitmentTypeRepo.findAll(
            {
                deleted_at: null
            }
        ));

        const appointmentTypeIdsForCheck: number[] = appointmentTypes.map((u: models.sch_appointment_typesI): number => u.id);

        const checkingAppointmentPriority: boolean = appointmentTypeIdsForCheck?.includes(appointmentTypeId);

        if (!checkingAppointmentPriority) {
            throw generateMessages('INVALID_APPOINTMENT_TYPE_ID');
        }

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const checkForReccurence: boolean = days || endDateForRecurrence || recurrenceEndingCriteriaId || endAfterOccurences ? true : false;

        if (checkForReccurence && appointmentTypeId === appointmentType.id) {

            throw generateMessages('NO_APPOINTMENT_CREATED_RECCURENCE');

        }

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId,
            }
        ));

        if (!speciality && !Object.keys(speciality).length) {
            throw generateMessages('NO_SPECIALITY_FOUND');
        }

        let endingCriteriaObj: models.sch_recurrence_ending_criteriasI;
        let endingCriteria: string;

        if (recurrenceEndingCriteriaId) {

            endingCriteriaObj = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(recurrenceEndingCriteriaId)) as unknown as models.sch_recurrence_ending_criteriasI;
            const { slug: endingCriteriaString } = endingCriteriaObj;
            endingCriteria = endingCriteriaString ?? '';
        }

        const { time_slot: specialityTimeSlot, } = speciality || {};

        const checkForDateCriteria: boolean = endDateForRecurrence ? true : false;
        const daysList: number[] = days && days.length ? days : [0, 1, 2, 3, 4, 5, 6];

        const requiredDates: Date[] = (await this[this.__formatDatesCriteriaMethod[`${checkForDateCriteria}`]]({

            daysList,
            endDateString: new Date(startDateTime),
            endingCriteria,
            numberOfRecurrsion: endAfterOccurences,
            recurrenceEndDateString: endDateForRecurrence,
            startDateString: startDateTime,

        }));

        const formatDates: Date[] = requiredDates && requiredDates.length ? requiredDates : [new Date(startDateTime)];
        const desiredTimeSlot: number = timeSlot ? timeSlot : specialityTimeSlot;
        const slotsForThisAppointment: number = timeSlot ? timeSlot / specialityTimeSlot : 1;

        const patientSessionIds: number[] = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findAll(
            {
                deleted_at: null,
                slug: { [Op.in]: ['checked_in', 'in_session'] }
            },
        )).map((o: models.kiosk_case_patient_session_statusesI): number => o.id);

        const isAlradyCheckedIn: boolean = this.shallowCopy(await this.__casePatientSessionRepo.findAll(
            {
                appointment_id: { [Op.ne]: null },
                case_id: caseId,
                date_of_check_in: `${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()}`,
                deleted_at: null,
                status_id: { [Op.in]: patientSessionIds }
            },
        )).length ? true : false;

        const appointmentStatus: models.sch_appointment_statusesI[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll(
            {
                deleted_at: null,
                slug: {
                    [Op.or]: ['scheduled', 'arrived']
                },
            },
        ));

        const existingCasePatientSession: models.kiosk_case_patient_sessionI = this.shallowCopy(await this.__casePatientSessionRepo.findOne(
            {
                case_id: caseId
            },
            {
                include: [
                    {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        where: {
                            slug: 'walk_in'
                        }
                    }
                ],
            }
        ));

        const createAppointmentObject: typings.CreateAppointmentI = {
            formatDates,
            startDateTime,
            existingCasePatientSession,
            appointmentStatus,
            isAlradyCheckedIn,
            desiredTimeSlot,
            doctorId,
            specialityId,
            caseId,
            patientId,
            time_zone,
            confirmationStatus,
            appointmentType,
            speciality,
            appointmentTypeId,
            facilityLocationId,
            caseType,
            comments,
            priorityId,
            isSpecialityBase,
            isSoftRegistered,
            caseTypeId,
            slotsForThisAppointment,
            userId,
            physicianId,
            transportation,
            technicianId,
            cptCodes
        };

        const pool = workerpool.pool();

        return pool.proxy()
            .then((): Promise<models.sch_appointmentsI[]> => this.createAppointment(createAppointmentObject, _authorization))
            .then((result: models.sch_appointmentsI[]): models.sch_appointmentsI[] => result)
            .catch((err: typings.ANY): typings.ANY => {
                pool.terminate();
                console.log('err in pool', err);
                throw err;
            })
            .then((result: models.sch_appointmentsI[]): models.sch_appointmentsI[] => {
                console.log('terminated!');
                pool.terminate(); // Terminate all workers when done
                return result;
            });

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public postV1 = async (data: typings.AddAppointmentBodyI, _authorization: string): Promise<any> => {

        const {
            appointment_type_id: appointmentTypeId,
            case_id: caseId,
            case_type_id: caseTypeId,
            comments,
            confirmation_status: confirmationStatus,
            doctor_id: doctorId,
            is_speciality_base: isSpecialityBase,
            facility_location_id: facilityLocationId,
            patient_id: patientId,
            priority_id: priorityId,
            speciality_id: specialityId,
            start_date_time: startDateTime,
            session_status_id:sessionStatusId,
            time_slot: timeSlot,
            user_id: userId = Number(process.env.USERID),
            undo_appointment_status_id: undoAppointmentStatusId,
            days,
            end_date_for_recurrence: endDateForRecurrence,
            recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
            end_after_occurences: endAfterOccurences,
            time_zone,
            is_soft_registered,
            physician_id: physicianId,
            transportation,
            technician_id: technicianId,
            cpt_codes: cptCodes,
            reading_provider_id: readingProviderId,
            cd_image: cdImage,
            is_transportation: isTransportation
        } = data;

        if (!specialityId) {
            throw generateMessages('SPECIALITY_REQUIRED');
        }

        if (!facilityLocationId) {
            throw generateMessages('FACILITY_REQUIRED');
        }

        const isSoftRegistered: boolean = is_soft_registered ? is_soft_registered : false;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const localStartTime: Date = this.convertDateToLocal(new Date(startDateTime), time_zone);

        if (new Date(localStartTime).getTime() < new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()) {
            throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
        }

        const { slug: caseType }: models.kiosk_case_typesI = this.shallowCopy(await this.__caseTypesRepo.findById(caseTypeId));

        const appointmentTypes: models.sch_appointment_typesI[] = this.shallowCopy(await this.__appoitmentTypeRepo.findAll(
            {
                deleted_at: null
            }
        ));

        const appointmentTypeIdsForCheck: number[] = appointmentTypes.map((u: models.sch_appointment_typesI): number => u.id);

        const checkingAppointmentPriority: boolean = appointmentTypeIdsForCheck?.includes(appointmentTypeId);

        if (!checkingAppointmentPriority) {
            throw generateMessages('INVALID_APPOINTMENT_TYPE_ID');
        }

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const checkForReccurence: boolean = days || endDateForRecurrence || recurrenceEndingCriteriaId || endAfterOccurences ? true : false;

        if (checkForReccurence && appointmentTypeId === appointmentType.id) {

            throw generateMessages('NO_APPOINTMENT_CREATED_RECCURENCE');

        }

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId,
            },
            {
                include:[
                    {
                        as: "specialityVisitType",
                        model: models.speciality_visit_types,
                        where:{
                            speciality_id: specialityId,
                            appointment_type_id: appointmentTypeId,
                            deleted_at: null
                        }
                    }
                ]
            }
        ));

        if (!speciality || !Object.keys(speciality).length) {
            throw generateMessages('NO_SPECIALITY_FOUND');
        }

        let endingCriteriaObj: models.sch_recurrence_ending_criteriasI;
        let endingCriteria: string;

        if (recurrenceEndingCriteriaId) {

            endingCriteriaObj = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(recurrenceEndingCriteriaId)) as unknown as models.sch_recurrence_ending_criteriasI;
            const { slug: endingCriteriaString } = endingCriteriaObj;
            endingCriteria = endingCriteriaString ?? '';
        }

        const { time_slot: specialityTimeSlot, } = speciality || {};

        const checkForDateCriteria: boolean = endDateForRecurrence ? true : false;
        const daysList: number[] = days && days.length ? days : [0, 1, 2, 3, 4, 5, 6];

        const requiredDates: Date[] = (await this[this.__formatDatesCriteriaMethod[`${checkForDateCriteria}`]]({

            daysList,
            endDateString: new Date(startDateTime),
            endingCriteria,
            numberOfRecurrsion: endAfterOccurences,
            recurrenceEndDateString: endDateForRecurrence,
            startDateString: startDateTime,

        }));

        const formatDates: Date[] = requiredDates && requiredDates.length ? requiredDates : [new Date(startDateTime)];
        const desiredTimeSlot: number = timeSlot ? timeSlot : specialityTimeSlot;
        const slotsForThisAppointment: number = timeSlot ? timeSlot / specialityTimeSlot : 1;

        const appointmentStatus: models.sch_appointment_statusesI[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll(
            {
                deleted_at: null,
                slug: {
                    [Op.or]: ['scheduled', 'arrived']
                },
            },
        ));

        const { id: appointmentArrivedStatusId }: typings.ANY = appointmentStatus.find((s: models.sch_appointment_statusesI) => s.slug === 'arrived');

        const checkInTodayAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                cancelled: false,
                case_id: caseId,
                deleted_at: null,
                status_id: appointmentArrivedStatusId,
                scheduled_date_time: { [Op.between]: [new Date(new Date().setUTCHours(0, 0, 0, 0)), new Date(new Date().setUTCHours(23, 59, 59, 59))] }
            },
            {
                include: [
                    {
                        model: models.kiosk_case_patient_session,
                        as: 'patientSessions',
                        include: {
                            model: models.kiosk_case_patient_session_statuses,
                            as: 'visitStatus',
                            where: {
                                deleted_at: null,
                                slug: { [Op.in]: ['checked_in', 'in_session'] }
                            }
                        },
                        where: {
                            deleted_at: null
                        }
                    }
                ]
            }
        ));

        let isAlradyCheckedIn: boolean = false;

        if (checkInTodayAppointment && Object.keys(checkInTodayAppointment).length) {
            isAlradyCheckedIn = true;
        }

        const existingCasePatientSession: models.kiosk_case_patient_sessionI = this.shallowCopy(await this.__casePatientSessionRepo.findOne(
            {
                case_id: caseId
            },
            {
                include: [
                    {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        where: {
                            slug: 'walk_in'
                        }
                    }
                ],
            }
        ));

        const createAppointmentObject: typings.CreateAppointmentI = {
            sessionStatusId,
            undoAppointmentStatusId,
            formatDates,
            startDateTime,
            existingCasePatientSession,
            appointmentStatus,
            isAlradyCheckedIn,
            desiredTimeSlot,
            doctorId,
            specialityId,
            caseId,
            patientId,
            time_zone,
            confirmationStatus,
            appointmentType,
            speciality,
            appointmentTypeId,
            facilityLocationId,
            caseType,
            comments,
            priorityId,
            isSpecialityBase,
            isSoftRegistered,
            caseTypeId,
            slotsForThisAppointment,
            userId,
            physicianId,
            transportation,
            technicianId,
            cptCodes,
            readingProviderId,
            cdImage,
            isTransportation
        };

        const appointmentsObjs:typings.CreateAppointmentI[] = await this.multipleAppointmentsAgainstCptCode(createAppointmentObject);
        const result: any=[];
        for (let i=0;i<appointmentsObjs.length;++i){
            result.push(...await this.createAppointmentV1(appointmentsObjs[i],this.shallowCopy(appointmentsObjs),cptCodes,i, _authorization));
        }
        let message=await this.checkErrorMultipleCptAppointments(cptCodes, appointmentsObjs, true,doctorId,speciality);
        return {msg_alert_1:message,appointments:result}

       /**
        * original worker pool code
        * const pool: workerpool = workerpool.pool();
        * pool.proxy()
                    .then((): Promise<models.sch_appointmentsI[]> => this.createAppointmentV1(appointmentsObjs[i], _authorization))
                    .then((result: models.sch_appointmentsI[]): models.sch_appointmentsI[] => result)
                    .catch((err: typings.ANY): typings.ANY => {
                        pool.terminate();
                        console.log('err in pool', err);
                        throw err;
                    })
                    .then((result: models.sch_appointmentsI[]): models.sch_appointmentsI[] => {
                        console.log('terminated!');
                        pool.terminate(); // Terminate all workers when done
                        return result;
                    })
        */

    }
    private readonly getStartTimeToCreate = async (data: typings.GetStartTimeToCreateI): Promise<string>=>{
         
        const includeClause: typings.ANY = [
            {
                as: 'dateList',
                model: models.sch_recurrence_date_lists,
                required: true,
                where: {
                    deleted_at: null,
                    end_date: { [Op.gte]: data.appointmentEndTime },
                    start_date: { [Op.lte]: data.startDateTime }
                },
            },
            ...(data.specialityId && [{
                as: 'availableSpeciality',
                model: models.sch_available_specialities,
                required: true,
                where: {
                    speciality_id: data.specialityId,
                    deleted_at: null,
                }
            }])
        ];

        let getAvailableObj;
        if (!data.doctorId) {
            getAvailableObj = this.shallowCopy(await this.__availableSpecialityRepo.findOne(
                {
                    speciality_id: data.specialityId,
                    deleted_at: null
                },
                {
                    include: [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gte]: data.appointmentEndTime },
                                start_date: { [Op.lte]: data.startDateTime }
                            },
                        }
                    ]
                }
            ))
        }
        else {
            getAvailableObj = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                {
                    deleted_at: null,
                    doctor_id: data.doctorId,
                },
                {
                    include: includeClause
                }
            ));
        }
        const doctorFilter: typings.ANY = [];
        if (data.doctorId) {
            doctorFilter.push(
                {
                    as: 'availableDoctor',
                    model: models.sch_available_doctors,
                    required: true,
                    where: {
                        deleted_at: null,
                        doctor_id: data.doctorId
                    },
                }
            );
        }
        const getScheduledAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                deleted_at: null,
                pushed_to_front_desk: false,
                ...(!data.doctorId && {available_doctor_id:null}),
                ...(data.doctorId && {available_doctor_id:{[Op.not]: null}}),
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(data.startDateTime), data.time_zone), Sequelize.col('scheduled_date_time')), {
                        [Op.and]: [
                            {
                                [Op.gt]: -1
                            },
                            {
                                [Op.lt]: 1
                            }
                        ]
                    })
                ]
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: data.specialityId
                        }
                    },
                    ...doctorFilter
                ]

            }));
           
        const sameTimeLS = getScheduledAppointments.map((e) => {
            if (e.availableSpeciality.speciality_id == data.specialityId) {
                return new Date(e.scheduled_date_time).toISOString()
            }
        })
        const mapCounter = lodash.countBy(sameTimeLS)
        let slot = new Date(data.startDateTime)
        if (data.speciality?.over_booking) {
            while (true) {
                const isValidEndDate = new Date(slot)
                if ((new Date(getAvailableObj.dateList[0].end_date)).getTime() < isValidEndDate.setMinutes(isValidEndDate.getMinutes() + data.desiredTimeSlot)) {
                    return null
                }
                if (!(slot.toISOString() in mapCounter)) {
                    return slot.toISOString()
                }
                else {
                    if (mapCounter[slot.toISOString()] <= data.speciality.over_booking) {
                        return slot.toISOString()
                    }
                }
                slot = isValidEndDate
            }
        }
        else {
            while (true) {
                const isValidEndDate = new Date(slot)
                if ((new Date(getAvailableObj.dateList[0].end_date)).getTime() < isValidEndDate.setMinutes(isValidEndDate.getMinutes() + data.desiredTimeSlot)) {
                    return null
                }
                if (!(slot.toISOString() in mapCounter)) {
                    return slot.toISOString()
                }
                slot = isValidEndDate
            }
        }
    }
     /**
     *
     * @param data
     * @param _authorization
     */
    public createAppointmentWithCptCodess = async (data: typings.AddAppointmentWithCptCodesBodyI, _authorization: string) => {

        const getScheduledAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne({
            id: data.appointment_id
        },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableDoctor',
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'appointmentCptCodes',
                        model: models.sch_appointment_cpt_codes,
                        required: false,
                        where: {deleted_at:null}
                    },
                    {
                        as: 'appointmentType',
                        model: models.sch_appointment_types,
                        required: false,
                        where: { deleted_at: null },

                    },
                    {
                        as: 'caseType',
                        model: models.kiosk_case_types,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'transportations',
                        model: models.sch_transportations,
                        required: false,
                        where: { deleted_at: null }
                    }
                ]
            }
        ))
      
        let appointment1st = null
        let same = false
        if (getScheduledAppointment) {
            await this.__schAppointmentCptCodesRepo.updateByReferenceIds(
                {
                    appointment_id: getScheduledAppointment.id
                },
                {
                    deleted_at: new Date(),
                    updated_by: data.user_id
                }
            )

            if (!data.cpt_codes || !data.cpt_codes.length) {
                appointment1st = await this.shallowCopy(await this.__repo.findOne({ id: getScheduledAppointment.id }))
                const appoints=await this.shallowCopy(await this.getNewResponseforUpdateApis([appointment1st.id],getScheduledAppointment.availableSpeciality.speciality_id))
                return {msg_alert_1: "Updated Successfully!", appointments:appoints}
            }

            const objFromApnt = {
                appointmentStartTime: new Date(getScheduledAppointment.scheduled_date_time),
                appointmentEndTime: new Date(getScheduledAppointment.scheduled_date_time),
                desiredTimeSlot: getScheduledAppointment.time_slots,
                doctorId: getScheduledAppointment.availableDoctor?.doctor_id,
                specialityId: getScheduledAppointment.availableSpeciality.speciality_id,
                caseId: getScheduledAppointment.case_id,
                patientId: getScheduledAppointment.patient_id,
                confirmationStatus: getScheduledAppointment.confirmation_status ? 1 : 0,
                appointmentType: getScheduledAppointment.appointmentType,
                appointmentTypeId: getScheduledAppointment.type_id,
                facilityLocationId: getScheduledAppointment.availableSpeciality.facility_location_id,
                comments: getScheduledAppointment.comments,
                caseType: getScheduledAppointment.caseType.slug,
                priorityId: getScheduledAppointment.priority_id,
                isSpecialityBase: getScheduledAppointment.is_speciality_base,
                isSoftRegistered: getScheduledAppointment.is_soft_registered,
                caseTypeId: getScheduledAppointment.case_type_id,
                physicianId: getScheduledAppointment.physician_id,
                transportation: this.shallowCopy(getScheduledAppointment.transportations),
                technicianId: getScheduledAppointment.technician_id,
                time_zone: data.time_zone,
                userId: data.user_id,
                isTransportation: getScheduledAppointment.is_transportation,
                cdImages: getScheduledAppointment.cd_image
            }

            objFromApnt.appointmentEndTime.setMinutes(objFromApnt.appointmentEndTime.getMinutes() + getScheduledAppointment.time_slots);

            const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
                {
                    deleted_at: null,
                    id: objFromApnt.specialityId,
                },
                {
                    include: {
                        as: 'specialityVisitType',
                        model: models.speciality_visit_types,
                        where: {
                            appointment_type_id: getScheduledAppointment?.appointmentType?.id,
                            speciality_id: objFromApnt.specialityId
                        }
                    },
                }
            ));
            if (!speciality.is_multiple_visit && speciality.specialityVisitType[0].allow_multiple_cpt_codes) {
                const cptCodeData: models.sch_appointment_cpt_codesI[] = data.cpt_codes.map((billing_code_id): typings.ANY =>
                ({
                    billing_code_id,
                    appointment_id: getScheduledAppointment.id
                }));

                await this.__schAppointmentCptCodesRepo.bulkCreate(cptCodeData)
                appointment1st = await this.shallowCopy(await this.__repo.findOne({ id: getScheduledAppointment.id }))
                const appoints=await this.shallowCopy(await this.getNewResponseforUpdateApis([appointment1st.id],getScheduledAppointment.availableSpeciality.speciality_id))
                return {msg_alert_1:"Updated Successfully!", appointments:appoints}
            }

            let cptCode0 = this.shallowCopy(data.cpt_codes[0])
            if (cptCode0 == getScheduledAppointment.appointmentCptCodes[0]?.billing_code_id){
                same = true
            }

            await this.__schAppointmentCptCodesRepo.create(
                {
                    billing_code_id: data.cpt_codes[0],
                    appointment_id: getScheduledAppointment.id
                }
            )
            
            data.cpt_codes.shift()
            appointment1st = await this.shallowCopy(await this.__repo.findOne({ id: getScheduledAppointment.id }))
            if (!data.cpt_codes.length) {
                const cptCodesData: models.billing_codes = await this.__billingCodesRepo.findOne({
                    id: cptCode0
                })
                const appoints=await this.shallowCopy(await this.getNewResponseforUpdateApis([appointment1st.id],getScheduledAppointment.availableSpeciality.speciality_id))
                return {msg_alert_1:"Updated Successfully!", appointments:appoints}
                // return {msg_alert_1:" new appointmenCreatedt for CPT["+cptCodesData.name+"]", ...appointment1st}
            }

            const cptCodes = this.shallowCopy(data.cpt_codes);

            if (speciality.is_multiple_visit && speciality.specialityVisitType[0].allow_multiple_cpt_codes && !speciality.specialityVisitType[0].is_multiple_same_day){
                const cptCodesData: models.billing_codes[] = await this.__billingCodesRepo.findAll({
                    id: cptCodes
                });
                let errorMessage = ""
                if (!same){
                    errorMessage += "Updated Successfully! "
                }
                errorMessage += "Please select multiple on same day checkbox in specialty master to create appointments for "
                for(const [ index, code] of cptCodesData.entries()){   
                    errorMessage += code.name.toString()
                    if(index != cptCodesData.length-1){
                        if (cptCodesData.length-2==index){
                            errorMessage += " and "
                        }
                        else{   
                            errorMessage += ", "
                        }
                    }
                }
                errorMessage += "."
                throw errorMessage
            }
            
            const appointmentStatus: models.sch_appointment_statusesI[] = this.shallowCopy(await this.__appointmentStatusRepo.findAll(
                {
                    deleted_at: null,
                    slug: {
                        [Op.or]: ['scheduled', 'arrived']
                    },
                },
            ));
            const existingCasePatientSession: models.kiosk_case_patient_sessionI = this.shallowCopy(await this.__casePatientSessionRepo.findOne(
                {
                    case_id: objFromApnt.caseId
                },
                {
                    include: [
                        {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            where: {
                                slug: 'walk_in'
                            }
                        }
                    ],
                }
            ));


            const patientSessionIds: number[] = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findAll(
                {
                    deleted_at: null,
                    slug: { [Op.in]: ['checked_in', 'in_session'] }
                },
            )).map((o: models.kiosk_case_patient_session_statusesI): number => o.id);

            const isAlradyCheckedIn: boolean = this.shallowCopy(await this.__casePatientSessionRepo.findAll(
                {
                    appointment_id: { [Op.ne]: null },
                    case_id: objFromApnt.caseId,
                    date_of_check_in: `${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()}`,
                    deleted_at: null,
                    status_id: { [Op.in]: patientSessionIds }
                },
            )).length ? true : false;

            const { time_slot: specialityTimeSlot, } = speciality || {};
            const slotsForThisAppointment: number = objFromApnt.desiredTimeSlot ? objFromApnt.desiredTimeSlot / specialityTimeSlot : 1;

            const getTime = await this.getStartTimeToCreate({
                appointmentEndTime: objFromApnt.appointmentEndTime,
                startDateTime: objFromApnt.appointmentStartTime,
                specialityId: objFromApnt.specialityId,
                doctorId: objFromApnt.doctorId,
                caseId: objFromApnt.caseId,
                patientId: objFromApnt.patientId,
                time_zone: objFromApnt.time_zone,
                speciality,
                desiredTimeSlot: objFromApnt.desiredTimeSlot
            })
            let message = undefined;
            const result: any = []
            if (getTime) {
                const startDateTime = getTime
                const formatDates: Date[] = [new Date(startDateTime)];
                const createAppointmentObject: typings.CreateAppointmentI = {
                    formatDates,
                    startDateTime: formatDates[0].toISOString(),
                    existingCasePatientSession,
                    appointmentStatus,
                    isAlradyCheckedIn,
                    desiredTimeSlot: objFromApnt.desiredTimeSlot,
                    doctorId: objFromApnt.doctorId,
                    specialityId: objFromApnt.specialityId,
                    caseId: objFromApnt.caseId,
                    patientId: objFromApnt.patientId,
                    time_zone: objFromApnt.time_zone,
                    confirmationStatus: objFromApnt.confirmationStatus,
                    appointmentType: objFromApnt.appointmentType,
                    speciality,
                    appointmentTypeId: objFromApnt.appointmentTypeId,
                    facilityLocationId: objFromApnt.facilityLocationId,
                    caseType: objFromApnt.caseType,
                    comments: objFromApnt.comments,
                    priorityId: objFromApnt.priorityId,
                    isSpecialityBase: objFromApnt.isSpecialityBase,
                    isSoftRegistered: objFromApnt.isSoftRegistered,
                    caseTypeId: objFromApnt.caseTypeId,
                    slotsForThisAppointment,
                    userId: objFromApnt.userId,
                    physicianId: objFromApnt.physicianId,
                    transportation: objFromApnt.transportation,
                    technicianId: objFromApnt.technicianId,
                    isTransportation: objFromApnt.isTransportation,
                    cptCodes,
                    cdImage: objFromApnt.cdImages
                };
                const appointmentsObjs: typings.CreateAppointmentI[] = await this.multipleAppointmentsAgainstCptCode(createAppointmentObject,false)
                result.push(appointment1st);
                for (let i = 0; i < appointmentsObjs.length; ++i) {
                    result.push(...await this.createAppointmentV1(appointmentsObjs[i],appointmentsObjs,cptCodes,i,_authorization));
                }
                message = await this.checkErrorMultipleCptAppointments(cptCodes, appointmentsObjs,same,getScheduledAppointment.availableDoctor?.id,speciality);
            }
            else {
                message = await this.checkErrorMultipleCptAppointments(cptCodes, [],same,getScheduledAppointment.availableDoctor?.id,speciality);
            }
            const appoints=await this.shallowCopy(await this.getNewResponseforUpdateApis(result.map((e)=>{return e.id}),getScheduledAppointment.availableSpeciality.speciality_id))
            if (same){
                return {msg_alert_1:"", msg_alert_2: message,appointments:appoints}
            }
            return {msg_alert_1: "Updated Successfully!",msg_alert_2:message,appointments:appoints}
        }
        else {
            throw generateMessages('APPOINTMENT_NOT_FOUND');
        }
    }

    
    /**
     *
     * @param data
     * @param _authorization
     */
    public put = async (data: typings.UpdateAppointmentBodyI, _authorization: string, __transactions: Transaction): Promise<typings.ANY> => {

        const {
            id,
            appointment_title: appointmentTitle,
            confirmation_status: confirmationStatus,
            patient_id: patientId,
            comments,
            start_date_time: startDateTime,
            case_id: caseId,
            is_speciality_base: isSpecialityBase,
            appointment_type_id: appointmentTypeId,
            doctor_id: doctorId,
            facility_location_id: facilityLocationId,
            speciality_id: specialityId,
            time_slot: timeSlot,
            user_id: userId = Number(process.env.USERID),
            time_zone,
            physician_id: physicianId,
            technician_id: technicianId,
            transportation,
            cpt_codes: cptCodes
        } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id, {
            include: [
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses
                },
                {
                    as: 'availableDoctor',
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: false,
                    where: { deleted_at: null },
                },
            ]
        }));

        if (!appointment || !Object.keys(appointment).length) {

            throw generateMessages('NO_APPOINTMENT_OF_GIVEN_ID');

        }

        if (new Date(startDateTime).getTime() < new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()) {
            throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
        }

        const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

        const {
            appointmentStatus: { slug },
            evaluation_date_time: evaluationDateTime,
            available_doctor_id: availableDoctorId,
            availableSpeciality,
            availableDoctor
        } = appointment;

        if (slug === 'no_show') {

            throw generateMessages(`NO_SHOW_STATUS`);

        }

        if (evaluationDateTime) {

            throw generateMessages(`EVALUATION_ALREADY_STARTED`);

        }

        const caseInfo: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findOne(
            {
                id: caseId
            },
            {
                include: {
                    model: models.case_referrals,
                    as: 'case_referral',
                    where: {
                        deleted_at: null
                    }
                }
            }
        ));

        const { case_referral: { slug: caseReferralSlug } }: typings.ANY = caseInfo;

        if (!doctorId || (doctorId && specialityId)) {

            const patientSameDayAppointmentsForAvailableSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(startDateTime), time_zone), Sequelize.col('scheduled_date_time')), {
                            [Op.and]: [
                                {
                                    [Op.gt]: -1
                                },
                                {
                                    [Op.lt]: 1
                                }
                            ]
                        })
                    ]
                },
                {
                    include: {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityId
                        }
                    }
                }));

            const patientSameDayAppointmentsForAvailableDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(startDateTime), time_zone), Sequelize.col('scheduled_date_time')), {
                            [Op.and]: [
                                {
                                    [Op.gt]: -1
                                },
                                {
                                    [Op.lt]: 1
                                }
                            ]
                        })
                    ],
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                },
                {
                    include: {
                        as: 'availableDoctor',
                        include:
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include:
                            {
                                as: 'userFacilities',
                                model: models.user_facility,
                                required: true,
                                where: {
                                    deleted_at: null,
                                    speciality_id: specialityId
                                },
                            },
                            model: models.users,
                            required: true,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: true,
                        where: { deleted_at: null },
                    }
                }));

            if (patientSameDayAppointmentsForAvailableSpeciality || patientSameDayAppointmentsForAvailableDoctor) {
                throw generateMessages('PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY');
            }
        }

        const formatedSpecialityId: number = availableDoctorId ? await this.getSpecialityIdByDoctor(availableDoctor) : availableSpeciality.speciality_id;

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: formatedSpecialityId,
            }
        ));

        if (!speciality && !Object.keys(speciality).length) {
            throw generateMessages('NO_SPECIALITY_FOUND');
        }

        const requiredSlots: number = timeSlot / speciality.time_slot;

        const requiredSpeciality: models.specialitiesI = formatedSpecialityId === specialityId ? speciality : this.shallowCopy(await this.__specialityRepo.findById(specialityId));
        const requiredTimeSlots: number = requiredSlots * requiredSpeciality.time_slot;

        const last24Hrs: Date = new Date(startDateTime);
        const next24Hrs: Date = new Date(startDateTime);

        let last24HrsAppointment: models.sch_appointmentsI[];
        let next24HrsAppointment: models.sch_appointmentsI[];

        let appointmentEndTime: Date = new Date(startDateTime);
        appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + requiredTimeSlots);

        if (!confirmationStatus) {

            last24Hrs.setHours(last24Hrs.getHours() - 24);
            next24Hrs.setHours(next24Hrs.getHours() + 24);

            const appointmentFilter: typings.FilterI = {
                cancelled: false,
                case_id: caseId,
                deleted_at: null,
                id: { [Op.ne]: id },
                patient_id: patientId,
                pushed_to_front_desk: false,
            };

            last24HrsAppointment = this.shallowCopy(await this.__repo.findAll({
                ...appointmentFilter,
                scheduled_date_time: { [Op.between]: [last24Hrs, startDateTime] },
            }));

            next24HrsAppointment = this.shallowCopy(await this.__repo.findOne(
                {
                    ...appointmentFilter,
                    scheduled_date_time: { [Op.and]: [{ [Op.gt]: new Date(startDateTime) }, { [Op.lt]: next24Hrs }] },
                },
                {
                    limit: 1,
                    order: [
                        ['scheduled_date_time', 'ASC']
                    ]
                }
            ));

            const lastAppointments: models.sch_appointmentsI[] = last24HrsAppointment?.filter((u: models.sch_appointmentsI): models.sch_appointmentsI => {

                const checkkEndTimeForAppointment: Date = new Date(u.scheduled_date_time);
                checkkEndTimeForAppointment?.setMinutes(checkkEndTimeForAppointment?.getMinutes() + u.time_slots);

                if (new Date(startDateTime).getDate() < checkkEndTimeForAppointment.getDate()) {
                    return u;
                }
            });

            if (lastAppointments?.length || (next24HrsAppointment?.length && new Date(next24HrsAppointment[0].scheduled_date_time).getTime() < new Date(appointmentEndTime).getTime())) {
                throw generateMessages('PATIENT_ALREADY_HAVE_ASSIGNMENT');
            }
        }

        let initialDone: boolean = false;
        let initialDoneBefore: boolean = false;

        const findInitialIncludeClause: { [key: string]: typings.ANY } = {
            include: [
                {
                    as: 'availableDoctor',
                    include:
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        include:
                        {
                            as: 'userFacilities',
                            model: models.user_facility,
                            required: false,
                            where: {
                                deleted_at: null,
                                speciality_id: specialityId
                            },
                        },
                        model: models.users,
                        required: true,
                        where: { deleted_at: null },
                    },
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: false,
                    where: { deleted_at: null, speciality_id: specialityId },
                },
            ]
        };

        const findInitialWhereFilter: typings.InitialWhereFilterI = {
            cancelled: false,
            case_id: caseId,
            deleted_at: null,
            id: { [Op.ne]: id },
            patient_id: patientId,
            pushed_to_front_desk: false,
            type_id: appointmentType.id,
        };

        const initialAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({ ...findInitialWhereFilter }, { ...findInitialIncludeClause }));

        const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

        const initialAppointment: models.sch_appointmentsI = initialAppointments.find((app: models.sch_appointmentsI): typings.ANY => (app.availableSpeciality || app.availableDoctor?.doctor?.userFacilities.length) && app.status_id !== noShowId);

        if (initialAppointment && Object.keys(initialAppointment).length && (initialAppointment.availableSpeciality || initialAppointment.availableDoctor?.doctor?.userFacilities)) {

            const {

                available_doctor_id: initialAvailableDoctorId,
                availableDoctor: initialAvailableDoctor,
                scheduled_date_time: scheduledDateTime,
                availableSpeciality: initialAvailableSpeciality,
                time_slots: initialTimeSlots,
            }: models.sch_appointmentsI = { ...initialAppointment };

            if (!initialAvailableDoctorId) {

                initialDone = (initialAvailableSpeciality.speciality_id === specialityId && appointment.appointmentStatus.slug !== 'no_show') ? true : false;
                const endTimeOfAppointment: Date = new Date(scheduledDateTime);
                endTimeOfAppointment.setMinutes(endTimeOfAppointment.getMinutes() + initialTimeSlots);

                if (endTimeOfAppointment.getTime() <= new Date(startDateTime).getTime() && initialDone) {
                    initialDoneBefore = true;
                }

            } else {

                const specialityIds: number[] = initialAvailableDoctor?.doctor?.userFacilities?.map((a: models.user_facilityI): number => a?.speciality_id);
                const checkSpecialityId: boolean = specialityIds?.includes(specialityId);

                initialDone = (checkSpecialityId && appointment.appointmentStatus.slug !== 'no_show') ? true : false;

                const endTimeOfAppointment: Date = new Date(scheduledDateTime);
                endTimeOfAppointment.setMinutes(endTimeOfAppointment.getMinutes() + initialTimeSlots);

                if (endTimeOfAppointment.getTime() <= new Date(startDateTime).getTime() && initialDone) {
                    initialDoneBefore = true;
                }
            }
        }

        if (appointmentTypeId === appointmentType.id && initialDone && caseReferralSlug != 'green_bills') {
            throw generateMessages('PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT');
        }

        if (appointmentTypeId !== appointmentType.id && !initialDone && caseReferralSlug != 'green_bills') {
            throw generateMessages('NO_INITIAL_EVALUATION_ASSIGNMENT');
        }

        if (appointmentTypeId !== appointmentType.id) {

            const checkNonInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                    type_id: appointmentType.id,
                },
                {
                    include:
                    {
                        as: 'availableDoctor',
                        include:
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include:
                            {
                                as: 'userFacilities',
                                model: models.user_facility,
                                required: true,
                                where: {
                                    deleted_at: null,
                                    speciality_id: specialityId
                                },
                            },
                            model: models.users,
                            required: true,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: true,
                        where: { deleted_at: null },
                    },
                }
            ));

            const checkNonInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                    type_id: appointmentType.id,
                },
                {
                    include:
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        where: { deleted_at: null, speciality_id: specialityId },
                    },
                }
            ));

            if ((checkNonInitialAppointmentAgainstSpeciality || checkNonInitialAppointmentAgainstDoctor) && caseReferralSlug != 'green_bills') {

                throw generateMessages('NO_RESCHEDULED_INTIAL_APPONTMENT');

            }

        } else {

            const checkInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                    type_id: { [Op.ne]: appointmentType.id },
                },
                {
                    include:
                    {
                        as: 'availableDoctor',
                        include:
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include:
                            {
                                as: 'userFacilities',
                                model: models.user_facility,
                                required: true,
                                where: {
                                    deleted_at: null,
                                    speciality_id: specialityId
                                },
                            },
                            model: models.users,
                            required: true,
                            where: { deleted_at: null },
                        },
                        model: models.sch_available_doctors,
                        required: true,
                        where: { deleted_at: null },
                    },
                }
            ));

            const checkInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                    type_id: { [Op.ne]: appointmentType.id },
                },
                {
                    include:
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        where: { deleted_at: null, speciality_id: specialityId },
                    },
                }
            ));

            if ((checkInitialAppointmentAgainstSpeciality || checkInitialAppointmentAgainstDoctor) && caseReferralSlug != 'green_bills') {

                throw generateMessages('NO_RESCHEDULED_APPOINTMENT');

            }

        }

        if ((appointmentTypeId === appointmentType.id && !initialDone) || (appointmentTypeId !== appointmentType.id && initialDone)) {

            let checkForInitial: boolean = false;

            if (!initialDone) {

                const checkAppointment: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                    {
                        cancelled: false,
                        case_id: appointment.case_id,
                        deleted_at: null,
                        id: { [Op.ne]: id },
                        patient_id: appointment.patient_id,
                        pushed_to_front_desk: false,
                        scheduled_date_time: { [Op.gte]: startDateTime },
                        type_id: { [Op.ne]: appointmentType.id }
                    },
                    {
                        include: [
                            {
                                as: 'availableDoctor',
                                attributes: { exclude: ['password'] },
                                include:
                                {
                                    as: 'doctor',
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
                                model: models.sch_available_doctors,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null },
                            },
                        ]
                    }));

                if (!checkAppointment || !checkAppointment.length) {
                    checkForInitial = true;
                } else {

                    let specialityCheck: boolean = false;
                    const requiredCheck: models.sch_appointmentsI = checkAppointment.find((z: models.sch_appointmentsI): models.sch_appointmentsI => {

                        const {

                            available_doctor_id: newAvailableDoctorId,
                            availableDoctor: newAvailableDoctor,
                            scheduled_date_time: scheduledDateTime,
                            availableSpeciality: newAvailableSpeciality,
                            time_slots: initialTimeSlots,
                        }: models.sch_appointmentsI = z;

                        if (!newAvailableDoctorId) {

                            if (newAvailableSpeciality?.speciality_id === formatedSpecialityId) {

                                const endTimeOfAppointment: Date = new Date(scheduledDateTime);
                                endTimeOfAppointment.setMinutes(endTimeOfAppointment.getMinutes() + timeSlot);

                                checkForInitial = true;
                                specialityCheck = true;

                                if (endTimeOfAppointment.getTime() > new Date(z.scheduled_date_time).getTime()) {
                                    checkForInitial = false;
                                }
                                return z;
                            }

                        } else {

                            const req: models.user_facilityI = newAvailableDoctor?.doctor?.userFacilities?.find((o: models.user_facilityI): models.user_facilityI => {
                                if (o.speciality_id === formatedSpecialityId) {

                                    const endAppointment: Date = new Date(scheduledDateTime);
                                    endAppointment.setMinutes(endAppointment.getMinutes() + timeSlot);

                                    checkForInitial = true;
                                    specialityCheck = true;

                                    if (endAppointment.getTime() > new Date(z.scheduled_date_time).getTime()) {
                                        checkForInitial = false;
                                    }

                                    return o;

                                }
                            });

                        }

                        if (!specialityCheck) {
                            checkForInitial = true;
                        }
                    });

                }

            } else if (initialDone && initialDoneBefore) {
                checkForInitial = true;
            }

            if (!checkForInitial && caseReferralSlug != 'green_bills') {
                throw generateMessages('APPOINTMENT_MUST_END_BEFORE_PROGRESS');
            }

            const otherAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
                case_id: caseId,
                deleted_at: null,
                id: { [Op.ne]: id },
                patient_id: patientId,
                scheduled_date_time: { [Op.gt]: startDateTime },
                type_id: { [Op.ne]: appointmentType.id },
            }));

            const timeChecks: boolean[] = otherAppointments.map((o: models.sch_appointmentsI): boolean => {

                const endTimeOfAppointment: Date = new Date(startDateTime);
                endTimeOfAppointment.setMinutes(endTimeOfAppointment.getMinutes() + requiredTimeSlots);

                if (endTimeOfAppointment.getTime() > new Date(o.scheduled_date_time).getTime()) {
                    return false;
                }

                return true;
            });

            if (timeChecks.includes(false) && caseReferralSlug != 'green_bills') {
                throw generateMessages('APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION');
            }

        }

        const whereClause: { [key: string]: number } = { facility_location_id: facilityLocationId, deleted_at: null };

        if (!doctorId) {
            whereClause.speciality_id = specialityId;
        } else {
            whereClause.doctor_id = doctorId;
        }

        const methodCheck: string = doctorId ? 'doctor' : 'speciality';

        const joinClause: { [key: string]: typings.ANY } = {
            include: {
                as: 'dateList',
                model: models.sch_recurrence_date_lists,
                required: true,
                where: {
                    deleted_at: null,
                    end_date: { [Op.gte]: new Date(appointmentEndTime) },
                    start_date: { [Op.lte]: new Date(startDateTime) },
                },
            }
        };

        const getAssignments: typings.ANY = this.shallowCopy(await this[this.__getAssigmentMethod[`${methodCheck}`]].findAll(
            { ...whereClause },
            {
                ...joinClause,
                ...(doctorId && [{
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: true,
                    where: {
                        speciality_id: specialityId,
                        deleted_at: null,
                    }
                }])
            }
        ));

        if (!getAssignments || !getAssignments.length) {
            throw generateMessages('NO_ASSIGNMENT_FOUND');
        }

        const requiredAssignmentArray: typings.AssignmentObjectForSlots[] = getAssignments.map((i: typings.ANY): typings.AssignmentObjectForSlots[] => {
            const { dateList } = i;

            return dateList?.map((d: models.sch_recurrence_date_listsI): typings.AssignmentObjectForSlots => ({

                available_speciality_id: i?.available_speciality_id,
                date_list_id: d?.id,
                end_date: d?.end_date,
                id: i?.id,
                no_of_doctors: d?.no_of_doctors,
                no_of_slots: d?.no_of_slots,
                start_date: d?.start_date,

            }));

        }).flat();

        const assignmentTimeSlot: number = this.getTimeSlotOfAssignment(requiredAssignmentArray[0]);

        appointmentEndTime = new Date(startDateTime);
        appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + assignmentTimeSlot * requiredSlots);

        const { start_date: startDateFromDateList, end_date: endDateFromDateList, id: availabilityId } = requiredAssignmentArray[0];

        const otherAppointmentsOnThisTime: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                id: { [Op.ne]: id },
                scheduled_date_time: { [Op.between]: { startDateFromDateList, endDateFromDateList } },
                [Op.or]: [
                    { available_doctor_id: availabilityId },
                    { available_speciality_id: availabilityId },
                ]
            }
        ));

        const freeSlotsForAppointments: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(requiredAssignmentArray[0], otherAppointmentsOnThisTime, requiredSpeciality.over_booking + 1, requiredSpeciality.time_slot, 1);

        const freeSlot: typings.FreeSlotsI = freeSlotsForAppointments?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

            const slotStart: Date = new Date(s.startDateTime);
            const slotEnd: Date = new Date(s.startDateTime);

            slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlot);

            if (slotStart.getTime() <= new Date(startDateTime).getTime() && new Date(startDateTime).getTime() < slotEnd.getTime()) {
                if (s.count > 0) {
                    return s;
                }
            }

        });

        if (!freeSlot || !Object.keys(freeSlot).length) {
            throw generateMessages('NO_SLOTS_REMAINING');
        }

        const { id: appointmentStatusId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({
            deleted_at: null,
            slug: 're_scheduled'
        }));

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (specialityId !== appointment?.availableSpeciality?.speciality_id || doctorId !== appointment?.availableDoctor?.doctor_id) {

            const deletedAppointments = await this.getAppointmentById({ appointment_id: [id], user_id: null }, _authorization);
            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: [id] }, config);

        }

        const updatedApointment: models.sch_appointmentsI = await this.__repo.update(
            id,
            {
                appointment_title: appointmentTitle,
                available_doctor_id: methodCheck === 'doctor' ? getAssignments[0].id : null,
                available_speciality_id: methodCheck === 'speciality' ? getAssignments[0].id : requiredAssignmentArray[0]?.available_speciality_id,
                comments,
                confirmation_status: confirmationStatus,
                date_list_id: getAssignments[0]?.dateList[0]?.id,
                is_speciality_base: isSpecialityBase,
                physician_id: physicianId,
                technician_id: technicianId,
                scheduled_date_time: new Date(startDateTime),
                status_id: appointmentStatusId,
                time_slots: assignmentTimeSlot * requiredSlots,
                type_id: appointmentTypeId,
                updated_at: new Date(),
                updated_by: userId,
            },
            __transactions
        );

        const createdTransportations: typings.ANY = [];
        const updatedTransportations: typings.ANY = [];

        if (transportation && transportation.length) {

            for (const trans of transportation) {

                const {
                    id,
                    is_deleted,
                } = trans;

                if (!id) {
                    createdTransportations.push(
                        {
                            appointment_id: updatedApointment.id,
                            ...trans,
                        }
                    );
                } else if (id && is_deleted) {
                    updatedTransportations.push(
                        {
                            ...trans,
                            deleted_at: new Date(),
                        }
                    );
                } else if (id) {
                    updatedTransportations.push(
                        {
                            ...trans
                        }
                    );
                }
            }

            this.shallowCopy(await this.__transportationsRepo.bulkCreate(createdTransportations, __transactions));
            this.shallowCopy(await this.__transportationsRepo.bulkUpdate(updatedTransportations, __transactions, null, ['is_pickup', 'is_dropoff', 'type', 'comments', 'street_address', 'suit', 'city', 'state', 'zip', 'deleted_at']));

        }

        const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                id: updatedApointment.id
            },
            {
                include: [
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'caseType',
                        model: models.kiosk_case_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                ]
            }
        ));

        const endTime: Date = new Date(newAppointment.scheduled_date_time);
        endTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);

        const contactPersonType: models.kiosk_contact_person_typesI = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));

        const selfContactPerson: models.kiosk_contact_personI = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
            case_id: newAppointment.case_id,
            contact_person_type_id: contactPersonType.id,
            deleted_at: null
        }));

        if (selfContactPerson && selfContactPerson.email) {
            // tslint:disable-next-line: no-floating-promises
            this.sentEmailForAppointment({
                appointmentId: newAppointment.id,
                appointmentStatus: newAppointment.appointmentStatus.name,
                caseId: newAppointment.case_id,
                caseType: newAppointment.caseType.name,
                confirmationStatus: newAppointment.confirmation_status,
                email: selfContactPerson.email,
                emailTitle: 'Update Appointment',
                endDateTime: new Date(endTime),
                patientLastName: newAppointment.patient.last_name,
                reason: 'updated',
                scheduledDateTime: new Date(newAppointment.scheduled_date_time),
                timeSlot: newAppointment.time_slots,
            });
        }

        // tslint:disable-next-line: no-floating-promises
        this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [newAppointment.id], email_title: 'Appointment Updated' }, config);

        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [newAppointment.id], user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);
        const patientSessionStatus: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, {
            ...config, params: { slug: 're_scheduled' }
        }));

        const { result: { data: responseDataForPatient } } = patientSessionStatus || {};

        await this.__http.put(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: responseDataForPatient[0]?.id, appointment_id: id, trigger_socket: true }, config);

        return updatedApointment;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public putV1 = async (data: typings.UpdateAppointmentBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            id,
            appointment_title: appointmentTitle,
            confirmation_status: confirmationStatus,
            patient_id: patientId,
            comments,
            start_date_time: startDateTime,
            case_id: caseId,
            is_speciality_base: isSpecialityBase,
            appointment_type_id: appointmentTypeId,
            doctor_id: doctorId,
            facility_location_id: facilityLocationId,
            speciality_id: specialityId,
            time_slot: timeSlot,
            user_id: userId,
            time_zone,
            physician_id: physicianId,
            technician_id: technicianId,
            transportation,
            cpt_codes: cptCodes,
            reading_provider_id: readingProviderId,
            cd_image: cdImage,
            is_transportation: isTransportation
        } = data;
        const __transactions = await sequelize.transaction();
        
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };
        let appointmentObj: any = {};

        try {

            if (!specialityId) {
                throw generateMessages('SPECIALITY_REQUIRED');
            }

            if (!facilityLocationId) {
                throw generateMessages('FACILITY_REQUIRED');
            }

            const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id, {
                include: [
                    {
                        as: 'appointmentStatus',
                        model: models.sch_appointment_statuses
                    },
                    {
                        as: 'availableDoctor',
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        model: models.sch_appointment_types,
                        as: 'appointmentType',
                        required: false,
                        where: { deleted_at: null }
                    }
                ]
            }));

            if (!appointment || !Object.keys(appointment).length) {

                throw generateMessages('NO_APPOINTMENT_OF_GIVEN_ID');

            }

            // if (new Date(startDateTime).getTime() < new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()) {
            //     throw generateMessages('APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE');
            // }

            const appointmentType: models.sch_appointment_typesI = this.shallowCopy(await this.__appoitmentTypeRepo.findOne({ slug: 'initial_evaluation' }));

            const {
                appointmentStatus: { slug },
                evaluation_date_time: evaluationDateTime,
                available_doctor_id: availableDoctorId,
                availableSpeciality,
                availableDoctor
            } = appointment;

            if (slug === 'no_show') {
                throw generateMessages(`NO_SHOW_STATUS`);
            }

            if (evaluationDateTime) {
                throw generateMessages(`EVALUATION_ALREADY_STARTED`);
            }

            const { is_transferring_case: isTransferringCase }: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findOne(
                {
                    id: caseId
                },
                {
                    attributes: ['is_transferring_case']
                }
            ));

            let checkSameDayAppointmentAllowed: Boolean = false;

            if (!doctorId || (doctorId && specialityId)) {

                const doctorFilter: typings.ANY = [];
                if (doctorId) {
                    doctorFilter.push(
                        {
                            as: 'availableDoctor',
                            model: models.sch_available_doctors,
                            required: false,
                            where: { deleted_at: null },
                        }
                    );
                }

                const sameAppointmentChecks: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                    {
                        id: { [Op.ne]: id },
                        cancelled: false,
                        case_id: caseId,
                        deleted_at: null,
                        patient_id: patientId,
                        pushed_to_front_desk: false,
                        [Op.and]: [
                            Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(startDateTime), time_zone), Sequelize.col('scheduled_date_time')), {
                                [Op.and]: [
                                    {
                                        [Op.gt]: -1
                                    },
                                    {
                                        [Op.lt]: 1
                                    }
                                ]
                            })
                        ]
                    },
                    {
                        include: [
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            },
                            ...doctorFilter
                        ]
                    }));
                    
                const speciality: models.specialities = this.shallowCopy(await this.__specialityRepo.findOne(
                    {
                        deleted_at: null,
                        id: specialityId,
                    }
                ));
                if (specialityId) {
                    const speciality: models.specialities = this.shallowCopy(await this.__specialityRepo.findOne(
                        {
                            deleted_at: null,
                            id: specialityId,
                        }
                    ));
                    if (!speciality.is_create_appointment && !doctorId) {
                        throw Error(`Selected speciality doesn't allow appointments to be created`);
                    }
                }
                for (const singleSpeciality of sameAppointmentChecks) {

                    const { scheduled_date_time, time_slots } = singleSpeciality;
                    const currentDateTime: Date = new Date(startDateTime);
                    const existingDateTime: Date = new Date(scheduled_date_time);
                    const existingDateTimeWithTimeSlot: Date = new Date(existingDateTime.getTime() + (time_slots * 60000));

                    if (singleSpeciality?.availableSpeciality?.speciality_id == specialityId && currentDateTime.getDay() === existingDateTime.getDay()) {
                        checkSameDayAppointmentAllowed = true
                    }

                    if (specialityId == singleSpeciality?.availableSpeciality?.speciality_id && currentDateTime.getTime() === existingDateTime.getTime()  && !speciality.over_booking) {
                        throw generateMessages('SAME_TIME_APPOINTMENT_ERROR');
                    }

                    if ((currentDateTime.getTime() >= existingDateTime.getTime() && currentDateTime.getTime() < existingDateTimeWithTimeSlot.getTime() && !speciality.over_booking)) {
                        throw generateMessages('TIME_SLOTS_ISSUE');
                    }
                }
            }

            const formatedSpecialityId: number = availableSpeciality.speciality_id;

            const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
                {
                    deleted_at: null,
                    id: formatedSpecialityId,
                },
                {
                    include:[
                        {
                            as: "specialityVisitType",
                            model: models.speciality_visit_types,
                            where:{
                                speciality_id: formatedSpecialityId,
                                appointment_type_id: appointmentTypeId,
                                deleted_at: null
                            }
                        }
                    ]
                }
            ));

            if (!speciality && !Object.keys(speciality).length) {
                throw generateMessages('NO_SPECIALITY_FOUND');
            }
            // const givenTime = this.convertDateToLocal(new Date(startDateTime), time_zone)
            if(new Date(appointment.scheduled_date_time).getTime() != new Date(startDateTime).getTime()){
                const appointmentEndTime = new Date(startDateTime);
                appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + timeSlot); 
                await this.checkIsThisTimeFreeOrNot(
                    {
                        appointmentEndTime: appointmentEndTime,
                        startDateTime: new Date(startDateTime),
                        specialityId: specialityId,
                        doctorId: doctorId,
                        caseId: caseId,
                        patientId: patientId,
                        time_zone: time_zone,
                        speciality,
                        desiredTimeSlot: timeSlot
          
                    }
                )
            }
            
            const requiredSlots: number = timeSlot / speciality.time_slot;

            const requiredSpeciality: models.specialitiesI = formatedSpecialityId === specialityId ? speciality : this.shallowCopy(await this.__specialityRepo.findById(specialityId));
            const requiredTimeSlots: number = requiredSlots * requiredSpeciality.time_slot;

            const last24Hrs: Date = new Date(startDateTime);
            const next24Hrs: Date = new Date(startDateTime);

            let last24HrsAppointment: models.sch_appointmentsI[];
            let next24HrsAppointment: models.sch_appointmentsI[];

            let appointmentEndTime: Date = new Date(startDateTime);
            appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + requiredTimeSlots);

            if (!confirmationStatus) {

                last24Hrs.setHours(last24Hrs.getHours() - 24);
                next24Hrs.setHours(next24Hrs.getHours() + 24);

                const appointmentFilter: typings.FilterI = {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                };

                last24HrsAppointment = this.shallowCopy(await this.__repo.findAll({
                    ...appointmentFilter,
                    scheduled_date_time: { [Op.between]: [last24Hrs, startDateTime] },
                }));

                next24HrsAppointment = this.shallowCopy(await this.__repo.findOne(
                    {
                        ...appointmentFilter,
                        scheduled_date_time: { [Op.and]: [{ [Op.gt]: new Date(startDateTime) }, { [Op.lt]: next24Hrs }] },
                    },
                    {
                        limit: 1,
                        order: [
                            ['scheduled_date_time', 'ASC']
                        ]
                    }
                ));

                const lastAppointments: models.sch_appointmentsI[] = last24HrsAppointment?.filter((u: models.sch_appointmentsI): models.sch_appointmentsI => {

                    const checkkEndTimeForAppointment: Date = new Date(u.scheduled_date_time);
                    checkkEndTimeForAppointment?.setMinutes(checkkEndTimeForAppointment?.getMinutes() + u.time_slots);

                    if (new Date(startDateTime).getDate() < checkkEndTimeForAppointment.getDate()) {
                        return u;
                    }
                });

                if(!speciality.specialityVisitType[0].is_multiple_same_day){
                    if (lastAppointments?.length || (next24HrsAppointment?.length && new Date(next24HrsAppointment[0].scheduled_date_time).getTime() < new Date(appointmentEndTime).getTime())) {
                        throw generateMessages('PATIENT_ALREADY_HAVE_ASSIGNMENT');
                    }
                }
            }
            
            const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

            const visitMap: typings.ANY = { caseId, patientId, appointmentTypeId, specialityId, noShowId, config };

            await this.checkVisitTypes(visitMap, isTransferringCase, checkSameDayAppointmentAllowed, appointment);

            if(!speciality.specialityVisitType[0].is_multiple_same_day){
                if (appointmentTypeId !== appointmentType.id) {

                    const checkNonInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            id: { [Op.ne]: id },
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                            scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                            type_id: appointmentType.id,
                        },
                        {
                            include: [
                                {
                                    as: 'availableDoctor',
                                    include:
                                    {
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        model: models.users,
                                        required: true,
                                        where: { deleted_at: null },
                                    },
                                    model: models.sch_available_doctors,
                                    required: true,
                                    where: { deleted_at: null },
                                },
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        speciality_id: specialityId,
                                        deleted_at: null,
                                    }
                                },
                            ]
                        }
                    ));

                    const checkNonInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            id: { [Op.ne]: id },
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                            scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                            type_id: appointmentType.id,
                        },
                        {
                            include:
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                where: { deleted_at: null, speciality_id: specialityId },
                            },
                        }
                    ));
                    if (checkNonInitialAppointmentAgainstSpeciality || checkNonInitialAppointmentAgainstDoctor) {

                        throw generateMessages('NO_RESCHEDULED_INTIAL_APPONTMENT');

                    }

                } else {

                    const checkInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            id: { [Op.ne]: id },
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                            scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                            type_id: { [Op.ne]: appointmentType.id },
                        },
                        {
                            include: [
                                {
                                    as: 'availableDoctor',
                                    include: [
                                        {
                                            as: 'doctor',
                                            attributes: { exclude: ['password'] },
                                            model: models.users,
                                            required: true,
                                            where: { deleted_at: null },
                                        },
                                        {
                                            as: 'availableSpeciality',
                                            include: {
                                                as: 'speciality',
                                                model: models.specialities,
                                                required: true,
                                                where: { deleted_at: null },
                                            },
                                            model: models.sch_available_specialities,
                                            required: true,
                                            where: { deleted_at: null, speciality_id: specialityId }
                                        },
                                    ],
                                    model: models.sch_available_doctors,
                                    required: true,
                                    where: { deleted_at: null },
                                },
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        speciality_id: specialityId,
                                        deleted_at: null,
                                    }
                                },
                            ]
                        }
                    ));

                    const checkInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            id: { [Op.ne]: id },
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                            scheduled_date_time: { [Op.between]: [new Date(appointment.scheduled_date_time), new Date(startDateTime)] },
                            type_id: { [Op.ne]: appointmentType.id },
                        },
                        {
                            include:
                            {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                where: { deleted_at: null, speciality_id: specialityId },
                            },
                        }
                    ));

                    if (checkInitialAppointmentAgainstSpeciality || checkInitialAppointmentAgainstDoctor) {

                        throw generateMessages('NO_RESCHEDULED_APPOINTMENT');

                    }
                }
            }
            const whereClause: { [key: string]: number } = { facility_location_id: facilityLocationId, deleted_at: null };
            const availableSpecailityFilter: typings.ANY = [];

            if (!doctorId) {
                whereClause.speciality_id = specialityId;
            } else {
                whereClause.doctor_id = doctorId;
                availableSpecailityFilter.push({
                    as: 'availableSpeciality',
                    include: {
                        as: 'speciality',
                        model: models.specialities,
                        required: true,
                        where: { deleted_at: null },
                    },
                    model: models.sch_available_specialities,
                    required: true,
                    where: { deleted_at: null, speciality_id: specialityId }
                }
                );

                const unavailability: typings.ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
                    [Op.or]: [
                        {
                            [Op.and]: [
                                {
                                    approval_status: 1,
                                    deleted_at: null,
                                    doctor_id: doctorId,
                                    end_date: { [Op.gt]: new Date(appointmentEndTime) },
                                    start_date: { [Op.lte]: new Date(startDateTime) }
                                }
                            ]
                        },
                        {
                            [Op.and]: [
                                {
                                    approval_status: 1,
                                    deleted_at: null,
                                    doctor_id: doctorId,
                                    end_date: { [Op.lte]: new Date(appointmentEndTime), [Op.gte]: new Date(startDateTime) }
                                }
                            ]
                        }
                    ]
                }));

                if (unavailability && Object.keys(unavailability).length) {
                    throw generateMessages('NO_PROVIDER_AVAILABLE');
                }
            }

            const methodCheck: string = doctorId ? 'doctor' : 'speciality';

            const joinClause: { [key: string]: typings.ANY } = {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            end_date: { [Op.gte]: new Date(appointmentEndTime) },
                            start_date: { [Op.lte]: new Date(startDateTime) },
                        },
                    },
                    ...availableSpecailityFilter
                ]
            };
            const getAssignments: typings.ANY = this.shallowCopy(await this[this.__getAssigmentMethod[`${methodCheck}`]].findAll(
                { ...whereClause },
                { ...joinClause }
            ));    
            if (!getAssignments || !getAssignments.length) {
                throw generateMessages('NO_ASSIGNMENT_FOUND');
            }

            const requiredAssignmentArray: typings.AssignmentObjectForSlots[] = getAssignments.map((i: typings.ANY): typings.AssignmentObjectForSlots[] => {
                const { dateList } = i;

                return dateList?.map((d: models.sch_recurrence_date_listsI): typings.AssignmentObjectForSlots => ({

                    available_speciality_id: i?.available_speciality_id,
                    date_list_id: d?.id,
                    end_date: d?.end_date,
                    id: i?.id,
                    no_of_doctors: d?.no_of_doctors,
                    no_of_slots: d?.no_of_slots,
                    start_date: d?.start_date,

                }));

            }).flat();

            const assignmentTimeSlot: number = this.getTimeSlotOfAssignment(requiredAssignmentArray[0]);

            appointmentEndTime = new Date(startDateTime);
            appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + assignmentTimeSlot * requiredSlots);

            const { start_date: startDateFromDateList, end_date: endDateFromDateList, id: availabilityId } = requiredAssignmentArray[0];

            const otherAppointmentsOnThisTime: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                {
                    deleted_at: null,
                    id: { [Op.ne]: id },
                    scheduled_date_time: { [Op.between]: { startDateFromDateList, endDateFromDateList } },
                    [Op.or]: [
                        { available_doctor_id: availabilityId },
                        { available_speciality_id: availabilityId },
                    ]
                }
            ));

            const freeSlotsForAppointments: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(requiredAssignmentArray[0], otherAppointmentsOnThisTime, requiredSpeciality.over_booking + 1, requiredSpeciality.time_slot, 1);

            const freeSlot: typings.FreeSlotsI = freeSlotsForAppointments?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                const slotStart: Date = new Date(s.startDateTime);
                const slotEnd: Date = new Date(s.startDateTime);

                slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlot);

                if (slotStart.getTime() <= new Date(startDateTime).getTime() && new Date(startDateTime).getTime() < slotEnd.getTime()) {
                    if (s.count > 0) {
                        return s;
                    }
                }

            });

            if (!freeSlot || !Object.keys(freeSlot).length) {
                throw generateMessages('NO_SLOTS_REMAINING');
            }

            const { id: appointmentStatusId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({
                deleted_at: null,
                slug: 're_scheduled'
            }));


            appointmentObj = { config };

            const specialityInfo: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.FRONT_DESK_URL}single_speciality`, { ...config, params: { id: specialityId } }));

            const { result: { data: { visit_types } } } = specialityInfo;

            const { appointmentType: { id: currentAppointmentTypeId } } = appointment;

            if (currentAppointmentTypeId != appointmentTypeId && !isTransferringCase) {

                let currentVisitType: typings.ANY;
                let updateVisitType: typings.ANY;

                for (const singleVisitType of visit_types) {

                    const { id: visit_type_id } = singleVisitType;

                    if (currentAppointmentTypeId === visit_type_id) {
                        currentVisitType = singleVisitType;
                    }

                    if (appointmentTypeId === visit_type_id) {
                        updateVisitType = singleVisitType;
                    }

                }

                if (!updateVisitType) {
                    throw generateMessages('CHECK_MASTER_VISIT_TYPE');
                }

                if (currentVisitType && currentVisitType.position > updateVisitType.position) {
                    const tempVisitType = updateVisitType;
                    updateVisitType = currentVisitType;
                    currentVisitType = tempVisitType;
                }

                if (currentVisitType && currentVisitType.is_required) {

                    const count = this.shallowCopy(await this.__repo.count(
                        'id',
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            patient_id: patientId,
                            type_id: currentVisitType.id,
                            pushed_to_front_desk: false,
                        }
                    ));

                    if (count === 1) {

                        if (!currentVisitType.is_multiple) {
                            throw generateMessages('APPOINTMENT_CANNOT_UPDATED');
                        }
                    }
                }

                if (updateVisitType.is_required) {

                    const count = this.shallowCopy(await this.__repo.count(
                        'id',
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            patient_id: patientId,
                            type_id: updateVisitType.id,
                            pushed_to_front_desk: false,
                        }
                    ));

                    if (count === 1) {

                        if (!updateVisitType.is_multiple) {
                            throw generateMessages('APPOINTMENT_CANNOT_UPDATED');

                        }
                    }
                }

            }

            if (specialityId !== appointment?.availableSpeciality?.speciality_id || doctorId !== appointment?.availableDoctor?.doctor_id) {

                const deletedAppointments = await this.getAppointmentById({ appointment_id: [id], user_id: null }, _authorization);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: [id] }, config);

            }

            const updatedApointment: models.sch_appointmentsI = await this.__repo.update(
                id,
                {
                    appointment_title: appointmentTitle,
                    available_doctor_id: methodCheck === 'doctor' ? getAssignments[0].id : null,
                    available_speciality_id: methodCheck === 'speciality' ? getAssignments[0].id : requiredAssignmentArray[0]?.available_speciality_id,
                    cd_image: cdImage ?? null,
                    comments,
                    confirmation_status: confirmationStatus,
                    date_list_id: getAssignments[0]?.dateList[0]?.id,
                    is_speciality_base: isSpecialityBase,
                    physician_id: physicianId ?? null,
                    reading_provider_id: readingProviderId ?? null,
                    technician_id: technicianId,
                    scheduled_date_time: new Date(startDateTime),
                    status_id: appointmentStatusId,
                    time_slots: assignmentTimeSlot * requiredSlots,
                    type_id: appointmentTypeId,
                    is_transportation: isTransportation ?? null,
                    updated_at: new Date(),
                    updated_by: userId,
                },
                __transactions
            );

            const createdTransportations: typings.ANY = [];
            const updatedTransportations: typings.ANY = [];

            if (!isTransportation) {
                await this.__transportationsRepo.updateByReferenceIds(
                    {
                        appointment_id: updatedApointment.id
                    },
                    {
                        deleted_at: new Date()
                    },
                    __transactions
                );
            }

            if (transportation && transportation.length) {

                for (const trans of transportation) {

                    const {
                        id,
                        is_deleted,
                    } = trans;

                    if (!id) {
                        createdTransportations.push(
                            {
                                appointment_id: updatedApointment.id,
                                ...trans,
                            }
                        );
                    } else if (id && is_deleted) {
                        updatedTransportations.push(
                            {
                                ...trans,
                                deleted_at: new Date(),
                            }
                        );
                    } else if (id) {
                        updatedTransportations.push(
                            {
                                ...trans
                            }
                        );
                    }
                }

                this.shallowCopy(await this.__transportationsRepo.bulkCreate(createdTransportations, __transactions));
                this.shallowCopy(await this.__transportationsRepo.bulkUpdate(updatedTransportations, __transactions, null, ['is_pickup', 'is_dropoff', 'type', 'comments', 'street_address', 'suit', 'city', 'state', 'zip', 'phone', 'deleted_at']));

            }



            if (cptCodes && cptCodes.length) {
                if (!speciality.is_multiple_visit){
                    await this.__schAppointmentCptCodesRepo.updateByReferenceIds(
                        {
                            appointment_id: updatedApointment.id
                        },
                        {
                            deleted_at: new Date()
                        },
                        __transactions
                    );
                    await this.addAppointmentsCptCodes(updatedApointment.id, cptCodes, __transactions);
                }
            }

            const checkVisitStatus: models.kiosk_case_patient_sessionI = this.shallowCopy(await this.__casePatientSessionRepo.findOne({
                appointment_id: id,
                case_id: caseId
            }));

            if (!checkVisitStatus || !Object.keys(checkVisitStatus).length) {
                throw Error('Visit Status not exists!');
            }

            const visitRescheuledId: models.kiosk_case_patient_session_statusesI = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findOne({slug: 're_scheduled'}));

            await this.__casePatientSessionRepo.updateByColumnMatched(
                {
                    appointment_id: id,
                    case_id: caseId,
                    deleted_at: null
                },
                {
                    status_id: visitRescheuledId.id,
                    updated_by: userId ?? null,
                },
                __transactions
                );

            // Const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            //     {
            //         Id: updatedApointment.id
            //     },
            //     {
            //         Include: [
            //             {
            //                 As: 'appointmentStatus',
            //                 Model: models.sch_appointment_statuses,
            //                 Required: false,
            //                 Where: {
            //                     Deleted_at: null,
            //                 }
            //             },
            //             {
            //                 As: 'patient',
            //                 Model: models.kiosk_patient,
            //                 Required: false,
            //                 Where: {
            //                     Deleted_at: null,
            //                 }
            //             },
            //             {
            //                 As: 'caseType',
            //                 Model: models.kiosk_case_types,
            //                 Required: false,
            //                 Where: {
            //                     Deleted_at: null,
            //                 }
            //             },
            //         ]
            //     }
            // ));

            // AppointmentObj = { ...appointmentObj, newAppointment };

            // Const endTime: Date = new Date(newAppointment.scheduled_date_time);
            // EndTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);

            // Const contactPersonType: models.kiosk_contact_person_typesI = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));

            // Const selfContactPerson: models.kiosk_contact_personI = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
            //     Case_id: newAppointment.case_id,
            //     Contact_person_type_id: contactPersonType.id,
            //     Deleted_at: null
            // }));

            // If (selfContactPerson && selfContactPerson.email) {
            //     // tslint:disable-next-line: no-floating-promises
            //     This.sentEmailForAppointment({
            //         AppointmentId: newAppointment.id,
            //         AppointmentStatus: newAppointment.appointmentStatus.name,
            //         CaseId: newAppointment.case_id,
            //         CaseType: newAppointment.caseType.name,
            //         ConfirmationStatus: newAppointment.confirmation_status,
            //         Email: selfContactPerson.email,
            //         EmailTitle: 'Update Appointment',
            //         EndDateTime: new Date(endTime),
            //         PatientLastName: newAppointment.patient.last_name,
            //         Reason: 'updated',
            //         ScheduledDateTime: new Date(newAppointment.scheduled_date_time),
            //         TimeSlot: newAppointment.time_slots,
            //     });
            // }

            // This.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [newAppointment.id], email_title: 'Appointment Updated' }, config);

            await __transactions.commit();
            
            

        } catch (transcationError) {

            await __transactions.rollback();
            throw transcationError;
        }
        
        const result = await this.createAppointmentWithCptCodess({
            appointment_id: id,
            cpt_codes: cptCodes,
            time_zone: time_zone,
            user_id: userId
        }, _authorization);
            
           
        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [id], user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, appointmentObj.config);
        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, appointmentObj.config);

        return { msg_alert_1: result.msg_alert_1,msg_alert_2: result.msg_alert_2, appointment: result.appointments}

    }

    public removeEvaluationTime = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {
        const {
            id,
            user_id
        } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id));

        if (!appointment || !Object.keys(appointment).length) {
            throw Error('Invalid id');
        }

        return this.__repo.update(id, {
            evaluation_date_time: null
        });
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public resolveAppointmentForDoctor = async (data: typings.ResolveAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            appointment_ids: appointmentIds,
            available_doctor_id: availableDoctorId,
            user_id: userId = Number(process.env.USERID),
            facility_location_tpye: facilityLocationType,
            unavailibility_end_date: unavailibilityEndDate,
        } = data;

        const appointmentsToBeResolved: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
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

        const formatedRequiredArray: typings.ResolvedDoctorAndAppointmentArrayI[] = this.formatAvailableDoctorForAutoResolve(appointmentsToBeResolved, availableDoctorId);

        const formatedAvailbleDoctor: typings.ResolvedDoctorAndAppointmentArrayI = formatedRequiredArray[1];
        const formatedAppoinments: typings.ResolvedDoctorAndAppointmentArrayI[] = formatedRequiredArray[0] as unknown as typings.ResolvedDoctorAndAppointmentArrayI[];

        const startDate: Date = unavailibilityEndDate ? new Date(unavailibilityEndDate) : new Date(formatedAvailbleDoctor.end_date);
        const endDate: Date = new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));

        const facilityLocationIdsForDoctor: number[] = await this.findFacilityLocations(formatedAvailbleDoctor.doctor_id, userId);

        const whereClauseForAvailableDoctor: { [key: string]: typings.ANY } = {
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

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
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

            toBeResolvedAvailableDoctor = availableDoctors?.find((d: models.sch_available_doctorsI): models.sch_available_doctorsI => {

                requiredArray = [...requiredArray, ...updatedArray?.filter((s: models.sch_appointmentsI): boolean => !(s.available_doctor_id !== d.id))];

                if (facilityLocationType !== 'same') {

                    const { doctor: { userFacilities } } = d;

                    for (const each of userFacilities) {

                        if (formatedAvailbleDoctor?.speciality_id === each.speciality_id) {

                            let availableFreeSlots: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(formatedAvailbleDoctor, requiredArray, formatedAvailbleDoctor.over_booking + 1, formatedAvailbleDoctor.time_slot, 0);

                            availableFreeSlots = this.getFreeSlotsWithUnavailabilityChk(availableFreeSlots, unavailabileDoctors, formatedAvailbleDoctor.time_slot);

                            const getResolvedAppointments: typings.ANY = this.resolveDoctorAppointmentOnFreeSlots(availableFreeSlots, formatedAppoinments, d.id, formatedAvailbleDoctor.time_slot);

                            if (getResolvedAppointments[1].length === 0) {

                                updatedArray = [...updatedArray, ...getResolvedAppointments[0]];
                                return d;
                            }

                            updatedArray = [...updatedArray, ...getResolvedAppointments[0]];

                        }
                    }

                } else {

                    if (formatedAvailbleDoctor.facility_location_id === d.facility_location_id) {

                        let availableFreeSlots: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(formatedAvailbleDoctor, requiredArray, formatedAvailbleDoctor.over_booking + 1, formatedAvailbleDoctor.time_slot, 0);

                        availableFreeSlots = this.getFreeSlotsWithUnavailabilityChk(availableFreeSlots, unavailabileDoctors, formatedAvailbleDoctor.time_slot);

                        const getResolvedAppointments: typings.ANY = this.resolveDoctorAppointmentOnFreeSlots(availableFreeSlots, formatedAppoinments, d.id, formatedAvailbleDoctor.time_slot);

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
                updated_by: userId
            }
        );

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const deletedAppointments = await this.getAppointmentById({ appointment_id: toBeResolvedAppointmentIds, user_id: null }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: toBeResolvedAppointmentIds, }, config);

        const newResolvedAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.bulkCreate([...requiredResolvedAppointmentsArray]));

        const formattedAppointmentForIOS = await this.getAppointmentById({ appointment_id: newResolvedAppointments?.map((x) => x.id), user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);

        // This.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [...newResolvedAppointments.map((a: models.sch_appointmentsI): number => a.id)], email_title: 'Appointment Updated' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: toBeResolvedAppointmentIds }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        return newResolvedAppointments;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public resolveAppointmentForSpeciality = async (data: typings.ResolveAppointmentsBodyI, _authorization: string): Promise<models.sch_appointmentsI[]> => {

        const {
            appointment_ids: appointmentIds,
            user_id: userId = Number(process.env.USERID),
            facility_location_tpye: facilityLocationType,
        } = data;

        const signInUser: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId,
            }
        ));

        if (!signInUser || !Object.keys(signInUser).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        if (!modelHasRoles || !Object.keys(modelHasRoles).length) {
            throw generateMessages('USER_HAS_NO_ROLES');
        }

        const { role: { slug } } = modelHasRoles || {};

        const getAppointmentsToResolve: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                deleted_at: null,
                id: { [Op.in]: appointmentIds },
                pushed_to_front_desk: false,
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
                        model: models.sch_recurrence_date_lists,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            }
        ));

        if (!getAppointmentsToResolve || !getAppointmentsToResolve.length) {
            throw generateMessages('NO_APPOINTMENT_FOUND');
        }

        let facilityIds: number[] = slug === 'super_admin' ? this.shallowCopy(await this.__facilityLocationRepo.findAll(
            { deleted_at: null, is_main: false })).map((o: models.facility_locationsI): number => o.id) :
            this.shallowCopy(await this.__userFacilityRepo.findAll({ user_id: userId, deleted_at: null })).map((o: models.user_facilityI): number => o.facility_location_id);

        facilityIds = this.filterUnique(facilityIds);

        const doctorIdsFromFacility: number[] = this.filterUnique(this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: { [Op.in]: facilityIds },
                speciality_id: { [Op.ne]: null },
            }
        )).map((o: models.user_facilityI): number => o.user_id));

        let lenghtOfAppointmentsToBeResolved: number = getAppointmentsToResolve.length;
        let requiredArray: models.sch_appointmentsI[] = [];
        let requiredTimeSlot: number;
        let getFreeSlotsForAvailableSpeciality: typings.FreeSlotsI[][];
        let getAppointmentResolved: typings.ANY;

        for (const specialityAppointment of getAppointmentsToResolve) {

            const {
                dateList: { start_date, end_date, no_of_doctors: noOfDoctors, no_of_slots: noOfSlots },
                available_speciality_id: availableSpecialityId,
                availableSpeciality: { speciality_id: specialityId, facility_location_id: facilityLocationId }
            } = specialityAppointment || {};

            const startDate: Date = new Date(start_date);
            const endDate: Date = new Date(end_date);

            const getMonthToResolve: Date = new Date(endDate);
            const desiredEndDate: Date = new Date(getMonthToResolve.setMonth(getMonthToResolve.getMonth() + 2));

            const availableSpecialityWhereClause: { [key: string]: typings.ANY } = facilityLocationType.toLowerCase() === 'same' ?
                {
                    facility_location_id: facilityLocationId,
                }
                :
                {
                    facility_location_id: { [Op.in]: facilityIds },
                };

            const dateListForAvailableSpecialityInFutureTwoMonths: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                {
                    available_speciality_id: { [Op.ne]: availableSpecialityId },
                    deleted_at: null,
                    start_date: { [Op.gte]: endDate, [Op.lte]: desiredEndDate },
                },
                {
                    include: {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityId,
                            ...availableSpecialityWhereClause
                        }
                    }
                }
            ));

            const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne({
                deleted_at: null,
                id: specialityId,
            }));

            let appointmentToResolvedInTwoMonths: models.sch_recurrence_date_listsI;
            for (const eachAppointmentForSpeciality of dateListForAvailableSpecialityInFutureTwoMonths) {

                const {

                    available_speciality_id: availableSpecialityIdFromDateList,
                    start_date: startDateStringFromDateList,
                    end_date: endDateStringFromDateList,
                    no_of_doctors: noOfDoctorsFromDateList,
                    no_of_slots: noOfSlotsFromDateList,

                } = eachAppointmentForSpeciality;

                const startDateFromDateList: Date = new Date(startDateStringFromDateList);
                const endDateFromDateList: Date = new Date(endDateStringFromDateList);

                const availableDoctorInNextTwoMonths: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                    {
                        deleted_at: null,
                    },
                    {
                        include: {
                            as: 'availableDoctor',
                            model: models.sch_available_doctors,
                            required: true,
                            where: {
                                available_speciality_id: availableSpecialityIdFromDateList,
                                deleted_at: null,
                            }
                        }
                    }
                ));

                const oldSlots: number = endDate.getTime() - startDate.getTime();
                const getMins: number = (oldSlots / 1000) / 60;

                let oldTimSlot: number = getMins / noOfSlots;
                oldTimSlot = oldTimSlot * noOfDoctors;

                let appointmentsWithUpdatedTimeSlot: models.sch_appointmentsI[] = getAppointmentsToResolve.map((d: models.sch_appointmentsI): models.sch_appointmentsI => {

                    const timeSlots: number = (d.time_slots / oldTimSlot) * speciality.time_slot;

                    return {
                        ...d,
                        time_slots: Math.floor(timeSlots),
                    };

                });

                if (availableDoctorInNextTwoMonths.length === 0) {

                    const milliSecondsOfSlotOfDoctor: number = endDateFromDateList.getTime() - startDateFromDateList.getTime();
                    const minutesOfSlotOfDoctor: number = (milliSecondsOfSlotOfDoctor / 1000) / 60;

                    requiredTimeSlot = minutesOfSlotOfDoctor / noOfSlotsFromDateList;
                    requiredTimeSlot = requiredTimeSlot * noOfDoctorsFromDateList;
                    let getAppointmentOnSpeciality: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                        {
                            available_speciality_id: availableSpecialityIdFromDateList,
                            deleted_at: null,
                            scheduled_date_time: { [Op.between]: [startDateFromDateList, endDateFromDateList] },
                        },
                        {
                            order: [
                                ['scheduled_date_time', 'ASC']
                            ]
                        }
                    ));

                    getAppointmentOnSpeciality = [...getAppointmentOnSpeciality, ...requiredArray?.filter((d: models.sch_appointmentsI): boolean => d?.available_speciality_id === availableSpecialityIdFromDateList)];

                    getFreeSlotsForAvailableSpeciality = this.getFreeSlotsForAutoResolveAppointment(eachAppointmentForSpeciality, getAppointmentOnSpeciality, noOfDoctorsFromDateList, requiredTimeSlot, true);

                    getAppointmentResolved = this.resolveAppointmentsOnFreeSlots(getFreeSlotsForAvailableSpeciality[0], appointmentsWithUpdatedTimeSlot, null, availableSpecialityIdFromDateList, requiredTimeSlot);

                    lenghtOfAppointmentsToBeResolved = lenghtOfAppointmentsToBeResolved - getAppointmentResolved[0].length;
                    requiredArray = [...requiredArray, ...getAppointmentResolved[0]];
                    appointmentsWithUpdatedTimeSlot = getAppointmentResolved[1];

                } else if (availableDoctorInNextTwoMonths?.length === noOfDoctorsFromDateList) {

                    for (const d of availableDoctorInNextTwoMonths) {
                        const {
                            availableDoctor: { doctor_id: doctorId, available_speciality_id: avaialbeSpecialityIdFromAvailableDoctor },
                            start_date: startDateStringOfDoctor,
                            end_date: endDateStringOfDoctor,
                        } = d;

                        const startDateOfDoctor: Date = new Date(startDateStringOfDoctor);
                        const endDateOfDoctor: Date = new Date(endDateStringOfDoctor);

                        const milliSeconds: number = new Date(d.end_date).getTime() - new Date(d.start_date).getTime();
                        const minutes: number = (milliSeconds / 1000) / 60;

                        requiredTimeSlot = minutes / d.no_of_slots;

                        if (doctorIdsFromFacility.includes(doctorId)) {

                            const doctorUnavailability: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
                                {
                                    [Op.or]: [
                                        { [Op.and]: [{ start_date: { [Op.lte]: startDateOfDoctor } }, { end_date: { [Op.gt]: startDateOfDoctor } }, { doctor_id: doctorId }, { approval_status: true }] },
                                        { [Op.and]: [{ start_date: { [Op.gte]: startDateOfDoctor } }, { start_date: { [Op.lt]: endDateOfDoctor } }, { doctor_id: doctorId }, { approval_status: true }] }
                                    ]
                                }
                            ));

                            let appointmentsOnDoctorAvailablity: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                                {
                                    available_doctor_id: d.available_doctor_id,
                                    deleted_at: null,
                                    scheduled_date_time: { [Op.between]: [startDateOfDoctor, endDateOfDoctor] },
                                },
                                {
                                    order: [
                                        ['scheduled_date_time', 'ASC']
                                    ]
                                }
                            ));

                            appointmentsOnDoctorAvailablity = [...appointmentsOnDoctorAvailablity, ...requiredArray?.filter((o: models.sch_appointmentsI): boolean => o?.available_speciality_id === availableSpecialityIdFromDateList)];

                            getFreeSlotsForAvailableSpeciality = this.getFreeSlotsForAutoResolveAppointment(d, appointmentsOnDoctorAvailablity, 1, requiredTimeSlot, false, doctorUnavailability);

                            getAppointmentResolved = this.resolveAppointmentsOnFreeSlots(getFreeSlotsForAvailableSpeciality[0], appointmentsWithUpdatedTimeSlot, d.available_doctor_id, avaialbeSpecialityIdFromAvailableDoctor, requiredTimeSlot);

                            lenghtOfAppointmentsToBeResolved = lenghtOfAppointmentsToBeResolved - getAppointmentResolved[0].length;
                            requiredArray = [...requiredArray, ...getAppointmentResolved[0]];
                            appointmentsWithUpdatedTimeSlot = getAppointmentResolved[1];

                            if (lenghtOfAppointmentsToBeResolved === 0) {
                                break;
                            }

                        }
                    }

                } else {

                    let resolvedDoctors: models.sch_recurrence_date_listsI;

                    for (const d of availableDoctorInNextTwoMonths) {
                        const {
                            availableDoctor: { doctor_id: doctorId, available_speciality_id: avaialbeSpecialityIdFromAvailableDoctor },
                            start_date: startDateStringOfDoctor,
                            end_date: endDateStringOfDoctor,
                        } = d;

                        const startDateOfDoctor: Date = new Date(startDateStringOfDoctor);
                        const endDateOfDoctor: Date = new Date(endDateStringOfDoctor);

                        const milliSeconds: number = new Date(d.end_date).getTime() - new Date(d.start_date).getTime();
                        const minutes: number = (milliSeconds / 1000) / 60;

                        requiredTimeSlot = minutes / d.no_of_slots;

                        if (doctorIdsFromFacility.includes(doctorId)) {

                            const doctorUnavailability: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
                                {
                                    [Op.or]: [
                                        { [Op.and]: [{ start_date: { [Op.lte]: startDateOfDoctor } }, { end_date: { [Op.gt]: startDateOfDoctor } }, { doctor_id: doctorId }, { approval_status: true }] },
                                        { [Op.and]: [{ start_date: { [Op.gte]: startDateOfDoctor } }, { start_date: { [Op.lt]: endDateOfDoctor } }, { doctor_id: doctorId }, { approval_status: true }] }
                                    ]
                                }
                            ));

                            let appointmentsOnDoctorAvailablity: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                                {
                                    available_doctor_id: d.available_doctor_id,
                                    deleted_at: null,
                                    scheduled_date_time: { [Op.between]: [startDateOfDoctor, endDateOfDoctor] },
                                },
                                {
                                    order: [
                                        ['scheduled_date_time', 'ASC']
                                    ]
                                }
                            ));

                            appointmentsOnDoctorAvailablity = [...appointmentsOnDoctorAvailablity, ...requiredArray?.filter((o: models.sch_appointmentsI): boolean => o?.available_speciality_id === availableSpecialityIdFromDateList)];

                            getFreeSlotsForAvailableSpeciality = this.getFreeSlotsForAutoResolveAppointment(d, appointmentsOnDoctorAvailablity, 1, requiredTimeSlot, false, doctorUnavailability);
                            getAppointmentResolved = this.resolveAppointmentsOnFreeSlots(getFreeSlotsForAvailableSpeciality[0], appointmentsWithUpdatedTimeSlot, d.available_doctor_id, avaialbeSpecialityIdFromAvailableDoctor, requiredTimeSlot);

                            lenghtOfAppointmentsToBeResolved = lenghtOfAppointmentsToBeResolved - getAppointmentResolved[0].length;
                            requiredArray = [...requiredArray, ...getAppointmentResolved[0]];
                            appointmentsWithUpdatedTimeSlot = getAppointmentResolved[1];

                            if (lenghtOfAppointmentsToBeResolved === 0) {
                                resolvedDoctors = d;
                                break;
                            }

                        }
                    }

                    if (!resolvedDoctors || !Object.keys(resolvedDoctors).length) {

                        const milliSecondsOfSlotOfDoctor: number = endDateFromDateList.getTime() - startDateFromDateList.getTime();
                        const minutesOfSlotOfDoctor: number = (milliSecondsOfSlotOfDoctor / 1000) / 60;

                        requiredTimeSlot = minutesOfSlotOfDoctor / noOfSlotsFromDateList;
                        requiredTimeSlot = requiredTimeSlot * noOfDoctorsFromDateList;

                        let getAppointmentOnSpeciality: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                            {
                                available_speciality_id: availableSpecialityIdFromDateList,
                                deleted_at: null,
                                scheduled_date_time: { [Op.between]: [startDateFromDateList, endDateFromDateList] },
                            },
                            {
                                order: [
                                    ['scheduled_date_time', 'ASC']
                                ]
                            }
                        ));

                        getAppointmentOnSpeciality = [...getAppointmentOnSpeciality, ...requiredArray?.filter((d: models.sch_appointmentsI): boolean => d?.available_speciality_id === availableSpecialityIdFromDateList)];

                        getFreeSlotsForAvailableSpeciality = this.getFreeSlotsForAutoResolveAppointment(eachAppointmentForSpeciality, getAppointmentOnSpeciality, noOfDoctorsFromDateList, requiredTimeSlot, true);

                        const getOldSlots: number = endDate.getTime() - startDate.getTime();
                        const getMinutes: number = (getOldSlots / 1000) / 60;

                        let getOldTimeSlot: number = getMinutes / noOfSlots;
                        getOldTimeSlot = getOldSlots * noOfDoctors;

                        appointmentsWithUpdatedTimeSlot = getAppointmentsToResolve.map((d: models.sch_appointmentsI): models.sch_appointmentsI => {

                            const timeSlots: number = (d.time_slots / oldTimSlot) * speciality.time_slot;

                            return {
                                ...d,
                                time_slots: timeSlots,
                            };

                        });

                        getAppointmentResolved = this.resolveAppointmentsOnFreeSlots(getFreeSlotsForAvailableSpeciality[0], appointmentsWithUpdatedTimeSlot, null, availableSpecialityIdFromDateList, requiredTimeSlot);

                        lenghtOfAppointmentsToBeResolved = lenghtOfAppointmentsToBeResolved - getAppointmentResolved[0].length;
                        requiredArray = [...requiredArray, ...getAppointmentResolved[0]];
                        appointmentsWithUpdatedTimeSlot = getAppointmentResolved[1];

                    }
                }

                if (lenghtOfAppointmentsToBeResolved === 0) {
                    appointmentToResolvedInTwoMonths = eachAppointmentForSpeciality;
                    break;
                }
            }
            if (!appointmentToResolvedInTwoMonths || !Object.keys(appointmentToResolvedInTwoMonths).length) {
                throw generateMessages('APPOINTMENT_CAN_NOT_RESOLVED');
            }

        }

        requiredArray = this.filterNonNull(requiredArray);

        if (requiredArray.length !== appointmentIds.length) {
            throw generateMessages('APPOINTMENT_CAN_NOT_RESOLVED');
        }

        const reScheduledStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 're_scheduled',
            }
        ));

        const reScheduledVisitStatus: models.kiosk_case_patient_session_statusesI = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findOne(
            {
                deleted_at: null,
                slug: 're_scheduled',
            }
        ));

        const requiredResolvedAppointmentsArray: models.sch_appointmentsI[] = requiredArray?.map((d: models.sch_appointmentsI): models.sch_appointmentsI => ({
            ...d,
            status_id: reScheduledStatus?.id
        }));

        const toBeResolvedAppointmentIds: number[] = getAppointmentsToResolve.map((d: models.sch_appointmentsI): number => d.id);

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const deleteOldStatusThroughAppointmentIds: typings.DeleteOldStatusFromKioskObjectI[] = getAppointmentsToResolve.map((d: models.sch_appointmentsI): typings.DeleteOldStatusFromKioskI => ({
            appointment_id: d.id,
            case_id: d?.case_id
        })).map((s: typings.DeleteOldStatusFromKioskI): typings.DeleteOldStatusFromKioskObjectI => ({
            appointments: [s],
            deleted_at: new Date(),
            updated_by: userId,
        }));

        const { status: deletedOldStatusFromKiosk } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/update-by-appointment-ids`, { ...deleteOldStatusThroughAppointmentIds, trigger_socket: true }, config));

        if (deletedOldStatusFromKiosk !== 200) {
            throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
        }

        await this.__repo.updateByIds(
            toBeResolvedAppointmentIds,
            {
                deleted_at: new Date(),
                updated_by: userId
            }
        );

        const deletedAppointments = await this.getAppointmentById({ appointment_id: toBeResolvedAppointmentIds, user_id: null }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: deletedAppointments, action_point: 'deleted', deleted_appointment_ids: toBeResolvedAppointmentIds, }, config);

        this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: [toBeResolvedAppointmentIds], email_title: 'Appointment Deleted' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: toBeResolvedAppointmentIds }, config);

        const newResolvedAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.bulkCreate([...requiredResolvedAppointmentsArray]));

        const createdAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: newResolvedAppointments.map((x) => x.id), user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: createdAppointmentForIOS, action_point: 'created' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        const addStatusToNewResolvedAppointments: typings.DeleteOldStatusFromKioskObjectI[] = newResolvedAppointments.map((d: models.sch_appointmentsI): typings.DeleteOldStatusFromKioskI => ({
            appointment_id: d.id,
            case_id: d?.case_id
        })).map((s: typings.DeleteOldStatusFromKioskI): typings.DeleteOldStatusFromKioskObjectI => ({
            appointments: [s],
            status_id: reScheduledVisitStatus?.id,
        }));

        const { status: newStatusAddedToKiosk } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/update-by-appointment-ids`, { ...addStatusToNewResolvedAppointments, trigger_socket: true }, config));

        if (newStatusAddedToKiosk !== 200) {
            throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
        }

        return newResolvedAppointments;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public suggest = async (data: typings.GetSuggestionBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            case_id: caseId,
            facility_location_id: facilityLocationId,
            case_type: caseType,
            case_type_id: caseTypeId,
            status_id: appointmentStatusId,
            speciality_id: specialityId,
            patient_id: patientId,
            type_id: typeId,
            doctor_id: doctorId,
            start_date: startDateString,
            end_date: endDateString,
            over_booking: overBooking,
            priority_slug: prioritySlug,
            start_time: startTime,
            end_time: endTime,
            appointment_title: appointmentTitle,
            days
        } = data;

        const slotsForEachDay: typings.ANY = [];

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findById(specialityId));

        if (!speciality || !Object.keys(speciality).length) {

            throw generateMessages('INVALID_SPECIALITY_IDS');

        }

        const { over_booking: specialityOverBooking, time_slot: specialityTimeSlot, name: specialityName, qualifier: specialityQualifier }: models.specialitiesI = speciality;

        const requiredOverbooking: number = overBooking ? overBooking + 1 : specialityOverBooking + 1;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const formatedDates: typings.FormattedDateForSugessionI[] = this.formatDatesForSuggestion({
            days,
            endDateString,
            endTime,
            startDateString,
            startTime,
        });

        if (!formatedDates || !formatedDates.length) {

            throw generateMessages('NO_DAYS_FOUND');

        }

        const whereClause: { [key: string]: number } = { facility_location_id: facilityLocationId, deleted_at: null };

        if (!doctorId) {

            whereClause.speciality_id = specialityId;

        } else {

            whereClause.doctor_id = doctorId;

        }

        const appointmentPriority: models.sch_appointment_prioritiesI = this.shallowCopy(await this.__appointmentPrioritiesRepo.findOne({ slug: prioritySlug }));

        const doctor: models.usersI = this.shallowCopy(await this.__userRepo.findById(doctorId, {
            include: {
                as: 'userBasicInfo',
                model: models.user_basic_info,
                required: false,
                where: { deleted_at: null },
            }
        }));

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: facilityLocationId
            },
            {
                include:
                {
                    as: 'facility',
                    model: models.facilities,
                    required: false,
                    where: { deleted_at: null },
                },
            }
        ));

        for (const date of formatedDates) {

            const joinClause: { [key: string]: typings.ANY } = {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        [Op.or]: [
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: date.start, [Op.lt]: date.end },
                            },
                            {

                                deleted_at: null,
                                end_date: { [Op.gt]: date.start },
                                start_date: { [Op.lte]: date.start },
                            }
                        ]
                    },
                }
            };

            const methodCheck: string = doctorId ? 'doctor' : 'speciality';

            const availabilities: typings.ANY = this.shallowCopy(await this[this.__getAssigmentMethod[`${methodCheck}`]].findAll(
                { ...whereClause },
                { ...joinClause }
            ));

            const formattedAvailablites: typings.ANY = availabilities.map((i: models.sch_available_specialitiesI): models.sch_available_specialitiesI[] => {
                const { dateList } = i;

                return dateList?.map((d: models.sch_recurrence_date_listsI): models.sch_available_specialitiesI => ({

                    ...i,
                    end_date: d.end_date,
                    no_of_doctors: d?.no_of_doctors,
                    no_of_slots: d?.no_of_slots,
                    start_date: d.start_date,

                }));

            }).flat();

            for (const availability of formattedAvailablites) {

                // tslint:disable-next-line: no-shadowed-variable
                const { speciality_id: assigmentSpecialityId, start_date: assignmentStartDate, end_date: assignmentEndDate, id, doctor_id: doctorId } = availability as typings.ANY;
                const filters: typings.ANY = {
                    deleted_at: null,
                    scheduled_date_time: { [Op.between]: [assignmentStartDate, assignmentEndDate] }
                };

                if (assigmentSpecialityId) {
                    filters.available_speciality_id = id;
                } else {
                    filters.available_doctor_id = id;
                }
                const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({ ...filters }));

                const assignmentTimeSlot: number = this.getTimeSlotOfAssignment(availability);
                const freeSlots: typings.ANY = this.getFreeSlotsWithOverBookingCheck(date, availability, appointments, requiredOverbooking, assignmentTimeSlot);

                let finalSlots: typings.ANY = freeSlots;

                if (doctorId) {

                    const unAvailableDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
                        [Op.or]: [
                            {
                                approval_status: true, doctor_id: doctorId, end_date: { [Op.gt]: date.start }, start_date: { [Op.lte]: date.start }
                            },
                            {
                                approval_status: true, doctor_id: doctorId, start_date: { [Op.gte]: date.start, [Op.lt]: date.start }
                            }
                        ]
                    }));

                    finalSlots = unAvailableDoctors && unAvailableDoctors.length ? this.getFreeSlotsWithUnavailabilityChk(freeSlots, unAvailableDoctors, assignmentTimeSlot) : finalSlots;
                }

                const day: string | number = date.start.getDate() < 10 ? `0${startDate.getDate()}` : startDate.getDate();

                const requiredDate: string = `${date.start.getFullYear()}-${date.start.getMonth() + 1}-${day}`;

                if (finalSlots && finalSlots.length && !slotsForEachDay?.find((s: typings.ANY): boolean => s.date_for_comparison === requiredDate)) {
                    slotsForEachDay.push({
                        appointment_title: appointmentTitle,
                        case_id: caseId,
                        case_type: caseType,
                        case_type_id: caseTypeId,
                        created_at: Date.now(),
                        doctor_basic_information: doctor?.userBasicInfo,
                        doctor_id: methodCheck === 'doctor' ? availability.doctor_id : null,
                        facility_location_detail: facilityLocation,
                        facility_location_id: facilityLocationId,
                        patient_id: patientId,
                        priority_id: appointmentPriority.id,
                        speciality_id: specialityId,
                        speciality_name: specialityName,
                        speciality_qualifier: specialityQualifier ?? null,
                        start_date_time: finalSlots[0]?.startDateTime,
                        status_id: appointmentStatusId,
                        type_id: typeId,

                    });
                }
            }

        }

        if (!slotsForEachDay || !slotsForEachDay.length) {
            throw generateMessages('NO_SLOT_FOUND');
        }

        return slotsForEachDay;

    }

    public triggerAppointmentSocket = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const {
            id: ids,
            action,
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: ids, user_id: null }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: action }, config);

        return null;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateAppointmentAndVisitStatus = async (data: typings.UpdateAppointmentVisitStatusBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            id,
            appointment_status: appointmentStatusSlug,
            visit_status: visitStatusSlug,
            case_id: caseId,
            trigger_socket: triggerSocket
        } = data;

        const existedAppointment: boolean = this.shallowCopy(await this.__repo.exists(id));

        if (!existedAppointment) {
            throw generateMessages('NO_APPOINTMENT_FOUND');
        }

        const appointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: appointmentStatusSlug }));

        const visitStatus: models.kiosk_case_patient_session_statusesI = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findOne({ slug: visitStatusSlug }));

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const { status } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: visitStatus.id, appointment_id: id, trigger_socket: triggerSocket }, config));

        if (status !== 200) {
            throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
        }

        await this.__repo.update(id, {
            status_id: appointmentStatus.id
        });

        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [id], user_id: null }, _authorization);

        if (!triggerSocket) {
            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);
        }

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [id] }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id));

        return appointment;
    }

    public updateAppointmentDoctor = async (data: typings.ANY, _authorization: string, transaction: Transaction): Promise<typings.ANY> => {

        const {
            appointment_ids: ids,
            doctor_id: doctorId,
            user_id: userId,
        } = data;

        for (const id of ids) {

            const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                { id },
                {
                    include: {
                        as: 'availableDoctor',
                        include: {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: false,
                            where: {
                                deleted_at: null,
                            }
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    }
                }
            ));

            const {
                scheduled_date_time,
                availableDoctor: appointmentAvailableDoctor
            } = appointment;

            if (!appointmentAvailableDoctor || !Object.keys(appointmentAvailableDoctor).length) {
                throw Error(`No doctor assignment found for appointment id: ${id}`);
            }

            const { availableSpeciality, facility_location_id: doctorFacilityLocationId } = appointmentAvailableDoctor;

            if (!availableSpeciality || !Object.keys(availableSpeciality).length) {
                throw Error(`Existing doctor do not have speciality assignemnt for appointment id: ${id}`);
            }

            const { speciality_id: specialityId } = availableSpeciality;

            const appointmentDate: Date = new Date(scheduled_date_time);

            const availabileDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                {
                    deleted_at: null,
                    doctor_id: doctorId,
                    facility_location_id: doctorFacilityLocationId,
                },
                {
                    include: [
                        {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            where: {
                                deleted_at: null,
                                speciality_id: specialityId,
                            }
                        },
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gt]: appointmentDate },
                                start_date: { [Op.lte]: appointmentDate },
                            }
                        },
                    ]
                }

            ));

            if (!availabileDoctor || !Object.keys(availabileDoctor).length) {
                throw Error(`No doctor assignment found for doctor id: ${doctorId} on ${String(appointmentDate)} against facility location id: ${doctorFacilityLocationId} & speciality id: ${specialityId} to update appointment id: ${id}`);
            }

            const { dateList } = availabileDoctor;
            const dateListId: number = dateList[0].id;

            await this.__repo.update(id, {
                available_doctor_id: availabileDoctor.id,
                available_speciality_id: availabileDoctor.available_speciality_id,
                date_list_id: dateListId,
                updated_by: userId
            },
                                     transaction
            );

            await this.__visitSessionRepo.updateByColumnMatched(
                {
                    appointment_id: id,
                    deleted_at: null
                },
                {
                    doctor_id: doctorId,
                    updated_by: userId
                },
                transaction
            );
        }

        return `${ids.length} appointments updated with Doctor id: ${doctorId}`;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateAppointmentEvaluation = async (data: typings.ANY, _authorization: string, transaction: Transaction): Promise<typings.ANY> => {
        const {
            appointment_id: appointmentId,
            case_id: caseId,
            visit_status: visitStatus,
            appointment_status: appintmentStatus,
            trigger_socket: triggerSocket = false,
            no_exit: noExit,
            delete_visit_for_finalize_appointment: deleteVisitForFinalizeAppointment
        } = data;

        const foundAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne({ id: appointmentId, deleted_at: null, cancelled: 0, pushed_to_front_desk: 0 }));

        if (!foundAppointment) {
            throw generateMessages('APPOINTMENT_NOT_FOUND');
        }

        if (foundAppointment.evaluation_date_time === null) {
            throw generateMessages('EVALUATION_ALREADY_UPDATE');
        }

        const {
            available_speciality_id: availableSpecId,
            available_doctor_id: availableDoctorId,
            is_speciality_base: isSpecialityBase,
            scheduled_date_time: scheduledDateTime,
            time_slots: timeSlots
        } = foundAppointment;

        const endDateOfAppointment: Date = new Date(scheduledDateTime);

        endDateOfAppointment.setMinutes(endDateOfAppointment.getMinutes() + timeSlots);

        let dateListIdToBeUpdated: number;

        if (isSpecialityBase) {

            const availableSpecialityInfo: models.sch_available_specialitiesI = this.shallowCopy(await this.__availableSpecialityRepo.findOne(
                {
                    deleted_at: null,
                    id: availableSpecId
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
                                    end_date: { [Op.gte]: endDateOfAppointment },
                                    start_date: { [Op.lte]: scheduledDateTime },
                                }
                            ]
                        },
                    }
                }
            ));

            const { dateList } = availableSpecialityInfo;
            dateListIdToBeUpdated = dateList[0]?.id;

        }

        const updatedAppointment: typings.ANY = this.shallowCopy(await this.__repo.update(foundAppointment.id, {
            available_doctor_id: foundAppointment.is_speciality_base ? null : foundAppointment.available_doctor_id,
            evaluation_date_time: null,
            ...(isSpecialityBase && { date_list_id: dateListIdToBeUpdated })
        }));

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [appointmentId] }, config);

        return this.updateAppointmentAndVisitStatus({
            appointment_status: appintmentStatus,
            case_id: caseId,
            id: foundAppointment.id,
            visit_status: visitStatus,
            trigger_socket: triggerSocket,
            no_exit: noExit
            // tslint:disable-next-line: align
        }, _authorization);
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateAppointmentForIos = async (data: typings.UpdateAppointmentForIosI, _authorization: string, transaction: Transaction): Promise<typings.ANY> => {

        const {
            id,
            doctor_id: doctorId,
            confirm,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id, {
            include: [
                {
                    as: 'availableDoctor',
                    include: [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                        },
                        {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                    ],
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'availableSpeciality',
                    include: {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                    },
                    model: models.sch_available_specialities,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
            // tslint:disable-next-line: align
        }, transaction));

        if (!appointment || !Object.keys(appointment).length) {
            throw generateMessages('NO_APPOINTMENT_OF_GIVEN_ID');
        }

        const {
            availableDoctor,
            availableSpeciality,
            dateList,
            available_doctor_id: availableDoctorId,
            available_speciality_id: availableSpecialityId,

            scheduled_date_time: scheduledDateTime,
            time_slots: timeSlots,
            case_id: caseId,
        } = appointment || {};

        const specialityId: number = availableDoctor?.availableSpeciality?.speciality_id ? availableDoctor?.availableSpeciality?.speciality_id : availableSpeciality?.speciality_id ?? null;

        let formatedAssignment: models.sch_recurrence_date_listsI;

        if (availableDoctorId) {
            const { dateList: availableDoctorDateList } = availableDoctor;
            formatedAssignment = availableDoctorDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === dateList.id);
        }

        if (availableSpecialityId && !formatedAssignment) {
            const { dateList: availableSpecialityDateList } = availableSpeciality;
            formatedAssignment = availableSpecialityDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === dateList.id);
        }

        const availabilityTimeSlot: number = this.getTimeSlotOfAssignment(formatedAssignment);

        const requiredSlotsForAppointment: number = appointment.time_slots / availabilityTimeSlot;

        const endDateOfAppointment: Date = new Date(scheduledDateTime);

        endDateOfAppointment.setMinutes(endDateOfAppointment.getMinutes() + timeSlots);

        const specialityIncludeClause: typings.ANY = specialityId ? [{
            as: 'availableSpeciality',
            include: {
                as: 'speciality',
                model: models.specialities,
                required: false,
                where: { deleted_at: null },
            },
            model: models.sch_available_specialities,
            required: true,
            where: {
                speciality_id: specialityId,
                deleted_at: null,
            }
        }] : [];

        const availableDoctorForNewAppointment: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
            {
                deleted_at: null,
                doctor_id: doctorId,
                facility_location_id: availableDoctorId ? availableDoctor.facility_location_id : availableSpeciality.facility_location_id
            },
            {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            end_date: { [Op.gte]: endDateOfAppointment },
                            start_date: { [Op.lte]: scheduledDateTime },
                        }
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        include: {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    ...specialityIncludeClause
                ]
                // tslint:disable-next-line: align
            }, transaction));

        if (!availableDoctorForNewAppointment || !Object.keys(availableDoctorForNewAppointment).length) {
            throw generateMessages('NO_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME');
        }

        if (availableDoctor && availableDoctor.doctor_id !== doctorId && !confirm) {
            throw generateMessages('ASSIGNMENT_TO_YOURSELF');
        }

        const {
            id: availableDoctorForNewAppointmentId,
            dateList: dateListForNewAppointment,
            start_date: availableDoctorForNewAppointmentStartDate,
            end_date: availableDoctorForNewAppointmentEndDate,
            doctor_id: availableDoctorForNewAppointmentDoctorId,
            availableSpeciality: availableDoctorSpeciality,
            doctor: {
                userFacilities: availableDoctorForNewAppointmentUserFacilities,
                userBasicInfo: {
                    first_name: firstName,
                    last_name: lastName,
                    middle_name: middleName,
                },
            }
        } = availableDoctorForNewAppointment;

        const availabilityTimeSlotForNewAppointment: number = this.getTimeSlotOfAssignment(dateListForNewAppointment[0]);

        const endDateForNewAppointment: Date = new Date(scheduledDateTime);

        endDateForNewAppointment.setMinutes(endDateForNewAppointment.getMinutes() + availabilityTimeSlotForNewAppointment * requiredSlotsForAppointment);

        const unavailability: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
            approval_status: true,
            doctor_id: doctorId,
            end_date: { [Op.gt]: endDateForNewAppointment },
            start_date: { [Op.lte]: scheduledDateTime },
            // tslint:disable-next-line: align
        }, null, transaction));

        if (unavailability && unavailability.length) {

            throw generateMessages('NO_PROVIDER_AVAILABLE');

        }

        const appointmentForUpdatedTime: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
            available_doctor_id: availableDoctorForNewAppointmentDoctorId,
            deleted_at: null,
            id: { [Op.ne]: id },
            scheduled_date_time: { [Op.between]: [availableDoctorForNewAppointmentStartDate, availableDoctorForNewAppointmentEndDate] },
            // tslint:disable-next-line: align
        }, null, transaction));

        const getFreeSlotsForAvailability: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(dateListForNewAppointment[0], appointmentForUpdatedTime, availableDoctorSpeciality?.speciality?.over_booking, availabilityTimeSlotForNewAppointment, 1);

        let reuiredScheduledDateTime: Date;
        const freeSlot: typings.FreeSlotsI = getFreeSlotsForAvailability?.find((s: typings.FreeSlotsI, index: number): typings.FreeSlotsI => {

            const slotStart: Date = new Date(s.startDateTime);
            const slotEnd: Date = new Date(s.startDateTime);

            slotEnd.setMinutes(slotEnd.getMinutes() + availabilityTimeSlotForNewAppointment);
            if (slotStart.getTime() <= new Date(appointment.scheduled_date_time).getTime() && new Date(appointment.scheduled_date_time).getTime() < slotEnd.getTime()) {
                if (s.count > 0) {
                    reuiredScheduledDateTime = new Date(s.startDateTime);
                    return s;
                }
            }

        });

        if (!freeSlot || !Object.keys(freeSlot).length) {
            throw generateMessages('NO_SLOTS_REMAINING');
        }

        const appointmentStatus: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 're_scheduled' }, null, transaction));

        await this.__repo.update(id, {
            available_doctor_id: availableDoctorForNewAppointmentId,
            scheduled_date_time: new Date(reuiredScheduledDateTime),
            status_id: appointmentStatus.id,
            time_slots: availabilityTimeSlotForNewAppointment * availabilityTimeSlot,
            updated_at: new Date(),
            updated_by: userId,
            // tslint:disable-next-line: align
        }, transaction);

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [id], user_id: null }, _authorization, transaction);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [id] }, config);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        const visitStatus: models.kiosk_case_patient_session_statusesI = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findOne({ slug: 're_scheduled' }, null, transaction));

        await this.__http.put(`${process.env.KIOSK_URL}/case-patient-session`, { case_id: caseId, appointment_id: id, status_id: visitStatus.id }, config);

        const updatedAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id, null, transaction));

        return [{
            ...updatedAppointment,
            doctor_id: availableDoctorForNewAppointmentDoctorId,
            doctor_name: middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`,
            speciality_id: availableDoctorSpeciality ? availableDoctorSpeciality?.speciality_id : null,
            speciality_name: availableDoctorSpeciality ? availableDoctorSpeciality?.speciality?.name : null,
            speciality_qualifier: availableDoctorSpeciality ? availableDoctorSpeciality?.speciality?.qualifier : null,

        }];
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateAppointmentStatus = async (data: typings.updateAppointmentStatusReqI, _authorization: string): Promise<typings.ANY> => {

        const {
            request_from_ios: requestFromIos,
            facility_location_id: facilityLocationId,
            case_type_id: caseTypeId,
            appointment_type_id: appointmentTypeId,
            current_date_time: currentDateTime,
            id,
            doctor_id: doctorId,
            user_id: userId = Number(process.env.USERID),
            speciality_id: specialityId,
            confirm,
            time_zone,
            is_speciality_base: isSpecialityBased
        } = data;

        const timeZone: number = -60;

        const config: typings.ANY = {
            headers: { Authorization: _authorization },
        };

        const specialityFilter: typings.ANY = [];

        const previousAppointmentState: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                deleted_at: null,
                id,
            },
            {
                include: {
                    as: 'patientSessions',
                    include: {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            }
        ));

        if (specialityId) {
            specialityFilter.push(
                {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: true,
                    where: {
                        speciality_id: specialityId,
                        deleted_at: null,
                    }
                }
            );
        }

        if (requestFromIos) {

            const dataForGetAllTemplatesApi: typings.dataForGetAllTemplatesApiI = {
                filter: 1,
                facility_location_id: [facilityLocationId],
                page: 1,
                per_page: 1000,
                pagination: 1,
                specialty_id: [specialityId],
                visit_type_id: [appointmentTypeId],
                case_type_id: [caseTypeId],
                user_id: doctorId
            };
            const configForTM: typings.ANY = {
                headers: { Authorization: _authorization },
                params: {
                    ...dataForGetAllTemplatesApi
                }
            };

            const allTemplates: typings.ANY = await this.__http.get(`${process.env.FRONT_DESK_URL}v2/get_all_templates`, configForTM);

            if (allTemplates.result.data.length === 0) {
                throw new Error('No template exists for this provider');
            }

            const isExistIOSTYPE: typings.ANY = allTemplates.result.data.find((e: typings.ANY): boolean => e.template_type === 'static_ios' && e.is_default);

            if (!isExistIOSTYPE) {
                throw new Error('Please Use Web app to access this template on IOS Apps when using Paper template/Dynamic templates');
            }

        }

        const findAppointmentIncludeClause: { [key: string]: typings.ANY } = {
            include: [
                {
                    as: 'availableDoctor',
                    include: {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                    },
                    model: models.sch_available_doctors,
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
                    as: 'availableSpeciality',
                    include: {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                    },
                    model: models.sch_available_specialities,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                },
                {
                    model: models.kiosk_cases,
                    as: 'case',
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        };

        const offsetForNewYork = this.getTimezoneOffset(new Date(), 'America/New_York');
        const serverCurrentDateOffset: number = offsetForNewYork == 240 ? 1 : 0;
        const serverCurrentDate = new Date();

        serverCurrentDate.setHours(serverCurrentDate.getHours() + serverCurrentDateOffset);
        const startDate: Date = currentDateTime     ? new Date(currentDateTime) : new Date(serverCurrentDate);
        const modifiedStartDate: Date = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));

        const foundAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne({ id }, findAppointmentIncludeClause));

        const { is_transferring_case: isTransferringCase } = foundAppointment.case;

        const { avoid_checkedin }: typings.ANY = foundAppointment?.appointmentType;

        if (new Date(foundAppointment.scheduled_date_time).getTime() < new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime()) {
            throw generateMessages('PAST_APPOINTMENTS');
        }

        const formattedStartDateTime: Date = new Date(format(new Date(modifiedStartDate), 'MM-dd-yyyy'));
        const formattedSchduledDateTime: Date = new Date(format(new Date(foundAppointment.scheduled_date_time), 'MM-dd-yyyy'));

        if (formattedSchduledDateTime.getTime() > formattedStartDateTime.getTime()) {
            throw generateMessages('FUTURE_APPOINTMENTS');
        }

        if (!foundAppointment) {
            throw generateMessages('INVALID_APPOINTMENT_TYPE_ID');
        }

        if (foundAppointment.appointmentStatus?.slug === 'no_show') {
            throw generateMessages('VISIT_STATUS_IS_NO_SHOW');
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
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

        const { role: { slug, id: superAdminId } } = modelHasRoles;

        if (isSpecialityBased) {

            try {
                await this.assignToYourSelf(
                    {
                        confirm,
                        startDate,
                        doctor_id: doctorId,
                        id,
                        user_id: userId,
                        slug,
                        specialityId,
                        superAdminId
                    },
                    _authorization,
                );

            } catch (error) {
                await this.updateAppointmentToPreviosStart(previousAppointmentState);
                throw error;
            }

        }

        const visitSession: models.visit_sessionsI = this.shallowCopy(await this.__visitSessionRepo.findOne({ case_id: foundAppointment?.case_id, appointment_id: foundAppointment?.id, deleted_at: null }, {
            include: {
                as: 'visitState',
                model: models.visit_session_states
            }
        }));

        const { visitState } = visitSession || {};

        if (visitState?.slug === 'un_finalized' || visitState?.slug === 'finalized') {
            return {};
        }

        const arrivedStatus: models.sch_appointment_statuses = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            { slug: 'arrived', deleted_at: null }
            ));

        const visitStatuses: models.kiosk_case_patient_session_statusesI[] = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findAll(
            { slug: { [Op.or]: ['checked_in', 'in_session'] }, deleted_at: null },
            ));

        try {
            const { status, result: { data: kioskCasePatientSession } }: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session`, {
                ...config,
                params: {
                    appointment_id: id,
                    case_id: foundAppointment.case_id,
                    deleted_at: null
                }
            }));

            if (status !== 200) {
                throw generateMessages('ERROR_WHILE_GETTING_STATUS_FROM_KIOSK');
            }

            if (kioskCasePatientSession?.status_id !== visitStatuses.find((e: models.kiosk_case_patient_session_statusesI): boolean => e.slug === 'checked_in')?.id && !avoid_checkedin) {
                throw generateMessages('VISIT_STATUS_IS_NOT_CHECKED_IN');
            }

        } catch (error) {
            await this.updateAppointmentToPreviosStart(previousAppointmentState);
            throw error;
        }

        if (!foundAppointment.case?.is_active) {

            try {

                await this.__http.post(`${process.env.KIOSK_URL}patient/activate`, { case_id: foundAppointment.case_id, patient_id: foundAppointment.patient_id, user_id: userId }, config);
                await this.activateAppointment({ case_id: foundAppointment.case_id, patient_id: foundAppointment.patient_id, user_id: userId }, _authorization);

            } catch (error) {
                await this.updateAppointmentToPreviosStart(previousAppointmentState);
                throw error;
            }

        }

        if (slug === 'super_admin') {

            return this.updateAppointmentStatusForSuperAdmin(
                {
                    arrivedStatus,
                    currentDateTime,
                    foundAppointment,
                    id,
                    userId,
                    visitStatuses,
                },
                _authorization,
                previousAppointmentState
                );

        }

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId
            }
            ));

        if (!speciality || !Object.keys(speciality).length) {
            throw generateMessages('INVALID_SPECIALITY_IDS');
        }

        const last24Hrs: Date = new Date(startDate);
        const next24Hrs: Date = new Date(startDate);

        last24Hrs.setHours(last24Hrs.getHours() - 24);
        next24Hrs.setHours(next24Hrs.getHours() + 24);

        const availabilityDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
            {
                deleted_at: null,
                doctor_id: doctorId,
                facility_location_id: foundAppointment?.available_doctor_id ? foundAppointment?.availableDoctor?.facility_location_id : foundAppointment?.availableSpeciality?.facility_location_id,
            },
            {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            end_date: { [Op.gt]: startDate },
                            start_date: { [Op.lte]: startDate },
                        },
                    },
                    ...specialityFilter
                ],
            }
        ));

        if (!availabilityDoctor || !Object.keys(availabilityDoctor).length) {
            throw generateMessages('NO_ASSIGNMENT_FOUND');
        }

        const requiredDateList: models.sch_recurrence_date_listsI = availabilityDoctor.dateList[0];

        const formatedAvailableDoctor: models.sch_available_doctorsI = {
            available_speciality_id: availabilityDoctor.supervisor_id,
            doctor_id: availabilityDoctor.doctor_id,
            end_date: requiredDateList.end_date,
            facility_location_id: availabilityDoctor.facility_location_id,
            id: availabilityDoctor.id,
            no_of_slots: requiredDateList.no_of_slots,
            start_date: requiredDateList.start_date,
            supervisor_id: availabilityDoctor.supervisor_id,
        };

        const timeSlotofAssignment: number = this.getTimeSlotOfAssignment(formatedAvailableDoctor);

        let formatedAssignment: models.sch_recurrence_date_listsI;

        if (foundAppointment.dateList.available_doctor_id) {
            const { dateList: availableDoctorDateList } = foundAppointment.availableDoctor;
            formatedAssignment = availableDoctorDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === foundAppointment.date_list_id);
        } else {
            const { dateList: availableSpecialityDateList } = foundAppointment.availableSpeciality;
            formatedAssignment = availableSpecialityDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === foundAppointment.date_list_id);
        }

        const availabilityTimeSlot: number = this.getTimeSlotOfAssignment(formatedAssignment);

        const slotForAppointment: number = foundAppointment.time_slots / availabilityTimeSlot;

        const appointmentsOfAvailablity: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_doctor_id: formatedAvailableDoctor.id,
                deleted_at: null,
            }
        ));

        const availableFreeSlots: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(formatedAvailableDoctor, appointmentsOfAvailablity, speciality.over_booking + 1, timeSlotofAssignment);

        const freeSlot: typings.FreeSlotsI = availableFreeSlots?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

            const slotStart: Date = new Date(s.startDateTime);
            const slotEnd: Date = new Date(s.startDateTime);

            slotEnd.setMinutes(slotEnd.getMinutes() + timeSlotofAssignment);

            if (slotStart.getTime() <= startDate.getTime() && startDate.getTime() < slotEnd.getTime()) {
                if (s.count > 0) {
                    return s;
                }
            }

        });

        if (!freeSlot || !Object.keys(freeSlot).length) {
            throw generateMessages('NO_SLOTS_REMAINING');
        }

        const { id: arrivedId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 'arrived'
            }
        ));

        const next24hourAppointments: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                cancelled: 0,
                deleted_at: null,
                status_id: arrivedId,
                id: { [Op.ne]: foundAppointment.id },
                patient_id: foundAppointment.patient_id,
                case_id: foundAppointment.case_id,
                pushed_to_front_desk: 0,
                scheduled_date_time: { [Op.between]: [modifiedStartDate, next24Hrs] },
            },
            {
                include: [
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            where: {
                                deleted_at: null,
                                slug: 'in_session',
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        where: {
                            deleted_at: null,
                        },
                    },
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: {
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
                                as: 'availableSpeciality',
                                include: {
                                    as: 'speciality',
                                    model: models.specialities,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                                model: models.sch_available_specialities,
                                required: true,
                                where: {
                                    deleted_at: null,
                                }
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]
            }
        ));

        if (next24hourAppointments && Object.keys(next24hourAppointments).length) {

            const {
                availableDoctor: {
                    doctor: {
                        userBasicInfo: {
                            first_name: firstName,
                            middle_name: midlleName,
                            last_name: lastName
                        }
                    },
                    availableSpeciality: {
                        speciality: docSpeciality
                    }
                }
            } = next24hourAppointments;

            const doctorName: string = `${firstName ? ' ' + firstName : ''}${midlleName ? ' ' + midlleName : ''}${lastName ? ' ' + lastName : ''}`;
            const msg: string = `Patient is already in session with ${doctorName} - ${docSpeciality.name}.`;

            throw {
                message: msg,
                status: 406
            };
        }

        const { id: noShowStatusId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne(
            {
                deleted_at: null,
                slug: 'no_show',
            }
        ));

        const appointmentTypes: models.sch_appointment_typesI[] = this.shallowCopy(await this.__appoitmentTypeRepo.findAll());

        const unEvaluatedInitialAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                cancelled: 0,
                case_id: foundAppointment.case_id,
                deleted_at: null,
                evaluation_date_time: null,
                id: { [Op.ne]: foundAppointment.id },
                patient_id: foundAppointment.patient_id,
                pushed_to_front_desk: 0,
                status_id: { [Op.ne]: noShowStatusId },
                type_id: appointmentTypes.find((t: models.sch_appointment_typesI): typings.ANY => t.slug === 'initial_evaluation').id,
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: false,
                            where: {
                                deleted_at: null,
                                speciality_id: specialityId
                            }
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityId
                        }
                    },
                ]
            }
        ));

        if (unEvaluatedInitialAppointment && Object.keys(unEvaluatedInitialAppointment).length && new Date(unEvaluatedInitialAppointment.scheduled_date_time).getTime() === new Date(startDate).getTime() && !isTransferringCase) {
            throw generateMessages('APPOINTMENT_ALREADY_IN_PROCESS');
        }

        const kioskCaseType: models.kiosk_case_typesI = this.shallowCopy(await this.__caseTypesRepo.findOne(
            {
                deleted_at: null,
                slug: 'worker_compensation'
            }
        ));

        let checkWcAuth: boolean = true;

        if (foundAppointment.case_type_id === kioskCaseType.id) {

            const doctorHasWcbAuth: models.medical_identifiersI = this.shallowCopy(await this.__medicalIdentifierRepo.findOne(
                {
                    deleted_at: null,
                    user_id: doctorId,
                    wcb_auth: true,
                }
                ));

            checkWcAuth = !doctorHasWcbAuth || !Object.keys(doctorHasWcbAuth).length ? false : true;
        }

        if (!checkWcAuth) {
            throw generateMessages('NO_WC_AUTHORIZE');
        }

        const toSendObj: typings.ANY = {
            appointment_id: foundAppointment.id,
            case_id: foundAppointment.case_id,
            trigger_socket: true,
            status_id: visitStatuses?.find((e: models.kiosk_case_patient_session_statusesI): boolean => e.slug === 'in_session').id
        };

        try {

            const { status: kioskStatus } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session`, toSendObj, config));

            if (kioskStatus !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }

        } catch (error) {
            await this.updateAppointmentToPreviosStart(previousAppointmentState);
            throw error;
        }

        try {

            await this.__repo.update(
                id,
                {
                    available_doctor_id: availabilityDoctor.id,
                    evaluation_date_time: new Date(startDate),
                    // Scheduled_date_time: new Date(startDate),
                    status_id: arrivedStatus.id,
                    updated_by: userId,
                }
            );

            const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [id], user_id: null }, _authorization);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated', is_speciality_based: isSpecialityBased }, config);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [id] }, config);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

            return [{
                appointment: await this.__repo.findOne({ id: foundAppointment.id }, {
                    include: {
                        as: 'availableDoctor',
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    }
                })
            }];

        } catch (error) {
            await this.updateAppointmentToPreviosStart(previousAppointmentState, true);
            throw error;
        }

    }

    public updateStatus = async (data: typings.ANY, _authorization: string, transaction: Transaction): Promise<models.sch_appointmentsI> => {

        const {
            appointment_id: id,
            appointment_status_id: appointmentStatusId,
            confirmation_status: confirmationStatus,
            visit_status_id: visitStatusId,
            user_id: userId,
        } = data;

        if (!id) {
            throw new Error('Invalid Request Object!');
        }

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findById(id));

        if (!appointment || !Object.keys(appointment).length) {
            throw new Error('Invalid Appointment Selected!');
        }
        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        if (appointmentStatusId) {
            await this.__repo.update(id, {
                status_id: appointmentStatusId,
                ...(confirmationStatus && { confirmation_status : 1 })
            }, transaction);
        }

        const { case_id: caseId, scheduled_date_time: scheduledDateTime } = appointment;

        const formattedScheduledDateTime: string = format(new Date(scheduledDateTime), 'MM-dd-yyyy');
        const formattedCurrentDateTime: string = format(new Date(), 'MM-dd-yyyy');

        if (visitStatusId) {
            await this.__http.put(`${process.env.KIOSK_URL}case-patient-session/update-on-appintment`, { case_id: caseId, status_id: visitStatusId, appointment_id: id, user_id: userId, update_check_in_time: formattedCurrentDateTime === formattedScheduledDateTime ? true : false }, config);
        }

        await transaction.commit();

        const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: [id], user_id: userId }, _authorization);

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-soft-patient-listing`, {}, config);
        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

        return appointment;

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateStatusMultipleAppointments = async (data: typings.UpdateStatusMultipleAppointmentsBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            appointment_ids: appointmentIds,
            status_id: statusId,
            trigger_socket: triggerSocket = false,
        } = data;

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
            id: { [Op.in]: appointmentIds }
        }));

        if (!appointments || !appointments.length || appointments.length !== appointmentIds.length) {
            throw generateMessages('INVALID_APPOINTMENT_IDS');
        }

        const updatedAppointments: models.sch_appointmentsI[] = await this.__repo.updateByIds(appointmentIds, { status_id: statusId });

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const formattedAppointmentForIOS = await this.getAppointmentById({ appointment_id: appointmentIds, user_id: null }, _authorization);

        if (!triggerSocket) {
            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);
        }

        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIds }, config);

        return updatedAppointments;

    }

    private readonly addAppointmentsCptCodes = async (id: typings.ANY, cptCodesInfo: number[], __transactions: Transaction): Promise<typings.ANY> => {

        const cptCodeData: models.sch_appointment_cpt_codesI[] = cptCodesInfo.map((billing_code_id): typings.ANY =>
        ({
            billing_code_id,
            appointment_id: id
        }));

        this.shallowCopy(await this.__schAppointmentCptCodesRepo.bulkCreate(cptCodeData, __transactions));
    }

    /**
     *
     * @param date
     * @param days
     */
    private readonly addDaysForReccurence = (date: Date, days: number): Date => new Date(date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)));

    private readonly addTransportations = async (id: typings.ANY, transportationsData: models.sch_transportationI[], __transaction: Transaction): Promise<typings.ANY> => {

        transportationsData.map((t) => { 
            delete t.id 
            return t
        });
        transportationsData = transportationsData.map((t): models.sch_transportationI =>
        ({
            ...t,
            appointment_id: id
        }));

        this.shallowCopy(await this.__transportationsRepo.bulkCreate(transportationsData, __transaction));

    }

    /**
     *
     * @param object
     */
    private readonly appointmentWithAvailableDoctorId = async (object: typings.GetAppointmentsAgainstAvailablityObjI): Promise<typings.AppointmentsAgainstAavailablityResponseDataI[]> => {

        const { availableDoctorId } = object;

        const availableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findById(
            availableDoctorId[0],
            {
                attributues: ['id', 'billable', 'available_doctor_id', 'case_id', 'patient_id', 'scheduled_date_time', 'time_slots'],
                include: [
                    {
                        as: 'appointments',
                        include: [
                            {
                                as: 'patient',
                                model: models.kiosk_patient,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'appointmentStatus',
                                attributes: ['name', 'slug'],
                                model: models.sch_appointment_statuses,
                                required: false,
                                where: {
                                    deleted_at: null,
                                }
                            }
                        ],
                        model: models.sch_appointments,
                        required: false,
                        where: {
                            cancelled: false,
                            deleted_at: null,
                            pushed_to_front_desk: false,
                        }
                    },
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
                ]
            }
        ));

        const { appointments } = availableDoctor || {};

        return appointments?.map((d: models.sch_appointmentsI): typings.AppointmentsAgainstAavailablityResponseDataI => ({
            appointment_billable: d.billable,
            appointment_id: d.id,
            appointment_status: d.appointmentStatus.name,
            appointment_status_slug: d.appointmentStatus.slug,
            available_doctor_id: availableDoctorId,
            case_id: d.case_id,
            doctor_id: availableDoctor.doctor_id,
            doctor_info: availableDoctor.doctor.userBasicInfo,
            patient_id: d.patient_id,
            patient_info: d.patient,
            scheduled_date_time: d.scheduled_date_time,
            time_slots: d.time_slots,
        }));
    }

    /**
     *
     * @param object
     */
    private readonly appointmentWithAvailableSpecialityId = async (object: typings.GetAppointmentsAgainstAvailablityObjI): Promise<typings.AppointmentsAgainstAavailablityResponseDataI[]> => {

        const { availableSpecialityId, availableDoctorId } = object;

        const availableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.__availableSpecialityRepo.findById(
            availableSpecialityId,
            {
                include:
                {
                    as: 'appointments',
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
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.sch_appointments,
                    required: false,
                    where: {
                        cancelled: false,
                        deleted_at: null,
                        pushed_to_front_desk: false,
                    }
                },
            }
        ));

        const doctorAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_doctor_id: { [Op.in]: availableDoctorId },
                available_speciality_id: { [Op.ne]: availableSpecialityId },
                cancelled: false,
                deleted_at: null,
                pushed_to_front_desk: false,
            },
            {
                attributues: ['id', 'billable', 'available_doctor_id', 'case_id', 'patient_id', 'scheduled_date_time', 'time_slots'],
                include: [
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'appointmentStatus',
                        attributes: ['name', 'slug'],
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
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
                        required: false,
                        where: { deleted_at: null },
                    }
                ],
            }
        ));

        const { appointments: specialityAppointments } = availableSpeciality || {};

        const appointments: models.sch_appointmentsI[] = [...specialityAppointments, ...doctorAppointments];

        return appointments?.map((d: models.sch_appointmentsI): typings.AppointmentsAgainstAavailablityResponseDataI => ({
            appointment_billable: d.billable,
            appointment_id: d.id,
            appointment_status: d.appointmentStatus.name,
            appointment_status_slug: d.appointmentStatus.slug,
            available_doctor_id: d.available_doctor_id,
            available_speciality_id: availableSpecialityId,
            case_id: d.case_id,
            doctor_id: d.available_doctor_id ? d.availableDoctor.doctor_id : null,
            doctor_info: d.available_doctor_id ? d.availableDoctor.doctor.userBasicInfo : null,
            patient_id: d.patient_id,
            patient_info: d.patient,
            scheduled_date_time: d.scheduled_date_time,
            speciality_id: availableSpeciality.speciality_id,
            time_slots: d.time_slots,
        }));
    }

    /**
     *
     * @param object
     */
    private readonly appointmentWithDateListId = async (object: typings.GetAppointmentsAgainstAvailablityObjI): Promise<typings.AppointmentsAgainstAavailablityResponseDataI[]> => {

        const { dateListId } = object;

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: 0,
                date_list_id: { [Op.in]: dateListId },
                deleted_at: null,
                pushed_to_front_desk: 0,
            },
            {
                attributues: ['id', 'billable', 'available_doctor_id', 'available_speciality_id', 'case_id', 'patient_id', 'scheduled_date_time', 'time_slots'],
                include: [
                    {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'appointmentStatus',
                        atttributes: ['name', 'slug'],
                        model: models.sch_appointment_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include:
                                {
                                    As: 'userBasicInfo',
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null }
                    }
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
     * @param transaction
     * @returns
     */
    private readonly assignToYourSelf = async (data: typings.UpdateAppointmentForIosI, _authorization: string): Promise<typings.ANY> => {

        const {
            id,
            startDate,
            doctor_id: doctorId,
            confirm,
            slug,
            superAdminId,
            specialityId,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const appointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
            {
                deleted_at: null,
                id,
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                        },
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'availableSpeciality',
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                        },
                        model: models.sch_available_specialities,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]
            },
            ));

        if (!appointment || !Object.keys(appointment).length) {
            throw generateMessages('NO_APPOINTMENT_OF_GIVEN_ID');
        }

        const {
            availableDoctor,
            availableSpeciality,
            dateList,
            available_doctor_id: availableDoctorId,
            available_speciality_id: availableSpecialityId,
            scheduled_date_time: scheduledDateTime,
            time_slots: timeSlots,
            case_id: caseId,
        } = appointment || {};

        let formatedAssignment: models.sch_recurrence_date_listsI;

        if (availableDoctorId) {
            const { dateList: availableDoctorDateList } = availableDoctor;
            formatedAssignment = availableDoctorDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === dateList.id);
        }

        if (availableSpecialityId && !formatedAssignment) {
            const { dateList: availableSpecialityDateList } = availableSpeciality;
            formatedAssignment = availableSpecialityDateList?.find((d: models.sch_recurrence_date_listsI): boolean => d.id === dateList.id);
        }

        const availabilityTimeSlot: number = this.getTimeSlotOfAssignment(formatedAssignment);

        const requiredSlotsForAppointment: number = appointment.time_slots / availabilityTimeSlot;

        const endDateOfAppointment: Date = new Date(scheduledDateTime);

        endDateOfAppointment.setMinutes(endDateOfAppointment.getMinutes() + timeSlots);

        const specialityIncludeClause = specialityId ? [{
            as: 'availableSpeciality',
            model: models.sch_available_specialities,
            include: {
                as: 'speciality',
                model: models.specialities,
                required: false,
                where: { deleted_at: null },
            },
            required: true,
            where: {
                speciality_id: specialityId,
                deleted_at: null,
            }
        }] : [];

        const availableDoctorForNewAppointment: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
            {
                deleted_at: null,
                doctor_id: doctorId,
                facility_location_id: availableDoctorId ? availableDoctor.facility_location_id : availableSpeciality.facility_location_id
            },
            {
                include: [
                    {
                        as: 'dateList',
                        attributes: { exclude: ['created_at', 'updated_at']},
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            end_date: { [Op.gte]: endDateOfAppointment },
                            start_date: { [Op.lte]: startDate },
                        }
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        include: {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    ...specialityIncludeClause
                ]
            }
            ));

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            },
            {
                attributes: { exclude: ['password'] },
                include: {
                    as: 'userBasicInfo',
                    model: models.user_basic_info,
                    where: { deleted_at: null },
                }
            }
        ));

        if (!availableDoctorForNewAppointment || !Object.keys(availableDoctorForNewAppointment).length) {
            if (user) {
                const { userBasicInfo } = user || {};

                throw Error (`${userBasicInfo?.first_name} ${userBasicInfo?.last_name} assignment not found at the given time.`);

            } else {
                throw generateMessages('NO_PROVIDER_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME');
            }
        }

        if (availableDoctor && availableDoctor.doctor_id !== Number(doctorId) && !confirm) {
            throw generateMessages('ASSIGNMENT_TO_YOURSELF');
        }

        const {
            id: availableDoctorForNewAppointmentId,
            dateList: dateListForNewAppointment,
            start_date: availableDoctorForNewAppointmentStartDate,
            end_date: availableDoctorForNewAppointmentEndDate,
            doctor_id: availableDoctorForNewAppointmentDoctorId,
            availableSpeciality: availableDoctorSpeciality,
        } = availableDoctorForNewAppointment;

        const availabilityTimeSlotForNewAppointment: number = this.getTimeSlotOfAssignment(dateListForNewAppointment[0]);

        const endDateForNewAppointment: Date = new Date(scheduledDateTime);

        endDateForNewAppointment.setMinutes(endDateForNewAppointment.getMinutes() + availabilityTimeSlotForNewAppointment * requiredSlotsForAppointment);

        const unavailability: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
            approval_status: true,
            doctor_id: doctorId,
            end_date: { [Op.gt]: endDateForNewAppointment },
            start_date: { [Op.lte]: scheduledDateTime }
        }));

        if (unavailability && unavailability.length) {

            throw generateMessages('NO_PROVIDER_AVAILABLE');

        }

        const appointmentForUpdatedTime: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
            available_doctor_id: availableDoctorForNewAppointmentDoctorId,
            deleted_at: null,
            id: { [Op.ne]: id },
            scheduled_date_time: { [Op.between]: [availableDoctorForNewAppointmentStartDate, availableDoctorForNewAppointmentEndDate] },
        }));

        const getFreeSlotsForAvailability: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(dateListForNewAppointment[0], appointmentForUpdatedTime, availableDoctorSpeciality?.speciality?.over_booking, availabilityTimeSlotForNewAppointment, 1);

        let reuiredScheduledDateTime: Date;
        const freeSlot: typings.FreeSlotsI = getFreeSlotsForAvailability?.find((s: typings.FreeSlotsI, index: number): typings.FreeSlotsI => {

            const slotStart: Date = new Date(s.startDateTime);
            const slotEnd: Date = new Date(s.startDateTime);

            slotEnd.setMinutes(slotEnd.getMinutes() + availabilityTimeSlotForNewAppointment);
            if (slotStart.getTime() <= new Date(startDate).getTime() && new Date(startDate).getTime() < slotEnd.getTime()) {
                if (s.count > 0) {
                    reuiredScheduledDateTime = new Date(s.startDateTime);
                    return s;
                }
            }

        });

        if (!freeSlot || !Object.keys(freeSlot).length) {
            throw generateMessages('NO_SLOTS_REMAINING');
        }

        await this.__repo.update(
            id,
            {
                date_list_id: dateListForNewAppointment[0].id,
                available_doctor_id: availableDoctorForNewAppointmentId,
                scheduled_date_time: new Date(reuiredScheduledDateTime),
                time_slots: availabilityTimeSlot,
                updated_at: new Date(),
                updated_by: userId,
            },
            );

        return null;

    }

    /**
     *
     * @param formattedPatient
     * @param facilityMappedObject
     */
    private readonly availibilityWiseMapping = (formattedPatient: models.sch_appointmentsI[], facilityMappedObject: typings.ANY): typings.ANY =>

        facilityMappedObject?.map((f: typings.ANY): typings.ANY => {

            const { availibilities, ...otherAttributes } = f;

            return {

                availibilities: availibilities.map((a: typings.ANY): typings.ANY => {

                    const { date_list_id: id } = a || {};

                    return {
                        ...a,
                        appointments: this.filterNonNull([formattedPatient.filter((p: models.sch_appointmentsI): boolean => p.date_list_id === id)]).flat() || []
                    };

                }),
                ...otherAttributes
            };
        })

    private readonly checkBackDated = (appointment: typings.ANY, config?: typings.ANY): typings.ANY => {

        const { billable, appointmentVisit } = appointment || {};

        const backDatedCheck: boolean = appointmentVisit?.document_uploaded && billable !== null ? true : false;

        return {
            back_dated_check: backDatedCheck,
        };

    }

    /**
     *
     * @param date
     * @param assignment
     * @param appointments
     * @param overbooking
     * @param timeSlot
     * @returns
     */
    private readonly checkExitAppointment = async (caseId: number, speciality: models.specialities, appointmentTypeId: number, requiredStartDate: string, time_zone: number, noShowId: number): Promise<boolean> => {

        const { id: specialityId, over_booking: overBooking } = speciality;

        const samePatientAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                case_id: caseId,
                deleted_at: null,
                cancelled: false,
                pushed_to_front_desk: false,
                status_id: {
                    [Op.ne]: noShowId
                },
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(requiredStartDate), time_zone), Sequelize.col('scheduled_date_time')), {
                        [Op.and]: [
                            {
                                [Op.gt]: -1
                            },
                            {
                                [Op.lt]: 1
                            }
                        ]
                    })
                ],
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityId
                        }
                    },
                ]
            }));

        let checkSameDayAppointmentAllowed: boolean = false;
        let overbookedAppointmentCount = 0;
        for (const appointment of samePatientAppointments) {

            const { scheduled_date_time, time_slots } = appointment;
            const currentDateTime: Date = new Date(requiredStartDate);
            const existingDateTime: Date = new Date(scheduled_date_time);

            if (appointmentTypeId == appointment?.type_id && currentDateTime.getDay() === existingDateTime.getDay()) {
                checkSameDayAppointmentAllowed = true;
            }
            
            if (currentDateTime.getTime() === existingDateTime.getTime()) {
                if(overbookedAppointmentCount == overBooking){
                    throw generateMessages('SAME_TIME_APPOINTMENT_ERROR');
                }
                overbookedAppointmentCount++;
            }
        }

        return checkSameDayAppointmentAllowed;

    }

    private readonly checkVisitTypes = async (visitMap, isTranferCheck, checkSameDayAppointmentAllowed: Boolean = false, updateApppintment: models.sch_appointmentsI = null) => {

        const { caseId, patientId, appointmentTypeId, specialityId, noShowId, config } = visitMap;

        const specialityInfo: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.FRONT_DESK_URL}single_speciality`, { ...config, params: { id: specialityId } }));

        const { result: { data: { visit_types: visitTypes } } } = specialityInfo;

        visitTypes.sort((a, b) => a.position - b.position);

        let currentVisitTypeIndex: number = null;

        for (let index: number = 0; index < visitTypes.length && currentVisitTypeIndex === null; index++) {
            if (visitTypes[index].id === appointmentTypeId) {
                currentVisitTypeIndex = index;
            }
        }

        if (currentVisitTypeIndex === null) {
            throw generateMessages('SELECTED_APPOINTMENT_SPECIALITY_ERROR');
        }

        for (const type of visitTypes) {

            const {
                id,
                is_required,
                is_multiple,
                is_multiple_same_day,
                name
            } = type;

            if (id === appointmentTypeId) {
                if(checkSameDayAppointmentAllowed){
                    if(is_multiple_same_day){
                        break;
                    }
                    throw generateMessages('PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY');
                }

                if (!is_multiple) {

                    const checkExisting: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            patient_id: patientId,
                            type_id: id,
                            status_id: { [Op.ne]: noShowId },
                            pushed_to_front_desk: false
                        },
                        {
                            include: [
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        speciality_id: specialityId
                                    }
                                },
                                {
                                    as: 'appointmentVisit',
                                    model: models.visit_sessions,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                }
                            ]
                        }
                    ));

                    // Const checkSession = checkExisting && this.shallowCopy(await this.__visitSessionRepo.findOne(
                    //     {
                    //         Appointment_id: checkExisting.id,
                    //         Deleted_at: null
                    //     }
                    // ));

                    if (checkExisting || checkExisting?.appointmentVisit) {
                        if (updateApppintment){
                            const appointmentCptCodes = this.shallowCopy(await this.__schAppointmentCptCodesRepo.findAll(
                            {
                                appointment_id: updateApppintment.id,
                                deleted_at: null
                            }))
                        }
                        else{
                            throw generateMessages('APPOINTMENT_WITH_SAME_CRITERIA_EXIST');
                        }
                    
                    }
                }
                break;
            }

            if (id !== appointmentTypeId && !isTranferCheck) {

                if (is_required) {
                    const checkExisting: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            patient_id: patientId,
                            status_id: { [Op.ne]: noShowId },
                            type_id: id,
                            pushed_to_front_desk: false
                        },
                        {
                            include: [
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        speciality_id: specialityId
                                    }
                                },
                                {
                                    as: 'appointmentVisit',
                                    model: models.visit_sessions,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                }
                            ]
                        }
                    ));

                    // Const checkSession = checkExisting && this.shallowCopy(await this.__visitSessionRepo.findOne(
                    //     {
                    //         Appointment_id: checkExisting.id,
                    //         Deleted_at: null
                    //     }
                    // ));

                    if (!checkExisting) {
                        throw new Error(`${name} is required against this appointment first.`);
                    }

                    if (!checkExisting?.appointmentVisit) {
                        throw new Error(`Visit session required for ${name} apppointment first.`);
                    }
                }
            }
        }
    }

    /**
     *
     * @param appointment
     */
    private readonly confirmDescriptionsOfPatient = (appointment: models.sch_appointmentsI[]): typings.ConfirmDescriptionI[] =>

        this.filterNonNull(appointment.map((o: models.sch_appointmentsI): typings.ConfirmDescriptionI => {

            if (o.confirmation_status === 0 || o.confirmation_status === false) {
                return {
                    ...o,
                    reading_provider: o?.readingProvider,
                    confirm_description: 'Not Confirm'
                };
            }
            if (o.confirmation_status === 1 || o.confirmation_status === true) {
                return {
                    ...o,
                    reading_provider: o?.readingProvider,
                    confirm_description: 'Confirm'
                };
            }
            return o;

        }))

    /**
     *
     * @param appointment
     * @param patientInfo
     */
    private readonly confirmStatusFromKiosk = (appointment: typings.ConfirmDescriptionI[], patientInfo: typings.KioskObjI): typings.ConfirmDescriptionI[] => {

        if (!patientInfo.case_patients || !patientInfo.case_patients.length) {
            return appointment;
        }

        const { case_patients: casePatients } = patientInfo;

        for (const o of casePatients) {

            if (!o.patient_sessions.length) {
                return appointment;
            }
            return appointment.map((p: typings.ConfirmDescriptionI): typings.ConfirmDescriptionI => {
                const { availableDoctor } = p;
                const appointmentObj: typings.ConfirmDescriptionI = {
                    provider_title: (availableDoctor) ? availableDoctor?.doctor?.medicalIdentifiers?.billingTitle.name : null,
                    ...p
                };
                if (o.patient_id === p.patient_id && o.id === p.case_id && p.status_id !== 2) {
                    appointmentObj.patient_status = 'Checked In';

                    if (o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')) {
                        appointmentObj.checked_in_time = o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')?.updated_at;
                    }

                    if (o.patient_sessions[0].status === 'In Session' && o.patient_sessions[0].appointment_id === p.id) {
                        appointmentObj.patient_status = o.patient_sessions[0].status;
                        appointmentObj.in_session_time = o.patient_sessions[0].updated_at;

                        if (o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')) {
                            appointmentObj.checked_in_time = o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')?.updated_at;
                        }
                    }

                    if (o.patient_sessions[0].status === 'Checked Out' && o.patient_sessions[0].appointment_id === p.id) {

                        appointmentObj.patient_status = o.patient_sessions[0].status;
                        appointmentObj.checked_out_time = o.patient_sessions[0].updated_at;

                        if (o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'In Session')) {
                            appointmentObj.checked_in_time = o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'In Session')?.updated_at;
                        }

                        if (o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')) {
                            appointmentObj.checked_in_time = o.patient_sessions?.find((d: typings.PatientSessionsI): boolean => d.status === 'Checked In')?.updated_at;
                        }

                    }

                    if (o.patient_sessions[0].status === 'No Show' && o.patient_sessions[0].appointment_id === p.id) {
                        appointmentObj.patient_status = o.patient_sessions[0].status;
                    }
                }

                return appointmentObj;
            }).flat();
        }

    }

    private readonly convertDateToLocal = (date: Date, timeZone: number): Date => new Date(date.setMinutes(date.getMinutes() - timeZone));

    private readonly createAppointment = async (data: typings.CreateAppointmentI, authorization: string): Promise<typings.ANY> => {

        const {
            formatDates,
            startDateTime,
            existingCasePatientSession,
            appointmentStatus,
            isAlradyCheckedIn,
            desiredTimeSlot,
            doctorId,
            specialityId,
            caseId,
            patientId,
            time_zone,
            confirmationStatus,
            appointmentType,
            speciality,
            appointmentTypeId,
            facilityLocationId,
            caseType,
            comments,
            priorityId,
            isSpecialityBase,
            isSoftRegistered,
            caseTypeId,
            slotsForThisAppointment,
            userId,
            physicianId,
            transportation,
            technicianId
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: authorization },
        };

        const appointmentIdsForSocketCall: number[] = [];

        try {

            const appointments: models.sch_appointmentsI[] = await Promise.all(formatDates.map(async (requiredStartDate: Date): Promise<typings.ANY> => {

                const formattedStartDateTime: string = format(new Date(startDateTime), 'MM-dd-yyyy');
                const formattedCurrentDateTime: string = format(new Date(), 'MM-dd-yyyy');

                const checkTodayAppointment: boolean = formattedStartDateTime === formattedCurrentDateTime ? true : false;

                const appointmentStatusId: number = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? appointmentStatus.find((e: models.sch_appointment_statusesI): boolean => e.slug === 'arrived').id
                    : appointmentStatus.find((e: models.sch_appointment_statusesI): boolean => e.slug === 'scheduled').id;

                const appointmentEndTime: Date = new Date(requiredStartDate);

                appointmentEndTime?.setMinutes(appointmentEndTime?.getMinutes() + desiredTimeSlot);

                const last24Hrs: Date = new Date(requiredStartDate);
                const next24Hrs: Date = new Date(requiredStartDate);

                let last24HrsAppointment: models.sch_appointmentsI[];
                let next24HrsAppointment: models.sch_appointmentsI[];

                if (!doctorId || (doctorId && specialityId)) {

                    const patientSameDayAppointmentsForAvailableSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(requiredStartDate), time_zone), Sequelize.col('scheduled_date_time')), {
                                    [Op.and]: [
                                        {
                                            [Op.gt]: -1
                                        },
                                        {
                                            [Op.lt]: 1
                                        }
                                    ]
                                })
                            ]
                        },
                        {
                            include: {
                                as: 'availableSpeciality',
                                model: models.sch_available_specialities,
                                required: true,
                                where: {
                                    deleted_at: null,
                                    speciality_id: specialityId
                                }
                            }
                        }));

                    const patientSameDayAppointmentsForAvailableDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            cancelled: false,
                            case_id: caseId,
                            deleted_at: null,
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(requiredStartDate), time_zone), Sequelize.col('scheduled_date_time')), {
                                    [Op.and]: [
                                        {
                                            [Op.gt]: -1
                                        },
                                        {
                                            [Op.lt]: 1
                                        }
                                    ]
                                })
                            ],
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                        },
                        {
                            include: {
                                as: 'availableDoctor',
                                include:
                                {
                                    as: 'doctor',
                                    attributes: { exclude: ['password'] },
                                    include:
                                    {
                                        as: 'userFacilities',
                                        model: models.user_facility,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            speciality_id: specialityId
                                        },
                                    },
                                    model: models.users,
                                    required: true,
                                    where: { deleted_at: null },
                                },
                                model: models.sch_available_doctors,
                                required: true,
                                where: { deleted_at: null },
                            }
                        }));

                    if (patientSameDayAppointmentsForAvailableSpeciality || patientSameDayAppointmentsForAvailableDoctor) {
                        throw generateMessages('PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY');
                    }
                }

                if (!confirmationStatus) {

                    last24Hrs.setHours(last24Hrs.getHours() - 24);
                    next24Hrs.setHours(next24Hrs.getHours() + 24);

                    const appointmentFilter: typings.FilterI = {
                        cancelled: false,
                        deleted_at: null,
                        patient_id: patientId,
                        pushed_to_front_desk: false,
                    };

                    last24HrsAppointment = this.shallowCopy(await this.__repo.findAll({
                        ...appointmentFilter,
                        scheduled_date_time: { [Op.between]: [last24Hrs, requiredStartDate] },
                    }));

                    next24HrsAppointment = this.shallowCopy(await this.__repo.findAll(
                        {
                            ...appointmentFilter,
                            scheduled_date_time: { [Op.and]: [{ [Op.gt]: requiredStartDate }, { [Op.lt]: next24Hrs }] },
                        },
                        {
                            limit: 1,
                            order: [
                                ['scheduled_date_time', 'ASC']
                            ]
                        }
                    ));

                    const lastAppointments: models.sch_appointmentsI[] = last24HrsAppointment?.filter((u: models.sch_appointmentsI): models.sch_appointmentsI => {

                        const checkkEndTimeForAppointment: Date = new Date(u.scheduled_date_time);
                        checkkEndTimeForAppointment?.setMinutes(checkkEndTimeForAppointment?.getMinutes() + u.time_slots);

                        if (new Date(requiredStartDate).getTime() < checkkEndTimeForAppointment.getTime()) {
                            return u;
                        }
                    });

                    if (lastAppointments?.length) {
                        throw generateMessages('PATIENT_ALREADY_HAVE_ASSIGNMENT');
                    }

                }

                const findInitialIncludeClause: { [key: string]: typings.ANY } = {
                    include: [
                        {
                            as: 'availableDoctor',
                            include:
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },

                                include:
                                {
                                    as: 'userFacilities',
                                    model: models.user_facility,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                        speciality_id: specialityId
                                    },
                                },
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                            model: models.sch_available_doctors,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: false,
                            where: { deleted_at: null, speciality_id: specialityId },
                        },
                    ]
                };

                const findInitialWhereFilter: typings.InitialWhereFilterI = {
                    cancelled: false,
                    case_id: caseId,
                    deleted_at: null,
                    patient_id: patientId,
                    pushed_to_front_desk: false,
                    type_id: appointmentType.id,
                };

                let initialDone: boolean = false;
                let initialDoneBefore: boolean = false;

                const initialAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({ ...findInitialWhereFilter }, { ...findInitialIncludeClause }));

                const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

                const initialAppointment: models.sch_appointmentsI = initialAppointments.find((app: models.sch_appointmentsI): typings.ANY => (app.availableSpeciality || app.availableDoctor?.doctor?.userFacilities.length) && app.status_id !== noShowId);

                if (initialAppointment && Object.keys(initialAppointment).length && (initialAppointment.availableSpeciality || initialAppointment.availableDoctor?.doctor?.userFacilities)) {

                    const {

                        available_doctor_id: availableDoctorId,
                        availableDoctor,
                        scheduled_date_time: scheduledDateTime,
                        availableSpeciality,

                    } = { ...initialAppointment };

                    const specialityIds: number[] = availableDoctor?.doctor?.userFacilities?.map((a: models.user_facilityI): number => a?.speciality_id);

                    const checkSpecialityId: boolean = specialityIds?.includes(specialityId);

                    initialDone = ((availableDoctorId && checkSpecialityId) || (availableSpeciality?.speciality_id === specialityId)) && initialAppointment.status_id !== noShowId && initialAppointment.evaluation_date_time !== null ? true : false;
                    initialDone = initialAppointment.status_id !== noShowId ? true : false;

                    initialDoneBefore = initialDone && new Date(scheduledDateTime).getTime() < new Date(requiredStartDate).getTime() ? true : false;

                }

                if (appointmentTypeId === appointmentType.id && initialDone) {
                    throw generateMessages('PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT');
                }

                if (appointmentTypeId !== appointmentType.id && !initialDone) {
                    throw generateMessages('NO_INITIAL_EVALUATION_ASSIGNMENT');
                }

                if ((appointmentTypeId === appointmentType.id && !initialDone) || (appointmentTypeId !== appointmentType.id && initialDone)) {

                    const checkForDoneBefore: boolean = initialDone ? false : !initialDone && !initialDoneBefore ? false : true;

                    if (checkForDoneBefore) {
                        throw generateMessages('APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION');
                    }

                    if (appointmentTypeId !== appointmentType.id) {

                        const checkNonInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                            {
                                cancelled: false,
                                case_id: caseId,
                                deleted_at: null,
                                patient_id: patientId,
                                pushed_to_front_desk: false,
                                scheduled_date_time: { [Op.gt]: new Date(startDateTime) },
                                type_id: appointmentType.id,
                            },
                            {
                                include:
                                {
                                    as: 'availableDoctor',
                                    include:
                                    {
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include:
                                        {
                                            as: 'userFacilities',
                                            model: models.user_facility,
                                            required: true,
                                            where: {
                                                deleted_at: null,
                                                speciality_id: specialityId
                                            },
                                        },
                                        model: models.users,
                                        required: true,
                                        where: { deleted_at: null },
                                    },
                                    model: models.sch_available_doctors,
                                    required: true,
                                    where: { deleted_at: null },
                                },
                            }
                        ));

                        const checkNonInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                            {
                                cancelled: false,
                                case_id: caseId,
                                deleted_at: null,
                                patient_id: patientId,
                                pushed_to_front_desk: false,
                                scheduled_date_time: { [Op.gt]: new Date(startDateTime) },
                                type_id: appointmentType.id,
                            },
                            {
                                include:
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    where: { deleted_at: null, speciality_id: specialityId },
                                },
                            }
                        ));

                        if (checkNonInitialAppointmentAgainstSpeciality || checkNonInitialAppointmentAgainstDoctor) {

                            throw generateMessages('APPOINTMENT_NOT_CREATED_BEFORE_INTIAL');

                        }

                    } else {

                        const checkInitialAppointmentAgainstDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                            {
                                cancelled: false,
                                case_id: caseId,
                                deleted_at: null,
                                patient_id: patientId,
                                pushed_to_front_desk: false,
                                scheduled_date_time: { [Op.gt]: new Date(startDateTime) },
                                type_id: { [Op.ne]: appointmentType.id },
                            },
                            {
                                include:
                                {
                                    as: 'availableDoctor',
                                    include:
                                    {
                                        as: 'doctor',
                                        attributes: { exclude: ['password'] },
                                        include:
                                        {
                                            as: 'userFacilities',
                                            model: models.user_facility,
                                            required: true,
                                            where: {
                                                deleted_at: null,
                                                speciality_id: specialityId
                                            },
                                        },
                                        model: models.users,
                                        required: true,
                                        where: { deleted_at: null },
                                    },
                                    model: models.sch_available_doctors,
                                    required: true,
                                    where: { deleted_at: null },
                                },
                            }
                        ));

                        const checkInitialAppointmentAgainstSpeciality: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                            {
                                cancelled: false,
                                case_id: caseId,
                                deleted_at: null,
                                patient_id: patientId,
                                pushed_to_front_desk: false,
                                scheduled_date_time: { [Op.gt]: new Date(startDateTime) },
                                type_id: { [Op.ne]: appointmentType.id },
                            },
                            {
                                include:
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    where: { deleted_at: null, speciality_id: specialityId },
                                },
                            }
                        ));

                        if (checkInitialAppointmentAgainstSpeciality || checkInitialAppointmentAgainstDoctor) {

                            throw generateMessages('NO_CREATED_APPOINTMENT');

                        }

                    }

                    if (!doctorId) {

                        if (!speciality.is_create_appointment) {
                            throw generateMessages('CANNOT_CREATE_SPECIALITY_APPOINTMENT');
                        }

                        let userFacility: models.user_facilityI[] = null;

                        const userFacilityWhereClause: typings.InitialWhereFilterI = {
                            deleted_at: null,
                            facility_location_id: facilityLocationId,
                            speciality_id: specialityId,
                        };

                        const userFacilityJoinClause: { [key: string]: typings.ANY } = {
                            include: {
                                as: 'users',
                                include: {
                                    as: 'medicalIdentifiers',
                                    model: models.medical_identifiers,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        wcb_auth: 1,
                                    }
                                }
                                ,
                                model: models.users,
                                required: true,
                                where: {
                                    deleted_at: null,
                                }
                            }
                        };

                        if (caseType === 'worker_compensation') {
                            userFacility = this.shallowCopy(await this.__userFacilityRepo.findAll(
                                { ...userFacilityWhereClause },
                                { ...userFacilityJoinClause }
                            ));
                        }

                        if ((caseType === 'worker_compensation') && (!userFacility || !userFacility.length)) {
                            throw generateMessages('NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION');
                        }

                        const assignmentFromSpecialityAvailablity: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
                            {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                                speciality_id: specialityId,
                            },
                            {
                                include: [
                                    {
                                        as: 'appointments',
                                        model: models.sch_appointments,
                                        required: false,
                                        where: {
                                            deleted_at: null,
                                        }
                                    },
                                    {
                                        as: 'dateList',
                                        model: models.sch_recurrence_date_lists,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            end_date: { [Op.gte]: appointmentEndTime },
                                            start_date: { [Op.lte]: requiredStartDate },

                                        },
                                    },
                                ]
                            }
                        ));

                        if (!assignmentFromSpecialityAvailablity || !assignmentFromSpecialityAvailablity.length) {
                            throw generateMessages('NO_SPECIALITY_ASSIGNMENT_FOUND');
                        }

                        let availableSpecialityToFound: typings.AssignmentObjectForSlots;
                        let thisAssignmentTimeSlot: number;

                        let assignmentStartDateTime: Date = new Date(requiredStartDate);

                        const specialityAssignmentObject: typings.AssignmentObjectForSlots[] = assignmentFromSpecialityAvailablity.map((i: models.sch_available_specialitiesI): typings.AssignmentObjectForSlots[] => {
                            const { dateList: dateListOfSpeciality } = i;

                            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): typings.AssignmentObjectForSlots => ({

                                appointments: i.appointments,
                                date_list_id: d.id,
                                end_date: d.end_date,
                                id: i.id,
                                no_of_doctors: d.no_of_doctors,
                                no_of_slots: d.no_of_slots,
                                start_date: d.start_date,

                            }));

                        }).flat();

                        for (const u of specialityAssignmentObject) {

                            thisAssignmentTimeSlot = this.getTimeSlotOfAssignment(u);

                            const endDateTime: Date = new Date(requiredStartDate);
                            endDateTime.setMinutes(endDateTime.getMinutes() + (thisAssignmentTimeSlot * slotsForThisAppointment));

                            if (confirmationStatus || !next24HrsAppointment.length || new Date(next24HrsAppointment[0]?.scheduled_date_time).getTime() > new Date(endDateTime).getTime()) {

                                const availableFreeSlots: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(u, u?.appointments, (speciality?.over_booking + 1) * u?.no_of_doctors, thisAssignmentTimeSlot);

                                const freeSlotforAssignment: typings.FreeSlotsI = availableFreeSlots.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                                    const slotStart: Date = new Date(s?.startDateTime);
                                    const slotEnd: Date = new Date(s?.startDateTime);

                                    slotEnd.setMinutes(slotEnd.getMinutes() + thisAssignmentTimeSlot);
                                    if (slotStart.getTime() <= new Date(requiredStartDate).getTime() && new Date(requiredStartDate).getTime() < slotEnd.getTime()) {
                                        if (s.count > 0) {
                                            return s;
                                        }
                                    }

                                });

                                assignmentStartDateTime = freeSlotforAssignment?.startDateTime;

                                if (freeSlotforAssignment && Object.keys(freeSlotforAssignment).length) {
                                    availableSpecialityToFound = u;
                                }
                            }

                        }

                        if (!availableSpecialityToFound) {
                            throw generateMessages('NO_SLOTS_REMAINING');
                        }

                        const createdAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.create({
                            available_speciality_id: availableSpecialityToFound?.id,
                            case_id: caseId,
                            case_type_id: caseTypeId,
                            chartNo: patientId,
                            comments,
                            confirmation_status: confirmationStatus,
                            created_by: userId,
                            date_list_id: availableSpecialityToFound?.date_list_id,
                            is_speciality_base: isSpecialityBase,
                            patient_id: patientId,
                            priority_id: priorityId ? priorityId : null,
                            scheduled_date_time: requiredStartDate,
                            status_id: appointmentStatusId,
                            time_slots: thisAssignmentTimeSlot * slotsForThisAppointment,
                            type_id: appointmentTypeId,
                            is_soft_registered: isSoftRegistered,
                            is_active: isSoftRegistered ? false : true,
                            physician_id: physicianId,
                            technician_id: technicianId
                        }));

                        if (transportation && transportation.length) {

                            // Await this.addTransportations(createdAppointment.id, transportation);
                        }

                        appointmentIdsForSocketCall.push(createdAppointment.id);

                        try {

                            const patientStatusesSlug: string = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? 'checked_in' : 'scheduled';
                            const patientSessionStatus: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: patientStatusesSlug } }));

                            const { result: { data: responseDataForPatient } } = patientSessionStatus || {};
                            await this.__http.post(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: responseDataForPatient[0]?.id, appointment_id: createdAppointment.id, trigger_socket: true, request_from_sch: true }, config);

                        } catch (error) {

                            await this.deleteAppointmentById(createdAppointment.id, userId);
                            throw error;
                        }

                        return createdAppointment;

                    }

                    const doctorHasWcbAuth: models.medical_identifiersI = this.shallowCopy(await this.__medicalIdentifierRepo.findOne({
                        deleted_at: null,
                        user_id: doctorId,
                        wcb_auth: true,
                    }));

                    if ((caseType === 'worker_compensation') && (!doctorHasWcbAuth || !Object.keys(doctorHasWcbAuth).length)) {
                        throw generateMessages('PROVIDER_DOES_NOT_HAVE_WC_AUTH');
                    }

                    const getAvailableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                        {
                            deleted_at: null,
                            doctor_id: doctorId,
                            facility_location_id: facilityLocationId,
                        },
                        {
                            include: {
                                as: 'dateList',
                                model: models.sch_recurrence_date_lists,
                                required: true,
                                where: {
                                    deleted_at: null,
                                    end_date: { [Op.gte]: appointmentEndTime },
                                    start_date: { [Op.lte]: requiredStartDate }
                                },
                            },
                        }
                    ));

                    if (!getAvailableDoctor || !Object.keys(getAvailableDoctor).length) {
                        throw generateMessages('ASSIGNMENT_NOT_FOUND');
                    }

                    const { dateList: dateListOfDoctor } = getAvailableDoctor || {};

                    const availableDoctor: typings.AvailableDoctorFromDateList = {
                        available_speciality_id: getAvailableDoctor?.available_speciality_id,
                        date_list_id: dateListOfDoctor[0].id,
                        end_date: dateListOfDoctor[0].end_date,
                        id: getAvailableDoctor.id,
                        no_of_slots: getAvailableDoctor.no_of_slots,
                        start_date: dateListOfDoctor[0].start_date,
                    };

                    const endDateTimeWithDoctor: Date = new Date(requiredStartDate);
                    const assignmentTimeSlotWithDoctor: number = this.getTimeSlotOfAssignment(availableDoctor);

                    endDateTimeWithDoctor.setMinutes(endDateTimeWithDoctor.getMinutes() + (assignmentTimeSlotWithDoctor * slotsForThisAppointment));

                    if (!confirmationStatus && next24HrsAppointment?.length && new Date(next24HrsAppointment[0]?.scheduled_date_time).getTime() < new Date(endDateTimeWithDoctor).getTime()) {
                        throw generateMessages('PATIENT_ALREADY_HAVE_ASSIGNMENT');
                    }

                    const appointmentsOfDoctor: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
                        available_doctor_id: availableDoctor.id,
                        cancelled: false,
                        deleted_at: null,
                        pushed_to_front_desk: false,
                    }));

                    const availableFreeSlotsWithDoctor: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(availableDoctor, appointmentsOfDoctor, (speciality.over_booking + 1), assignmentTimeSlotWithDoctor);
                    const freeSlot: typings.FreeSlotsI = availableFreeSlotsWithDoctor?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                        const slotStart: Date = new Date(s.startDateTime);
                        const slotEnd: Date = new Date(s.startDateTime);

                        slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlotWithDoctor);

                        if (slotStart.getTime() <= requiredStartDate.getTime() && requiredStartDate.getTime() < slotEnd.getTime()) {
                            if (s.count > 0) {
                                return s;
                            }
                        }

                    });

                    if (!freeSlot || !Object.keys(freeSlot).length) {
                        throw generateMessages('NO_SLOTS_REMAINING');
                    }

                    const doctorUnavailability: typings.ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
                        [Op.or]: [
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        end_date: { [Op.gt]: endDateTimeWithDoctor },
                                        start_date: { [Op.lte]: requiredStartDate }
                                    },
                                ]
                            },
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        start_date: { [Op.gte]: requiredStartDate, [Op.lt]: endDateTimeWithDoctor }
                                    },
                                ]
                            }
                        ]
                    }));

                    if (doctorUnavailability && Object.keys(doctorUnavailability).length) {

                        throw generateMessages('NO_PROVIDER_AVAILABLE');

                    }

                    const createdAppointmentWithDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.create({
                        available_doctor_id: availableDoctor?.id,
                        available_speciality_id: availableDoctor?.available_speciality_id,
                        case_id: caseId,
                        case_type_id: caseTypeId,
                        chartNo: patientId,
                        comments,
                        confirmation_status: confirmationStatus,
                        created_by: userId,
                        date_list_id: availableDoctor?.date_list_id,
                        is_speciality_base: isSpecialityBase,
                        patient_id: patientId,
                        priority_id: priorityId ? priorityId : null,
                        scheduled_date_time: requiredStartDate,
                        status_id: appointmentStatusId,
                        time_slots: assignmentTimeSlotWithDoctor * slotsForThisAppointment,
                        type_id: appointmentTypeId,
                        is_soft_registered: isSoftRegistered,
                        is_active: isSoftRegistered ? false : true,
                        physician_id: physicianId,
                        technician_id: technicianId
                    }));

                    if (transportation && transportation.length) {
                        // Await this.addTransportations(createdAppointmentWithDoctor.id, transportation);
                    }

                    appointmentIdsForSocketCall.push(createdAppointmentWithDoctor.id);

                    try {

                        const patientStatusesSlug: string = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? 'checked_in' : 'scheduled';
                        const patientSessionStatusWithDoctor: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: patientStatusesSlug } }));

                        const { result: { data: responseData } } = patientSessionStatusWithDoctor || {};

                        await this.__http.post(`${process.env.KIOSK_URL}case-patient-session`, { case_id: caseId, status_id: responseData[0]?.id, appointment_id: createdAppointmentWithDoctor.id, trigger_socket: true, request_from_sch: true }, config);

                    } catch (error) {

                        await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                        throw error;

                    }

                    const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            id: createdAppointmentWithDoctor.id
                        },
                        {
                            include: [
                                {
                                    as: 'appointmentStatus',
                                    model: models.sch_appointment_statuses,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                                {
                                    as: 'patient',
                                    model: models.kiosk_patient,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                                {
                                    as: 'caseType',
                                    model: models.kiosk_case_types,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                            ]
                        }
                    ));

                    const endTime: Date = new Date(newAppointment.scheduled_date_time);
                    endTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);

                    const contactPersonType: models.kiosk_contact_person_typesI = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));

                    const selfContactPerson: models.kiosk_contact_personI = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
                        case_id: newAppointment.case_id,
                        contact_person_type_id: contactPersonType.id,
                        deleted_at: null
                    }));

                    // If (selfContactPerson && selfContactPerson.email) {
                    //     // tslint:disable-next-line: no-floating-promises
                    //     This.sentEmailForAppointment({
                    //         AppointmentId: newAppointment.id,
                    //         AppointmentStatus: newAppointment.appointmentStatus.name,
                    //         CaseId: newAppointment.case_id,
                    //         CaseType: newAppointment.caseType.name,
                    //         ConfirmationStatus: newAppointment.confirmation_status,
                    //         Email: selfContactPerson.email,
                    //         EmailTitle: 'Create Appointment',
                    //         EndDateTime: new Date(endTime),
                    //         PatientLastName: newAppointment.patient.last_name,
                    //         Reason: 'created',
                    //         ScheduledDateTime: new Date(newAppointment.scheduled_date_time),
                    //         TimeSlot: newAppointment.time_slots,
                    //     });
                    // }

                    return createdAppointmentWithDoctor;

                }

            }));

            if (appointmentIdsForSocketCall && appointmentIdsForSocketCall.length) {

                const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIdsForSocketCall, user_id: userId }, authorization);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                // This.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIdsForSocketCall, email_title: 'Appointment Created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIdsForSocketCall }, config);

            }

            return appointments;

        } catch (error) {

            if (appointmentIdsForSocketCall && appointmentIdsForSocketCall.length) {

                const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIdsForSocketCall, user_id: userId }, authorization);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                // This.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIdsForSocketCall, email_title: 'Appointment Created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIdsForSocketCall }, config);

            }

            throw error;
        }
    }
    private readonly isOverlaping = (scheduledTimes,startTime,endTime)=>{
        startTime=startTime.getTime()
        endTime=endTime.getTime()
        
        let count = 0
        let exist = false
        for (let i=0;i<scheduledTimes.length;++i){
            const o=scheduledTimes[i]
            if ( (o[0] <= startTime && startTime < o[1])  || ( o[0] < endTime  && endTime <= o[1])) {
                count += 1
                exist = true
            }
        }
        return  {count,exist}    
    }
    private readonly removeOverlapping = (intervals)=>{
        intervals.sort()
        const stack = []
        for (const interval of intervals){
            if (!stack.length){
                stack.push(this.shallowCopy(interval))
            }
            else{
                if (stack[stack.length-1][0] <= interval[0] && interval[0] <= stack[stack.length-1][1]){
                    stack[stack.length-1][1] = Math.max(stack[stack.length-1][1],interval[1])
                } 
                else{
                    stack.push(this.shallowCopy(interval))
                }
            }
        }

        return stack

    }
    private readonly findFreeSlot = (intervals,startTime,endTime)=>{
        
        startTime=startTime.getTime()
        endTime=endTime.getTime()
        const requiredGap = endTime-startTime
        let result=0;
        if(intervals.length>1){
            for(let i=1;i<intervals.length;++i){
                const prevInterval=intervals[i-1]
                const interval=intervals[i]
                const currGap = prevInterval[1]-interval[0]
                if (currGap >= requiredGap){
                    result = prevInterval[1]
                }
            }
            if(result == 0){
                result = intervals[intervals.length-1][1] 
            }
        }
        else{
            result=intervals[0][1]
        }       
        return startTime>result?startTime:result   
    }

    private readonly multipleAppointmentsAgainstCptCode = async (data: any, flag:boolean = true ): Promise<any[]> => {

        const appointmentObjs: any[] = [];
        const specialitVisit = data.speciality?.specialityVisitType
        
        if (data.speciality) {
            if (data.speciality.is_multiple_visit && specialitVisit && specialitVisit.length && specialitVisit[0].is_multiple_same_day) {
                let overBookingCount = data.speciality.over_booking
                const cptCodeCopy = this.shallowCopy(data.cptCodes?data.cptCodes:[])
                data.cptCodes = []
                const appointmentEndTime: Date = new Date(data.startDateTime);
                appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + data.desiredTimeSlot);
                const includeClause: typings.ANY = [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            end_date: { [Op.gte]: appointmentEndTime },
                            start_date: { [Op.lte]: data.startDateTime }
                        },
                    },
                    ...(data.specialityId && [{
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            speciality_id: data.specialityId,
                            deleted_at: null,
                        }
                    }])
                ];
                let getAvailableObj;
                if (!data.doctorId){
                     getAvailableObj =  this.shallowCopy(await this.__availableSpecialityRepo.findOne(
                        {
                            speciality_id: data.specialityId,
                            facility_location_id: data.facilityLocationId,
                            deleted_at: null
                        },
                        {
                            include: [
                                {
                                    as: 'dateList',
                                    model: models.sch_recurrence_date_lists,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        end_date: { [Op.gte]: appointmentEndTime }, 
                                        start_date: { [Op.lte]: data.startDateTime } 
                                    },
                                }
                            ]
                        }
                    ))
                }
                else{
                    getAvailableObj = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                        {
                            deleted_at: null,
                            doctor_id: data.doctorId,
                            facility_location_id: data.facilityLocationId
                        },
                        {
                            include: includeClause
                        }
                    ));
                }
                if (getAvailableObj?.dateList && getAvailableObj.dateList.length) {
                    const doctorFilter: typings.ANY = [];
                    if (data.doctorId) {
                        doctorFilter.push(
                            {
                                as: 'availableDoctor',
                                model: models.sch_available_doctors,
                                required: true,
                                where: { 
                                    deleted_at: null,
                                    doctor_id: data.doctorId
                                 },
                            }
                        );
                    }
                    const getScheduledAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                        {
                            cancelled: false,
                            deleted_at: null,
                            pushed_to_front_desk: false,
                            ...(!data.doctorId && {available_doctor_id:null}),
                            ...(data.doctorId && {available_doctor_id:{[Op.not]: null}}),
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(data.startDateTime), data.time_zone), Sequelize.col('scheduled_date_time')), {
                                    [Op.and]: [
                                        {
                                            [Op.gt]: -1
                                        },
                                        {
                                            [Op.lt]: 1
                                        }
                                    ]
                                })
                            ]
                        },
                        {
                            include: [
                                {
                                    as: 'availableSpeciality',
                                    model: models.sch_available_specialities,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        speciality_id: data.specialityId
                                    }
                                },
                                ...doctorFilter
                            ]

                        }));
                    const sameTimeLS = getScheduledAppointments.map((e)=>{
                        if (e?.availableSpeciality?.speciality_id == data.specialityId){
                            return new Date(e.scheduled_date_time).toISOString()
                        }
                    })
                    const mapCounter = lodash.countBy(sameTimeLS)

                    let idx=0
                    const currTime = new Date(data.startDateTime)
                    if (!cptCodeCopy?.length){
                        if(currTime.toISOString() in mapCounter){
                            if (overBookingCount >= mapCounter[currTime.toISOString()]) {
                                appointmentObjs.push(data)
                                return appointmentObjs
                            }
                            else{
                                throw generateMessages('NO_SLOTS_REMAINING');
                            }
                        }
                        else{
                            const isValidTime = new Date(currTime)
                            if ((new Date(getAvailableObj.dateList[0].end_date)).getTime() < isValidTime.setMinutes(isValidTime.getMinutes() + data.desiredTimeSlot)){
                                return []
                            }  
                            appointmentObjs.push(data)
                            return appointmentObjs
                        }
                    }
                    while( idx<cptCodeCopy.length){                 
                        if (overBookingCount) {
                            if (!(currTime.toISOString() in mapCounter)){ // if overlapping not exists
                                data.cptCodes.push(cptCodeCopy[idx])
                                appointmentObjs.push(this.shallowCopy(data))
                                mapCounter[currTime.toISOString()] = 1
                                data.cptCodes = []
                                idx+=1
                                if (idx>=cptCodeCopy.length){
                                    return appointmentObjs
                                }
                            }
                            else { // if overlapping exists
                                // check is it under overbooking
                                if (overBookingCount >= mapCounter[currTime.toISOString()]) { // overbooking satisfied
                                    data.cptCodes.push(cptCodeCopy[idx])
                                    appointmentObjs.push(this.shallowCopy(data))
                                    mapCounter[currTime.toISOString()] += 1
                                    data.cptCodes = []
                                    idx+=1
                                    if (idx >= cptCodeCopy.length){
                                        return appointmentObjs
                                    }
                                }
                                else { // overlapping exceed the overbooking count (will go to next slot)
                                    if (idx==0 && flag){ // not found on first slot
                                        throw generateMessages('NO_SLOTS_REMAINING');
                                    }
                                    currTime.setMinutes(currTime.getMinutes() + data.desiredTimeSlot);
                                    data.startDateTime = currTime
                                    if(data.formatDates.length>1){
                                        data.formatDates = data.formatDates.map((e)=>{ 
                                            e.setHours(currTime.getHours())
                                            e.setMinutes(currTime.getMinutes())
                                            e.setSeconds(currTime.getSeconds())
                                            return e
                                        })
                                    }
                                    else{
                                        data.formatDates = [currTime] 
                                    }
                                }
                            }
                        }
                        else {
                            if (!(currTime.toISOString() in mapCounter)){ // if overlapping not exists
                                data.cptCodes.push(cptCodeCopy[idx])
                                appointmentObjs.push(this.shallowCopy(data))
                                mapCounter[currTime.toISOString()] = 1
                                data.cptCodes = []
                                idx+=1
                                if (idx>=cptCodeCopy.length){
                                    return appointmentObjs
                                }
                            }
                            else{
                                if(idx==0 && flag){
                                    throw generateMessages('NO_SLOTS_REMAINING');
                                }
                            }
                            // will go to the next slot.
                            currTime.setMinutes(currTime.getMinutes() + data.desiredTimeSlot);
                            data.startDateTime = currTime
                            if(data.formatDates.length>1){
                                data.formatDates = data.formatDates.map((e)=>{ 
                                    e.setHours(currTime.getHours())
                                    e.setMinutes(currTime.getMinutes())
                                    e.setSeconds(currTime.getSeconds())
                                    return e
                                })
                            }
                            else{
                                data.formatDates = [currTime] 
                            }
                        }
                        // checking are we inside the availability slots.
                        const isValidTime = new Date(currTime)
                        if ((new Date(getAvailableObj.dateList[0].end_date)).getTime() < isValidTime.setMinutes(isValidTime.getMinutes() + data.desiredTimeSlot)){
                            return appointmentObjs
                        }   
                        
                    }
                }
            }
            else{
                if (!specialitVisit[0].is_multiple_same_day){
                    const appointmentEndTime: Date = new Date(data.startDateTime);
                    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + data.desiredTimeSlot);
                    const includeClause: typings.ANY = [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gte]: appointmentEndTime },
                                start_date: { [Op.lte]: data.startDateTime }
                            },
                        },
                        ...(data.specialityId && [{
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: true,
                            where: {
                                speciality_id: data.specialityId,
                                deleted_at: null,
                            }
                        }])
                    ];
                    let getAvailableObj;
                    if (!data.doctorId){
                         getAvailableObj =  this.shallowCopy(await this.__availableSpecialityRepo.findOne(
                            {
                                speciality_id: data.specialityId,
                                facility_location_id: data.facilityLocationId,
                                deleted_at: null
                            },
                            {
                                include: [
                                    {
                                        as: 'dateList',
                                        model: models.sch_recurrence_date_lists,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            end_date: { [Op.gte]: appointmentEndTime }, 
                                            start_date: { [Op.lte]: data.startDateTime } 
                                        },
                                    }
                                ]
                            }
                        ))
                    }
                    else{
                        getAvailableObj = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                            {
                                deleted_at: null,
                                doctor_id: data.doctorId,
                                facility_location_id: data.facilityLocationId
                            },
                            {
                                include: includeClause
                            }
                        ));
                    }
                    if (getAvailableObj?.dateList && getAvailableObj.dateList.length) {
                        const doctorFilter: typings.ANY = [];
                        if (data.doctorId) {
                            doctorFilter.push(
                                {
                                    as: 'availableDoctor',
                                    model: models.sch_available_doctors,
                                    required: true,
                                    where: { 
                                        deleted_at: null,
                                        doctor_id: data.doctorId
                                     },
                                }
                            );
                        }
                        const getScheduledAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                            {
                                cancelled: false,
                                case_id: data.caseId,
                                deleted_at: null,
                                patient_id: data.patientId,
                                pushed_to_front_desk: false,
                                ...(!data.doctorId && {available_doctor_id:null}),
                                ...(data.doctorId && {available_doctor_id:{[Op.not]: null}}),
                                [Op.and]: [
                                    Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(data.startDateTime), data.time_zone), Sequelize.col('scheduled_date_time')), {
                                        [Op.and]: [
                                            {
                                                [Op.gt]: -1
                                            },
                                            {
                                                [Op.lt]: 1
                                            }
                                        ]
                                    })
                                ]
                            },
                            {
                                include: [
                                    {
                                        as: 'availableSpeciality',
                                        model: models.sch_available_specialities,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            speciality_id: data.speciality.id
                                        }
                                    },
                                    ...doctorFilter
                                ]
    
                            }));
                        if(getScheduledAppointments.length){
                            return []
                        }
                        const sameTimeLS = getScheduledAppointments.map((e)=>{
                            if (e.availableSpeciality.speciality_id == data.specialityId){
                                return new Date(e.scheduled_date_time).toISOString()
                            }
                        })
                        const mapCounter = lodash.countBy(sameTimeLS)
                        const currTime = new Date(data.startDateTime) 
                        const isValidTime = new Date(currTime)
                        if (((new Date(getAvailableObj.dateList[0].end_date)).getTime() < isValidTime.setMinutes(isValidTime.getMinutes() + data.desiredTimeSlot))){
                            await this.throwErrorOnInitialSlotNotAvailable(data.cptCodes,data.doctorId)
                        }
                        if (currTime.toISOString() in mapCounter) {
                            return []
                        }
                        if (data.cptCodes?.length && data.speciality.is_multiple_visit){
                            data.cptCodes = [data.cptCodes[0]]
                        }
                        appointmentObjs.push(data)
                        return appointmentObjs
                    }
                    else{
                        await this.throwErrorOnInitialSlotNotAvailable(data.cptCodes,data.doctorId)
                    }
                    
                }
                appointmentObjs.push(data)
            }
        }
        return appointmentObjs;
    }

    private readonly createAppointmentV1 = async (data: typings.CreateAppointmentI,totalappointments,totalCptCodes,i, authorization: string): Promise<typings.ANY> => {
        const {
            sessionStatusId,
            undoAppointmentStatusId,
            formatDates,
            startDateTime,
            existingCasePatientSession,
            appointmentStatus,
            isAlradyCheckedIn,
            desiredTimeSlot,
            doctorId,
            specialityId,
            caseId,
            patientId,
            time_zone,
            confirmationStatus,
            appointmentType,
            speciality,
            appointmentTypeId,
            facilityLocationId,
            caseType,
            comments,
            priorityId,
            isSpecialityBase,
            isSoftRegistered,
            caseTypeId,
            slotsForThisAppointment,
            userId,
            physicianId,
            transportation,
            technicianId,
            cptCodes,
            readingProviderId,
            cdImage,
            isTransportation
        } = data;

        const config: typings.GenericHeadersI = {
            headers: { Authorization: authorization },
        };

        const appointmentIdsForSocketCall: number[] = [];

        const { is_transferring_case: isTransferringCase }: models.kiosk_casesI = this.shallowCopy(await this.__kioskCaseRepo.findOne(
            {
                id: caseId
            },
            {
                attributes: ['is_transferring_case']
            }
        ));

        try {

            if (specialityId) {
                const speciality: models.specialities = this.shallowCopy(await this.__specialityRepo.findOne(
                    {
                        deleted_at: null,
                        id: specialityId,
                    }
                ));
                if (!speciality.is_create_appointment && !doctorId) {
                    throw Error(`Selected speciality doesn't allow appointments to be created`);
                }
            }

            const { id: noShowId }: models.sch_appointment_statusesI = this.shallowCopy(await this.__appointmentStatusRepo.findOne({ slug: 'no_show' }));

            const appointments: models.sch_appointmentsI[] = await Promise.all(formatDates.map(async (requiredStartDate: Date): Promise<typings.ANY> => {

                const __transaction = await sequelize.transaction();

                try {

                    const formattedStartDateTime: string = format(new Date(startDateTime), 'MM-dd-yyyy');
                    const formattedCurrentDateTime: string = format(new Date(), 'MM-dd-yyyy');

                    const checkTodayAppointment: boolean = formattedStartDateTime === formattedCurrentDateTime ? true : false;

                    const appointmentStatusId: number = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? appointmentStatus.find((e: models.sch_appointment_statusesI): boolean => e.slug === 'arrived').id
                        : appointmentStatus.find((e: models.sch_appointment_statusesI): boolean => e.slug === 'scheduled').id;

                    const appointmentEndTime: Date = new Date(requiredStartDate);

                    appointmentEndTime?.setMinutes(appointmentEndTime?.getMinutes() + desiredTimeSlot);

                    const last24Hrs: Date = new Date(requiredStartDate);
                    const next24Hrs: Date = new Date(requiredStartDate);

                    let last24HrsAppointment: models.sch_appointmentsI[];
                    let next24HrsAppointment: models.sch_appointmentsI[];

                    let checkSameDayAppointmentAllowed: Boolean = false;

                    if (!doctorId || (doctorId && specialityId)) {

                        const doctorFilter: typings.ANY = [];
                        if (doctorId) {
                            doctorFilter.push(
                                {
                                    as: 'availableDoctor',
                                    model: models.sch_available_doctors,
                                    required: false,
                                    where: { deleted_at: null },
                                }
                            );
                        }

                        const sameAppointmentChecks: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
                            {
                                cancelled: false,
                                case_id: caseId,
                                deleted_at: null,
                                patient_id: patientId,
                                pushed_to_front_desk: false,
                                [Op.and]: [
                                    Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(requiredStartDate), time_zone), Sequelize.col('scheduled_date_time')), {
                                        [Op.and]: [
                                            {
                                                [Op.gt]: -1
                                            },
                                            {
                                                [Op.lt]: 1
                                            }
                                        ]
                                    })
                                ]
                            },
                            {
                                include: [
                                    {
                                        as: 'availableSpeciality',
                                        model: models.sch_available_specialities,
                                        required: false,
                                        where: {
                                            deleted_at: null,
                                        }
                                    },
                                    ...doctorFilter
                                ]
                            }));

                        for (const singleSpeciality of sameAppointmentChecks) {

                            const { scheduled_date_time, time_slots } = singleSpeciality;
                            const currentDateTime: Date = new Date(startDateTime);
                            const existingDateTime: Date = new Date(scheduled_date_time);
                            const existingDateTimeWithTimeSlot: Date = new Date(existingDateTime.getTime() + (time_slots * 60000));

                            if (singleSpeciality?.availableSpeciality?.speciality_id == specialityId && appointmentTypeId == singleSpeciality?.type_id && currentDateTime.getDay() === existingDateTime.getDay()) {
                                checkSameDayAppointmentAllowed = true;
                            }

                            if (specialityId == singleSpeciality?.availableSpeciality?.speciality_id && currentDateTime.getTime() === existingDateTime.getTime()  && !speciality?.specialityVisitType[0]?.is_multiple_same_day) {
                                // await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId)
                                throw generateMessages('SAME_TIME_APPOINTMENT_ERROR');
                            }

                            if ((currentDateTime.getTime() >= existingDateTime.getTime() && currentDateTime.getTime() < existingDateTimeWithTimeSlot.getTime() && !speciality?.specialityVisitType[0]?.is_multiple_same_day)) {
                                // await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId)
                                throw generateMessages('TIME_SLOTS_ISSUE');
                            }
                        }
                    }

                    if (!confirmationStatus) {

                        last24Hrs.setHours(last24Hrs.getHours() - 24);
                        next24Hrs.setHours(next24Hrs.getHours() + 24);

                        const appointmentFilter: typings.FilterI = {
                            cancelled: false,
                            deleted_at: null,
                            patient_id: patientId,
                            pushed_to_front_desk: false,
                        };

                        last24HrsAppointment = this.shallowCopy(await this.__repo.findAll({
                            ...appointmentFilter,
                            scheduled_date_time: { [Op.between]: [last24Hrs, requiredStartDate] },
                        }));

                        next24HrsAppointment = this.shallowCopy(await this.__repo.findAll(
                            {
                                ...appointmentFilter,
                                scheduled_date_time: { [Op.and]: [{ [Op.gt]: requiredStartDate }, { [Op.lt]: next24Hrs }] },
                            },
                            {
                                limit: 1,
                                order: [
                                    ['scheduled_date_time', 'ASC']
                                ]
                            }
                        ));

                        const lastAppointments: models.sch_appointmentsI[] = last24HrsAppointment?.filter((u: models.sch_appointmentsI): models.sch_appointmentsI => {

                            const checkkEndTimeForAppointment: Date = new Date(u.scheduled_date_time);
                            checkkEndTimeForAppointment?.setMinutes(checkkEndTimeForAppointment?.getMinutes() + u.time_slots);

                            if (new Date(requiredStartDate).getTime() < checkkEndTimeForAppointment.getTime()) {
                                return u;
                            }
                        });

                    }

                    const visitMap: typings.ANY = { caseId, patientId, appointmentTypeId, specialityId, noShowId, config };

                    await this.checkVisitTypes(visitMap, isTransferringCase, checkSameDayAppointmentAllowed);

                    if (!doctorId) {

                        if (!speciality.is_create_appointment) {
                            throw generateMessages('CANNOT_CREATE_SPECIALITY_APPOINTMENT');
                        }

                        let userFacility: models.user_facilityI[] = null;

                        const userFacilityWhereClause: typings.InitialWhereFilterI = {
                            deleted_at: null,
                            facility_location_id: facilityLocationId,
                            speciality_id: specialityId,
                        };

                        const userFacilityJoinClause: { [key: string]: typings.ANY } = {
                            include: {
                                as: 'users',
                                include: {
                                    as: 'medicalIdentifiers',
                                    model: models.medical_identifiers,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        wcb_auth: 1,
                                    }
                                }
                                ,
                                model: models.users,
                                required: true,
                                where: {
                                    deleted_at: null,
                                }
                            }
                        };

                        if (caseType === 'worker_compensation') {
                            userFacility = this.shallowCopy(await this.__userFacilityRepo.findAll(
                                { ...userFacilityWhereClause },
                                { ...userFacilityJoinClause }
                            ));
                        }

                        if ((caseType === 'worker_compensation') && (!userFacility || !userFacility.length)) {
                            throw generateMessages('NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION');
                        }

                        const assignmentFromSpecialityAvailablity: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__availableSpecialityRepo.findAll(
                            {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                                speciality_id: specialityId,
                            },
                            {
                                include: [
                                    {
                                        as: 'appointments',
                                        model: models.sch_appointments,
                                        required: false,
                                        where: {
                                            deleted_at: null,
                                        }
                                    },
                                    {
                                        as: 'dateList',
                                        model: models.sch_recurrence_date_lists,
                                        required: true,
                                        where: {
                                            deleted_at: null,
                                            end_date: { [Op.gte]: appointmentEndTime },
                                            start_date: { [Op.lte]: requiredStartDate },

                                        },
                                    },
                                ]
                            }
                        ));

                        if (!assignmentFromSpecialityAvailablity || !assignmentFromSpecialityAvailablity.length) {
                            await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId,speciality)
                            // throw generateMessages('NO_SPECIALITY_ASSIGNMENT_FOUND');
                        }

                        let availableSpecialityToFound: typings.AssignmentObjectForSlots;
                        let thisAssignmentTimeSlot: number;

                        let assignmentStartDateTime: Date = new Date(requiredStartDate);

                        const specialityAssignmentObject: typings.AssignmentObjectForSlots[] = assignmentFromSpecialityAvailablity.map((i: models.sch_available_specialitiesI): typings.AssignmentObjectForSlots[] => {
                            const { dateList: dateListOfSpeciality } = i;

                            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): typings.AssignmentObjectForSlots => ({

                                appointments: i.appointments,
                                date_list_id: d.id,
                                end_date: d.end_date,
                                id: i.id,
                                no_of_doctors: d.no_of_doctors,
                                no_of_slots: d.no_of_slots,
                                start_date: d.start_date,

                            }));

                        }).flat();

                        for (const u of specialityAssignmentObject) {
                            thisAssignmentTimeSlot = this.getTimeSlotOfAssignment(u);
                            const endDateTime: Date = new Date(requiredStartDate);
                            endDateTime.setMinutes(endDateTime.getMinutes() + (thisAssignmentTimeSlot * slotsForThisAppointment));
                            if (confirmationStatus || !next24HrsAppointment.length || new Date(next24HrsAppointment[0]?.scheduled_date_time).getTime() >= new Date(endDateTime).getTime()) {
                            
                                const availableFreeSlots: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(u, u?.appointments, (speciality?.over_booking + 1) * u?.no_of_doctors, thisAssignmentTimeSlot);

                                const freeSlotforAssignment: typings.FreeSlotsI = availableFreeSlots.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                                    const slotStart: Date = new Date(s?.startDateTime);
                                    const slotEnd: Date = new Date(s?.startDateTime);

                                    slotEnd.setMinutes(slotEnd.getMinutes() + thisAssignmentTimeSlot);
                                    if (slotStart.getTime() <= new Date(requiredStartDate).getTime() && new Date(requiredStartDate).getTime() < slotEnd.getTime()) {
                                        if (s.count > 0) {
                                            return s;
                                        }
                                    }

                                });

                                assignmentStartDateTime = freeSlotforAssignment?.startDateTime;

                                if (freeSlotforAssignment && Object.keys(freeSlotforAssignment).length) {
                                    availableSpecialityToFound = u;
                                }
                            }

                        }

                        if (!availableSpecialityToFound) {
                            throw generateMessages('NO_SLOTS_REMAINING');
                        }

                        const createdAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.create({
                            available_speciality_id: availableSpecialityToFound?.id,
                            case_id: caseId,
                            case_type_id: caseTypeId,
                            chartNo: patientId,
                            comments,
                            confirmation_status: confirmationStatus,
                            created_by: userId,
                            date_list_id: availableSpecialityToFound?.date_list_id,
                            is_speciality_base: isSpecialityBase,
                            patient_id: patientId,
                            priority_id: priorityId ? priorityId : null,
                            scheduled_date_time: requiredStartDate,
                            status_id: undoAppointmentStatusId ? undoAppointmentStatusId :appointmentStatusId,
                            time_slots: thisAssignmentTimeSlot * slotsForThisAppointment,
                            type_id: appointmentTypeId,
                            is_soft_registered: isSoftRegistered,
                            is_active: isSoftRegistered ? false : true,
                            physician_id: physicianId,
                            technician_id: technicianId,
                            reading_provider_id: readingProviderId,
                            cd_image: cdImage,
                            is_transportation: isTransportation ?? null
                        },
                                                                                                                       __transaction
                        ));

                        if (transportation && transportation.length) {
                            await this.addTransportations(createdAppointment.id, transportation, __transaction);
                        }

                        if (cptCodes && cptCodes.length) {
                            await this.addAppointmentsCptCodes(createdAppointment.id, cptCodes, __transaction);
                        }

                        await __transaction.commit();

                        appointmentIdsForSocketCall.push(createdAppointment.id);

                        try {

                            const patientStatusesSlug: string = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? 'checked_in' : 'scheduled';
                            const patientSessionStatus: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: patientStatusesSlug } }));

                            const { result: { data: responseDataForPatient } } = patientSessionStatus || {};
                            await this.__http.post(`${process.env.KIOSK_URL}case-patient-session/`,
                                                   {
                                    appointment_id: createdAppointment.id,
                                    case_id: caseId,
                                    request_from_sch: true,
                                    status_id: sessionStatusId ? sessionStatusId : responseDataForPatient[0]?.id,
                                    trigger_socket: true
                                },
                                                   config);

                            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}case-patient-session/change-in-waiting-list`, { user_id: userId }, config);

                        } catch (error) {

                            await this.deleteAppointmentById(createdAppointment.id, userId);
                            throw error;
                        }

                        return createdAppointment;

                    }

                    const doctorHasWcbAuth: models.medical_identifiersI = this.shallowCopy(await this.__medicalIdentifierRepo.findOne({
                        deleted_at: null,
                        user_id: doctorId,
                        wcb_auth: true,
                    }));

                    if ((caseType === 'worker_compensation') && (!doctorHasWcbAuth || !Object.keys(doctorHasWcbAuth).length)) {
                        throw generateMessages('PROVIDER_DOES_NOT_HAVE_WC_AUTH');
                    }

                    const includeClause: typings.ANY = [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gte]: appointmentEndTime },
                                start_date: { [Op.lte]: requiredStartDate }
                            },
                        },
                        ...(specialityId && [{
                            as: 'availableSpeciality',
                            model: models.sch_available_specialities,
                            required: true,
                            where: {
                                speciality_id: specialityId,
                                deleted_at: null,
                            }
                        }])
                    ];

                    const getAvailableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                        {
                            deleted_at: null,
                            doctor_id: doctorId,
                            facility_location_id: facilityLocationId,
                        },
                        {
                            include: includeClause
                        }
                    ));
                    if (!getAvailableDoctor || !Object.keys(getAvailableDoctor).length) {
                        await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId,speciality)
                        throw generateMessages('ASSIGNMENT_NOT_FOUND');
                    }

                    const { dateList: dateListOfDoctor } = getAvailableDoctor || {};

                    const availableDoctor: typings.AvailableDoctorFromDateList = {
                        available_speciality_id: getAvailableDoctor?.available_speciality_id,
                        date_list_id: dateListOfDoctor[0].id,
                        end_date: dateListOfDoctor[0].end_date,
                        id: getAvailableDoctor.id,
                        no_of_slots: getAvailableDoctor.no_of_slots,
                        start_date: dateListOfDoctor[0].start_date,
                    };

                    const endDateTimeWithDoctor: Date = new Date(requiredStartDate);
                    const assignmentTimeSlotWithDoctor: number = this.getTimeSlotOfAssignment(availableDoctor);

                    endDateTimeWithDoctor.setMinutes(endDateTimeWithDoctor.getMinutes() + (assignmentTimeSlotWithDoctor * slotsForThisAppointment));

                    if (!confirmationStatus && next24HrsAppointment?.length && new Date(next24HrsAppointment[0]?.scheduled_date_time).getTime() < new Date(endDateTimeWithDoctor).getTime()) {
                        throw generateMessages('PATIENT_ALREADY_HAVE_ASSIGNMENT');
                    }

                    const appointmentsOfDoctor: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll({
                        available_doctor_id: availableDoctor.id,
                        cancelled: false,
                        deleted_at: null,
                        pushed_to_front_desk: false,
                    }));

                    const availableFreeSlotsWithDoctor: typings.FreeSlotsI[] = this.getFreeSlotsForAssignment(availableDoctor, appointmentsOfDoctor, (speciality.over_booking + 1), assignmentTimeSlotWithDoctor);
                    const freeSlot: typings.FreeSlotsI = availableFreeSlotsWithDoctor?.find((s: typings.FreeSlotsI): typings.FreeSlotsI => {

                        const slotStart: Date = new Date(s.startDateTime);
                        const slotEnd: Date = new Date(s.startDateTime);

                        slotEnd.setMinutes(slotEnd.getMinutes() + assignmentTimeSlotWithDoctor);

                        if (slotStart.getTime() <= new Date(requiredStartDate).getTime() && new Date(requiredStartDate).getTime() < slotEnd.getTime()) {
                            if (s.count > 0) {
                                return s;
                            }
                        }

                    });
                    if (!freeSlot || !Object.keys(freeSlot).length){
                        if(speciality.is_multiple_visit){
                            await this.checkErrorMultipleCptAppointments(totalCptCodes,totalappointments.slice(0,i),true,doctorId,speciality)
                        }
                        throw generateMessages('NO_SLOTS_REMAINING');
                       
                    }

                    const doctorUnavailability: typings.ANY = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
                        [Op.or]: [
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        end_date: { [Op.gt]: endDateTimeWithDoctor },
                                        start_date: { [Op.lte]: requiredStartDate }
                                    },
                                ]
                            },
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        start_date: { [Op.gte]: requiredStartDate, [Op.lt]: endDateTimeWithDoctor }
                                    },
                                ]
                            },
                            {
                                [Op.and]: [
                                    {
                                        approval_status: 1,
                                        deleted_at: null,
                                        doctor_id: doctorId,
                                        end_date: { [Op.lte]: endDateTimeWithDoctor, [Op.gte]: requiredStartDate }
                                    },
                                ]
                            }
                        ]
                    }));

                    if (doctorUnavailability && Object.keys(doctorUnavailability).length) {

                        throw generateMessages('NO_PROVIDER_AVAILABLE');

                    }

                    const createdAppointmentWithDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__repo.create({
                        available_doctor_id: availableDoctor?.id,
                        available_speciality_id: availableDoctor?.available_speciality_id,
                        case_id: caseId,
                        case_type_id: caseTypeId,
                        chartNo: patientId,
                        comments,
                        confirmation_status: confirmationStatus,
                        created_by: userId,
                        date_list_id: availableDoctor?.date_list_id,
                        is_speciality_base: isSpecialityBase,
                        patient_id: patientId,
                        priority_id: priorityId ? priorityId : null,
                        scheduled_date_time: requiredStartDate,
                        status_id: undoAppointmentStatusId ? undoAppointmentStatusId: appointmentStatusId,
                        time_slots: assignmentTimeSlotWithDoctor * slotsForThisAppointment,
                        type_id: appointmentTypeId,
                        is_soft_registered: isSoftRegistered,
                        is_active: isSoftRegistered ? false : true,
                        physician_id: physicianId,
                        technician_id: technicianId,
                        reading_provider_id: readingProviderId,
                        cd_image: cdImage,
                        is_transportation: isTransportation ?? null
                    },
                                                                                                                             __transaction
                    ));

                    if (transportation && transportation.length) {
                        await this.addTransportations(createdAppointmentWithDoctor.id, transportation, __transaction);
                    }

                    if (cptCodes && cptCodes.length) {
                        await this.addAppointmentsCptCodes(createdAppointmentWithDoctor.id, cptCodes, __transaction);
                    }

                    await __transaction.commit();

                    appointmentIdsForSocketCall.push(createdAppointmentWithDoctor.id);

                    try {

                        const patientStatusesSlug: string = ((existingCasePatientSession && Object.keys(existingCasePatientSession).length) || isAlradyCheckedIn) && checkTodayAppointment ? 'checked_in' : 'scheduled';
                        const patientSessionStatusWithDoctor: typings.ANY = this.shallowCopy(await this.__http.get(`${process.env.KIOSK_URL}case-patient-session-statuses`, { ...config, params: { slug: patientStatusesSlug } }));

                        const { result: { data: responseData } } = patientSessionStatusWithDoctor || {};

                        await this.__http.post(`${process.env.KIOSK_URL}case-patient-session/`,
                                               {
                                appointment_id: createdAppointmentWithDoctor.id,
                                case_id: caseId,
                                request_from_sch: true,
                                status_id: sessionStatusId ? sessionStatusId : responseData[0]?.id,
                                trigger_socket: true
                            },                 config);
                        this.__http.webhook(`${process.env.SOCKET_SERVER_URL}case-patient-session/change-in-waiting-list`, { user_id: userId }, config);

                    } catch (error) {

                        await this.deleteAppointmentById(createdAppointmentWithDoctor.id, userId);
                        throw error;

                    }

                    const newAppointment: models.sch_appointmentsI = this.shallowCopy(await this.__repo.findOne(
                        {
                            id: createdAppointmentWithDoctor.id
                        },
                        {
                            include: [
                                {
                                    as: 'appointmentStatus',
                                    model: models.sch_appointment_statuses,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                                {
                                    as: 'patient',
                                    model: models.kiosk_patient,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                                {
                                    as: 'caseType',
                                    model: models.kiosk_case_types,
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                    }
                                },
                            ]
                        }
                    ));

                    const endTime: Date = new Date(newAppointment.scheduled_date_time);
                    endTime.setMinutes(endTime.getMinutes() + newAppointment.time_slots);

                    const contactPersonType: models.kiosk_contact_person_typesI = this.shallowCopy(await this.__kioskContactPersonTypesRepo.findOne({ slug: 'self' }));

                    const selfContactPerson: models.kiosk_contact_personI = this.shallowCopy(await this.__kioskContactPersonRepo.findOne({
                        case_id: newAppointment.case_id,
                        contact_person_type_id: contactPersonType.id,
                        deleted_at: null
                    }));

                    if (selfContactPerson && selfContactPerson.email) {
                        // tslint:disable-next-line: no-floating-promises
                        this.sentEmailForAppointment({
                            appointmentId: newAppointment.id,
                            appointmentStatus: newAppointment.appointmentStatus.name,
                            caseId: newAppointment.case_id,
                            caseType: newAppointment.caseType.name,
                            confirmationStatus: newAppointment.confirmation_status,
                            email: selfContactPerson.email,
                            emailTitle: 'Create Appointment',
                            endDateTime: new Date(endTime),
                            patientLastName: newAppointment.patient.last_name,
                            reason: 'created',
                            scheduledDateTime: new Date(newAppointment.scheduled_date_time),
                            timeSlot: newAppointment.time_slots,
                        });
                    }

                    return createdAppointmentWithDoctor;
                } catch (err) {
                    await __transaction.rollback();
                    throw err;
                }

            }));

            if (appointmentIdsForSocketCall && appointmentIdsForSocketCall.length) {

                const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIdsForSocketCall, user_id: userId }, authorization);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIdsForSocketCall, email_title: 'Appointment Created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIdsForSocketCall }, config);

            }

            return appointments;

        } catch (error) {

            if (appointmentIdsForSocketCall && appointmentIdsForSocketCall.length) {

                const formattedAppointmentForIOS: models.sch_appointmentsI[] = await this.getAppointmentById({ appointment_id: appointmentIdsForSocketCall, user_id: userId }, authorization);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'created' }, config);
                this.__http.emailGenator(`${process.env.EMAIL_TEMPLATE_GENERATOR_URL}appointment/generate-data-with-multiple-context`, { appointment_ids: appointmentIdsForSocketCall, email_title: 'Appointment Created' }, config);
                this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: appointmentIdsForSocketCall }, config);

            }

            throw error;
        }
    }

    /**
     *
     * @param id
     * @param userId
     * @returns
     */
    private readonly deleteAppointmentById = async (id: number, userId: number): Promise<typings.ANY> =>

        this.__repo.update(
            id,
            {
                deleted_at: new Date(),
                updated_by: userId
            }
        )

    /**
     *
     * @param id
     * @param userId
     * @returns
     */
    private readonly deleteKioskSessionByAppointmentId = async (id: number, userId: number): Promise<typings.ANY> =>

        this.__casePatientSessionRepo.update(
            id,
            {
                deleted_at: new Date(),
                updated_by: userId
            }
        )

    /**
     *
     * @param availablities
     * @param facilityLocations
     * @param colorCodes
     */
    private readonly facilityWiseMapping = (availablities: typings.ANY, facilityLocations: models.facility_locationsI[], colorCodes: models.sch_color_codesI[]): typings.FacilityWiseMappingI[] => {

        const specialityObj: typings.ANY = availablities.map((o: typings.ANY): typings.SpecialityObjForfacilityWiseMappingI =>
            o.dateList.map((s: models.sch_recurrence_date_listsI): typings.SpecialityObjForfacilityWiseMappingI => {
                if (facilityLocations?.find((p: models.facility_locationsI): boolean => p.id === o.facility_location_id)) {
                    return {
                        appointments: [],
                        date_list_id: s.id,
                        doctor_id: o?.doctor_id,
                        end_date: s?.end_date,
                        id: o?.id,
                        speciality_id: o?.availableSpeciality?.speciality_id ?? o?.speciality?.id,
                        speciality_qualifier: o?.availableSpeciality?.speciality?.qualifier ?? o?.speciality?.qualifier,
                        speciality_name: o?.availableSpeciality?.speciality?.name ?? o?.speciality?.name,
                        speciality_key: o?.availableSpeciality?.speciality?.speciality_key ?? o?.speciality?.speciality_key,
                        start_date: s?.start_date,
                        supervisor_id: o?.supervisor_id,
                        facility_location_id: o.facility_location_id,
                        facility_location_qualifier: o.qualifier
                    };
                }
            })).flat();
        return facilityLocations.map((p: models.facility_locationsI): typings.FacilityWiseMappingI => {

            const colorCode: string = colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === p.id)?.code ?? '#9d9d9d';

            if (specialityObj.length) {
                return {
                    availibilities: this.filterNonNull(specialityObj.filter((s: typings.SpecialityObjForfacilityWiseMappingI): typings.ANY => s.facility_location_id === p.id)),
                    color: colorCode,
                    facility_id: p.id,
                    facility_name: `${p.facility.name}-${p.name}`,
                    facility_qualifier: `${p?.facility?.qualifier}-${p?.qualifier}`,
                };
            }
        });
    }

    /**
     *
     * @param dates
     * @param days
     */
    private readonly filterDatelist = (dates: typings.FormattedDateForSugessionI[], days: number[]): typings.FormattedDateForSugessionI[] => {

        if (days && days.length) {

            return dates.filter((d: typings.FormattedDateForSugessionI): boolean => !days.includes(d.dateDay));

        }

        return dates;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    private readonly findAvailableSlots = (sameClinic: boolean, doctAvailibility: models.sch_available_doctorsI, assignments: models.sch_available_doctorsI): typings.ANY => {

        if (sameClinic) {
            if (doctAvailibility.facility_location_id === assignments.facility_location_id) {

                const overbooking: number = assignments?.availableSpeciality?.speciality?.over_booking;

                const availableSlots: typings.ANY = this.getFreeSlotsForAssignment(doctAvailibility, doctAvailibility.appointments, overbooking + 1, this.getTimeSlotOfAssignment(doctAvailibility), 0);
            }
        }
    }

    /**
     *
     * @param startDateTime
     * @param daysToAdd
     * @param daysList
     * @param endingCriteria
     */
    private readonly findEndDateForRecurrence = async (startDateTime: Date, daysToAdd: number, daysList?: number[], endingCriteria?: string): Promise<Date> => {

        if (endingCriteria === 'weekly') {
            const startDate: Date = new Date(startDateTime);
            let checkStartDate: Date = new Date(startDateTime);
            let newDate: Date;

            if (startDate.getDay() > daysList[daysList.length - 1]) {
                newDate = this.addDaysForReccurence(startDate, (7 - startDate.getDay() + 1));
                checkStartDate = newDate;
            }

            const getEndDate: Date = checkStartDate;

            let counter: number = 0;
            while (counter < daysToAdd) {
                if (checkStartDate.getDay() > daysList[daysList.length - 1]) {
                    newDate = this.addDaysForReccurence(checkStartDate, (7 - checkStartDate.getDay()));
                }

                getEndDate.setTime(getEndDate.getTime() + (7 * 1000 * 60 * 60 * 24));
                counter += 1;

            }

            const getDaysToAdd: number = daysList[daysList.length - 1] - checkStartDate.getDay();
            return this.addDaysForReccurence(getEndDate, getDaysToAdd);

        }

        const today: Date = new Date(startDateTime);

        const futureDay: Date = getDay(daysToAdd);

        return futureDay;

        function getDay(numOfDays: number): Date {
            const Day: Date = new Date(today.getTime());

            Day.setDate(today.getDate() + numOfDays);
            return Day;
        }

    }

    /**
     *
     * @param startDate
     * @param daysToAdd
     * @param daysList
     */
    private readonly findEndDateForRecurrenceMonthly = async (startDate: Date, daysToAdd: number, daysList: number[]): Promise<Date> => {

        const endDate: Date = new Date(startDate);
        let date: Date;
        if (endDate.getDay() === daysList[0]) {
            for (let j: number = 0; j < daysToAdd; j += 1) {
                endDate.setTime(endDate.getTime() + (28 * 1000 * 60 * 60 * 24));
            }
        } else {
            let checkLoop: boolean = true;

            while (checkLoop) {
                endDate.setTime(endDate.getTime() + (1000 * 60 * 60 * 24));

                if (endDate.getDay() === daysList[0]) {
                    for (let i: number = 0; i < daysToAdd; i += 1) {
                        endDate.setTime(endDate.getTime() + (28 * 1000 * 60 * 60 * 24));
                    }
                    checkLoop = false;

                }
            }

        }

        return date = new Date(endDate);

    }

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

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
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
     * @param appointments
     * @param doctorIds
     */
    private readonly formatAppointmentPatientForIos = (appointments: models.sch_appointmentsI[], doctorIds: number[], config?: typings.ANY): typings.ANY[] =>

        this.filterNonNull(appointments.map((o: models.sch_appointmentsI): typings.ANY => {

            if (!o.patient || !Object.keys(o.patient).length) {
                return null;
            }

            const resultBackdated = this.checkBackDated(o, config);

            return {
                ...resultBackdated,
                appointment_duration: o?.time_slots,
                appointment_status: o?.appointmentStatus?.name,
                appointment_title: o?.appointment_title,
                appointment_type_description: o?.appointmentType?.name,
                appointment_type_id: o?.type_id,
                assign_to_me: doctorIds.includes(o?.availableDoctor?.doctor_id) ? true : false,
                available_doctor_id: o?.available_doctor_id,
                available_speciality_id: o?.available_speciality_id,
                case_id: o?.case_id,
                case_type_id: o?.case_type_id,
                case_type: o?.case?.caseType?.name ?? null,
                comments: o?.comments,
                confirmation_status: o?.confirmation_status,
                created_at: o?.created_at,
                created_by: o?.created_by,
                date_list_id: o?.date_list_id,
                doctor_first_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.first_name ?? null : null,
                doctor_id: o?.available_doctor_id ? o?.availableDoctor?.doctor_id ?? null : null,
                doctor_last_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.middle_name ?? null : null,
                doctor_middle_name: o?.available_doctor_id ? o?.availableDoctor?.doctor?.userBasicInfo?.last_name ?? null : null,
                evaluation_date_time: o?.evaluation_date_time,
                facility_location_id: o?.available_doctor_id ? o?.availableDoctor?.facility_location_id : o?.availableSpeciality?.facility_location_id,
                first_name: o?.patient.first_name,
                has_app: o?.availableDoctor ? o?.availableDoctor.availableSpeciality?.speciality?.has_app : o?.availableSpeciality?.speciality.has_app,
                id: o?.id,
                last_name: o?.patient?.last_name,
                middle_name: o?.patient?.middle_name,
                patient_id: o?.patient_id,
                priority_description: o?.priority?.name,
                priority_id: o?.priority_id,
                profile_avatar: o?.patient.profile_avatar,
                scheduled_date_time: o?.scheduled_date_time,
                speciality: o?.availableSpeciality ? o?.availableSpeciality?.speciality?.name : o?.availableDoctor.availableSpeciality?.speciality?.name,
                speciality_id: o?.availableSpeciality ? o?.availableSpeciality?.speciality_id : o?.availableDoctor.availableSpeciality?.speciality_id,
                speciality_key: o?.availableSpeciality ? o?.availableSpeciality?.speciality?.speciality_key : o?.availableDoctor.availableSpeciality?.speciality?.speciality_key,
                time_slot: o?.availableDoctor ? o?.availableDoctor.availableSpeciality?.speciality?.time_slot : o?.availableSpeciality?.speciality?.time_slot,
                updated_at: o?.updated_at,
                updated_by: o?.updated_by,
                visit_session_state_id: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.id : null,
                visit_session_state_name: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.name : null,
                visit_session_state_slug: o?.appointmentVisit?.visitState ? o?.appointmentVisit.visitState.slug : null,
                case_patient_sessions: o.kioskCasePatientSessions,
                is_speciality_base: o.is_speciality_base,
                start_date_time: o?.scheduled_date_time,

            };

        }))

    /**
     *
     * @param singleAppointment
     * @param appointments
     * @param getTimeSlot
     */
    private readonly formatAvailableDoctor = (singleAppointment: models.sch_appointmentsI, appointments: models.sch_appointmentsI[], getTimeSlot: number): typings.ANY => {

        const {
            dateList: { start_date, end_date, no_of_slots: noOfSlots },
            available_doctor_id: availableDoctorId,
            availableDoctor,
            availableDoctor: { doctor: { userFacilities }, supervisor_id: supervisorId, doctor_id: doctorId },
        } = singleAppointment;

        const requiredToBeResolvedDoctor: typings.ResolveDoctorAssignmentsObjI = {
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
    private readonly formatAvailableDoctorForAutoResolve = (appointments: models.sch_appointmentsI[], isForApproval: boolean | number): typings.ResolvedDoctorAndAppointmentArrayI[] => {

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

        return this.filterNonNull(appointments.map((a: models.sch_appointmentsI): typings.ANY => {

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

            const isDuplicate: models.sch_appointmentsI = requiredArray?.find((p: models.sch_appointmentsI): boolean => p?.available_doctor_id === a.available_doctor_id);

            if (isDuplicate && Object.keys(isDuplicate).length) {
                return null;
            }

            const requiredToBeResolvedDoctor: typings.ResolveDoctorAssignmentsObjI = {
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
     * @param obj
     */
    private readonly formatDatesCriteriaWithEndDate = async (obj: typings.FormatDatesCriteriaI): Promise<Date[]> => {

        const {
            daysList, endDateString, endingCriteria, recurrenceEndDateString, startDateString
        } = obj;

        if (startDateString.slice(0, 10) === recurrenceEndDateString.slice(0, 10)) {
            return [new Date(startDateString)];
        }

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);
        const recurrenceEndDate: Date = new Date(recurrenceEndDateString);

        let date: Date[] = [];

        if (endingCriteria === 'monthly') {

            const daysListLength: number = daysList.length;
            let counter: number = 1;

            while (startDate.getTime() <= recurrenceEndDate.getTime()) {
                const temp: number = daysListLength * counter;
                date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                    if (startDate.getDay() === daysList[index]) {
                        return new Date(JSON.parse(JSON.stringify(startDate)));
                    }
                }))];
                if (temp === date.length) {
                    counter = counter + 1;
                    startDate.setMonth(startDate.getMonth() + 1, 0);
                }
                startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
            }

            return date;

        }

        while (startDate.getTime() <= recurrenceEndDate.getTime()) {
            date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                if (startDate.getDay() === daysList[index]) {
                    return new Date(JSON.parse(JSON.stringify(startDate)));
                }
            }))];
            startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
        }

        return date;

    }

    /**
     *
     * @param obj
     */
    private readonly formatDatesCriteriaWithOutEndDate = async (obj: typings.FormatDatesCriteriaI): Promise<Date[]> => {

        const {
            endingCriteria,
            daysList,
            startDateString,
            endDateString,
            numberOfRecurrsion
        } = obj;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        let date: Date[] = [];
        let recurrencedEndDate: Date;

        if (endingCriteria === 'monthly') {
            recurrencedEndDate = await this.findEndDateForRecurrenceMonthly(startDate, numberOfRecurrsion, daysList);
            const daysListLength: number = daysList.length;
            let counter: number = 1;

            while (startDate.getTime() <= recurrencedEndDate.getTime()) {
                const temp: number = daysListLength * counter;

                date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                    if (startDate.getDay() === daysList[index]) {

                        return new Date(JSON.parse(JSON.stringify(startDate)));
                    }
                }))];
                if (temp === date.length) {
                    counter = counter + 1;

                    startDate.setMonth(startDate.getMonth() + 1, 0);
                }
                startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
            }

            return date;

        }
        recurrencedEndDate = await this.findEndDateForRecurrence(startDate, numberOfRecurrsion, daysList, endingCriteria);

        while (startDate.getTime() <= recurrencedEndDate?.getTime()) {

            date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                if (startDate.getDay() === daysList[index]) {
                    return new Date(JSON.parse(JSON.stringify(startDate)));
                }
            }))];
            startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
        }

        return date;

    }

    /**
     *
     * @param object
     * @param _authorization
     */
    private readonly formatDatesForSuggestion = (object: typings.ANY, _authorization?: string): typings.FormattedDateForSugessionI[] => {

        const {
            startDateString,
            endDateString,
            endTime,
            startTime,
            days,
        } = object;

        const formatedDates: typings.FormattedDateForSugessionI[] = [];

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        while (startDate.getTime() <= endDate.getTime()) {

            const day: string | number = startDate.getDate() < 10 ? `0${startDate.getDate()}` : startDate.getDate();
            const month: string = startDate.getMonth() + 1 < 9 ? `0${startDate.getMonth() + 1}` : `${startDate.getMonth() + 1}`;
            formatedDates.push({
                dateDay: startDate.getDay(),
                dateString: `${startDate.getFullYear()}-${month}-${day}`,
            });

            startDate.setDate(startDate.getDate() + 1);

        }
        return this.filterDatelist(formatedDates, days).map((d: typings.FormattedDateForSugessionI): typings.FormattedDateForSugessionI => ({
            end: new Date(`${d.dateString}T${endTime}.000Z`),
            start: new Date(`${d.dateString}T${startTime}.000Z`),
        }));

    }

    /**
     *
     * @param appointment
     * @returns
     */
    private readonly formatedAppointmentAgainstDateList = (appointment: models.sch_appointmentsI[]): models.sch_appointmentsI[] =>
        appointment.map((d: models.sch_appointmentsI): typings.AppointmentsAgainstAavailablityResponseDataI => ({
            appointment_billable: d.billable,
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
     *
     * @param facilityLocationIds
     * @param doctorId
     */
    private readonly formatJoinClause = (facilityLocationIds: number[], specialityIds: number[], doctorIds: number[], doctorId: number): typings.ANY => {

        const joinClause: typings.ANY = this.__repo.getJoinClause('get_appointment_list_mandatory');

        const { include, ...otherAttributes }: typings.ANY = joinClause?.find((c: typings.ANY): typings.ANY => c.as === 'availableDoctor');

        const whereClauseForSpecialityFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        let requiredCondition: boolean = false;

        if (specialityIds && specialityIds.length) {
            whereClauseForSpecialityFilter.id = { [Op.in]: specialityIds };
            requiredCondition = true;
        }

        if (doctorId) {
            otherAttributes.where = { deleted_at: null, facility_location_id: { [Op.in]: facilityLocationIds } };
        }

        if (doctorIds && doctorIds.length) {
            otherAttributes.where = { deleted_at: null, doctor_id: { [Op.in]: doctorIds } };
            otherAttributes.required = true;
        }

        return this.filterNonNull(
            [
                ...joinClause.filter((c: typings.ANY): typings.ANY => c.as !== 'availableDoctor'),
                {
                    ...otherAttributes,
                    include: [
                        {
                            as: 'facilityLocations',
                            include: {
                                as: 'facility',
                                model: models.facilities,
                                required: false,
                                where: { deleted_at: null },
                            },
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null, id: { [Op.in]: facilityLocationIds } }
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
                                    model: models.medical_identifiers,
                                    attributes: ['id'],
                                    required: false,
                                    include: {
                                        as: 'billingTitle',
                                        required: false,
                                        attributes: ['id', 'name'],
                                        model: models.billing_titles,
                                        where: { deleted_at: null }
                                    },
                                    where: {
                                        deleted_at: null,
                                    },
                                }
                            ],
                            model: models.users,
                            required: true,
                            where: { deleted_at: null },
                        },
                    ]
                },
                {
                    as: 'availableSpeciality',
                    include: [

                        {
                            as: 'facilityLocation',
                            include:
                                [
                                    {
                                        as: 'facility',
                                        model: models.facilities,
                                        required: false,
                                        where: { deleted_at: null },

                                    }
                                ],
                            model: models.facility_locations,
                            required: true,
                            where: { deleted_at: null, id: { [Op.in]: facilityLocationIds } },
                        },
                        {
                            as: 'speciality',
                            model: models.specialities,
                            required: requiredCondition,
                            where: { ...whereClauseForSpecialityFilter },
                        },

                    ],
                    model: models.sch_available_specialities,
                    required: whereClauseForSpecialityFilter.id || facilityLocationIds.length ? true : false,
                    where: {
                        deleted_at: null,
                        facility_location_id: { [Op.in]: facilityLocationIds }
                    }
                },
                {
                    as: 'case',
                    model: models.kiosk_cases,
                    where: { deleted_at: null },
                    include: { model: models.billing_case_status, as: 'caseStatus' }
                },
                {
                    as: 'patientSessions',
                    include: {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        required: true,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                }
            ]);

    }

    private readonly formatJoinClauseForAppointmentList = (facilityLocationIds: number[], specialityIds: number[], doctorIds: number[], patientStatusIds: number[], doctorId: number): typings.ANY => {

        const joinClause: typings.ANY = this.__repo.getJoinClause('get_appointment_mandatory');

        const whereClauseForSpecialityFilter: { [key: string]: typings.ANY } = { deleted_at: null };
        const whereClauseForAvialbleSpecialityFilter: { [key: string]: typings.ANY } = { deleted_at: null };
        const whereClauseForDoctorFilter: { [key: string]: typings.ANY } = { deleted_at: null };

        let requiredCondition: boolean = false;

        if (specialityIds && specialityIds.length) {
            whereClauseForSpecialityFilter.id = { [Op.in]: specialityIds };
            whereClauseForAvialbleSpecialityFilter.speciality_id = specialityIds;
            requiredCondition = true;
        }

        if (doctorId) {
            whereClauseForDoctorFilter.where = { deleted_at: null, facility_location_id: { [Op.in]: facilityLocationIds } };
        }

        whereClauseForDoctorFilter.required = false;

        if (doctorIds && doctorIds.length) {
            whereClauseForDoctorFilter.where = { deleted_at: null, doctor_id: { [Op.in]: doctorIds } };
        }

        return [
            ...joinClause,
            {
                as: 'availableSpeciality',
                include: [
                    {
                        ...whereClauseForDoctorFilter,
                        as: 'availableSpecialityDoctor',
                        required: false,
                        model: models.sch_available_doctors,
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: [
                                    {
                                        as: 'userBasicInfo',
                                        attributes: ['id', 'first_name', 'last_name', 'middle_name', 'user_id'],
                                        model: models.user_basic_info,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    {
                                        model: models.medical_identifiers,
                                        attributes: ['id'],
                                        required: false,
                                        include: {
                                            as: 'billingTitle',
                                            required: false,
                                            attributes: ['id', 'name'],
                                            model: models.billing_titles,
                                            where: { deleted_at: null }
                                        },
                                        where: {
                                            deleted_at: null,
                                        },
                                    }
                                ],
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                        ]
                    },
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
                        where: { deleted_at: null, id: { [Op.in]: facilityLocationIds } },
                    },
                    {
                        as: 'speciality',
                        model: models.specialities,
                        required: requiredCondition,
                        where: { ...whereClauseForSpecialityFilter },
                    },
                ],
                model: models.sch_available_specialities,
                required: requiredCondition,
                where: {
                    facility_location_id: { [Op.in]: facilityLocationIds },
                    ...whereClauseForAvialbleSpecialityFilter
                }
            },
            {
                as: 'case',
                attributes: ['id'],
                model: models.kiosk_cases,
                where: { deleted_at: null },
                include: {
                    model: models.billing_case_status,
                    as: 'caseStatus',
                    attributes: ['id', 'name']
                }
            },
            {
                as: 'patientSessions',
                include: {
                    as: 'visitStatus',
                    attributes: ['name', 'slug'],
                    model: models.kiosk_case_patient_session_statuses,
                    required: true,
                    where: {
                        deleted_at: null,
                    },
                },
                model: models.kiosk_case_patient_session,
                required: true,
                where: {
                    deleted_at: null,
                    ...((patientStatusIds && patientStatusIds.length) && { status_id: { [Op.in]: patientStatusIds } })
                }
            }
        ];

    }

    private readonly formatProjectionClause = (patientId: number, caseId: number, startDate: Date, endDate: Date): typings.ANY => patientId && caseId ?
        { cancelled: 0, pushed_to_front_desk: 0, patient_id: patientId, case_id: caseId, deleted_at: null } : { cancelled: 0, pushed_to_front_desk: 0, scheduled_date_time: { [Op.between]: [startDate, endDate] }, deleted_at: null }

    private readonly formatProjectionClauseAppointment = (patientId: number, startDate: Date, endDate: Date): typings.ANY => patientId ?
        { cancelled: 0, pushed_to_front_desk: 0, patient_id: patientId, deleted_at: null } : { cancelled: 0, pushed_to_front_desk: 0, scheduled_date_time: { [Op.between]: [startDate, endDate] }, deleted_at: null }

    private readonly formattedPatient = (appointment: typings.ANY, config?: typings.ANY): typings.ANY =>

        appointment?.map((o: typings.ANY): typings.ANY => {

            if (!o?.patient) {
                return [];
            }

            const { physicianClinic } = o;
            const resultBackdated: typings.ANY = this.checkBackDated(o, config);

            const chartId: number = o.patient_id + 1000000000;

            let chartIdString: string = chartId.toString();

            chartIdString = chartIdString.substring(1, 10);

            const chartIdStringFormated = `${chartIdString.substring(0, 3)}-${chartIdString.substring(3, 5)}-${chartIdString.substring(5, 9)}`;
            
            const formattedPhysicianClinicResponse: typings.ANY = physicianClinic ? {
                // ...physicianClinic,
                physician: physicianClinic?.physician ? {
                    clinic_location_id: physicianClinic?.clinicLocation?.id,
                    physician_clinic_id: physicianClinic?.id,
                    ...physicianClinic?.clinic,
                    ...physicianClinic?.clinicLocation,
                    ...physicianClinic?.physician,
                } : null
            } : null;

            o.patient.chart_id = `${chartIdString.substring(0, 9)}`;
            const chartIdFormated = `${chartIdStringFormated.substring(0,11)}`
            return {
                ...resultBackdated,
                appointment_billable: o.billable,
                appointment_duration: o?.time_slots,
                appointment_status: o?.appointmentStatus.name,
                appointment_status_id: o?.status_id,
                appointment_status_slug: o?.appointmentStatus.slug,
                appointment_title: o?.appointment_title,
                appointment_type_description: o?.appointmentType?.name,
                appointment_type_qualifier: o?.appointmentType?.qualifier,
                appointment_type_slug: o?.appointmentType?.slug,
                appointment_type_id: o?.type_id,
                appointment_visit_state_id: o.appointmentVisit ? o.appointmentVisit : null,
                appointment_visit_state_name: o.appointmentVisit ? o.appointmentVisit?.visitState?.name : null,
                appointment_visit_state_slug: o.appointmentVisit ? o.appointmentVisit?.visitState?.slug : null,
                available_doctor_id: o?.available_doctor_id,
                available_doctor_is_provider_assignment :o?.availableDoctor?.is_provider_assignment?true:false,
                available_speciality_id: o?.available_speciality_id,
                case_id: o?.case_id,
                case_type_id: o?.case_type_id ?? null,
                case_type_name: o?.case?.caseType?.name ?? null,
                cd_image: o?.cd_image,
                comments: o?.comments,
                confirm_description: o?.confirm_description,
                confirmation_status: o?.confirmation_status,
                created_at: o?.created_at,
                created_by: o?.created_by,
                date_list_id: o?.date_list_id,
                doctor_info: o?.availableDoctor?.doctor?.userBasicInfo ?? null,
                evaluation_date_time: o?.evaluation_date_time,
                first_name: o?.patient?.first_name,
                has_app: o?.available_speciality_id ? o?.availableSpeciality?.speciality?.has_app : o?.availableDoctor?.availableSpeciality?.speciality?.has_app,
                id: o?.id,
                last_name: o?.patient?.last_name,
                middle_name: o?.patient?.middle_name,
                patient_id: o?.patient_id,
                patient_status: o?.patient_status,
                picture: o?.patient?.profile_avatar ?? null,
                priority_description: o?.priority?.name,
                priority_id: o?.priority_id,
                reading_provider_id: o?.reading_provider_id,
                reading_provider: o?.reading_provider,
                scheduled_date_time: o?.scheduled_date_time,
                speciality_id: o?.available_speciality_id ? o?.availableSpeciality?.speciality_id : o?.availableDoctor?.availableSpeciality?.speciality_id,
                speciality_key: o?.available_speciality_id ? o?.availableSpeciality?.speciality?.speciality_key : o?.availableDoctor?.availableSpeciality?.specialit?.speciality_key,
                speciality_name: o?.available_speciality_id ? o?.availableSpeciality?.speciality?.name : o?.availableDoctor?.availableSpeciality?.specialit?.name,
                speciality_qualifier: o?.available_speciality_id ? o?.availableSpeciality?.speciality?.qualifier : o?.availableDoctor?.availableSpeciality?.specialit?.qualifier,
                time_slot: o?.available_speciality_id ? o?.availableSpeciality?.speciality?.time_slot : o?.availableDoctor?.availableSpeciality?.specialit?.time_slot,
                updated_at: o?.updated_at,
                updated_by: o?.updated_by,
                chart_id: o?.patient?.chart_id,
                chart_id_formatted: chartIdFormated,
                is_active: o?.is_active,
                is_transportation: o?.is_transportation,
                case_status: o?.case?.caseStatus?.name,
                physician_clinic: formattedPhysicianClinicResponse,
                technician: o?.technician,
                transportations: o?.transportations,
                appointment_cpt_codes: o?.appointmentCptCodes,
                appointmentType: o?.appointmentType,
                patientSession: o?.patientSessions
            };
        })

    private readonly getApointmentListCount = async (data: typings.GetAppointmentListBodyI, _authorization: string): Promise<typings.ANY> => {
        const {
            end_date: endDate,
            patient_id: patientId,
            case_id: caseId,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds
        } = data;

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne(
            {
                deleted_at: null,
                id: userId
            }
        ));

        if (!user && !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(

            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles || {};

        if (userRole && slug === 'kiosk') {

            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const checkUserFacility: models.user_facilityI[] = userFacilities.filter((u: models.user_facilityI): boolean => facilityLocationIds.includes(u.facility_location_id));

            if (!checkUserFacility.length) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

        }

        let doctorId: number;

        if (!Object.keys(userRole).length || slug !== 'super_admin') {
            const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
                {
                    deleted_at: null,
                    speciality_id: { [Op.ne]: null },
                    user_id: userId
                }
            ));

            if (!userFacilities && !userFacilities.length) {
                throw generateMessages('NO_APPOINTMENT_TO_SHOW');
            }

            doctorId = userId;
        }

        const whereClause: { [key: string]: typings.ANY } = this.formatProjectionClause(patientId, caseId, new Date(startDate), new Date(endDate));

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereClause.type_id = { [Op.in]: appointmentTypeIds };
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereClause.status_id = { [Op.in]: appointmentStatusIds };
        }

        if (caseTypeIds && caseTypeIds.length) {
            whereClause.case_type_id = { [Op.in]: caseTypeIds };
        }

        const joinClause: typings.ANY = this.formatJoinClause(facilityLocationIds, specialityIds, doctorIds, doctorId);

        const appointment: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                ...whereClause
            },
            {
                include: [
                    ...joinClause
                ],
            }
        ));

        const count: number = appointment?.map((o: models.sch_appointmentsI): typings.GetAppointmentListSpecialityObjI[] => {

            const {
                availableDoctor,
                availableSpeciality,
                patient
            } = o;

            const { facilityLocations: availableDoctorFacilityLocations } = availableDoctor || {};
            const { facilityLocation: availableSpecialityFacilityLocation } = availableSpeciality || {};

            if ((!availableDoctor || !availableDoctorFacilityLocations) && (!availableSpeciality || !availableSpecialityFacilityLocation)) {
                return [];
            }

        }).flat().length;

        return {
            appointment_count: count
        };

    }

    private readonly getApointmentListCountV1 = async (data: typings.GetAppointmentListBodyI, _authorization: string): Promise<typings.ANY> => {

        const {
            end_date: endDate,
            patient_id: patientId,
            case_ids: caseIds,
            patient_name: patientName,
            doctor_ids: doctorIds,
            facility_location_ids: facilityLocationIds,
            start_date: startDate,
            user_id: userId = Number(process.env.USERID),
            appointment_type_ids: appointmentTypeIds,
            appointment_status_ids: appointmentStatusIds,
            speciality_ids: specialityIds,
            case_type_ids: caseTypeIds,
            patient_status_ids: patientStatusIds
        } = data;

        const count: typings.ANY = this.generateAppointmentListCountV1({patientStatusIds, facilityLocationIds, specialityIds, doctorIds, patientId, patientName, appointmentTypeIds, appointmentStatusIds, caseTypeIds, caseIds, startDate, endDate});

        const [countData]: typings.ANY = this.shallowCopy(await sequelize.query(count));

        const [countResult] = countData;

        return {
            appointment_count: countResult.total_count
        };

    }

    private readonly getCancelAppointments = (data: models.sch_appointmentsI[]): models.sch_appointmentsI[] => data.filter((c: models.sch_appointmentsI): boolean => c.cancelled && c.deleted_at === null);

    private readonly getCompletedAppointments = (data: models.sch_appointmentsI[]): models.sch_appointmentsI[] => data.filter((c: models.sch_appointmentsI): boolean => !c.cancelled && c.deleted_at === null && c?.appointmentStatus?.slug === 'completed');

    // ChangeAzhar
    private readonly getDeletedAppointmentsById = async (data: typings.singleAppointmentBodyI, _authorization: string, transaction?: Transaction): Promise<typings.ANY> => {

        const {
            appointment_id: appointmentId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
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

    private readonly getFreeSlotsForAssignment = (assignment: models.sch_available_specialitiesI | models.sch_available_doctorsI, appointment: models.sch_appointmentsI[], overbooking: number, timeSlot: number, wantOverBooking?: number): typings.ANY => {

        if (!timeSlot) {
            return [];
        }

        const freeSlots: typings.FreeSlotsI[] = [];

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
                if(!appoint.cancelled){
                    const appStart: Date = new Date(appoint?.scheduled_date_time);
                    const appEnd: Date = new Date(appoint?.scheduled_date_time);

                    appEnd.setMinutes(appEnd.getMinutes() + appoint?.time_slots);

                    freeSlots?.find((a: typings.FreeSlotsI, i: number): void => {
                        if (appStart.getTime() <= a.startDateTime.getTime() && a.startDateTime.getTime() < appEnd.getTime() && appoint?.deleted_at === null) {
                            freeSlots[i].count -= 1;
                        }
                    });
                }
            }

        }

        if (wantOverBooking === 0) {

            return freeSlots.map((o: typings.FreeSlotsI): boolean => o.count === overbooking);
        }

        return freeSlots;

    }

    private readonly getFreeSlotsWithOverBookingCheck = (date: typings.FormattedDateForSugessionI, assignment: models.sch_recurrence_date_listsI, appointments: models.sch_appointmentsI[], overbooking?: number, timeSlot?: number): typings.ANY => {

        const freeSlots: typings.FreeSlotsI[] = [];
        let finalFreeSlots: typings.FreeSlotsI[] = [];
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

        if (appointments && appointments.length) {

            for (const appoint of appointments) {

                const appStart: Date = new Date(appoint?.scheduled_date_time);
                const appEnd: Date = new Date(appoint?.scheduled_date_time);

                appEnd.setMinutes(appEnd.getMinutes() + appoint?.time_slots);

                freeSlots?.find((a: typings.FreeSlotsI, i: number): void => {
                    if (appStart.getTime() <= a.startDateTime.getTime() && a.startDateTime.getTime() < appEnd.getTime() && appoint?.deleted_at === null) {
                        freeSlots[i].count -= 1;
                    }
                });
            }

        }

        finalFreeSlots = freeSlots.filter((d: typings.FreeSlotsI): Date => {
            if (d.count > 0) {
                // tslint:disable-next-line: increment-decrement
                for (let k: number = 0; k < d.count; k++) {

                    if (new Date(date.start).getTime() <= new Date(d.startDateTime).getTime() && new Date(d.startDateTime).getTime() < new Date(date.end).getTime()) {
                        return d.startDateTime;
                    }
                }
            }
        });

        return finalFreeSlots;

    }

    private readonly getFreeSlotsWithUnavailabilityChk = (freeSlots: typings.ANY, unAvails: models.sch_unavailable_doctorsI[], timeSlot: number): typings.ANY => {

        if (!unAvails.length) {
            return freeSlots;
        }

        freeSlots.forEach((slot: typings.ANY, i: number): typings.ANY => {

            let flaag: boolean = false;
            const slotEnd: Date = new Date(slot);

            slotEnd.setMinutes(slotEnd.getMinutes() + timeSlot);
            unAvails.forEach((u: models.sch_unavailable_doctorsI, j: number): typings.ANY => {
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

    private readonly getMaxTimezoneOffset = (): number => {
        const date: Date = new Date();
        const jan: Date = new Date(date.getFullYear(), 0, 1);
        const jul: Date = new Date(date.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }

    private readonly getNoShowAppointments = (data: models.sch_appointmentsI[]): models.sch_appointmentsI[] => data.filter((n: models.sch_appointmentsI): boolean => !n.cancelled && n.deleted_at === null && n?.appointmentStatus?.slug === 'no_show');

    private readonly getSpecialityIdByDoctor = async (availableDoctor: models.sch_available_doctorsI): Promise<number> => {

        const { doctor_id: doctorId, facility_location_id: facilityLocationId } = availableDoctor;

        const userFacility: models.user_facilityI = this.shallowCopy(await this.__userFacilityRepo.findOne({ user_id: doctorId, facility_location_id: facilityLocationId, deleted_at: null, speciality_id: { [Op.ne]: null } }));

        if (!userFacility || !Object.keys(userFacility).length) {

            throw generateMessages('NO_FIND_SPECIALIYT');

        }

        return userFacility.speciality_id;
    }

    private readonly getTimeSlotOfAssignment = (assignment: models.sch_available_specialitiesI | models.sch_available_doctorsI): number => {

        const { start_date: startDate, end_date: endDate, no_of_doctors: noOfDoctors, no_of_slots: noOfSlots } = assignment || {} as typings.ANY;

        let difference: number = new Date(endDate).getTime() - new Date(startDate).getTime();

        difference = (difference / 60000);

        if (noOfDoctors && noOfSlots > 0) {
            const total: number = noOfSlots / noOfDoctors;
            return (Math.round(difference / total));
        }

        if (noOfSlots > 0) {
            return (Math.round(difference / noOfSlots));
        }

        return 0;

    }

    private readonly getTodayAppointments = (data: models.sch_appointmentsI[]): models.sch_appointmentsI[] =>
        data.filter((t: models.sch_appointmentsI): models.sch_appointmentsI => {
            const formattedSchduledDateTime: string = format(new Date(t.scheduled_date_time), 'MM-dd-yyyy');
            const formattedCurrentDateTime: string = format(new Date(), 'MM-dd-yyyy');
            if (!t.cancelled && t.deleted_at === null && formattedSchduledDateTime === formattedCurrentDateTime) {
                return t;
            }
        })

    private readonly getWaitingListCount = async (data: typings.ANY, _authorization: string): Promise<typings.ANY> => {

        const { case_ids: caseIds, current_date: currentDate } = data;

        const casePatients: models.kiosk_casesI[] = this.shallowCopy(await this.__kioskCaseRepo.findAll(
            { id: { [Op.in]: caseIds } },
            {
                attributes: ['id'],
                include: [
                    { model: models.kiosk_case_types, as: 'caseType', attributes: ['id'], },
                    { model: models.kiosk_patient, as: 'patient',attributes: ['id'], },
                ]
            }
        ));

        const formatedCasePatients: number = casePatients.length;

        const checkInStatus: models.kiosk_case_patient_session_statusesI[] = this.shallowCopy(await this.__casePatientSessionStatusesRepo.findAll({
            [Op.or]: [
                {
                    slug: 'walk_in'
                },
                {
                    slug: 'walk_in_not_seen'
                }
            ]
        }, { attributes: ['id'] }));

        const checkInStatusIds: number[] = checkInStatus.map((e: models.kiosk_case_patient_session_statusesI): number => e.id);

        const checkedInPatients: models.kiosk_case_patient_sessionI[] = this.shallowCopy(await this.__casePatientSessionRepo.findAll(
            { status_id: { [Op.in]: checkInStatusIds }, date_of_check_in: currentDate, deleted_at: null },
            {
                attributes: ['id'],
                include: [
                    {
                        as: 'case',
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: [
                            { model: models.kiosk_patient, as: 'patient', attributes: ['id'], },
                            { model: models.kiosk_case_types, as: 'caseType',attributes: ['id'], }
                        ]
                    },
                    {
                        as: 'sessionPatientNotSeenReason',
                        attributes: ['id'],
                        model: models.kiosk_case_patient_session_not_seen_reasons,
                    }
                ]
            }
        ));

        const formatedCheckedInPatients: number = checkedInPatients.length;

        return {
            case_patients: formatedCasePatients,
            checked_in_patients: formatedCheckedInPatients,
        };

    }

    private readonly resolveAppointmentsOnFreeSlots = (freeSlots: typings.FreeSlotsI[], appointments: models.sch_appointmentsI[], availableDoctorId: number, availableSpecialityId: number, timeSlot: number): typings.ANY =>

        appointments.map((d: models.sch_appointmentsI): typings.ANY => {

            const slotsRequired: number = Math.floor(d.time_slots / timeSlot);
            let requiredAppointment: models.sch_appointmentsI;

            const getStartTime: typings.FreeSlotsI = freeSlots?.find((o: typings.FreeSlotsI, i: number): typings.FreeSlotsI => {

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
                    return o;

                }
            });

            const resolvedAppointments: models.sch_appointmentsI = getStartTime && requiredAppointment && Object.keys(requiredAppointment) ? {

                available_doctor_id: availableDoctorId,
                available_speciality_id: availableSpecialityId,
                case_id: requiredAppointment?.case_id,
                case_type_id: requiredAppointment?.case_type_id,
                date_list_id: requiredAppointment?.date_list_id,
                patient_id: requiredAppointment?.patient_id,
                priority_id: requiredAppointment?.priority_id,
                scheduled_date_time: getStartTime?.startDateTime,
                time_slots: requiredAppointment?.time_slots,
                type_id: requiredAppointment?.type_id,

            } : null;

            return [[resolvedAppointments], [requiredAppointment]];

        }).flat()

    private readonly resolveDoctorAppointmentOnFreeSlots = (freeSlots: typings.FreeSlotsI[], appointments: models.sch_appointmentsI[], availableDoctorId: number, timeSlot: number): typings.ANY =>

        appointments.map((d: models.sch_appointmentsI, index: number): typings.ANY => {

            const slotsRequired: number = Math.floor(d.time_slots / timeSlot);
            let requiredAppointment: models.sch_appointmentsI;

            const getStartTime: typings.FreeSlotsI = freeSlots?.find((o: typings.FreeSlotsI, i: number): typings.FreeSlotsI => {

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

    private readonly sentEmailForAppointment = async (object: typings.ANY, _authorization?: string): Promise<typings.ANY> => {

        const { email, caseId, caseType, appointmentId, appointmentStatus, confirmationStatus, timeSlot, scheduledDateTime, endDateTime, reason, patientLastName, emailTitle } = object;

        const content: string = `${this.getFormatedEmailBody('createAppointment', { caseId, caseType, appointmentId, appointmentStatus, confirmationStatus, timeSlot, scheduledDateTime, endDateTime, reason, patientLastName })}`;

        // tslint:disable-next-line: no-floating-promises
        await this.__http.post(`${process.env.LAMBDA_URL}/development/email/generate-email-for-single-user`, { email, emailTitle, content }, {});
    }

    private readonly sentEmailForMultipleAppointment = async (array: typings.ANY, _authorization?: string): Promise<typings.ANY> => {

        for (const object of array) {

            const { email, caseId, caseType, appointmentId, appointmentStatus, confirmationStatus, timeSlot, scheduledDateTime, endDateTime, reason, patientLastName, emailTitle } = object;

            const content: string = `${this.getFormatedEmailBody('createAppointment', { caseId, caseType, appointmentId, appointmentStatus, confirmationStatus, timeSlot, scheduledDateTime, endDateTime, reason, patientLastName })}`;

            await this.__http.post(`${process.env.LAMBDA_URL}/development/email/generate-email-for-single-user`, { email, emailTitle, content }, {});
        }
    }

    /**
     *
     * @param object
     * @param _authorization
     * @returns
     */
    private readonly updateAppointmentStatusForSuperAdmin = async (object: typings.updateAppointmentStatusForSuperAdminI, _authorization: string, previousAppointmentState: models.sch_appointmentsI): Promise<typings.ANY> => {

        const {
            foundAppointment,
            currentDateTime,
            visitStatuses,
            id,
            arrivedStatus,
            userId,

        } = object;

        const toSendObj: typings.ANY = {
            appointment_id: foundAppointment.id,
            case_id: foundAppointment.case_id,
            trigger_socket: true,
            status_id: visitStatuses?.find((e: models.kiosk_case_patient_session_statusesI): boolean => e.slug === 'in_session').id
        };

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        try {

            const { status } = this.shallowCopy(await this.__http.put(`${process.env.KIOSK_URL}case-patient-session`, toSendObj, config));

            if (status !== 200) {
                throw generateMessages('ERROR_WHILE_UPDATING_STATUS');
            }

        } catch (error) {
            await this.updateAppointmentToPreviosStart(previousAppointmentState);
            throw error;
        }

        try {

            await this.__repo.update(
                id,
                {
                    evaluation_date_time: currentDateTime ? new Date(currentDateTime) : new Date(),
                    status_id: arrivedStatus.id,
                    updated_by: userId
                },
                );

            const formattedAppointmentForIOS = await this.getAppointmentById({ appointment_id: [id], user_id: userId }, _authorization);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/action-against-appointments-for-ios`, { appointment_object: formattedAppointmentForIOS, action_point: 'updated' }, config);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments-for-ios`, { appointment_ids: [id] }, config);

            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

            return [{
                appointment: await this.__repo.findOne({ id: foundAppointment.id }, {
                    include: {
                        as: 'availableDoctor',
                        model: models.sch_available_doctors,
                        required: false,
                        where: { deleted_at: null },
                    }
                })
            }];

        } catch (error) {
            await this.updateAppointmentToPreviosStart(previousAppointmentState, true);
            throw error;
        }
    }

    private readonly updateAppointmentToPreviosStart = async (apppointment: models.sch_appointmentsI, revertKioskStatus?: boolean): Promise<typings.ANY> => {

        const {
            id,
            evaluation_date_time,
            date_list_id,
            available_doctor_id,
            scheduled_date_time,
            status_id,
            time_slots,
            updated_at,
            updated_by
        } = apppointment;

        await this.__repo.update(id, {
            date_list_id,
            evaluation_date_time,
            available_doctor_id,
            scheduled_date_time,
            status_id,
            time_slots,
            updated_at,
            updated_by
        });

        if (revertKioskStatus) {

            const {
                patientSessions
            } = apppointment || {};

            if (patientSessions) {

                const { id: patientSessionId, status_id: patientSessionStatusId} = patientSessions;
                await this.__casePatientSessionRepo.update(patientSessionId, {
                    status_id: patientSessionStatusId
                });
            }
        }

        return null;
    }

    private readonly checkErrorMultipleCptAppointments = async (cptCodes, multipleAppointments, same,doctor,speciality ):Promise<string> => {
        if(!cptCodes){
            if(multipleAppointments?.length){
                return "Created new appointment"
            }
            else{
                let errorMessage=""
                if(speciality.specialityVisitType[0].is_multiple_same_day){
                     errorMessage += "Unable to create appointment"
                    if (doctor){
                        errorMessage += " due to no provider assignment found at the given time."
                    }
                    else{
                        errorMessage += " due to no speciality assignment found at the given time."
                    }
                }
                else{
                     errorMessage += "Please select multiple on same day checkbox in specialty master to create appointment"
                }
                throw  errorMessage
            }
        }
        const appCptCodes=multipleAppointments.map((e)=>e.cptCodes);
        const cptCodesOfAppointment: models.billing_codes[] = await this.__billingCodesRepo.findAll({
            id: appCptCodes
        })
        const cptCodesData: models.billing_codes[] = await this.__billingCodesRepo.findAll({
            id: cptCodes?cptCodes: []
        });
        if (!speciality.specialityVisitType[0].is_multiple_same_day){
            if ((cptCodes?.length == 1 && multipleAppointments.length && cptCodes.length==multipleAppointments.length) || (!speciality.is_multiple_visit && cptCodes.length>1 && multipleAppointments.length==1)){ // success case
                let msg = "";
                msg += "Created new appointments for "
                for(const [ index, code] of cptCodesData.entries()){
                    msg += code.name.toString()
                    if(index != cptCodesData.length-1){
                        if (cptCodesData.length-2==index){
                            msg += " and "
                        }
                        else{   
                            msg += ", "
                        }
                    }
                }
                msg += "."
                return msg
            }
            if(cptCodes?.length>multipleAppointments.length){
                let errorMessage=""
                if (appCptCodes.length){ // checking for successfull cpts
                    errorMessage += "Created new appointment for "
                    for(const [ index, code] of cptCodesOfAppointment.entries()){
                        errorMessage += code.name.toString()
                        if(index != cptCodesOfAppointment.length-1){
                            if (cptCodesOfAppointment.length-2==index){
                                errorMessage += " and "
                            }
                            else{   
                                errorMessage += ", "
                            }
                        }
                    }
                    errorMessage += ". Please select multiple on same day checkbox in specialty master to create appointments for "
                    for(const [ index, code] of cptCodesData.entries()){
                        if(index >= multipleAppointments.length){    
                            errorMessage += code.name.toString()
                            if(index != cptCodes.length-1){
                                if (cptCodes.length-2==index){
                                    errorMessage += " and "
                                }
                                else{   
                                    errorMessage += ", "
                                }
                            }
                        }
                    }
                }
                else{
                    errorMessage += "Please select multiple on same day checkbox in specialty master to create appointments for "
                    for(const [ index, code] of cptCodesData.entries()){
                        if(index >= multipleAppointments.length){    
                            errorMessage += code.name.toString()
                            if(index != cptCodes.length-1){
                                if (cptCodes.length-2==index){
                                    errorMessage += " and "
                                }
                                else{   
                                    errorMessage += ", "
                                }
                            }
                        }
                    }
                    errorMessage += "."
                    throw  errorMessage
                }
                throw  errorMessage
            }

        }
        
        if(!speciality.is_multiple_visit && speciality.specialityVisitType[0].allow_multiple_cpt_codes){
            if (appCptCodes?.length){    
                const cptCodesOfAppointment: models.billing_codes[] = await this.__billingCodesRepo.findAll({
                    id: appCptCodes[0]
                })
                if (cptCodesOfAppointment.length){
                    let msg = "";
                    msg += "Created new appointment for "
                    for(const [ index, code] of cptCodesOfAppointment.entries()){
                        msg += code.name.toString()
                        if(index != cptCodesOfAppointment.length-1){
                            if (cptCodesOfAppointment.length-2==index){
                                msg += " and "
                            }
                            else{   
                                msg += ", "
                            }
                        }
                    }
                    msg += "."
                    return msg
                }
            }
        }
       
        if (cptCodes?.length && multipleAppointments.length && cptCodes.length==multipleAppointments.length ){ // success case
            let msg = "";
            msg += "Created new appointments for "
            for(const [ index, code] of cptCodesOfAppointment.entries()){
                msg += code.name.toString()
                if(index != cptCodesOfAppointment.length-1){
                    if (cptCodesOfAppointment.length-2==index){
                        msg += " and "
                    }
                    else{   
                        msg += ", "
                    }
                }
            }
            msg += "."
            return msg
        }
        if (cptCodes?.length > multipleAppointments.length){ // need to throw error 
            if (!same){
                let errorMessage = "Updated Successfully "
                if (appCptCodes.length){ // checking for successfull cpts
                    errorMessage += "and created new appointment for "
                    for(const [ index, code] of cptCodesOfAppointment.entries()){
                        errorMessage += code.name.toString()
                        if(index != cptCodesOfAppointment.length-1){
                            if (cptCodesOfAppointment.length-2==index){
                                errorMessage += " and "
                            }
                            else{   
                                errorMessage += ", "
                            }
                        }
                    }
                    errorMessage += " "
                }
                errorMessage += "but was unable to create appointment for "
                for(const [ index, code] of cptCodesData.entries()){
                    if(index >= multipleAppointments.length){    
                        errorMessage += code.name.toString()
                        if(index != cptCodes.length-1){
                            if (cptCodes.length-2==index){
                                errorMessage += " and "
                            }
                            else{   
                                errorMessage += ", "
                            }
                        }
                    }
                }
                if (doctor){
                    errorMessage += " due to no provider assignment found at the given time."
                }
                else{
                    errorMessage += " due to no speciality assignment found at the given time."
                }
                throw errorMessage
            }
            else{
                let errorMessage = ""
                if (appCptCodes.length){ // checking for successfull cpts
                    errorMessage += "Created new appointment for "
                    for(const [ index, code] of cptCodesOfAppointment.entries()){
                        errorMessage += code.name.toString()
                        if(index != cptCodesOfAppointment.length-1){
                            if (cptCodesOfAppointment.length-2==index){
                                errorMessage += " and "
                            }
                            else{   
                                errorMessage += ", "
                            }
                        }
                    }
                }
                if(cptCodesData.length && appCptCodes.length){
                    errorMessage +=  " but was "
                }
                if (appCptCodes.length){
                    errorMessage += "unable"
                }
                else{
                    errorMessage += "Unable"
                }
                errorMessage += " to create appointment for "
                for(const [ index, code] of cptCodesData.entries()){
                    if(index >= multipleAppointments.length){    
                        errorMessage += code.name.toString()
                        if(index != cptCodes.length-1){
                            if (cptCodes.length-2==index){
                                errorMessage += " and "
                            }
                            else{   
                                errorMessage += ", "
                            }
                        }
                    }
                }
                if (doctor){
                    errorMessage += " due to no provider assignment found at the given time."
                }
                else{
                    errorMessage += " due to no speciality assignment found at the given time."
                }
                throw errorMessage
            }
        }
    }

    private readonly throwErrorOnInitialSlotNotAvailable = async (cptCodes,doctor) => {
        if(!cptCodes){
            let errorMessage=""
            errorMessage += "Unable to create appointment"
            if (doctor){
                errorMessage += " due to no provider assignment found at the given time."
            }
            else{
                errorMessage += " due to no speciality assignment found at the given time."
            }
            throw  errorMessage;
        }
        const cptCodesData: models.billing_codes[] = await this.__billingCodesRepo.findAll({
            id: cptCodes
        });
        let errorMessage = "Unable to create appointment "
        if(cptCodes.length){
            errorMessage+="for "
        }
        for(const [ index, code] of cptCodesData.entries()){  
            errorMessage += code.name.toString()
            if(index != cptCodesData.length-1){
                if(index != cptCodesData.length-1){
                    if (cptCodesData.length-2==index){
                        errorMessage += " and "
                    }
                    else{   
                        errorMessage += ", "
                    }
                }
            }
        }
        if (doctor){
            errorMessage += " due to no provider assignment found at the given time."
        }
        else{
            errorMessage += " due to no speciality assignment found at the given time."
        }
        throw errorMessage
    }
    private getNewResponseforUpdateApis = async (ids: number[],specialityId) => {
        let appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                id: ids,
                deleted_at: null,
            },
            {
                include: [
                    {
                        as: 'availableDoctor',
                        include: [
                            {
                                as: 'doctor',
                                attributes: { exclude: ['password'] },
                                include: {
                                    as: 'userBasicInfo',
                                    attributes: ['id', 'first_name', 'last_name', 'middle_name', 'profile_pic', 'user_id'],
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.users,
                                required: false,
                                where: { deleted_at: null },
                            },
                            {
                                as: 'availableSpeciality',
                                include: {
                                    model: models.specialities,
                                    as: 'speciality',
                                    required: false,
                                    where: {
                                        deleted_at: null,
                                        ...(specialityId && { id: specialityId })
                                    }
                                },
                                model: models.sch_available_specialities,
                                required: false,
                                where: { deleted_at: null }
                            },
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'availableSpeciality',
                        include: [
                            {
                                model: models.specialities,
                                as: 'speciality',
                                required: false,
                                where: {
                                    deleted_at: null,
                                    id: specialityId
                                }
                            },
                            {
                                model: models.facility_locations,
                                as: 'facilityLocation',
                                required: false,
                                include: {
                                    model: models.facilities,
                                    as: 'facility',
                                    required: false,
                                }

                            }
                        ],
                        model: models.sch_available_specialities,
                        required:false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'case',
                        attributes: ['id'],
                        model: models.kiosk_cases,
                        include: [
                            {
                                model: models.billing_case_status,
                                as: 'caseStatus',
                                attributes: ['id', 'name'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.kiosk_case_types,
                                as: 'caseType',
                                attributes: ['id', 'name'],
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ],
                    },
                    {
                        model: models.kiosk_patient,
                        as: 'patient',
                        required: false,
                        where:{deleted_at:null}
                    },
                    {
                        model: models.sch_appointment_statuses,
                        as: 'appointmentStatus',
                        required: false,
                        where:{deleted_at:null}
                    },
                    {
                        model: models.physician_clinics,
                        as: 'physicianClinic',
                        attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                        required: false,
                        where: { deleted_at: null },
                        include: [
                            {
                                model: models.physicians,
                                as: 'physician',
                                attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                model: models.clinics,
                                as: 'clinic',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            },
                            {
                                model: models.clinic_locations,
                                as: 'clinicLocation',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        ]
                    },
                    {
                        model: models.users,
                        as: 'technician',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        where: { deleted_at: null }
                    },
                    {
                        model: models.users,
                        as: 'readingProvider',
                        required: false,
                        attributes: ['id', 'email'],
                        include: {
                            model: models.user_basic_info
                        },
                        deleted_at: null
                    },
                    {
                        model: models.sch_transportations,
                        as: 'transportations',
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        model: models.sch_appointment_cpt_codes,
                        as: 'appointmentCptCodes',
                        required: false,
                        where: { deleted_at: null },
                        include: {
                            model: models.billing_codes,
                            as: 'billingCode',
                            required: false,
                            where: { deleted_at: null },
                        },
                    },
                    {
                        as: 'appointmentType',
                        attributes: ['id', 'name', 'slug'],
                        include: {
                            as: 'specialityVisitType',
                            model: models.speciality_visit_types,
                            where:{
                                speciality_id:  { [Op.eq]: specialityId }
                            }
                        },
                        model: models.sch_appointment_types,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'patientSessions',
                        include: {
                            as: 'visitStatus',
                            model: models.kiosk_case_patient_session_statuses,
                            required: false,
                            where: {
                                deleted_at: null,
                            },
                        },
                        model: models.kiosk_case_patient_session,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                ],
                order: [
                    ['scheduled_date_time', 'ASC']
                ]
            }
        ))
        appointments = appointments.map((e) => {
                e.appointmentVisit=null
                if(e.availableDoctor){
                    let obj: any = {id: e.availableDoctor.doctor?.id , ...e.availableDoctor.doctor?.userBasicInfo}
                    e.availableDoctor.doctor = obj;
                    delete e.availableDoctor?.doctor.userBasicInfo;
                }
                if(e.physicianClinic){
                    const formattedPhysicianClinicResponse: typings.ANY = e.physicianClinic ? {
                        // ...physicianClinic,
                        physician: e.physicianClinic?.physician ? {
                            clinic_location_id: e.physicianClinic?.clinicLocation?.id,
                            physician_clinic_id: e.physicianClinic?.id,
                            ...e.physicianClinic?.clinic,
                            ...e.physicianClinic?.clinicLocation,
                            ...e.physicianClinic?.physician,
                        } : null
                    } : null;

                    e.physicianClinic = formattedPhysicianClinicResponse;
                }
                if(e.readingProvider){
                    e['reading_provider']=this.shallowCopy(e.readingProvider)
                    delete e.readingProvider
                }
                return e
            }
        )
        return appointments
    }
    
    private readonly checkIsThisTimeFreeOrNot = async (data: typings.GetStartTimeToCreateI)=>{
        const includeClause: typings.ANY = [
            {
                as: 'dateList',
                model: models.sch_recurrence_date_lists,
                required: true,
                where: {
                    deleted_at: null,
                    end_date: { [Op.gte]: data.appointmentEndTime },
                    start_date: { [Op.lte]: data.startDateTime }
                },
            },
            ...(data.specialityId && [{
                as: 'availableSpeciality',
                model: models.sch_available_specialities,
                required: true,
                where: {
                    speciality_id: data.specialityId,
                    deleted_at: null,
                }
            }])
        ];

        let getAvailableObj;
        if (!data.doctorId) {
            getAvailableObj = this.shallowCopy(await this.__availableSpecialityRepo.findOne(
                {
                    speciality_id: data.specialityId,
                    deleted_at: null
                },
                {
                    include: [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: { [Op.gte]: data.appointmentEndTime },
                                start_date: { [Op.lte]: data.startDateTime }
                            },
                        }
                    ]
                }
            ))
        }
        else {
            getAvailableObj = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                {
                    deleted_at: null,
                    doctor_id: data.doctorId,
                },
                {
                    include: includeClause
                }
            ));
        }
        const doctorFilter: typings.ANY = [];
        if (data.doctorId) {
            doctorFilter.push(
                {
                    as: 'availableDoctor',
                    model: models.sch_available_doctors,
                    required: true,
                    where: { 
                        deleted_at: null,
                        doctor_id: data.doctorId
                     },
                }
            );
        }
        const getScheduledAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                cancelled: false,
                deleted_at: null,
                pushed_to_front_desk: false,
                ...(!data.doctorId && {available_doctor_id:null}),
                ...(data.doctorId && {available_doctor_id:{[Op.not]: null}}),
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('datediff', this.convertDateToLocal(new Date(data.startDateTime), data.time_zone), Sequelize.col('scheduled_date_time')), {
                        [Op.and]: [
                            {
                                [Op.gt]: -1
                            },
                            {
                                [Op.lt]: 1
                            }
                        ]
                    })
                ]
            },
            {
                include: [
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: data.specialityId
                        }
                    },
                    ...doctorFilter
                ]

            }));
           
        const sameTimeLS = getScheduledAppointments.map((e) => {
            if (e.availableSpeciality.speciality_id == data.specialityId) {
                return new Date(e.scheduled_date_time).toISOString()
            }
        })
        const mapCounter = lodash.countBy(sameTimeLS)
        const currTime = new Date(data.startDateTime) 
        const isValidTime = new Date(currTime)
        if (((new Date(getAvailableObj?.dateList[0].end_date)).getTime() < isValidTime.setMinutes(isValidTime.getMinutes() + data.desiredTimeSlot))){
            throw generateMessages('NO_ASSIGNMENT_FOUND');
        }
        if (currTime.toISOString() in mapCounter) {
            if(data.speciality.over_booking < mapCounter[currTime.toISOString()]){
                throw generateMessages('NO_SLOTS_REMAINING');
            }
        }
    }
}
