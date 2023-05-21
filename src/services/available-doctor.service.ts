import * as moment from 'moment';
import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import * as typings from '../shared/common';
import { Frozen, Helper, Http } from '../shared';
import {
    ANY,
    AssignedReqObjI,
    AutomateDoctorReqObjI,
    AvailableDoctorsReqObjI,
    CreateDaysAndDatesI,
    DeleteAvailableDoctorsReqObjI,
    DoctorAssignmentResponseObjI,
    DoctorFreeSlotsI,
    DoctorResponseObjI,
    GetAllAvailableDoctorsMultiSpecReqObjI,
    FiltersAvailableDoctorsI,
    FiltersAvailableDoctorsResponseI,
    FormatedDatesI,
    formatedWeekI,
    formatWeeklyArrayI,
    FreeSlotsI,
    GenericHeadersI,
    GetAllAvailableDoctorsReqObjI,
    GetAppointmentsResponseDataI,
    GetAvailabilitiesReqI,
    getDoctorAssignmentsI,
    GetFilterDoctorReqObjI,
    GetFreeSlotsoOfDoctorsBodyI,
    isDoctorTimingSychronizedI,
    ModelRoleI,
    ModifiedAvailableDoctorsReqObjI,
    SpecialitiesDesireObjI,
    SpecificAppointmentsReqObjI,
    UpdateSpecialityAssignmentsPreCheckReqObjI
} from '../shared/common';
import { generateMessages } from '../utils';
import { EEXIST } from 'constants';
import { xssFilter } from 'helmet';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AvailableDoctorService extends Helper {

    public __http: Http;
    private readonly __createDaysAndDatesMethod: { [key: string]: string };
    private readonly __deleteDoctorMethod: { [key: string]: string };
    private readonly __deleteDoctorWithAppointmentMethod: { [key: string]: string };
    private readonly __formatDatesCriteriaMethod: { [key: string]: string };

    /**
     *
     * @param __repo
     * @param __facilityLocationRepo
     * @param __userBasicInfoRepo
     * @param __specialityRepo
     * @param __recurrenceEndingCriteriaRepo
     * @param __dayListsRepo
     * @param __recurrenceDayListRepo
     * @param __userRepo
     * @param __unAvailableDoctorRepo
     * @param __availableDoctorNotificationRepo
     * @param __userFacilityRepo
     * @param __rolesRepo
     * @param __modelHasRolesRepo
     * @param __recurrenceDateListRepo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.availableDoctorRepository,
        public __availableSpecialityRepo: typeof repositories.availableSpecialityRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __userBasicInfoRepo: typeof repositories.userBasicInfoRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
        public __recurrenceEndingCriteriaRepo: typeof repositories.recurrenceEndingCriteriaRepository,
        public __dayListsRepo: typeof repositories.dayListRepository,
        public __recurrenceDayListRepo: typeof repositories.recurrenceDayListRepository,
        public __userRepo: typeof repositories.userRepository,
        public __unAvailableDoctorRepo: typeof repositories.unAvailableDoctorRepository,
        public __availableDoctorNotificationRepo: typeof repositories.availableDoctorNotificationRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __rolesRepo: typeof repositories.roleRepository,
        public __modelHasRolesRepo: typeof repositories.modelHasRoleRepository,
        public __recurrenceDateListRepo: typeof repositories.recurrenceDateListRepository,
        public __appointmentRepo: typeof repositories.appointmentRepository,

        public http: typeof Http
    ) {
        super();
        this.__http = new http();
        this.__formatDatesCriteriaMethod = {
            false: 'formatDatesCriteriaWithOutEndDate',
            true: 'formatDatesCriteriaWithEndDate'
        };
        this.__createDaysAndDatesMethod = {
            false: 'createDaysAndDatesWithoutRecurrence',
            true: 'createDaysAndDatesWithRecurrence'
        };
        this.__deleteDoctorMethod = {
            false: 'deleteAvailableDoctorWithoutReccurence',
            true: 'deleteAvailableDoctorWithReccurence',
        };
        this.__deleteDoctorWithAppointmentMethod = {
            false: 'deleteAvailableDoctorWithAppointment',
            true: 'deleteSingleAvailableDoctorWithoutAppointment',
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public automate = async (data: AutomateDoctorReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            facility_location_ids: facilityLocationIds,
            doctor_ids: doctorIds,
            start_date: startDateString,
            number_of_weeks: NumOfWeeks,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const startDate: Date = new Date(startDateString);
        const requiredStartDate: Date = new Date(startDateString);
        const requiredRecords: number = doctorIds.length * facilityLocationIds.length;

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: { [Op.in]: facilityLocationIds },
                speciality_id: { [Op.ne]: null },
                user_id: { [Op.in]: doctorIds },
            },
            {
                include: [
                    {
                        as: 'users',
                        include:
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },

                        },
                        model: models.users,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]
            }
        ));

        if (requiredRecords !== userFacilities.length) {
            throw generateMessages('NO_FACILITY_LOCATION_FOUND');
        }

        const signInUser: models.user_basic_infoI = this.shallowCopy(await this.__userBasicInfoRepo.findOne(
            {
                deleted_at: null,
                user_id: userId,
            }
        ));

        if (!signInUser || !Object.keys(signInUser).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        const userIdsfromFacility: number[] = this.filterUnique(userFacilities.map((a: models.user_facilityI): number => a.user_id));
        const timeSlots: number[] = userFacilities.map((a: models.user_facilityI): number => a.speciality.time_slot);

        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        startDate.setMinutes(startDate.getMinutes() - new Date().getTimezoneOffset());

        const endDateToCreate: Date = this.getEndDate(startDate, NumOfWeeks);
        const lastDateToCheckPattern: Date = this.getLastDate(startDate, NumOfWeeks);

        const availableDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                available_speciality_id: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        end_date: { [Op.lt]: startDate },
                        start_date: { [Op.gte]: lastDateToCheckPattern }
                    },
                },
            }
        ));

        if (!availableDoctor || !availableDoctor.length) {
            throw generateMessages('NO_HISTORY_FOUND');
        }

        const requiredAvailableDoctor: models.sch_available_doctorsI[] = availableDoctor?.map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList } = i || {};

            return dateList?.map((d: models.sch_recurrence_date_listsI): models.sch_available_doctorsI => ({

                doctor_id: i.doctor_id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
                supervisor_id: i.supervisor_id,

            }));

        })
            .flat()
            .sort((a: models.sch_available_doctorsI, b: models.sch_available_doctorsI): number => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        const checkLastStartDate: string = new Date(requiredAvailableDoctor[0]?.start_date).toISOString().slice(0, 10);
        const checkLastEndDate: string = new Date(requiredAvailableDoctor[0]?.end_date).toISOString().slice(0, 10);
        const dateToCheckPattern: string = new Date(lastDateToCheckPattern).toISOString().slice(0, 10);

        const isBetween: boolean = moment(dateToCheckPattern).isBetween(checkLastStartDate, checkLastEndDate, null, '[]');

        if (!isBetween) {
            throw generateMessages('NO_HISTORY_FOUND');
        }

        const isDoctorTimingSychronized: isDoctorTimingSychronizedI[] = requiredAvailableDoctor.map((a: models.sch_available_doctorsI): isDoctorTimingSychronizedI => {

            const { start_date, end_date } = a || {};
            return {
                end_date: new Date(end_date).toISOString().slice(11, -1),
                start_date: new Date(start_date).toISOString().slice(11, -1),
            };
        });

        const isStartDateSychronized: boolean = this.checkDoctorTimingSychronization(isDoctorTimingSychronized, 'start_date');
        const isEndDateSychronized: boolean = this.checkDoctorTimingSychronization(isDoctorTimingSychronized, 'end_date');

        if (!isStartDateSychronized || !isEndDateSychronized) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const availableDoctorDates: Date[] = requiredAvailableDoctor.map((a: models.sch_available_doctorsI): Date => new Date(a.start_date));
        const weeklyArray: number[][] = this.getPastPattern(lastDateToCheckPattern, endDateToCreate, availableDoctorDates);
        const requiredDaysToCreate: number[] = weeklyArray.map((x: number[]): number => x[0]);
        const isPatternSychronized: boolean = this.isPatternSychronized(weeklyArray);

        if (!isPatternSychronized) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const formatedEndDate: Date = new Date(requiredAvailableDoctor[0].end_date);
        formatedEndDate.setDate(requiredStartDate.getDate());
        formatedEndDate.setFullYear(requiredStartDate.getFullYear());
        formatedEndDate.setMonth(requiredStartDate.getMonth());

        const formatedStartDate: Date = new Date(requiredAvailableDoctor[0].start_date);
        formatedStartDate.setDate(requiredStartDate.getDate());
        formatedStartDate.setFullYear(requiredStartDate.getFullYear());
        formatedStartDate.setMonth(requiredStartDate.getMonth());

        const datesForAvailbleDoctor: FormatedDatesI[] = this.formatDatesForAutomation(requiredDaysToCreate, formatedEndDate, endDateToCreate, formatedStartDate);
        const uniqueAvailableDoctos: models.sch_available_doctorsI[] = this.getUniqueAvailableDoctors(requiredAvailableDoctor);

        const formattedAvailableDoctor: models.sch_available_doctorsI[] = datesForAvailbleDoctor.map((s: FormatedDatesI): models.sch_available_doctorsI[] =>
            uniqueAvailableDoctos.map((z: models.sch_available_doctorsI): models.sch_available_doctorsI => ({

                doctor_id: z.doctor_id,
                end_date: s.end_date,
                facility_location_id: z.facility_location_id,
                no_of_slots: z.no_of_slots,
                start_date: s.start_date,
                supervisor_id: z.supervisor_id,

            }))).flat();

        const overLapedAvailablities: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        [Op.or]: [
                            {
                                end_date: { [Op.gt]: startDate },
                                start_date: { [Op.lt]: endDateToCreate }
                            },
                            {
                                start_date: {
                                    [Op.lt]: endDateToCreate,
                                    [Op.gte]: startDate
                                }
                            }
                        ]
                    },
                },
            }
        )).map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList } = i || {};

            return dateList?.map((d: models.sch_recurrence_date_listsI): models.sch_available_doctorsI => ({

                doctor_id: i.doctor_id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
                supervisor_id: i.supervisor_id,

            }));

        }).flat();

        let requiredAvailablities: models.sch_available_doctorsI[] = !overLapedAvailablities || !overLapedAvailablities.length ? formattedAvailableDoctor : this.getNonOverlappingAvailablities(formattedAvailableDoctor, overLapedAvailablities);

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                [Op.or]: [
                    {
                        approval_status: 1,
                        deleted_at: null,
                        doctor_id: { [Op.in]: doctorIds },
                        end_date: { [Op.gte]: endDateToCreate },
                        start_date: { [Op.lte]: startDate },
                    },
                    {
                        approval_status: 1,
                        deleted_at: null,
                        doctor_id: { [Op.in]: doctorIds },
                        start_date: { [Op.gte]: startDate, [Op.lte]: endDateToCreate },
                    }
                ]
            }
        ));

        requiredAvailablities = !unavailabileDoctors || !unavailabileDoctors.length ? requiredAvailablities : this.getNonOverlappingAvailablities(requiredAvailablities, unavailabileDoctors);

        if (!requiredAvailablities || !requiredAvailablities.length) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const availableDoctorArray: models.sch_available_doctorsI[] = this.getUniqueAvailableDoctors(requiredAvailablities);

        const uniqueDoctorAvailablities: models.sch_available_doctorsI[] = this.getUniqueDatesAvailableDoctors(requiredAvailablities);
        const newAvailableDoctorIds: number[] = this.shallowCopy(await this.__repo.bulkCreate([...availableDoctorArray], transaction)).map((a: models.sch_available_doctorsI): number => a.id);

        const dateListArray: models.sch_recurrence_date_listsI[] = uniqueDoctorAvailablities.map((d: models.sch_available_doctorsI): models.sch_recurrence_date_listsI[] =>
            newAvailableDoctorIds.map((f: number): models.sch_recurrence_date_listsI =>
            ({
                available_doctor_id: f,
                end_date: d.end_date,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
            }))).flat();

        return this.__recurrenceDateListRepo.bulkCreate([...dateListArray], transaction);

    }

    public automateV1 = async (data: AutomateDoctorReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            facility_location_ids: facilityLocationIds,
            doctor_ids: doctorIds,
            start_date: startDateString,
            number_of_weeks: NumOfWeeks,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const startDate: Date = new Date(startDateString);
        const requiredStartDate: Date = new Date(startDateString);

        const signInUser: models.user_basic_infoI = this.shallowCopy(await this.__userBasicInfoRepo.findOne(
            {
                deleted_at: null,
                user_id: userId,
            }
        ));

        if (!signInUser || !Object.keys(signInUser).length) {
            throw generateMessages('LOGGED_IN_NOT_FOUND');
        }

        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        startDate.setMinutes(startDate.getMinutes() - new Date().getTimezoneOffset());

        const endDateToCreate: Date = this.getEndDate(startDate, NumOfWeeks);
        const lastDateToCheckPattern: Date = this.getLastDate(startDate, NumOfWeeks);

        const availableDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
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
                            deleted_at: null,
                            end_date: { [Op.lte]: startDate },
                            start_date: { [Op.gte]: lastDateToCheckPattern }
                        },
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: { [Op.in] : specialityIds }
                        },
                    }
                ]
            }
        ));

        if (!availableDoctor || !availableDoctor.length) {
            throw generateMessages('NO_HISTORY_FOUND');
        }

        const requiredAvailableDoctor: models.sch_available_doctorsI[] = availableDoctor?.map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList } = i || {};

            return dateList?.map((d: models.sch_recurrence_date_listsI): models.sch_available_doctorsI => ({

                doctor_id: i.doctor_id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
                supervisor_id: i.supervisor_id,

            }));

        })
            .flat()
            .sort((a: models.sch_available_doctorsI, b: models.sch_available_doctorsI): number => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        const checkLastStartDate: string = new Date(requiredAvailableDoctor[0]?.start_date).toISOString().slice(0, 10);
        const checkLastEndDate: string = new Date(requiredAvailableDoctor[0]?.end_date).toISOString().slice(0, 10);
        const dateToCheckPattern: string = new Date(lastDateToCheckPattern).toISOString().slice(0, 10);

        const isBetween: boolean = moment(dateToCheckPattern).isBetween(checkLastStartDate, checkLastEndDate, null, '[]');

        if (!isBetween) {
            throw generateMessages('NO_HISTORY_FOUND');
        }

        const isDoctorTimingSychronized: isDoctorTimingSychronizedI[] = requiredAvailableDoctor.map((a: models.sch_available_doctorsI): isDoctorTimingSychronizedI => {

            const { start_date, end_date } = a || {};
            return {
                end_date: new Date(end_date).toISOString().slice(11, -1),
                start_date: new Date(start_date).toISOString().slice(11, -1),
            };
        });

        const isStartDateSychronized: boolean = this.checkDoctorTimingSychronization(isDoctorTimingSychronized, 'start_date');
        const isEndDateSychronized: boolean = this.checkDoctorTimingSychronization(isDoctorTimingSychronized, 'end_date');

        if (!isStartDateSychronized || !isEndDateSychronized) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const availableDoctorDates: Date[] = requiredAvailableDoctor.map((a: models.sch_available_doctorsI): Date => new Date(a.start_date));
        const weeklyArray: number[][] = this.getPastPattern(lastDateToCheckPattern, endDateToCreate, availableDoctorDates);
        const requiredDaysToCreate: number[] = weeklyArray.map((x: number[]): number => x[0]);
        const isPatternSychronized: boolean = this.isPatternSychronized(weeklyArray);

        if (!isPatternSychronized) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const formatedEndDate: Date = new Date(requiredAvailableDoctor[0].end_date);
        formatedEndDate.setDate(requiredStartDate.getDate());
        formatedEndDate.setFullYear(requiredStartDate.getFullYear());
        formatedEndDate.setMonth(requiredStartDate.getMonth());

        const formatedStartDate: Date = new Date(requiredAvailableDoctor[0].start_date);
        formatedStartDate.setDate(requiredStartDate.getDate());
        formatedStartDate.setFullYear(requiredStartDate.getFullYear());
        formatedStartDate.setMonth(requiredStartDate.getMonth());

        const datesForAvailbleDoctor: FormatedDatesI[] = this.formatDatesForAutomation(requiredDaysToCreate, formatedEndDate, endDateToCreate, formatedStartDate);
        const uniqueAvailableDoctos: models.sch_available_doctorsI[] = this.getUniqueAvailableDoctors(requiredAvailableDoctor);

        const formattedAvailableDoctor: models.sch_available_doctorsI[] = datesForAvailbleDoctor.map((s: FormatedDatesI): models.sch_available_doctorsI[] =>
            uniqueAvailableDoctos.map((z: models.sch_available_doctorsI): models.sch_available_doctorsI => ({

                doctor_id: z.doctor_id,
                end_date: s.end_date,
                facility_location_id: z.facility_location_id,
                no_of_slots: z.no_of_slots,
                start_date: s.start_date,
                supervisor_id: z.supervisor_id,

            }))).flat();

        const requiredAvailableSpecialities: models.sch_available_specialitiesI[] = this.filterNonNull(availableDoctor?.map((i: models.sch_available_doctorsI): models.sch_available_specialitiesI => {

            const { availableSpeciality } = i || {};

            if (availableSpeciality) {
                return {
                    end_after_occurences: availableSpeciality?.end_after_occurences,
                    end_date: formatedEndDate,
                    end_date_for_recurrence: availableSpeciality?.end_date_for_recurrence,
                    facility_location_id: availableSpeciality?.facility_location_id,
                    no_of_doctors: availableSpeciality?.no_of_doctors,
                    no_of_slots: availableSpeciality?.no_of_slots,
                    number_of_entries: availableSpeciality?.number_of_entries,
                    recurrence_ending_criteria_id: availableSpeciality?.recurrence_ending_criteria_id,
                    speciality_id: availableSpeciality?.speciality_id,
                    start_date: startDate,

                };
            }
        }))

        const uniqueAvailableSpecialities: models.sch_available_doctorsI[] = this.getUniqueAvailableSpecialities(requiredAvailableSpecialities);

        const newAvailableSpeciality: any[] = this.shallowCopy(await this.__availableSpecialityRepo.bulkCreate([...uniqueAvailableSpecialities], transaction));
        const overLapedAvailablities: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        [Op.or]: [
                            {
                                end_date: { [Op.gt]: startDate },
                                start_date: { [Op.lt]: endDateToCreate }
                            },
                            {
                                start_date: {
                                    [Op.lt]: endDateToCreate,
                                    [Op.gte]: startDate
                                }
                            }
                        ]
                    },
                },
            }
        )).map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList } = i || {};

            return dateList?.map((d: models.sch_recurrence_date_listsI): models.sch_available_doctorsI => ({

                doctor_id: i.doctor_id,
                end_date: d.end_date,
                facility_location_id: i.facility_location_id,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
                supervisor_id: i.supervisor_id,

            }));

        }).flat();

        let requiredAvailablities: models.sch_available_doctorsI[] = !overLapedAvailablities || !overLapedAvailablities.length ? formattedAvailableDoctor : this.getNonOverlappingAvailablities(formattedAvailableDoctor, overLapedAvailablities);

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                [Op.or]: [
                    {
                        approval_status: 1,
                        deleted_at: null,
                        doctor_id: { [Op.in]: doctorIds },
                        end_date: { [Op.gte]: endDateToCreate },
                        start_date: { [Op.lte]: startDate },
                    },
                    {
                        approval_status: 1,
                        deleted_at: null,
                        doctor_id: { [Op.in]: doctorIds },
                        start_date: { [Op.gte]: startDate, [Op.lte]: endDateToCreate },
                    }
                ]
            }
        ));

        requiredAvailablities = !unavailabileDoctors || !unavailabileDoctors.length ? requiredAvailablities : this.getNonOverlappingAvailablities(requiredAvailablities, unavailabileDoctors);

        if (!requiredAvailablities || !requiredAvailablities.length) {
            throw generateMessages('NO_ASSIGNMENT_PROPOSED');
        }

        const availableDoctorArray: models.sch_available_doctorsI[] = this.getUniqueAvailableDoctors(requiredAvailablities);

        const newAvailableDoctorArray: models.sch_available_doctorsI[] = newAvailableSpeciality.map(e =>
        ({
            ...availableDoctorArray[0],
            available_speciality_id: e.id,
            is_provider_assignment: true,
        }));
        const uniqueDoctorAvailablities: models.sch_available_doctorsI[] = this.getUniqueDatesAvailableDoctors(requiredAvailablities);
        const newAvailableDoctorIds: number[] = this.shallowCopy(await this.__repo.bulkCreate([...newAvailableDoctorArray], transaction)).map((a: models.sch_available_doctorsI): number => a.id);

        const dateListArray: models.sch_recurrence_date_listsI[] = uniqueDoctorAvailablities.map((d: models.sch_available_doctorsI): models.sch_recurrence_date_listsI[] =>
            newAvailableDoctorIds.map((f: number): models.sch_recurrence_date_listsI =>
            ({
                available_doctor_id: f,
                end_date: d.end_date,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,
            }))).flat();

        return this.__recurrenceDateListRepo.bulkCreate([...dateListArray], transaction);

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public delete = async (params: ANY, _authorization: string, transaction: Transaction): Promise<ANY> => {
        
        const {
            available_doctor_id: availableDoctorId,
            date_list_id: dateListId,
            user_id: userId = Number(process.env.USERID),
        } = params;

        const avilableDoctorDateLists: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_doctor_id: availableDoctorId,
                deleted_at: null
            },
            {
                include: {
                    as: 'availableDoctor',
                    model: models.sch_available_doctors,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                }
            }));

        if (!avilableDoctorDateLists || !avilableDoctorDateLists.length) {
            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        let appointmentAgainstDoctor: models.sch_appointmentsI[] = [];

        for (const d of avilableDoctorDateLists) {

            const appointmentsToGet: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
                {
                    available_doctor_id: availableDoctorId,
                    cancelled: 0,
                    deleted_at: null,
                    pushed_to_front_desk: 0,
                    scheduled_date_time: { [Op.between]: [new Date(d.start_date), new Date(d.end_date)] },
                }
            ));

            appointmentAgainstDoctor = [ ...appointmentAgainstDoctor, ...appointmentsToGet ];
        }

        const checkMethod: boolean = !dateListId ? true : false;

        return this[this.__deleteDoctorMethod[`${checkMethod}`]]({
            _authorization,
            appointmentAgainstDoctor,
            availableDoctorId,
            dateListId,
            transaction,
            userId,
        });

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointments = async (data: ANY, _authorization: string): Promise<GetAppointmentsResponseDataI[]> => {
        const { available_doctor_id: availableDoctorId } = data;

        const availableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findById(availableDoctorId, {
            include: [
                {
                    as: 'doctor',
                    attributes: { exclude: ['password'] },
                    include: {
                        as: 'userBasicInfo',
                        model: models.user_basic_info,
                        required: false,
                        where: { deleted_at: null }
                    },
                    model: models.users,
                    required: false,
                    where: { deleted_at: null }
                },
                {
                    as: 'appointments',
                    include: {
                        as: 'patient',
                        model: models.kiosk_patient,
                        required: false,
                        where: { deleted_at: null }
                    },
                    model: models.sch_appointments,
                    required: false,
                    where: { deleted_at: null }
                }
            ]
        }));

        const { appointments, doctor: { userBasicInfo } } = availableDoctor;

        return appointments.map((a: models.sch_appointmentsI): ANY => ({
            chart_no: '',
            doctor_first_name: userBasicInfo?.first_name,
            doctor_last_name: userBasicInfo?.last_name,
            doctor_middle_name: userBasicInfo?.middle_name,
            first_name: a?.patient?.first_name,
            id: a.id,
            last_name: a?.patient?.last_name,
            middle_name: a?.patient?.middle_name,
            patient_id: a?.patient?.id,
            scheduled_date_time: a?.scheduled_date_time,
            time_slots: a?.time_slots,
        })) || [];
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAvailabilities = async (data: GetAvailabilitiesReqI, _authorization: string): Promise<ANY> => {

        const {
            facility_location_id: facilityLocationId,
            speciality_id: specialityId,
            start_date: startDateString,
            end_date: endDateString,
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const doctorIds: number[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
            }
        )).map((d: models.user_facilityI): number => d.user_id);

        if (!doctorIds || !doctorIds.length) {
            return [];
        }

        return this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: facilityLocationId,
            },
            {
                include:
                    [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                [Op.or]: [
                                    {
                                        end_date: { [Op.gt]: startDate },
                                        start_date: { [Op.lte]: startDate }
                                    },
                                    {
                                        start_date: {
                                            [Op.lt]: endDate,
                                            [Op.gte]: startDate
                                        }
                                    }
                                ]
                            },
                        },
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include: {
                                as: 'userBasicInfo',
                                model: models.user_basic_info,
                                required: false,
                                where: { deleted_at: null }
                            },
                            model: models.users,
                            required: false,
                            where: { deleted_at: null }
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
    public getDoctorAssignments = async (data: getDoctorAssignmentsI, _authorization: string): Promise<ANY> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_ids: facilityLocationIds,
            doctor_ids: doctorIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
            },
            {
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
                        attributes: { exclude: ['password', 'remember_token', 'reset_key'] },
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
                            },
                            {
                                as: 'medicalIdentifiers',
                                model:models.medical_identifiers,
                                attributes:['id'],
                                include:{
                                    as:"billingTitle",
                                    attributes:['name'],
                                    model:models.billing_titles,
                                    where:{ deleted_at: null  }
                                },
                                where:  { 
                                    deleted_at: null,  
                              },
                            },


                        ],
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'dateList',
                        include: {
                            as: 'appointments',
                            model: models.sch_appointments,
                            required: false,
                            where: {
                                cancelled: 0,
                                deleted_at: null,
                                evaluation_date_time: null,
                                pushed_to_front_desk: 0,
                                scheduled_date_time: { [Op.between]: [startDate, endDate] },
                            }
                        },
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gt]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                },
                                {

                                    deleted_at: null,
                                    [Op.and]: [
                                        { start_date: { [Op.gte]: startDate } },
                                        { start_date: { [Op.lt]: endDate } }
                                    ],
                                }
                            ]
                        },
                    }
                ]
            }
        ));

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
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

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        required: false,
                        where: {
                            deleted_at: null,
                            slug: 'facility_location',
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        }));

        if ((!user || !Object.keys(user).length)) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes } = user;

        const availableDoctorObject: DoctorAssignmentResponseObjI[] = availableDoctor.map((o: models.sch_available_doctorsI): ANY => {

            const color: string = colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === o.facility_location_id)?.code ?? '#9d9d9d';

            return {
                facility_color: color,
                ...o
            };
        });

        return {
            assignments: availableDoctorObject,
            unavailabilities: unavailabileDoctors,
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getDoctorAssignmentsV1 = async (data: getDoctorAssignmentsI, _authorization: string): Promise<ANY> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_ids: facilityLocationIds,
            doctor_ids: doctorIds,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableDoctor: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: { [Op.in]: facilityLocationIds },
            },
            {
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
                        model: models.sch_available_specialities,
                        as: 'availableSpeciality',
                        required: specialityIds && specialityIds.length ? true : false,
                        where: { deleted_at: null },
                        include: {
                            model: models.specialities,
                            as: 'speciality',
                            required: specialityIds && specialityIds.length ? true : false,
                            where: {
                                deleted_at: null,
                                ...(specialityIds && { id: specialityIds })
                            }
                        }
                    },
                    {
                        as: 'doctor',
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
                        attributes: { exclude: ['password', 'remember_token', 'reset_key'] },
                    },
                    {
                        as: 'dateList',
                        include: {
                            as: 'appointments',
                            model: models.sch_appointments,
                            required: false,
                            where: {
                                cancelled: 0,
                                deleted_at: null,
                                evaluation_date_time: null,
                                pushed_to_front_desk: 0,
                                scheduled_date_time: { [Op.between]: [startDate, endDate] },
                            }
                        },
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gt]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                },
                                {

                                    deleted_at: null,
                                    [Op.and]: [
                                        { start_date: { [Op.gte]: startDate } },
                                        { start_date: { [Op.lt]: endDate } }
                                    ],
                                }
                            ]
                        },
                    }
                ]
            }
        ));

        const unavailabileDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
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

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        required: false,
                        where: {
                            deleted_at: null,
                            slug: 'speciality',
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: { deleted_at: null },
                }
            ]
        }));

        if ((!user || !Object.keys(user).length)) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const { colorCodes } = user;

        const availableDoctorObject: DoctorAssignmentResponseObjI[] = availableDoctor.map((o: models.sch_available_doctorsI): ANY => {

            const color: string = colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === o.availableSpeciality?.speciality_id)?.code ?? '#9d9d9d';

            return {
                speciality_color: color,
                ...o
            };
        });

        return {
            assignments: availableDoctorObject,
            unavailabilities: unavailabileDoctors,
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getFilteredDoctor = async (data: GetFilterDoctorReqObjI, _authorization: string): Promise<ANY> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_ids: facilityLocationIds,
            user_id: userId = Number(process.env.USERID),
            doctor_id: doctorId,
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const userJoinClause: ANY = this.__userRepo.getJoinClause('get_filtered_doctor');

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId, deleted_at: null }, { include: userJoinClause }));

        if (!user && !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const modelHasRolesJoinClause: ANY = this.__modelHasRolesRepo.getJoinClause('get_filtered_doctor');

        const modelHasRoles: ModelRoleI = this.shallowCopy(await this.__modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: modelHasRolesJoinClause
            }
        ));

        const { role: { slug } } = modelHasRoles;

        const { colorCodes } = user;

        let userFacility: models.user_facilityI[];

        const userFacilityJoinClause: ANY = this.__userFacilityRepo.getJoinClause('get_filtered_doctor');

        const whereClause: ANY = slug !== 'super_admin' ? this.formatProjectionClauseForFilteredDoctor(doctorId, facilityLocationIds)
            :
            this.formatProjectionClauseForFilteredDoctorWithFacilityLocationIds(facilityLocationIds);

        userFacility = this.shallowCopy(await this.__userFacilityRepo.findAll(
            { ...whereClause },
            { include: userFacilityJoinClause }
        ));

        const doctorIds: number[] = userFacility.map((o: models.user_facilityI): number => o.user_id);

        const doctorObj: FiltersAvailableDoctorsResponseI[] = userFacility.map((o: models.user_facilityI): ANY => {

            const { users, users: { userFacilities, userTimings, userBasicInfo } } = o;

            const expectedUserFacility: models.user_facilityI[] = userFacilities.filter((u: models.user_facilityI): boolean => facilityLocationIds.includes(u.facility_location_id));
            let expectedUserTimings: models.user_timingsI;
            let specialitycolor: string = '#9d9d9d';
            const specialitiesArray: FiltersAvailableDoctorsI[] = expectedUserFacility && expectedUserFacility.length ? expectedUserFacility.map((s: models.user_facilityI): FiltersAvailableDoctorsI => {
                specialitycolor = colorCodes?.find((spec: models.sch_color_codesI): boolean => spec.object_id === s.speciality_id)?.code ?? '#9d9d9d';
                expectedUserTimings = userTimings?.find((t: models.user_timingsI): ANY => t.facility_location_id === s.facility_location_id);
                return {
                    color: specialitycolor,
                    facility_location_id: s.facility_location_id,
                };
            }) : [];

            const specialtyObject: FiltersAvailableDoctorsI = Object.assign({}, ...specialitiesArray);

            return {
                doctor: {
                    info: { ...userBasicInfo },
                    specialities: specialtyObject,
                    user_timings: [expectedUserTimings]
                },
                user_id: users.id,
            };
        });

        const unavailableDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                approval_status: 1,
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                end_date: { [Op.gte]: endDate },
                start_date: { [Op.lte]: startDate },
            }
        ));

        return !unavailableDoctor || !unavailableDoctor.length ? doctorObj : unavailableDoctor?.filter((p: models.sch_unavailable_doctorsI): ANY =>
            doctorObj?.find((o: ANY): boolean => o.user_id === p.doctor_id));

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getFreeSlotsOfDoctors = async (data: GetFreeSlotsoOfDoctorsBodyI, _authorization: string): Promise<ANY> => {

        const {
            start_date: startDateString,
            end_date: endDateString,
            facility_location_ids: facilityLocationIds,
            doctor_id: doctorId,
            time_zone: timeZone
        } = data;
        
        const startDate: Date = this.convertDateToLocal(new Date(startDateString),timeZone)
        const endDate: Date = new Date(endDateString)
        
        const hours = Math.abs(timeZone)/60
        if (startDate.getDate() == endDate.getDate() && startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth()){//for same dates
            endDate.setUTCDate(endDate.getDate()+1)
            if (timeZone >= 0){// time zone positive
                if (timeZone != 0){
                    endDate.setUTCHours(24-hours,timeZone % 60)
                }
            }
            else{   // time zone negative
                endDate.setUTCHours(hours,hours % 60)
            }
        }
        else{ // for different dates
            if(timeZone > 0){ // time zone positive
                if(timeZone){ 
                    endDate.setUTCHours(24-hours,timeZone % 60)
                }
            }
            else{ // time zone negative
                endDate.setDate(endDate.getDate()+1)
                endDate.setUTCHours(hours,timeZone % 60)
            }
        }
        
        let facilityLocationClause: ANY = {};

        if (facilityLocationIds) {
            facilityLocationClause = {
                facility_location_id: {
                    [Op.in]: facilityLocationIds
                }
            };
        }

        const filters: ANY = {
            doctor_id: doctorId,
            ...facilityLocationClause
        };

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                ...filters
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
                                end_date: { [Op.lt]: endDate },
                                start_date: { [Op.gte]: startDate },
                            },
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: startDate, [Op.lt]: endDate },
                            }
                        ]
                    }
                }
            }));

        if (!availableDoctors || !availableDoctors.length) {
            throw generateMessages('PROVIDER_NOT_AVAILABLE');
        }

        const formatedAvailableDoctors: ANY = availableDoctors.map((availableDoctor: models.sch_available_doctorsI): ANY => {

            const { dateList, ...otherAttributes } = availableDoctor;

            return dateList?.map((d: models.sch_recurrence_date_listsI): ANY => ({
                ...otherAttributes,
                date_list_id: d.id,
                end_date: d.end_date,
                no_of_doctors: d?.no_of_doctors,
                no_of_slots: d?.no_of_slots,
                start_date: d.start_date,
            }));

        }).flat();

        const userFacility: models.user_facilityI = this.shallowCopy(await this.__userFacilityRepo.findOne({
            facility_location_id: { [Op.in]: facilityLocationIds },
            speciality_id: { [Op.ne]: null },
            user_id: doctorId,
            // tslint:disable-next-line: align
        }, {
            include: {
                as: 'speciality',
                model: models.specialities,
                required: false
            }
        }));

        if (!userFacility || !Object.keys(userFacility).length) {
            throw generateMessages('PROVIDER_NOT_FOUND');
        }

        const { speciality } = userFacility;

        if (!speciality || !Object.keys(speciality).length) {
            throw generateMessages('PROVIDER_IS_NOT_ASSIGNED_TO_ANY_SPECIALITY');
        }

        let formattedArray: DoctorFreeSlotsI[] = [];
        let timeSlot: number;

        for (const availability of formatedAvailableDoctors) {

            const {
                id,
                start_date: availabilityStartDateString,
                end_date: availabilityEndDateString,
                doctor_id: availabilityDoctorId,
                no_of_slots: NumOfSlots
            } = availability;

            const availabilityStartDate: Date = new Date(availabilityStartDateString);
            const availabilityEndDate: Date = new Date(availabilityEndDateString);

            const milliSeconds: number = availabilityEndDate.getTime() - availabilityStartDate.getTime();
            const minutes: number = (milliSeconds / 1000) / 60;

            timeSlot = minutes / NumOfSlots;

            const unAvailabilities: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
                [Op.or]: [
                    {
                        approval_status: true,
                        deleted_at: null,
                        doctor_id: availabilityDoctorId,
                        end_date: { [Op.gt]: availabilityStartDate },
                        start_date: { [Op.lte]: availabilityStartDate },
                    },
                    {
                        approval_status: true,
                        deleted_at: null,
                        doctor_id: availabilityDoctorId,
                        start_date: { [Op.gte]: availabilityStartDate, [Op.lt]: availabilityEndDate },
                    }
                ]
            }));

            const appointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
                {
                    available_doctor_id: id,
                    deleted_at: null,
                    scheduled_date_time: { [Op.between]: [availabilityStartDate, availabilityEndDate] }
                },
                {
                    order: [
                        ['scheduled_date_time', 'ASC']
                    ]
                }
            ));

            formattedArray = [...formattedArray, ...this.getFreeSlotsTimings(availability, appointments, speciality.over_booking + 1, timeSlot, true, unAvailabilities)].flat();

        }

        const formatObject: ANY = [];

        for (const z of formattedArray) {

            let count: number = 0;

            let localDate: Date = new Date(z.slot_time);
            localDate = this.convertDateToLocal(new Date(z.slot_time), timeZone);

            const onlyDate: string = localDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const onlyTime: string = localDate.toLocaleTimeString();

            if (!formatObject.length) {

                const requiredDateTime: ANY = {};
                requiredDateTime.date = onlyDate;
                requiredDateTime.time = [];
                requiredDateTime.time.push({ slot: onlyTime, facility_location_id: z.facility_location_id });
                formatObject.push(requiredDateTime);

            } else {

                let already: boolean = false;

                for (const singleObjs of formatObject) {

                    if (singleObjs.date === onlyDate) {
                        already = true;
                        formatObject[count].time.push({ slot: onlyTime, facility_location_id: z.facility_location_id });
                    }
                    count += 1;
                }

                if (!already) {
                    const requiredDateTime: ANY = {};
                    requiredDateTime.date = onlyDate;
                    requiredDateTime.time = [];
                    requiredDateTime.time.push({ slot: onlyTime, facility_location_id: z.facility_location_id });
                    formatObject.push(requiredDateTime);
                }
            }

        }

        return {
            available_slots: formatObject,
            duration: parseInt(timeSlot.toString(), 0)
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getMaunalDoctorsList = async (data: GetAllAvailableDoctorsReqObjI, _authorization: string): Promise<DoctorResponseObjI[]> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_id: facilityLocationId,
            speciality_id: specialityId,
            user_id: userId = Number(process.env.USERID),
        } = data;

    

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

    

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        required: false,
                        where: {
                            deleted_at: null,
                            slug: 'facility_location',
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            ]
        }));

   
    
        if (!user && !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
            },
            {
                include: {
                    as: 'users',
                    include: [
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'userTimings',
                            model: models.user_timings,
                            required: true,
                            where: {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                                specialty_id: specialityId,
                            }
                        }
                        , 
                        {
                            as: 'medicalIdentifiers',
                            model:models.medical_identifiers,
                            attributes:['id'],
                            include:{
                                as:"billingTitle",
                                attributes:['name'],
                                model:models.billing_titles,
                                where:{ deleted_at: null  }
                            },
                            where:  { 
                                deleted_at: null,  
                          },
                        },
                    ],
                    model: models.users,
                    required: true,
                    where: { deleted_at: null },
                }
            }
        ));

     
        const doctorInfoObj: models.user_facilityI[] = userFacilities.map((s: models.user_facilityI): ANY =>
        ({
            email: s?.users?.email,
            speciality_id: s?.speciality_id,
            user_id: s?.users?.id,
            user_info: s?.users?.userBasicInfo,
            provide_title:(s?.users?.medicalIdentifiers) ? s?.users?.medicalIdentifiers?.billingTitle?.name : null
        }));

        const doctorIds: number[] = doctorInfoObj.map((s: models.user_facilityI): number => s.user_id);

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: facilityLocationId
            },
            {
                include: [
                    {
                        as: 'facilityLocations',
                        model: models.facility_locations,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gt]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                },
                                {
                                    deleted_at: null,
                                    start_date: {
                                        [Op.gte]: startDate,
                                        [Op.lt]: endDate,
                                    }
                                }
                            ]
                        },
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            speciality_id: specialityId
                        }
                    }
                ]
            }));

        if (!availableDoctors && !availableDoctors.length) {
            throw generateMessages('PROVIDER_NOT_AVAILABLE');
        }

        const formattedAvailabledDoctors: models.sch_available_doctorsI[] = availableDoctors.map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList: dateListOfSpeciality } = i;

            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): ANY => ({

                ...i,
                date_list_id: d.id,
                end_date: d.end_date,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,

            }));

        }).flat();

        const superAdmin: models.rolesI = this.shallowCopy(await this.__rolesRepo.findOne(
            {
                slug: 'super_admin',
            },
            {
                include: {
                    as: 'modelRoles',
                    model: models.model_has_roles,
                    required: false,
                    where: {
                        model_id : userId
                    }
                }
            }
        ));

        const { modelRoles } = superAdmin;

        const checkSuperAdmin: number = modelRoles.length;

        const facilityForSignedUser: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({ user_id: userId, deleted_at: null }));

        const { colorCodes } = user;

        const checkAvailablity: ModifiedAvailableDoctorsReqObjI[] = formattedAvailabledDoctors.map((p: ANY): ModifiedAvailableDoctorsReqObjI => {

            const desiredFacilty: models.user_facilityI = facilityForSignedUser.find((f: models.user_facilityI): boolean => f.facility_location_id === p.facility_location_id);

            if (!desiredFacilty && !checkSuperAdmin) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const isFacilitySupervisor: boolean = true;
            const color: string = colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === p.facility_location_id)?.code ?? '#9d9d9d';

            return {
                date_list_id: p.date_list_id,
                doctor_id: p.doctor_id,
                end_date: p.end_date,
                facility_color: color,
                facility_id: p.facilityLocations.facility_id,
                facility_name: p.facilityLocations.name,
                id: p.id,
                is_facility_supervisor: isFacilitySupervisor,
                start_date: p.start_date,
            };

        });

        const checkUnAvailablityOfDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                [Op.or]: [
                    {
                        [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gt]: startDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }, { approval_status: 1 }]
                    },
                    {
                        [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lt]: endDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }, { approval_status: 1 }]
                    }
                ]
            }
        ));

        let unavailability: string = checkUnAvailablityOfDoctor?.length > 0 ? 'partial' : 'none';

        const checkUnAvailablity: models.sch_unavailable_doctorsI[] = checkUnAvailablityOfDoctor?.filter((c: models.sch_unavailable_doctorsI): boolean => new Date(c.start_date).getTime() <= startDate.getTime() && new Date(c.end_date).getTime() >= endDate.getTime());

        if (checkUnAvailablity.length) {
            unavailability = 'full';
        }

        return doctorInfoObj.map((d: models.user_facilityI): ANY =>
        ({
            ...d,
            assignments: [...checkAvailablity.filter((o: ModifiedAvailableDoctorsReqObjI): boolean => o.doctor_id === d.user_id)],
            unavailability,
            unavailabilityTime: checkUnAvailablityOfDoctor,
        }));

    }

    /**
     *
     * @param data
     * @param _authorization
     */
     public getMaunalDoctorsListV1 = async (data: GetAllAvailableDoctorsMultiSpecReqObjI, _authorization: string): Promise<DoctorResponseObjI[]> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_id: facilityLocationId,
            speciality_ids: specialityIds,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const user: models.usersI = this.shallowCopy(await this.__userRepo.findOne({ id: userId, deleted_at: null }, {
            include: [
                {
                    as: 'colorCodes',
                    include: {
                        as: 'type',
                        model: models.sch_color_code_types,
                        required: false,
                        where: {
                            deleted_at: null,
                            slug: 'facility_location',
                        }
                    },
                    model: models.sch_color_codes,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            ]
        }));

        if (!user && !Object.keys(user).length) {
            throw generateMessages('NO_RECORD_FOUND');
        }

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityIds,
            },
            {
                group:['user_id'],
                include: {
                    as: 'users',
                    include: [
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'userTimings',
                            model: models.user_timings,
                            required: true,
                            where: {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                            }
                        }
                    ],
                    model: models.users,
                    required: true,
                    where: { deleted_at: null },
                }
            }
        ));

        const doctorInfoObj: models.user_facilityI[] = userFacilities.map((s: models.user_facilityI): ANY =>
        ({
            email: s?.users?.email,
            speciality_id: s?.speciality_id,
            user_id: s?.users?.id,
            user_info: s?.users?.userBasicInfo,
        }));

        const doctorIds: number[] = doctorInfoObj.map((s: models.user_facilityI): number => s.user_id);

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
                facility_location_id: facilityLocationId,
            },
            {
                include: [
                    {
                        as: 'facilityLocations',
                        model: models.facility_locations,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            [Op.or]: [
                                {
                                    deleted_at: null,
                                    end_date: { [Op.gt]: startDate },
                                    start_date: { [Op.lte]: startDate },
                                },
                                {
                                    deleted_at: null,
                                    start_date: {
                                        [Op.gte]: startDate,
                                        [Op.lt]: endDate,
                                    }
                                }
                            ]
                        },
                    }
                ]
            }));

        if (!availableDoctors && !availableDoctors.length) {
            throw generateMessages('PROVIDER_NOT_AVAILABLE');
        }

        const formattedAvailabledDoctors: models.sch_available_doctorsI[] = availableDoctors.map((i: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {

            const { dateList: dateListOfSpeciality } = i;

            return dateListOfSpeciality?.map((d: models.sch_recurrence_date_listsI): ANY => ({

                ...i,
                date_list_id: d.id,
                end_date: d.end_date,
                no_of_slots: d.no_of_slots,
                start_date: d.start_date,

            }));

        }).flat();

        const superAdmin: models.rolesI = this.shallowCopy(await this.__rolesRepo.findOne(
            {
                slug: 'super_admin',
            },
            {
                include: {
                    as: 'modelRoles',
                    model: models.model_has_roles,
                    required: false,
                }
            }
        ));

        const { modelRoles } = superAdmin;

        const checkSuperAdmin: number = modelRoles[0].model_id;

        const facilityForSignedUser: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll({ user_id: userId, deleted_at: null }));

        const { colorCodes } = user;

        const checkAvailablity: ModifiedAvailableDoctorsReqObjI[] = formattedAvailabledDoctors.map((p: ANY): ModifiedAvailableDoctorsReqObjI => {

            const desiredFacilty: models.user_facilityI = facilityForSignedUser.find((f: models.user_facilityI): boolean => f.facility_location_id === p.facility_location_id);

            if (!desiredFacilty && checkSuperAdmin !== userId) {
                throw generateMessages('USER_NOT_ALLOWED');
            }

            const isFacilitySupervisor: boolean = true;
            const color: string = colorCodes?.find((fac: models.sch_color_codesI): boolean => fac.object_id === p.facility_location_id)?.code ?? '#9d9d9d';

            return {
                date_list_id: p.date_list_id,
                doctor_id: p.doctor_id,
                end_date: p.end_date,
                facility_color: color,
                facility_id: p.facilityLocations.facility_id,
                facility_name: p.facilityLocations.name,
                id: p.id,
                is_facility_supervisor: isFacilitySupervisor,
                start_date: p.start_date,
            };

        });

        const checkUnAvailablityOfDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
            {
                [Op.or]: [
                    {
                        [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gt]: startDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }, { approval_status: 1 }]
                    },
                    {
                        [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lt]: endDate } }, { doctor_id: { [Op.in]: doctorIds } }, { deleted_at: null }, { approval_status: 1 }]
                    }
                ]
            }
        ));

        let unavailability: string = checkUnAvailablityOfDoctor?.length > 0 ? 'partial' : 'none';

        const checkUnAvailablity: models.sch_unavailable_doctorsI[] = checkUnAvailablityOfDoctor?.filter((c: models.sch_unavailable_doctorsI): boolean => new Date(c.start_date).getTime() <= startDate.getTime() && new Date(c.end_date).getTime() >= endDate.getTime());

        if (checkUnAvailablity.length) {
            unavailability = 'full';
        }

        return doctorInfoObj.map((d: models.user_facilityI): ANY =>
        ({
            ...d,
            assignments: [...checkAvailablity.filter((o: ModifiedAvailableDoctorsReqObjI): boolean => o.doctor_id === d.user_id)],
            unavailability,
            unavailabilityTime: checkUnAvailablityOfDoctor,
        }));

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getPartialAvailableDoctor = async (data: GetAllAvailableDoctorsReqObjI, _authorization: string): Promise<ANY> => {

        const {
            end_date: endDateString,
            start_date: startDateString,
            facility_location_id: facilityLocationId,
            speciality_id: specialityId,
            user_id: userId = Number(process.env.USERID),
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const userFacilities: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
            }
        ));

        if (!userFacilities || !userFacilities.length) {
            return [];
        }

        const doctorIds: number[] = userFacilities.map((s: models.user_facilityI): number => s.user_id);

        return this.__repo.findAll(
            {
                deleted_at: null,
                doctor_id: { [Op.in]: doctorIds },
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
                            end_date: { [Op.gte]: endDate },
                            start_date: { [Op.lte]: startDate },
                        },
                    },
                    {
                        as: 'doctor',
                        attributes: { exclude: ['password'] },
                        include:[
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: true,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'medicalIdentifiers',
                            model:models.medical_identifiers,
                            attributes:['id'],
                            required: false,
                            include:{
                                as:"billingTitle",
                                attributes:['name'],
                                model:models.billing_titles,
                                where:{ deleted_at: null  }
                            },
                            where:  { 
                                deleted_at: null,  
                          },
                        },
                    ],
                        model: models.users,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        model: models.sch_available_specialities,
                        as: 'availableSpeciality',
                        required:  true,
                        where: { deleted_at: null },
                        include: {
                            model: models.specialities,
                            as: 'speciality',
                            required:true,
                            where: {
                                deleted_at: null,
                                id:specialityId
                            }
                        }
                    },
                ]
            },

        );

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getPreCheckForUpdation = async (data: UpdateSpecialityAssignmentsPreCheckReqObjI, _authorization: string): Promise<ANY> => {

        const {
            available_doctor_id: id,
        } = data;

        const availableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findById(
            id,
            {
                include: {
                    as: 'appointments',
                    model: models.sch_appointments,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            }
        ));

        if (!availableDoctor || !Object.keys(availableDoctor).length) {
            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        const { appointments } = availableDoctor;

        if (!appointments || !appointments.length) {
            return {
                end_time: null,
                start_time: null,
            };
        }

        const filteredAppointments: models.sch_appointmentsI[] = appointments.map((o: models.sch_appointmentsI): ANY => {

            const endDateTime: Date = new Date(o.scheduled_date_time);
            const startDateTime: Date = new Date(o.scheduled_date_time);

            endDateTime.setMinutes(endDateTime.getMinutes() + o.time_slots);

            return startDateTime && new Date(endDateTime).getTime() > new Date(startDateTime).getTime() ? new Date(endDateTime) : startDateTime;

        })?.sort();

        const appointmentTime: Date[] = appointments?.map((a: models.sch_appointmentsI): Date => a.scheduled_date_time)?.sort();

        return {
            end_time: filteredAppointments.pop(),
            start_time: appointmentTime[0],
        };

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public post = async (data: AvailableDoctorsReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            doctor: {
                facility_location_id: facilityLocationId,
                doctor_id: doctorId,
                end_date: endDate,
                start_date: startDate,
                days,
                recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
                end_date_for_recurrence: endDateForRecurrence,
                end_after_occurences: endAfterOccurences,
            },
        } = data;

        if (!recurrenceEndingCriteriaId) {
            const checkDuplicate: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findOne(
                {
                    deleted_at: null,
                    doctor_id: doctorId,
                    facility_location_id: facilityLocationId
                },
                {
                    include: {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            [Op.or]: [
                                {
                                    end_date: {
                                        [Op.and]: [
                                            {
                                                [Op.gt]: startDate
                                            },
                                            {
                                                [Op.lte]: endDate
                                            }
                                        ]
                                    }
                                },
                                {
                                    start_date: { [Op.between]: [startDate, endDate] }
                                }
                            ]
                        }
                    }
                }
            ));

            if (checkDuplicate && Object.keys(checkDuplicate).length) {
                throw generateMessages('SAME_ASSIGNMENT_EXIST');
            }
        }

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: facilityLocationId
            },
            {
                include: {
                    as: 'faciltyTiming',
                    model: models.facility_timings,
                    required: false,
                    where: { deleted_at: null },
                }
            }));

        if (!facilityLocation || !Object.keys(facilityLocation).length) {
            throw generateMessages('NO_FACILITY_LOCATION_FOUND');
        }

        let endingCriteriaObj: models.sch_recurrence_ending_criteriasI;
        let endingCriteria: string;

        if (recurrenceEndingCriteriaId) {

            endingCriteriaObj = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(recurrenceEndingCriteriaId)) as unknown as models.sch_recurrence_ending_criteriasI;
            const { slug: endingCriteriaString } = endingCriteriaObj;
            endingCriteria = endingCriteriaString ?? '';
        }

        const { faciltyTiming } = facilityLocation;

        const checkForRecurrence: boolean = !days && !recurrenceEndingCriteriaId ? false : true;

        const checkedFacilityTimings: boolean = await this.checkFacilityTimings(faciltyTiming, startDate, endDate, checkForRecurrence, days, endingCriteria);

        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        }

        const doctor: models.usersI = this.shallowCopy(await this.__userRepo.findById(doctorId, {
            include: [
                {
                    as: 'userTimings',
                    model: models.user_timings,
                    required: false,
                    where: { 
                        deleted_at: null,
                        facility_location_id : facilityLocationId
                    }
                },
                {
                    as: 'userFacilities',
                    include: {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    model: models.user_facility,
                    required: false,
                    where: {
                        deleted_at: null,
                        facility_location_id: facilityLocationId
                    }
                }
            ]
        }));

        if (!doctor || !Object.keys(doctor).length) {
            throw generateMessages('NO_DOCTOR_FOUND');
        }

        const { userTimings, userFacilities } = doctor;

        let formatedDays: number[] = days && days.length ? days : this.filterUnique(faciltyTiming.map((timing: models.facility_timingsI): number => timing.day_id));

        const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimings(userTimings, startDate, endDate, checkForRecurrence, formatedDays, endingCriteria);

        if (!checkedDoctorTimings.length) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
        }

        if (endingCriteria === 'daily') {
            formatedDays = checkedDoctorTimings.map((d: ANY): ANY => d.day_id).filter((x: ANY): ANY => formatedDays.includes(x));
        }

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__repo.findAll(
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
                        [Op.or]: [
                            {
                                deleted_at: null,
                                end_date: { [Op.gte]: endDate },
                                start_date: { [Op.lte]: startDate },
                            },
                            {
                                deleted_at: null,
                                start_date: { [Op.gte]: startDate, [Op.lt]: endDate }
                            },
                            {
                                deleted_at: null,
                                end_date: { [Op.gt]: startDate, [Op.lte]: endDate }
                            }
                        ]
                    },
                },
            }
        ));

        if (availableDoctors && availableDoctors.length) {
            throw generateMessages('PROVIDER_ALREADY_ASSIGN');
        }

        // Const unAvailablityOfDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
        //     [Op.or]: [
        //         {
        //             [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gte]: endDate } }, { doctor_id: doctorId }, { approval_status: 1 }, { deleted_at: null }]
        //         },
        //         {
        //             [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lte]: endDate } }, { doctor_id: doctorId }, { approval_status: 1 }, { deleted_at: null }]
        //         },
        //     ]
        // })).filter((d: models.sch_unavailable_doctorsI): boolean => d.start_date.getTime() <= new Date(startDate).getTime() && d.end_date.getTime() >= new Date(endDate).getTime()) as unknown as models.sch_unavailable_doctorsI[];

        // If (unAvailablityOfDoctor && unAvailablityOfDoctor.length) {
        //     Throw generateMessages('PROVIDER_NOT_AVAILABLE');
        // }

        const duration: number = new Date(endDate).getTime() - new Date(startDate).getTime();

        const specialityTimeSlot: number = userFacilities[0]?.speciality?.time_slot;

        const slots: number = Math.floor(duration / (specialityTimeSlot * 60 * 1000));

        const newAvailableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.create({
            doctor_id: doctorId,
            end_date: endDate,
            facility_location_id: facilityLocationId,
            no_of_slots: slots,
            start_date: startDate,
            supervisor_id: userId
            // tslint:disable-next-line: align
        }, transaction
        )) as unknown as models.sch_available_doctorsI;

        const { id: availableDoctorId } = newAvailableDoctor;

        const daysAndDatesMethod: boolean = recurrenceEndingCriteriaId ? true : false;

        await this[this.__createDaysAndDatesMethod[`${daysAndDatesMethod}`]]({
            doctorId,
            endAfterOccurences,
            endDate,
            endDateForRecurrence,
            endingCriteria,
            facilityLocationId,
            formatedDays,
            newAvailableDoctorId: availableDoctorId,
            slots,
            startDate,
            transaction,
            userTimings
        });

        return this.__availableDoctorNotificationRepo.create({
            available_doctor_id: availableDoctorId,
            doctor_id: doctorId
            // tslint:disable-next-line: align
        }, transaction);

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public put = async (data: AvailableDoctorsReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            available_doctor: {
                id,
                date_list_id: dateListId,
                start_date: startDateString,
                end_date: endDateString,
                facility_location_id: facilityLocationId,
                doctor_id: doctorId,
            }
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findById(id, {
            include: {

                model: models.sch_available_specialities,
                as: 'availableSpeciality',
                required: false,
                where: { deleted_at: null },
                include: {
                    model: models.specialities,
                    as: 'speciality',
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }

            }
        }));
       
        const { availableSpeciality: { speciality: avlDoctorSpeciality } } = availableDoctor;

        if (!availableDoctor || !Object.keys(availableDoctor).length) {

            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findById(facilityLocationId, {
            include: {
                as: 'faciltyTiming',
                model: models.facility_timings,
                where: {
                    deleted_at: null
                }
            }
        }));

        const { faciltyTiming } = facilityLocation;

        const checkedFacilityTimings: boolean = await this.checkFacilityTimings(faciltyTiming, startDateString, endDateString, false);

        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        }

        const availableDoctorDateList: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__repo.findAll({ doctor_id: doctorId, deleted_at: null }, {
            include: [
                {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        [Op.or]: [
                            { [Op.and]: [{ start_date: { [Op.lte]: startDate }, end_date: { [Op.gte]: endDate }, deleted_at: null }] },
                            { [Op.and]: [{ start_date: { [Op.gte]: startDate, [Op.lt]: endDate }, deleted_at: null }] },
                            { [Op.and]: [{ end_date: { [Op.gt]: startDate, [Op.lte]: endDate }, deleted_at: null }] },
                        ]
                    }
                },
                {
                    model: models.sch_available_specialities,
                    as: 'availableSpeciality',
                    required: true,
                    where: { deleted_at: null },
                    include: {
                        model: models.specialities,
                        as: 'speciality',
                        required: true,
                        where: {
                            deleted_at: null,
                            id: avlDoctorSpeciality.id
                        }
                    }
                }
        ]
        }));

        if (availableDoctorDateList.length > 1 || (availableDoctorDateList.length === 1 && availableDoctorDateList[0].id !== id)) {
            
            throw generateMessages('NO_PROVIDER_AVAILABLE');
        }

        const unavailableDoctors: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
            [Op.or]: [
                { [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gte]: endDate } }, { doctor_id: doctorId }, { approval_status: true }, { deleted_at: null }] },
                { [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lte]: endDate } }, { doctor_id: doctorId }, { approval_status: true }, { deleted_at: null }] }
            ]
        }));

        const fullyUnavailableDoctors: models.sch_unavailable_doctorsI[] = unavailableDoctors.filter((u: models.sch_unavailable_doctorsI): boolean => u.start_date.getTime() <= startDate.getTime() && u.end_date.getTime() >= endDate.getTime());

        if (fullyUnavailableDoctors && fullyUnavailableDoctors.length) {

            throw generateMessages('NO_PROVIDER_AVAILABLE');
        }

        const userFacility: models.user_facilityI = this.shallowCopy(await this.__userFacilityRepo.findOne(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: avlDoctorSpeciality.id,
                user_id: doctorId,
            },
            {
                include: [
                    {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null }
                    },
                    {
                        as: 'users',
                        include: {
                            as: 'userTimings',
                            model: models.user_timings,
                            required: false,
                            where: {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                            }
                        }
                        ,
                        model: models.users,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    }
                ]
            }
        ));

        const { users: { userTimings }, speciality } = userFacility || {};

        const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimings(userTimings, startDateString, endDateString, false);

        if (!checkedDoctorTimings.length) {

            throw generateMessages(`NO_TIME_FALL`);
        }

        const slots: number = (endDate.getTime() - startDate.getTime()) / (speciality.time_slot * 60 * 1000);

        return this.__recurrenceDateListRepo.update(
            dateListId,
            {
                end_date: endDate,
                no_of_slots: slots,
                start_date: startDate,
                updated_at: new Date(),
                updated_by: userId,
            },
            transaction
        );
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public resolvePastAvailabilties = async (data: ANY, _authorization: string): Promise<ANY> => {
        const { speciality_id: specialityId, doctor_id: doctorId, user_id: userId = Number(process.env.USERID) } = data;
    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public specificAppointments = async (data: SpecificAppointmentsReqObjI, _authorization: string): Promise<ANY> => {

        const {
            available_doctor_id: id,
            start_date: startDateString,
            end_date: endDateString,
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        return this.__appointmentRepo.findAll(
            {
                available_doctor_id: id,
                cancelled: false,
                deleted_at: null,
                pushed_to_front_desk: false,
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
                        as: 'availableDoctor',
                        include: {
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
                        where: {
                            deleted_at: null,
                        }
                    }
                ],
            }
        );

    }

    /**
     *
     * @param date
     * @param days
     */
    private readonly addDaysForReccurence = (date: Date, days: number): Date => new Date(date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)));

    /**
     *
     * @param doctor
     * @param dataType
     * @returns
     */
    private readonly checkDoctorTimingSychronization = (doctor: isDoctorTimingSychronizedI[], dataType: string): boolean =>
        doctor.every((val: isDoctorTimingSychronizedI, _i: number, arr: isDoctorTimingSychronizedI[]): boolean => val[`${dataType}`] === arr[0][`${dataType}`])

    /**
     *
     * @param userTimings
     * @param startDate
     * @param endDate
     * @param withRecurrence
     * @param days
     * @param endingCriteria
     */
    private readonly checkDoctorTimings = async (userTimings: models.user_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteria?: string): Promise<models.user_timingsI[]> => {

        if (!withRecurrence) {

            const filteredTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): models.user_timingsI => {

                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                if (dayId === new Date(startDate).getDay()) {

                    const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const formateddoctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);
                    const doctorEndDate: Date = (new Date(`${endDate.slice(0, 10)}T${formateddoctorEndDate.toISOString().slice(-13)}`));

                    if (doctorStartDate.toISOString().slice(0, 10) !== doctorEndDate.toISOString().slice(0, 10)) {
                        doctorEndDate.setDate(doctorStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (doctorStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= doctorEndDate.getTime() && doctorStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= doctorEndDate.getTime()) {
                        return t;
                    }
                }
            });

            return filteredTimings;
        }
        if (endingCriteria === 'daily') {
            return [...userTimings];
        }

        const timings: models.user_timingsI[] = [];
        const count: number = days.map((d: number): number => d).reduce((acc: number, c: number): number => {

            const filteredTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): models.user_timingsI => {

                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                if (dayId === c) {

                    // const doctorStartDate: Date = new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`);
                    // const doctorEndDate: Date = new Date(`${startDate.slice(0, 10)}T${String(endTime)}.000Z`);

                    const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const doctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);

                    if (doctorStartDate.toISOString().slice(0, 10) !== doctorEndDate.toISOString().slice(0, 10)) {
                        doctorEndDate.setDate(doctorStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (doctorStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= doctorEndDate.getTime() && doctorStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= doctorEndDate.getTime()) {
                        timings.push(t);
                        return t;
                    }
                }
            });
            // tslint:disable-next-line: no-unused-expression
            filteredTimings && filteredTimings.length ? acc++ : acc;
            return acc;
            // tslint:disable-next-line: align
        }, 0);

        if (count === days.length) {
            return timings;
        }

        return [];
    }

    /**
     *
     * @param faciltyTiming
     * @param startDate
     * @param endDate
     * @param withRecurrence
     * @param days
     * @param endingCriteria
     */
    private readonly checkFacilityTimings = async (faciltyTiming: models.facility_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteria?: string): Promise<boolean> => {

        if (!withRecurrence) {

            const filteredTimings: models.facility_timingsI[] = faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {
                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone, facility_location_id } = t;

                if (dayId === new Date(startDate).getDay()) {

                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const formatedEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);
                    const facilityEndDate: Date = (new Date(`${endDate.slice(0, 10)}T${formatedEndDate.toISOString().slice(-13)}`));

                    if (facilityStartDate.toISOString().slice(0, 10) !== facilityEndDate.toISOString().slice(0, 10)) {
                        facilityEndDate.setDate(facilityStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (facilityStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= facilityEndDate.getTime() && facilityStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= facilityEndDate.getTime()) {
                        return t;
                    }
                }
            });

            return filteredTimings && filteredTimings.length ? true : false;
        }

        if (endingCriteria === 'daily') {
            return true;
        }

        const count: number = days?.map((d: number): number => d).reduce((acc: number, c: number): number => {
            const filteredTimings: models.facility_timingsI[] = faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {
                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                if (dayId === c) {

                    // const facilityStartDate: Date = new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`);
                    // const facilityEndDate: Date = new Date(`${startDate.slice(0, 10)}T${String(endTime)}.000Z`);

                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const facilityEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);


                    if (facilityStartDate.toISOString().slice(0, 10) !== facilityEndDate.toISOString().slice(0, 10)) {
                        facilityEndDate.setDate(facilityStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (facilityStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= facilityEndDate.getTime() && facilityStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= facilityEndDate.getTime()) {
                        return t;
                    }
                }
            });
            // tslint:disable-next-line: no-unused-expression
            filteredTimings && filteredTimings.length ? acc++ : acc;
            return acc;
            // tslint:disable-next-line: align
        }, 0);

        if (count === days.length) {
            return true;
        }

        return false;

    }

    private readonly convertDateToLocal = (date: Date, timeZone: number): Date => new Date(date.setMinutes(date.getMinutes() - timeZone));

    /**
     *
     * @param obj
     */
    private readonly createDaysAndDatesWithoutRecurrence = async (obj: CreateDaysAndDatesI): Promise<ANY> => {

        const { facilityLocationId, doctorId, newAvailableDoctorId, endDate, startDate, slots, transaction, userTimings } = obj;

        const unAvailablityOfDoctor: models.sch_unavailable_doctorsI = this.shallowCopy(await this.__unAvailableDoctorRepo.findOne({
            [Op.or]: [
                {
                    end_date: { [Op.gte]: endDate },
                    start_date: { [Op.lte]: startDate }
                },
                {
                    [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lt]: endDate } }]
                },
                {
                    start_date: {
                        [Op.gt]: startDate,
                        [Op.lt]: endDate
                    }
                },
                {
                    end_date: {
                        [Op.gt]: startDate,
                        [Op.lt]: endDate
                    }
                }
            ],
            approval_status: 1,
            deleted_at: null,
            doctor_id: doctorId
        }));
        // .filter((d: models.sch_unavailable_doctorsI): boolean => new Date(d.start_date).getTime() <= new Date(startDate).getTime() && new Date(d.end_date).getTime() >= new Date(endDate).getTime()) as unknown as models.sch_unavailable_doctorsI[];

        const userTimingDays: number[] = userTimings.map((u: models.user_timingsI): number => u.day_id);

        if (unAvailablityOfDoctor || !userTimingDays.includes(new Date(startDate).getDay())) {
            throw generateMessages('PROVIDER_NOT_AVAILABLE');
        }

        const checkDuplicate: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findOne(
            {
                deleted_at: null,
                doctor_id: doctorId,
                facility_location_id: facilityLocationId
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        [Op.or]: [
                            {
                                end_date: {
                                    [Op.and]: [
                                        {
                                            [Op.gt]: startDate
                                        },
                                        {
                                            [Op.lte]: endDate
                                        }
                                    ]
                                }
                            },
                            {
                                start_date: { [Op.between]: [startDate, endDate] }
                            }
                        ]
                    }
                }
            }
        ));

        if (checkDuplicate && Object.keys(checkDuplicate).length) {
            throw generateMessages('SAME_ASSIGNMENT_EXIST');
        }

        const day: models.sch_day_listsI = this.shallowCopy(await this.__dayListsRepo.findOne({ unit: new Date(startDate).getDay() }));

        await this.__recurrenceDayListRepo.create({ available_doctor_id: newAvailableDoctorId, day_id: day.id }, transaction);

        await this.__recurrenceDateListRepo.create({ available_doctor_id: newAvailableDoctorId, end_date: new Date(endDate), start_date: new Date(startDate), no_of_slots: slots }, transaction);

        return null;
    }

    /**
     *
     * @param obj
     */
    private readonly createDaysAndDatesWithRecurrence = async (obj: CreateDaysAndDatesI): Promise<FormatedDatesI[]> => {

        const { facilityLocationId, formatedDays, newAvailableDoctorId, endDateForRecurrence, endDate, endingCriteria, endAfterOccurences, startDate, slots, doctorId, userTimings, transaction } = obj;

        const checkForDateCriteria: boolean = endDateForRecurrence ? true : false;

        let formatDates: FormatedDatesI[] = (await this[this.__formatDatesCriteriaMethod[`${checkForDateCriteria}`]]({
            daysList: formatedDays,
            endDateString: endDate,
            endingCriteria,
            numberOfRecurrsion: endAfterOccurences,
            recurrenceEndDateString: endDateForRecurrence,
            startDateString: startDate,
        })).map((c: FormatedDatesI): FormatedDatesI => ({
            ...c,
            available_doctor_id: newAvailableDoctorId,
            no_of_slots: slots,
        }));

        // const userTimingDays: number[] = userTimings.map((u: models.user_timingsI): number => u.day_id);

        // formatDates = formatDates.filter((d: FormatedDatesI): ANY => userTimingDays.includes(new Date(d.start_date).getDay()));

        if (formatDates && formatDates.length) {

            const unAvailablityOfDoctor: models.sch_unavailable_doctorsI[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll({
                approval_status: 1,
                deleted_at: null,
                doctor_id: doctorId,
                [Op.or]: [
                    {
                        [Op.and]: [{ start_date: { [Op.lte]: startDate } }, { end_date: { [Op.gte]: formatDates[formatDates.length - 1].end_date } }]
                    },
                    {
                        [Op.and]: [{ start_date: { [Op.gte]: startDate } }, { start_date: { [Op.lte]: formatDates[formatDates.length - 1].end_date } }]
                    }
                ]
            }));

            unAvailablityOfDoctor.map((u: models.sch_unavailable_doctorsI): ANY => {

                formatDates.filter((formatDate: FormatedDatesI): ANY => {
                    if ((
                        // tslint:disable-next-line: strict-comparisons
                        (u.start_date <= formatDate.start_date && u.end_date >= formatDate.end_date) ||
                        // tslint:disable-next-line: strict-comparisons
                        (u.start_date >= formatDate.start_date && u.start_date <= formatDate.end_date)) &&
                        (u.start_date.getTime() <= formatDate.start_date.getTime() && u.end_date.getTime() >= formatDate.end_date.getTime())
                    ) {
                        return true;
                    }
                });
            });

            for (const formatedDate of formatDates) {

                const checkDuplicate: models.sch_available_doctorsI = this.shallowCopy(await this.__repo.findOne(
                    {
                        deleted_at: null,
                        doctor_id: doctorId,
                        facility_location_id: facilityLocationId
                    },
                    {
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                start_date: { [Op.between]: [formatedDate.start_date, formatedDate.end_date] },
                            },
                        },
                    }
                ));

                if (checkDuplicate && Object.keys(checkDuplicate).length) {
                    throw generateMessages('SAME_ASSIGNMENT_EXIST');
                }
            }
        }

        if (formatDates && formatDates.length) {
            await this.__recurrenceDateListRepo.bulkCreate([...formatDates], transaction);
        }

        let recurrenceDayslist: number[] = formatedDays;

        if (endingCriteria === 'daily') {
            recurrenceDayslist = [...new Set(formatDates.map((d: FormatedDatesI): number => d.start_date.getDay()))] as unknown as number[];
        }

        const daylists: models.sch_day_listsI[] = this.shallowCopy(await this.__dayListsRepo.findAll({
            unit: {
                [Op.in]: recurrenceDayslist
            }
        }));

        const formatedRecurrenceDays: models.sch_recurrence_day_listsI[] = daylists.map((d: models.sch_day_listsI): models.sch_recurrence_day_listsI => ({
            available_doctor_id: newAvailableDoctorId,
            day_id: d.id
        }));

        await this.__recurrenceDayListRepo.bulkCreate([...formatedRecurrenceDays], transaction);

        return formatDates;
    }

    /**
     *
     * @param object
     */
    private readonly deleteAvailableDoctorWithAppointment = async (object: DeleteAvailableDoctorsReqObjI): Promise<ANY> => {

        const {
            availableDoctorId,
            dateListId,
            userId,
            _authorization,
            transaction
        } = object;

        const config: GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const deletedSingleAvailableDoctorWithoutAppointment: ANY = await this.deleteSingleAvailableDoctorWithoutAppointment(
            {
                availableDoctorId,
                dateListId,
                transaction,
                userId,
            }
        );

        // Await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        return deletedSingleAvailableDoctorWithoutAppointment;
    }

    /**
     *
     * @param object
     */
    private readonly deleteAvailableDoctorWithoutReccurence = async (object: DeleteAvailableDoctorsReqObjI): Promise<ANY> => {

        const {
            appointmentAgainstDoctor,
            availableDoctorId,
            dateListId,
            userId,
            _authorization,
            transaction
        } = object;

        const checkMethod: boolean = !appointmentAgainstDoctor || !appointmentAgainstDoctor.length ? true : false;

        return this[this.__deleteDoctorWithAppointmentMethod[`${checkMethod}`]]({
            _authorization,
            availableDoctorId,
            dateListId,
            transaction,
            userId,
        });

    }

    /**
     *
     * @param object
     */
    private readonly deleteAvailableDoctorWithReccurence = async (object: DeleteAvailableDoctorsReqObjI): Promise<ANY> => {

        const {
            appointmentAgainstDoctor,
            availableDoctorId,
            transaction,
            userId,
        } = object;

        if (appointmentAgainstDoctor && appointmentAgainstDoctor.length) {
            throw generateMessages('CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT');
        }

        await this.__recurrenceDateListRepo.updateByColumnMatched(
            {
                available_doctor_id: availableDoctorId,
                deleted_at: null
            },
            {
                deleted_at: new Date(),
                updated_by: userId
                // tslint:disable-next-line: align
            }, transaction);

        return this.__repo.update(availableDoctorId, { deleted_at: new Date(), updated_by: userId }, transaction);
    }

    /**
     *
     * @param object
     */
    private readonly deleteSingleAvailableDoctorWithoutAppointment = async (object: DeleteAvailableDoctorsReqObjI): Promise<ANY> => {

        const {
            availableDoctorId,
            dateListId,
            userId,
            transaction
        } = object;

        const avilableDateLists: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_doctor_id: availableDoctorId,
                deleted_at: null
            }
        ));

        const updatedDateList: models.sch_recurrence_date_listsI = await this.__recurrenceDateListRepo.update(dateListId, { deleted_at: new Date(), updated_by: userId }, transaction);

        if (avilableDateLists.length === 1) {
            return this.__repo.update(availableDoctorId, { deleted_at: new Date(), updated_by: userId }, transaction);
        }

        return updatedDateList;
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
            Day.setDate(today.getDate() + Number(numOfDays));
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

        let endDate: Date = new Date(startDate);
        let date: Date;
        if (endDate.getDay() === daysList[0]) {
            for (let j: number = 0; j < daysToAdd; j += 1) {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

        } else {
            let checkLoop: boolean = true;

            while (checkLoop) {
                endDate.setTime(endDate.getTime() + (1000 * 60 * 60 * 24));

                if (endDate.getDay() === daysList[0]) {
                    for (let i: number = 0; i < daysToAdd; i += 1) {
                        endDate.setMonth(endDate.getMonth() + 1);
                    }

                    endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

                    checkLoop = false;

                }
            }

        }

        return date = new Date(endDate);

    }

    /**
     *
     * @param obj
     */
    private readonly formatDatesCriteriaWithEndDate = async (obj: { daysList: number[]; endDateString: string; endingCriteria: string; recurrenceEndDateString: string; startDateString: string }): Promise<FormatedDatesI[]> => {

        const {
            daysList, endDateString, endingCriteria, recurrenceEndDateString, startDateString
        } = obj;

        if (startDateString === recurrenceEndDateString) {
            return [];
        }

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);
        const recurrenceEndDate: Date = new Date(recurrenceEndDateString);

        const startDateTime: number = startDate.getTime();
        const endDateTime: number = endDate.getTime();

        const duration: number = endDateTime - startDateTime;

        let date: Date[] = [];
        let formatedDates: FormatedDatesI[] = [];

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

            formatedDates = date?.map((d: Date): { end_date: Date; start_date: Date } => {
                const expectedRecurrenceEndDate: Date = new Date(d.getTime() + duration);
                return {
                    end_date: expectedRecurrenceEndDate,
                    start_date: d
                };
            }) || [];

            return formatedDates;
        }

        while (startDate.getTime() <= recurrenceEndDate.getTime()) {

            date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                if (startDate.getDay() === daysList[index]) {
                    return new Date(JSON.parse(JSON.stringify(startDate)));
                }
            }))];

            startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
        }

        formatedDates = date?.map((d: Date): { end_date: Date; start_date: Date } => {
            const expectedRecurrenceEndDate: Date = new Date(d.getTime() + duration);
            return {
                end_date: expectedRecurrenceEndDate,
                start_date: d
            };
        }) || [];

        return formatedDates;

    }

    /**
     *
     * @param obj
     */
    private readonly formatDatesCriteriaWithOutEndDate = async (obj: { daysList: number[]; endDateString: string; endingCriteria: string; numberOfRecurrsion: number; startDateString: string }): Promise<ANY> => {

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
        let formatedDates: FormatedDatesI[] = [];
        let recurrencedEndDate: Date;

        const startDateTime: number = startDate.getTime();
        const endDateTime: number = endDate.getTime();

        const duration: number = endDateTime - startDateTime;

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

            formatedDates = date?.map((d: Date): { end_date: Date; start_date: Date } => {
                const expectedRecurrenceEndDate: Date = new Date(d.getTime() + duration);

                return {
                    end_date: expectedRecurrenceEndDate,
                    start_date: d
                };
            }) || [];

            return formatedDates;
        }

        recurrencedEndDate = await this.findEndDateForRecurrence(startDate, numberOfRecurrsion, daysList, endingCriteria);

        while (startDate.getTime() <= recurrencedEndDate?.getTime()) {

            let check: boolean = true;

            date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                if (startDate.getDay() === daysList[index]) {
                    return new Date(JSON.parse(JSON.stringify(startDate)));
                }
                if (endingCriteria === 'daily' && !daysList.includes(startDate.getDay()) && check) {
                    check = false;
                    recurrencedEndDate.setTime(recurrencedEndDate.getTime() + 1000 * 60 * 60 * 24);
                }
            }))];
            startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
        }

        formatedDates = date?.map((d: Date): { end_date: Date; start_date: Date } => {
            const expectedRecurrenceEndDate: Date = new Date(d.getTime() + duration);
            return {
                end_date: expectedRecurrenceEndDate,
                start_date: d
            };
        }) || [];

        return formatedDates;

    }

    /**
     *
     * @param daysList
     * @param endDateString
     * @param recurrenceEndDateString
     * @param startDateString
     */
    private readonly formatDatesForAutomation = (daysList: number[], endDateString: Date, recurrenceEndDateString: Date, startDateString: Date): FormatedDatesI[] => {

        if (new Date(startDateString).getTime() === recurrenceEndDateString.getTime()) {
            return [];
        }

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);
        let recurrenceEndDate: Date = new Date(recurrenceEndDateString);
        recurrenceEndDate.setHours(23,59,59,59);
        const startDateTime: number = startDate.getTime();
        const endDateTime: number = endDate.getTime();

        const duration: number = endDateTime - startDateTime;

        let date: Date[] = [];
        let formatedDates: FormatedDatesI[] = [];

        while (startDate.getTime() <= recurrenceEndDate.getTime()) {
            date = [...date, ...this.filterNonNull(daysList.map((_j: number, index: number): Date => {
                if (startDate.getDay() === daysList[index]) {
                    return new Date(JSON.parse(JSON.stringify(startDate)));
                }
            }))];
            startDate.setTime(startDate.getTime() + 1000 * 60 * 60 * 24);
        }

        formatedDates = date?.map((d: Date): { end_date: Date; start_date: Date } => {
            const expectedRecurrenceEndDate: Date = new Date(d.getTime() + duration);
            return {
                end_date: expectedRecurrenceEndDate,
                start_date: d
            };
        }) || [];

        return formatedDates;

    }

    /**
     *
     * @param doctorId
     * @param facilityLocationIds
     */
    private readonly formatProjectionClauseForFilteredDoctor = (doctorId: number, facilityLocationIds: number[]): ANY => doctorId ?
        {
            deleted_at: null,
            facility_location_id: { [Op.in]: facilityLocationIds },
            speciality_id: { [Op.ne]: null },
            user_id: doctorId,
        }
        :
        {
            deleted_at: null,
            facility_location_id: { [Op.in]: facilityLocationIds },
            speciality_id: { [Op.ne]: null },
        }

    /**
     *
     * @param facilityLocationIds
     */
    private readonly formatProjectionClauseForFilteredDoctorWithFacilityLocationIds = (facilityLocationIds: number[]): ANY => facilityLocationIds.length ?
        {
            deleted_at: null,
            facility_location_id: { [Op.in]: facilityLocationIds },
            speciality_id: { [Op.ne]: null },
        }
        :
        {
            deleted_at: null,
            speciality_id: { [Op.ne]: null },
        }

    /**
     *
     * @param startDate
     * @param noOfWeeks
     */
    private readonly getEndDate = (startDate: Date, noOfWeeks: number): Date => {

        const endDate: Date = new Date(startDate);
        // tslint:disable-next-line: binary-expression-operand-order
        endDate.setTime(endDate.getTime() + (noOfWeeks * (7 * (24 * 60 * 60 * 1000))) - (24 * 60 * 60 * 1000));

        const endDateString: string = endDate.toISOString().slice(0, 19).replace('T', ' ');
        const formatedDate: string[] = endDateString.split(' ');

        return new Date(`${formatedDate[0]} 23:59:59`);
    }

    /**
     *
     * @param startDate
     */
    private readonly getEndDateOfWeek = (startDate: Date): formatedWeekI => {

        const curr: Date = new Date(startDate);
        const firstday: Date = new Date(curr.setDate(curr.getDate() - curr.getDay()));
        const lastday: Date = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));

        return {
            end_of_week: lastday,
            start_of_week: firstday,
        };
    }

    /**
     *
     * @param availability
     * @param appointments
     * @param overbooking
     * @param timeSlot
     * @param wantOverBooking
     * @param unavailability
     * @returns
     */
    private readonly getFreeSlotsTimings = (availability: models.sch_available_doctorsI, appointments: models.sch_appointmentsI[], overbooking: number, timeSlot: number, wantOverBooking: boolean, unavailability: models.sch_unavailable_doctorsI[]): DoctorFreeSlotsI[] => {

        const freeSlots: FreeSlotsI[] = [];

        const assignmentStartDate: Date = new Date(availability.start_date);
        const assignmentEndDate: Date = new Date(availability.end_date);

        while (assignmentStartDate.getTime() !== assignmentEndDate.getTime() && !(assignmentStartDate.getTime() > assignmentEndDate.getTime())) {

            freeSlots.push({ startDateTime: new Date(assignmentStartDate), count: overbooking });
            assignmentStartDate.setMinutes(assignmentStartDate.getMinutes() + timeSlot);

        }

        for (const appoint of appointments) {

            const appStart: Date = new Date(appoint?.scheduled_date_time);
            const appEnd: Date = new Date(appoint?.scheduled_date_time);

            appEnd.setMinutes(appEnd.getMinutes() + appoint?.time_slots);

            for (const f of freeSlots) {
                if (appStart.getTime() <= f.startDateTime.getTime() && f.startDateTime.getTime() < appEnd.getTime() && appoint?.deleted_at === null) {
                    f.count -= 1;
                }
            }
        }

        if (!wantOverBooking) {

            return this.filterNonNull(freeSlots.map((d: FreeSlotsI): DoctorFreeSlotsI => {

                if (d.count === overbooking) {

                    let availableSlot: models.sch_unavailable_doctorsI;
                    const slotEndTime: Date = new Date(d.startDateTime);
                    slotEndTime.setMinutes(slotEndTime.getMinutes() + timeSlot);

                    if (unavailability && unavailability.length) {

                        availableSlot = unavailability.find((s: models.sch_unavailable_doctorsI): models.sch_unavailable_doctorsI => {

                            // tslint:disable-next-line: max-line-length
                            if ((new Date(d.startDateTime).getTime() >= new Date(s.start_date).getTime() && new Date(d.startDateTime).getTime() < new Date(s.end_date).getTime()) || (new Date(slotEndTime).getTime() >= new Date(s.start_date).getTime() && new Date(slotEndTime).getTime() < new Date(s.end_date).getTime())) {
                                return s;
                            }

                        });
                    }

                    if (!availableSlot) {

                        return {
                            facility_location_id: availability.facility_location_id,
                            slot_time: d.startDateTime,
                        };

                    }

                }
            }));

        }

        return this.filterNonNull(freeSlots.map((d: FreeSlotsI): DoctorFreeSlotsI => {
            if (d.count > 0) {
                for (let k: number = 0; k < d.count; k += 1) {
                    let availableSlot: models.sch_unavailable_doctorsI = {};
                    const slotEndTime: Date = new Date(d.startDateTime);
                    slotEndTime.setMinutes(slotEndTime.getMinutes() + timeSlot);

                    if (unavailability && unavailability.length) {

                        availableSlot = unavailability.find((s: models.sch_unavailable_doctorsI): models.sch_unavailable_doctorsI => {
                            // tslint:disable-next-line: max-line-length
                            if ((new Date(d.startDateTime).getTime() >= new Date(s.start_date).getTime() && new Date(d.startDateTime).getTime() < new Date(s.end_date).getTime()) || (new Date(slotEndTime).getTime() >= new Date(s.start_date).getTime() && new Date(slotEndTime).getTime() < new Date(s.end_date).getTime())) {
                                return s;
                            }
                        });
                    }

                    if (!availableSlot || !Object.keys(availableSlot).length) {
                        return {
                            facility_location_id: availability.facility_location_id,
                            slot_time: d.startDateTime,
                        };
                    }
                }
            }
        }));
    }

    /**
     *
     * @param startDate
     * @param noOfWeeks
     */
    private readonly getLastDate = (startDate: Date, noOfWeeks: number): Date => {

        const lastDate: Date = new Date(startDate);
        // tslint:disable-next-line: binary-expression-operand-order
        lastDate.setTime(lastDate.getTime() - (noOfWeeks * 3 * (7 * (24 * 60 * 60 * 1000))));
        lastDate.setHours(0);
        lastDate.setMinutes(0);
        lastDate.setSeconds(0);
        lastDate.setMilliseconds(0);
        lastDate.setMinutes(lastDate.getMinutes() - new Date().getTimezoneOffset());
        return lastDate;
    }

    /**
     *
     * @param proposed
     * @param overlap
     */
    private readonly getNonOverlappingAvailablities = (proposed: models.sch_available_doctorsI[], overlap: models.sch_available_doctorsI[]): ANY =>

        this.filterNonNull(proposed.filter((o: models.sch_available_doctorsI): models.sch_available_doctorsI => {

            const isOverLapped: models.sch_available_doctorsI = overlap.find((d: models.sch_available_doctorsI): models.sch_available_doctorsI => {

                if (new Date(o.start_date).getTime() < new Date(d.end_date).getTime() && new Date(o.end_date).getTime() > new Date(d.start_date).getTime() && d.doctor_id === o.doctor_id) {
                    return d;
                }
            });

            if (!isOverLapped || !Object.keys(isOverLapped).length) {
                return o;
            }

        }))

    /**
     *
     * @param startDate
     * @param tillDate
     * @param availableDoctorDates
     */
    private readonly getPastPattern = (startDate: Date, tillDate: Date, availableDoctorDates: Date[]): number[][] => {

        const formattedStartDate: Date = new Date(startDate);
        const formattedPatternDates: Date[][] = [];

        let weeklyStartEnd: formatedWeekI = this.getEndDateOfWeek(formattedStartDate);
        while (weeklyStartEnd.start_of_week.getTime() <= tillDate.getTime()) {

            const datesArray: Date[] = this.getWeeklyDatesArray(weeklyStartEnd.start_of_week, weeklyStartEnd.end_of_week);
            formattedPatternDates.push(datesArray);
            const endOfWeek: Date = datesArray.pop();
            weeklyStartEnd = this.getEndDateOfWeek(new Date(endOfWeek.setDate(endOfWeek.getDate() + 1)));

        }

        let availablityPattern: number[][] = [];

        for (const element of formattedPatternDates) {

            availablityPattern = [...availablityPattern, ...element.map((s: Date): number[] =>

                this.filterNonNull(availableDoctorDates.map((o: Date): number => {
                    if (s.getDay() === o.getDay()) {
                        return s.getDay();
                    }
                })))];

        }
        return this.filterNonEmpty(availablityPattern);

    }

    /**
     *
     * @param doctor
     */
    private readonly getUniqueAvailableDoctors = (doctor: models.sch_available_doctorsI[]): models.sch_available_doctorsI[] =>
        doctor.reduce((acc: models.sch_available_doctorsI[], current: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {
            if (!acc.some((x: models.sch_available_doctorsI): boolean => x.doctor_id === current.doctor_id && x.facility_location_id === current.facility_location_id && x.supervisor_id === current.supervisor_id)) {
                acc.push(current);
            }
            return acc;
            // tslint:disable-next-line: align
        }, [])

    /**
*
* @param doctor
*/
    private readonly getUniqueAvailableSpecialities = (availability: models.sch_available_specialitiesI[]): models.sch_available_specialitiesI[] =>
        availability.reduce((acc: models.sch_available_specialitiesI[], current: models.sch_available_specialitiesI): models.sch_available_specialitiesI[] => {
            if (!acc.some((x: models.sch_available_specialitiesI): boolean => x.speciality_id === current.speciality_id && x.facility_location_id === current.facility_location_id)) {
                acc.push(current);
            }
            return acc;
            // tslint:disable-next-line: align
        }, [])
    /**
     *
     * @param doctor
     */
    private readonly getUniqueDatesAvailableDoctors = (doctor: models.sch_available_doctorsI[]): models.sch_available_doctorsI[] =>
        doctor.reduce((acc: models.sch_available_doctorsI[], current: models.sch_available_doctorsI): models.sch_available_doctorsI[] => {
            if (!acc.some((x: models.sch_available_doctorsI): boolean => new Date(x.start_date).getTime() === new Date(current.start_date).getTime())) {
                acc.push(current);
            }
            return acc;
            // tslint:disable-next-line: align
        }, [])

    /**
     *
     * @param start
     * @param end
     */
    private readonly getWeeklyDatesArray = (start: Date, end: Date): Date[] => {

        const datesArray: Date[] = [];

        for (const dt: Date = new Date(start); dt.getTime() <= end.getTime(); dt.setDate(dt.getDate() + 1)) {
            datesArray.push(new Date(dt));
        }
        return datesArray;
    }

    /**
     *
     * @param pattern
     */
    private readonly isPatternSychronized = (pattern: number[][]): boolean => {

        const checkPattern: ANY = [...pattern];
        const tempValue: ANY = [];

        for (const patCheck of checkPattern) {
            tempValue.push(
                {
                    length: patCheck.length,
                    value: patCheck[0]
                });
        }

        let isSync: ANY = [];

        for (const checkData of tempValue) {

            isSync =  [...isSync, ...[tempValue.find((val: ANY, _index: number, array: ANY): boolean => {

                if (checkData.value === val.value && checkData.length !== val.length) {
                    return val;
                }

            })]];
        }

        return isSync.length ? true : false;

    }

}
