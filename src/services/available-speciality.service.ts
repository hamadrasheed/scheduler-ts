import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import {
    ANY,
    AvailableAppointmentsReturnObjI,
    AvailableSpecialitiesReqObjI,
    AvailableMultiSpecialitiesReqObjI,
    CreateAvailableDoctorsI,
    CreateDaysAndDatesI,
    DeleteAvailableSpeciality,
    FormatDatesCriteriaI,
    FormatedDatesI,
    GenericHeadersI,
    GetAllAvailableSpecialitiesReqObjI,
    GetAvailableAppointmentsReqObjI,
    getSpecialityAssignmentsReqObjI,
    UpdateAvailableSpecialitiesReqObjI,
    UpdateSpecialityAssignmentsPreCheckReqObjI,
    UpdateSpecialityReqI,
    checkIsProviderAlreadyAssignedI,
    CheckFacilityTimingI,
    CheckFacilityTimingConflictI,
} from '../shared/common';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AvailableSpecialityService extends Helper {

    public __http: Http;
    private readonly __createAvailableDoctorsMethod: { [key: string]: string };
    private readonly __createDaysAndDatesMethod: { [key: string]: string };
    private readonly __deleteMultipleSpecialityMethod: { [key: string]: string };
    private readonly __deleteSpecialityMethod: { [key: string]: string };
    private readonly __formatDatesCriteriaMethod: { [key: string]: string };
    private readonly __updateDoctorMethod: { [key: string]: string };

    /**
     *
     * @param __repo
     * @param __availableDoctorRepo
     * @param __facilityLocationRepo
     * @param __userRepo
     * @param __userFacilityRepo
     * @param __userBasicInfoRepo
     * @param __specialityRepo
     * @param __recurrenceEndingCriteriaRepo
     * @param __dayListsRepo
     * @param __recurrenceDayListRepo
     * @param __recurrenceDateListRepo
     * @param __unAvailableDoctorRepo
     * @param __appointmentRepo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.availableSpecialityRepository,
        public __availableDoctorRepo: typeof repositories.availableDoctorRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __userRepo: typeof repositories.userRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __userBasicInfoRepo: typeof repositories.userBasicInfoRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
        public __recurrenceEndingCriteriaRepo: typeof repositories.recurrenceEndingCriteriaRepository,
        public __dayListsRepo: typeof repositories.dayListRepository,
        public __recurrenceDayListRepo: typeof repositories.recurrenceDayListRepository,
        public __recurrenceDateListRepo: typeof repositories.recurrenceDateListRepository,
        public __unAvailableDoctorRepo: typeof repositories.unAvailableDoctorRepository,
        public __appointmentRepo: typeof repositories.appointmentRepository,
        public __schAssignmentProviderTypesRepo: typeof repositories.assignProviderTypesRepository,
        public http: typeof Http
    ) {
        super();
        this.__http = new http();
        this.__formatDatesCriteriaMethod = {
            false: 'formatDatesCriteriaWithOutEndDate',
            true: 'formatDatesCriteriaWithEndDate'
        };
        this.__createAvailableDoctorsMethod = {
            automatic: 'createAvailableDoctorsAutomatically',
            manual: 'createAvailableDoctorsManually',
        };
        this.__createDaysAndDatesMethod = {
            false: 'createDaysAndDatesWithoutRecurrence',
            true: 'createDaysAndDatesWithRecurrence'
        };
        this.__updateDoctorMethod = {
            automatic: 'updateSpecialityWithAutomaticDoctor',
            manual: 'updateSpecialityWithManualDoctor',
            none: 'updateSpecialityWithNoneDoctor',
        };
        this.__deleteSpecialityMethod = {
            false: 'deleteDoctorWithSingleSpeciality',
            true: 'deleteDoctorWithMultipleSpecilaity',
        };
        this.__deleteMultipleSpecialityMethod = {
            false: 'deleteDoctorWithMultipleSpecilaity',
            true: 'deleteWithCheckForReccurence',
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public delete = async (params: ANY, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const {
            available_speciality_id: availableSpecialityId,
            date_list_id: dateListId,
            user_id: userId = Number(process.env.USERID)
        } = params;

        const filterForAvailableSpeciality: ANY = {
            available_speciality_id: availableSpecialityId,
            deleted_at: null
        };

        const filterForAppointments: ANY = {
            available_speciality_id: availableSpecialityId,
            cancelled: 0,
            deleted_at: null,
            pushed_to_front_desk: 0,
        };

        if (dateListId) {
            filterForAvailableSpeciality.id = dateListId;
            filterForAppointments.date_list_id = dateListId;
        }

        const avilableDateLists: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                ...filterForAvailableSpeciality
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

        if (!avilableDateLists || !avilableDateLists.length) {
            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        let appointmentAgainstSpeciality: models.sch_appointmentsI[] = [];

        for (const d of avilableDateLists) {

            const getAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll({
                    ...filterForAppointments,
                    scheduled_date_time: { [Op.between]: [new Date(d.start_date), new Date(d.end_date)] },
            }));

            appointmentAgainstSpeciality = [...appointmentAgainstSpeciality, ...getAppointments];
        }

        if (appointmentAgainstSpeciality.length !== 0) {
            throw generateMessages('CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT');
        }

        const checkMethod: boolean = !dateListId ? true : false;

        return this[this.__deleteSpecialityMethod[`${checkMethod}`]]({
            availableSpecialityId,
            avilableDateLists,
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
    public getAll = async (data: GetAllAvailableSpecialitiesReqObjI, _authorization: string): Promise<models.sch_available_specialitiesI[]> => {

        const {
            end_date: endDate,
            start_date: startDate,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds
        } = data;

        const availableSpecialities: models.sch_available_specialitiesI[] = this.shallowCopy(await this.__repo.findAll(
            {
                deleted_at: null,
                facility_location_id: {
                    [Op.in]: facilityLocationIds
                },
                speciality_id: {
                    [Op.in]: specialityIds
                },
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                        deleted_at: null,
                        end_date: {
                            [Op.lte]: endDate
                        },
                        start_date: {
                            [Op.gte]: startDate
                        },
                    },
                },
            }
        ));

        if (!availableSpecialities || !availableSpecialities.length) {
            throw generateMessages('NO_SPECIALITY_ASSIGNMENT_FOUND');
        }

        return availableSpecialities;
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAppointments = async (query: GetAvailableAppointmentsReqObjI, _authorization: string): Promise<AvailableAppointmentsReturnObjI[]> => {

        const { available_speciality_id: availableSpecialityId, user_id: userId = Number(process.env.USERID) } = query;

        const availableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
            {
                id: availableSpecialityId,
                deleted_at: null
            },
            {
                include: [
                    {
                        as: 'appointments',
                        attributes: ['id', 'scheduled_date_time', 'time_slots'],
                        include: [
                            {
                                as: 'patient',
                                attribute: ['id', 'first_name', 'last_name', 'middle_name'],
                                model: models.kiosk_patient,
                                required: false,
                                where: { deleted_at: null }
                            },
                            {
                                as: 'availableDoctor',
                                attributes: ['id', 'doctor_id'],
                                include: {
                                    as: 'doctor',
                                    attributes: { exclude: ['password'] },
                                    include: {
                                        as: 'userBasicInfo',
                                        attributes: ['first_name', 'last_name', 'middle_name'],
                                        model: models.user_basic_info,
                                        required: false,
                                        where: { deleted_at: null }
                                    },
                                    model: models.users,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                model: models.sch_available_doctors,
                                required: false,
                                where: { deleted_at: null }
                            }
                        ],
                        model: models.sch_appointments,
                        required: false,
                        where: {
                            cancelled: 0,
                            deleted_at: null,
                            pushed_to_front_desk: 0,
                        }
                    }
                ]
            }));

        const { appointments, speciality_id: specialityId } = availableSpeciality || {};

        return appointments?.map((appointment: models.sch_appointmentsI): AvailableAppointmentsReturnObjI => ({
            available_doctor_id: appointment.availableDoctor?.id,
            available_speciality_id: availableSpecialityId,
            doctor_first_name: appointment.availableDoctor?.doctor?.userBasicInfo?.first_name,
            doctor_id: appointment.availableDoctor?.doctor_id,
            doctor_last_name: appointment.availableDoctor?.doctor?.userBasicInfo?.last_name,
            doctor_middle_name: appointment.availableDoctor?.doctor?.userBasicInfo?.middle_name,
            first_name: appointment.patient.first_name,
            id: appointment.id,
            last_name: appointment.patient.last_name,
            middle_name: appointment.patient.middle_name,
            patient_id: appointment.patient.id,
            scheduled_date_time: appointment.scheduled_date_time,
            speciality_id: specialityId,
            time_slot: appointment.time_slots,
        }));
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getPreCheckForUpdation = async (data: UpdateSpecialityAssignmentsPreCheckReqObjI, _authorization: string): Promise<ANY> => {

        const {
            available_speciality_id: id,
            date_list_id: dateListId,
            user_id: userId = Number(process.env.USERID)
        } = data;

        const availableSpecialities: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
            { id, deleted_at: null },
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
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null },
                    }
                ]

            }
        ));

        if (!availableSpecialities || !Object.keys(availableSpecialities).length) {
            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        const availableSpecialityDateList: models.sch_recurrence_date_listsI = this.shallowCopy(await this.__recurrenceDateListRepo.findOne(
            {
                deleted_at: null,
                id: dateListId
            },
            {
                include:
                {
                    as: 'appointments',
                    model: models.sch_appointments,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
            }));

        // const { appointments, speciality: { over_booking } } = availableSpecialities || {};

        const { no_of_doctors: numberOfDoctor, appointments } = availableSpecialityDateList || {};

        if (!appointments || !appointments.length) {
            return {
                end_time: null,
                no_of_doctors: 0,
                start_time: null,
            };
        }

        const filteredAppointments: models.sch_appointmentsI[] = appointments.map((o: models.sch_appointmentsI): ANY => {

            const endDateTime: Date = new Date(o.scheduled_date_time);
            const startDateTime: Date = new Date(o.scheduled_date_time);
            endDateTime.setMinutes(endDateTime.getMinutes() + o.time_slots);

            return startDateTime && new Date(endDateTime).getTime() > new Date(startDateTime).getTime() ? new Date(endDateTime) : startDateTime;

        }).sort();

        // Const noOfDoctors: number = this.getNumberOfDoctors(appointments, over_booking);

        const numberOfAvailableDoctors: number = appointments?.filter((a: models.sch_appointmentsI): boolean => a.available_doctor_id !== null)?.length;

        const appointmentTime: Date[] = appointments?.map((a: models.sch_appointmentsI): Date => a.scheduled_date_time)?.sort();

        return {
            end_time: filteredAppointments.pop(),
            no_of_doctors: numberOfAvailableDoctors > numberOfDoctor ? numberOfAvailableDoctors : numberOfDoctor,
            start_time: appointmentTime[0],
        };
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getSpecialityAssignments = async (data: getSpecialityAssignmentsReqObjI, _authorization: string): Promise<models.sch_available_specialitiesI[]> => {

        const {
            end_date: endDate,
            start_date: startDate,
            facility_location_ids: facilityLocationIds,
            speciality_ids: specialityIds
        } = data;

        return this.__repo.findAll(
            {
                deleted_at: null,
                facility_location_id: {
                    [Op.in]: facilityLocationIds
                },
                speciality_id: {
                    [Op.in]: specialityIds
                },
            },
            {
                include: [
                    {
                        as: 'availableDoctors',
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
                                as: 'dateList',
                                model: models.sch_recurrence_date_lists,
                                required: false,
                                where: { deleted_at: null },
                            }
                        ],
                        model: models.sch_available_doctors,
                        required: false,
                        where: {
                            deleted_at: null,
                            is_provider_assignment: false
                        }
                    },
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            [Op.or]: [
                                {
                                    end_date: { [Op.gte]: startDate },
                                    start_date: { [Op.lte]: startDate }
                                },
                                {
                                    start_date: {
                                        [Op.lte]: endDate,
                                        [Op.gte]: startDate
                                    }
                                }
                            ]
                        },
                    }
                ]
            });

    }

    private async checkProviderIsAlreadyAssigned(data: checkIsProviderAlreadyAssignedI){

        const {
            doctors,
            startDate,
            endDate,
            timeZone,
            availableSpecialityId
        } = data;


        const checkDuplicate: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
            {
                deleted_at: null,
                doctor_id : doctors
            },
            {
                include: [
                    {
                        as: 'dateList',
                        model: models.sch_recurrence_date_lists,
                        required: true,
                        where: {
                            deleted_at: null,
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        {
                                            start_date: {
                                                [Op.lte]: startDate
                                            }
                                        },
                                        {
                                            end_date: {
                                                [Op.gte]: endDate
                                            }
                                        },
                                    ]
                                },
                                {
                                    end_date: {
                                        [Op.and]: [
                                            {
                                                [Op.gte]: startDate
                                            },
                                            {
                                                [Op.lte]: endDate
                                            }
                                        ]
                                    }
                                },
                                {
                                    start_date: {
                                        [Op.and]: [
                                            {
                                                [Op.gte]: startDate
                                            },
                                            {
                                                [Op.lte]: endDate
                                            }
                                        ]
                                    }
                                },
                            ]
                        }
                    },
                    {
                        as: 'facilityLocations',
                        model: models.facility_locations,
                        include: {
                            as: 'facility',
                            model: models.facilities,
                            required: true,
                        },
                        required: true,
                    },
                    {
                        as: 'availableSpeciality',
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                            ...(availableSpecialityId && { 
                                id: {
                                    [Op.ne]: availableSpecialityId
                                }
                            })
                        },
                        include: {
                            model: models.specialities,
                            require: true,
                        }
                    }
                ]
            }
        ));

        if(checkDuplicate){
            const err = generateMessages('PROVIDER_ALREADY_ASSIGN');
            const adjustedStartDate: String[] = this.convertDateToLocal(new Date(checkDuplicate.start_date), timeZone).toLocaleString("en-US", { year: 'numeric', day:'numeric', month: 'numeric' , hour: 'numeric', minute: 'numeric', hour12: true }).split(',');
            const endTime: String = this.convertDateToLocal(new Date(checkDuplicate.end_date), timeZone).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
            const dateOnly: String = adjustedStartDate[0];
            const startTime: String = adjustedStartDate[1];
            err.message = `${err.message} in ${checkDuplicate.facilityLocations.facility.qualifier} - ${checkDuplicate.facilityLocations.qualifier} - ${checkDuplicate.availableSpeciality.speciality.name}, on ${dateOnly} from${startTime} to ${endTime}`
            throw err;
        }
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public post = async (data: AvailableSpecialitiesReqObjI, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            doctors,
            doctor_method: doctorMethod,
            doctor_method_id: doctorMethodId,
            speciality: {
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
                end_date: endDate,
                start_date: startDate,
                no_of_doctors: noOfDoctors,
                days,
                end_date_for_recurrence: endDateForRecurrence,
                recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
                end_after_occurences: endAfterOccurences,
                number_of_entries: numberOfEntries,
            },
            timeZone
        } = data;

        if (doctorMethod === 'manual' && noOfDoctors !== doctors.length) {
            throw generateMessages('MANUAL_ASSIGNMENT_NO_OF_DOCTORS');
        }

        if (!recurrenceEndingCriteriaId && doctorMethod !== 'automatic') {

            const filters: ANY = [
                {
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
                                start_date: {
                                    [Op.and]: [
                                        {
                                            [Op.gt]: startDate
                                        },
                                        {
                                            [Op.lt]: endDate
                                        }
                                    ]
                                }
                            },
                        ]
                    }
                }
            ];

            if (doctorMethod === 'manual') {
                filters.push({
                    as: 'availableDoctors',
                    model: models.sch_available_doctors,
                    required: true,
                    where: {
                        doctor_id: {
                            [Op.in]: doctors
                        }
                    }
                });
                await this.checkProviderIsAlreadyAssigned({
                    doctors,
                    startDate,
                    endDate,
                    timeZone
                });
            }

            const checkDuplicate: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
                {
                    deleted_at: null,
                    facility_location_id: facilityLocationId,
                    speciality_id: specialityId,
                },
                {
                    include: [
                        ...filters
                    ]
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
                include: [
                    {
                        as: 'faciltyTiming',
                        model: models.facility_timings,
                        where: { deleted_at: null },
                    }, {
                        as: 'facility',
                        model: models.facilities,
                        required: true,
                    }
                ]
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

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findById(specialityId));

        const { time_slot: timeSlot } = speciality;

        let newAvailableSpeciality: models.sch_available_specialitiesI;

        const checkForRecurrence: boolean = !days && !recurrenceEndingCriteriaId ? false : true;

        const formatedDays: number[] = days && days.length ? days : this.filterUnique(faciltyTiming?.map((timing: models.facility_timingsI): number => timing.day_id));

        const checkTimingData: CheckFacilityTimingI = {
            isMultiple: false,
            specialityId,
            specialityName: speciality.qualifier,
            facilityLocation,
        }

        const checkedFacilityTimings: boolean = await this.checkFacilityTimingsWithConflicts(checkTimingData, faciltyTiming, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);
        
        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        }

        let expectedDoctors: models.usersI[];

        if (doctors && doctors.length) {
            expectedDoctors = this.shallowCopy(await this.__userRepo.findAll(
                {
                    deleted_at: null,
                    id: { [Op.in]: doctors },
                },
                {
                    include:
                        [
                            {
                                as: 'userBasicInfo',
                                model: models.user_basic_info,
                                required: false,
                                where: { deleted_at: null }

                            },
                            {
                                as: 'userTimings',
                                model: models.user_timings,
                                required: false,
                                where: {
                                    deleted_at: null,
                                    facility_location_id: facilityLocationId,
                                }
                            }
                        ],
                }));

            if (!expectedDoctors || !expectedDoctors.length) {
                throw generateMessages('NO_DOCTOR_FOUND');
            }

            const userTimings: models.user_timingsI[] = expectedDoctors.map((f: models.usersI): models.user_timingsI[] => f.userTimings).flat() as unknown as models.user_timingsI[];

            const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimingsWithConflicts(checkTimingData, userTimings, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);

            if (!checkedDoctorTimings.length) {
                throw generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
            }

        }

        const formatEndDate: Date = new Date(endDate);
        const formatStartDate: Date = new Date(startDate);

        const time: number = formatEndDate.getTime() - formatStartDate.getTime();

        let mins: number = time / 60000;

        mins = mins / timeSlot;

        const noOfSlots: number = (mins * noOfDoctors);

        newAvailableSpeciality = this.shallowCopy(await this.__repo.create({
            end_after_occurences: endAfterOccurences,
            end_date: endDate,
            end_date_for_recurrence: endDateForRecurrence,
            facility_location_id: facilityLocationId,
            no_of_doctors: noOfDoctors,
            no_of_slots: noOfSlots,
            number_of_entries: numberOfEntries,
            recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
            speciality_id: specialityId,
            start_date: startDate,
            // tslint:disable-next-line: align
        }, transaction
        )) as unknown as models.sch_available_specialitiesI;

        const daysAndDatesMethod: boolean = recurrenceEndingCriteriaId ? true : false;

        const formatDatesCriteria: FormatedDatesI[] = await this[this.__createDaysAndDatesMethod[`${daysAndDatesMethod}`]]({
            doctorMethod,
            doctorMethodId,
            endAfterOccurences,
            endDate,
            endDateForRecurrence,
            endingCriteria,
            facilityLocationId,
            formatedDays,
            newAvailableSpecialityId: newAvailableSpeciality.id,
            noOfDoctors,
            noOfSlots,
            specialityId,
            startDate,
            transaction
        });

        if (!doctorMethod || doctorMethod.toLocaleLowerCase() === 'none') {
            return {
                data: newAvailableSpeciality
            };
        }

        const newAvailableDoctor: ANY = await this[this.__createAvailableDoctorsMethod[`${doctorMethod}`]]({
            checkForRecurrence,
            doctorMethodId,
            doctors,
            endDate,
            facilityLocationId,
            formatDatesCriteria,
            formatedDays,
            mins,
            newAvailableSpecialityId: newAvailableSpeciality.id,
            noOfDoctors,
            noOfSlots,
            recurrenceEndingCriteriaId,
            specialityId,
            startDate,
            transaction,
            userId
        });

        return noOfDoctors && noOfDoctors !== newAvailableDoctor.length ? {
            data: newAvailableDoctor,
            message: generateMessages('ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT')
        } : {
            data: newAvailableDoctor
        };

    }

    /**
     * 
     * @param data 
     * @param _authorization 
     * @param transaction 
     * @returns 
     */
    public createDoctorAssignments = async (data: AvailableMultiSpecialitiesReqObjI, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const doctorMethodId: any = this.shallowCopy(await this.__schAssignmentProviderTypesRepo.findOne(
            {
                slug: 'automatic_assign'
            }
        ));

        return await this.postV1(
            {
                ...data,
                no_of_doctors: 1,
                doctor_method: "automatic",
                doctor_method_id: doctorMethodId.id,
                is_provider_assignment: true
            },
            _authorization,
            transaction
        );
    } 

    /**
     *
     * @param data
     * @param _authorization
     */
    public postV1 = async (data: AvailableMultiSpecialitiesReqObjI, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            doctors,
            no_of_doctors: noOfDoctors,
            doctor_method: doctorMethod,
            doctor_method_id: doctorMethodId,
            facility_location_id: facilityLocationId,
            specialities,
            time_zone,
            is_provider_assignment: isProviderAssignment
        } = data;

        let newAvailableSpecialities: models.sch_available_specialitiesI[] = [];
        let newAvailableDoctors : models.sch_available_doctors[] = [];

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: facilityLocationId
            },
            {
                include: [
                    {
                        as: 'faciltyTiming',
                        model: models.facility_timings,
                        where: { deleted_at: null },
                    }, {
                        as: 'facility',
                        model: models.facilities,
                        required: true,
                    }
                ]
            }));

        if (!facilityLocation || !Object.keys(facilityLocation).length) {
            throw generateMessages('NO_FACILITY_LOCATION_FOUND');
        }

        let allowMultipleAssignments: boolean; 
        let expectedDoctors: models.usersI[];
        let userTimings : models.user_timingsI[];

        if (doctors && doctors.length) {
            expectedDoctors = this.shallowCopy(await this.__userRepo.findAll(
                {
                    deleted_at: null,
                    id: { [Op.in]: doctors },
                },
                {
                    include:
                        [
                            {
                                as: 'userBasicInfo',
                                model: models.user_basic_info,
                                required: false,
                                where: { deleted_at: null }

                            },
                            {
                                as: 'userTimings',
                                model: models.user_timings,
                                required: false,
                                where: {
                                    deleted_at: null,
                                    facility_location_id: facilityLocationId,
                                }
                            }
                        ],
                }));

            if (!expectedDoctors || !expectedDoctors.length) {

                throw generateMessages('NO_DOCTOR_FOUND');
            }
            userTimings = expectedDoctors.map((data: ANY): ANY => data.userTimings).flat();
            allowMultipleAssignments = expectedDoctors[0].allow_multiple_assignment;
        }

        const specialitiesMap : ANY = {}

        const ids = specialities.map((s: ANY) => s.speciality_id);

        const specialitiesInfo: models.specialitiesI[] = this.shallowCopy(await this.__specialityRepo.findAll(
            {
                deleted_at: null,
                id: ids
            }
        ));

        for (const spec of specialitiesInfo) {
            specialitiesMap[spec.id] = spec;
        }

        const assignmentDoesnotFallErrors: CheckFacilityTimingConflictI[] = [];
        const assignmentDoesnotFallDoctorErrors: CheckFacilityTimingConflictI[] = [];

        for (const spec of specialities) {

            const {
                speciality_id: specialityId,
                end_date: endDate,
                start_date: startDate,
                days,
                end_date_for_recurrence: endDateForRecurrence,
                recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
                end_after_occurences: endAfterOccurences,
                number_of_entries: numberOfEntries,
            } = spec;

            const { qualifier : specialityName } = specialitiesMap[specialityId];

            if (doctorMethod === 'manual' && noOfDoctors !== doctors.length) {

                throw generateMessages('MANUAL_ASSIGNMENT_NO_OF_DOCTORS');
            }

            if (!recurrenceEndingCriteriaId && doctorMethod !== 'automatic') {

                const filters: ANY = [
                    {
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
                                    start_date: {
                                        [Op.and]: [
                                            {
                                                [Op.gt]: startDate
                                            },
                                            {
                                                [Op.lt]: endDate
                                            }
                                        ]
                                    }
                                },
                            ]
                        }
                    }
                ];

                if (doctorMethod === 'manual') {
                    filters.push({
                        as: 'availableDoctors',
                        model: models.sch_available_doctors,
                        required: true,
                        where: {
                            doctor_id: {
                                [Op.in]: doctors
                            }
                        }
                    });
                }

                const checkDuplicate: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
                    {
                        deleted_at: null,
                        facility_location_id: facilityLocationId,
                        speciality_id: specialityId,
                    },
                    {
                        include: [
                            ...filters
                        ]
                    }
                ));

                if (checkDuplicate && Object.keys(checkDuplicate).length) {  
                                       
                    throw this.MultiAssignmentError(specialityName,'SAME_ASSIGNMENT_EXIST');
                }
            }

            let endingCriteriaObj: models.sch_recurrence_ending_criteriasI;
            let endingCriteria: string;

            if (recurrenceEndingCriteriaId) {

                endingCriteriaObj = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(recurrenceEndingCriteriaId)) as unknown as models.sch_recurrence_ending_criteriasI;
                const { slug: endingCriteriaString } = endingCriteriaObj;
                endingCriteria = endingCriteriaString ?? '';
            }

            const { faciltyTiming } = facilityLocation;

            const { time_slot: timeSlot } = specialitiesMap[specialityId];

            const checkForRecurrence: boolean = !days && !recurrenceEndingCriteriaId ? false : true;

            const formatedDays: number[] = days && days.length ? days : this.filterUnique(faciltyTiming?.map((timing: models.facility_timingsI): number => timing.day_id));

            const checkTimingData : CheckFacilityTimingI = {
                isMultiple: true,
                specialityId,
                specialityName,
                facilityLocation,
            }

            const checkedFacilityTimings: boolean = await this.checkFacilityTimingsWithConflicts(checkTimingData, faciltyTiming, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);
            if(checkTimingData.conflict){
                assignmentDoesnotFallErrors.push(checkTimingData.conflict);
                continue;
            }
            if (!checkedFacilityTimings) {

                throw this.MultiAssignmentError(specialityName,'ASSIGNMENT_DOES_NOT_FALL');
            }

            if (doctors && doctors.length) {

                const getUserTimings: models.user_timingsI[] = expectedDoctors.map((f: models.usersI): models.user_timingsI[] => f.userTimings).flat() as unknown as models.user_timingsI[];

                const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimingsWithConflicts(checkTimingData, getUserTimings, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);

                if(checkTimingData.conflict){
                    assignmentDoesnotFallDoctorErrors.push(checkTimingData.conflict);
                    continue;
                }

                if (!checkedDoctorTimings.length) {

                    throw this.MultiAssignmentError(specialityName,'ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
                }

            }

            const formatEndDate: Date = new Date(endDate);
            const formatStartDate: Date = new Date(startDate);

            const time: number = formatEndDate.getTime() - formatStartDate.getTime();

            let mins: number = time / 60000;

            mins = mins / timeSlot;

            const noOfSlots: number = (mins * noOfDoctors);

            let formattedDaysForDoctor = userTimings.filter((timing: ANY) => timing.specialty_id == specialityId).map((f: ANY) => f.day_id);
            
            specialitiesMap[specialityId] = {
                ...specialitiesMap[specialityId],
                specAssignmentInfo: spec,
                mins,
                noOfSlots,
                checkForRecurrence,
                formatedDays: formatedDays ?? formattedDaysForDoctor,
                recurrenceEndingCriteriaId,
                endingCriteria
            }

            newAvailableSpecialities.push(
                {
                    end_after_occurences: endAfterOccurences,
                    end_date: formatEndDate,
                    end_date_for_recurrence: endDateForRecurrence,
                    facility_location_id: facilityLocationId,
                    no_of_doctors: noOfDoctors,
                    no_of_slots: noOfSlots,
                    number_of_entries: numberOfEntries,
                    recurrence_ending_criteria_id: recurrenceEndingCriteriaId,
                    speciality_id: specialityId,
                    start_date: formatStartDate,
                    // tslint:disable-next-line: align
                }
            );
        }

        if(assignmentDoesnotFallErrors.length){
            this.multiAssignmentDoesntFallError(assignmentDoesnotFallErrors);
        }
        if(assignmentDoesnotFallDoctorErrors.length){
            await this.multiAssignmentDoesntFallDoctorError(assignmentDoesnotFallDoctorErrors);
        }
        
        newAvailableSpecialities = this.shallowCopy(await this.__repo.bulkCreate(newAvailableSpecialities, transaction));
       
        for (const availableSpeciality of newAvailableSpecialities) {

            const {
                specAssignmentInfo,
                mins,
                noOfSlots,
                checkForRecurrence,
                recurrenceEndingCriteriaId,
                formatedDays: formattedDaysForDoctor,
                endingCriteria
            } = specialitiesMap[availableSpeciality.speciality_id];

            const {
                end_after_occurences,
                start_date,
                end_date,
                end_date_for_recurrence,
                speciality_id
            } = specAssignmentInfo;

            const daysAndDatesMethod: boolean = recurrenceEndingCriteriaId ? true : false;

            const formatDatesCriteria: FormatedDatesI[] = await this[this.__createDaysAndDatesMethod[`${daysAndDatesMethod}`]]({
                doctorMethod,
                doctorMethodId,
                endAfterOccurences: end_after_occurences,
                endDate: end_date,
                endDateForRecurrence: end_date_for_recurrence,
                endingCriteria,
                facilityLocationId,
                formatedDays:formattedDaysForDoctor,
                newAvailableSpecialityId: availableSpeciality.id,
                noOfDoctors,
                noOfSlots,
                specialityId: speciality_id,
                startDate: start_date,
                isProviderAssignment,
                transaction
            });

            if (!doctorMethod || doctorMethod.toLocaleLowerCase() === 'none') {
                continue;
                // return {
                //     data: newAvailableSpecialities
                // };
            }
            const { name : specialityName } = specialitiesMap[speciality_id];

            const newAvailableDoctor: ANY = await this[this.__createAvailableDoctorsMethod[`${doctorMethod}`]]({
                allowMultipleAssignments,
                checkForRecurrence,
                doctorMethodId,
                doctors,
                endDate: end_date,
                facilityLocationId,
                formatDatesCriteria,
                formatedDays:formattedDaysForDoctor,
                mins: mins,
                newAvailableSpecialityId: availableSpeciality.id,
                noOfDoctors,
                noOfSlots,
                recurrenceEndingCriteriaId,
                specialityId: speciality_id,
                startDate: start_date,
                transaction,
                userId,
                isProviderAssignment,
                specialityName,
                timezone: time_zone.time_zone,
                facilityLocationName: facilityLocation.name
            });
            newAvailableDoctors.push(newAvailableDoctor);
        }

        return noOfDoctors && noOfDoctors * specialities.length > newAvailableDoctors.length ? {
            data: newAvailableDoctors,
            message: generateMessages('ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT')
        } : {
            data: newAvailableDoctors
        };
    }

    private multiAssignmentDoesntFallError(conflicts: CheckFacilityTimingConflictI[]){
        const { facilityLocationName, facilityName } = conflicts[0];
        const err = generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        let msg = `${err.message} of ${facilityName} - ${facilityLocationName}, `;
        for(const [index, conflict] of conflicts.entries()){
            const { facilityStartDate, facilityEndDate, specialityName } = conflict;
            const addAnd = (index === conflicts.length - 1) && index !== 0;
            const addComma = (index !== conflicts.length - 1) && index !== 0;
            const adjustedStartDate: String = facilityStartDate.toLocaleString("en-US", { weekday:'long', hour: 'numeric', minute: 'numeric', hour12: true });
            const endTime: String = facilityEndDate.toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
            msg+= `${addComma?', for ':''}${addAnd? ' and for ':''}${specialityName}, ${adjustedStartDate} - ${endTime}`
        }
        err.message= msg;
        throw err;
    }

    private async multiAssignmentDoesntFallDoctorError(conflicts: CheckFacilityTimingConflictI[]){
        const { facilityLocationName, facilityName, userId } = conflicts[0];
        const doctor: models.usersI = await this.__userRepo.findOne(
            {
                id: userId,
            },
            {
                include:
                    [
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: true,
                        },
                        {
                            as: 'medicalIdentifiers',
                            model: models.medical_identifiers,
                            required: false,
                            include: {
                                model: models.billing_titles,
                                as: 'billingTitle',
                                required: true
                            }
                        },

                    ],
            }
        );
        const billingTitle = doctor?.medicalIdentifiers?.billingTitle?.name;
        let fullName = `${doctor.userBasicInfo.first_name} ${doctor.userBasicInfo.middle_name ? doctor.userBasicInfo.middle_name +' ' : '' }${doctor.userBasicInfo.last_name}`;
        const err = generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
        let msg = `${err.message} of ${facilityName} - ${facilityLocationName} for ${fullName}, ${billingTitle ? billingTitle +' ': ''}for `;
        for(const [index, conflict] of conflicts.entries()){
            const { doctorStartDate, doctorEndDate, specialityName } = conflict;
            const addAnd = (index === conflicts.length - 1) && index !== 0;
            const addComma = (index !== conflicts.length - 1) && index !== 0;
            const adjustedStartDate: String = doctorStartDate.toLocaleString("en-US", { weekday:'long', hour: 'numeric', minute: 'numeric', hour12: true });
            const endTime: String = doctorEndDate.toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
            msg+= `${addComma?', for ':''}${addAnd? ' and for ':''}${specialityName}, ${adjustedStartDate} - ${endTime}`
        }
        err.message= msg;
        throw err;
    }


    private MultiAssignmentError(specName: String, errorMessage: ANY): ANY {
        const error = generateMessages(errorMessage);
        const { message } = error;
        return {
            ...error,
            message: `${specName} - ${message}`
        }
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public update = async (data: UpdateAvailableSpecialitiesReqObjI, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            doctors,
            doctor_method: doctorMethod,
            doctor_method_id: doctorMethodId,
            doctor_date_list_ids: doctorDateListIds,
            available_speciality: {
                date_list_id: dateListId,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
                end_date: endDateString,
                start_date: startDateString,
                no_of_doctors: noOfDoctors,
                id,
            },
            time_zone
        } = data;

        if (doctorMethod === 'manual' && noOfDoctors !== doctors.length) {
            throw generateMessages('MANUAL_ASSIGNMENT_NO_OF_DOCTORS');
        }

        if (doctorMethod === 'manual' ) {
            await this.checkProviderIsAlreadyAssigned({
                doctors,
                startDate: startDateString,
                endDate: endDateString,
                timeZone: time_zone,
                availableSpecialityId: id
            });
        }
        const endDate: Date = new Date(endDateString);
        const startDate: Date = new Date(startDateString);

        const availableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne({ id, deleted_at: null }, {}, transaction));

        if (!availableSpeciality || !Object.keys(availableSpeciality).length) {
            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }

        const avilableDateListForAvailableSpeciality: models.sch_recurrence_date_listsI = this.shallowCopy(await this.__recurrenceDateListRepo.findById(dateListId, {}, transaction));

        const { start_date, end_date, doctor_method_id: existingDoctorMethod, no_of_doctors: existingNumberOfDoctors } = avilableDateListForAvailableSpeciality || {};

        const startDateFromDateList: Date = new Date(start_date);
        const endDateFromDateList: Date = new Date(end_date);
        let availableDoctor: models.sch_available_doctorsI[];
        let checkNumberOfAssignedDoctors: boolean = true;

        if (doctorMethod.toLocaleLowerCase() !== 'none') {

            availableDoctor = this.shallowCopy(await this.__availableDoctorRepo.findAll(
                {
                    available_speciality_id: id,
                    deleted_at: null,
                },
                {
                    include: {
                        as: 'availableSpeciality',
                        include: {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                end_date: endDateFromDateList,
                                start_date: startDateFromDateList,
                            },
                        },
                        model: models.sch_available_specialities,
                        required: true,
                        where: {
                            deleted_at: null,
                        }
                    }
                },
                transaction
            ));

            checkNumberOfAssignedDoctors = availableDoctor?.length !== noOfDoctors ? false : true;
        }

        if (existingDoctorMethod === doctorMethodId && startDateFromDateList?.getTime() === startDate.getTime() && endDateFromDateList?.getTime() === endDate.getTime() && existingNumberOfDoctors === noOfDoctors && checkNumberOfAssignedDoctors) {
            return [];
        }

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: facilityLocationId
            },
            {
                include: [
                    {
                        as: 'faciltyTiming',
                        model: models.facility_timings,
                        where: { deleted_at: null },
                    }, {
                        as: 'facility',
                        model: models.facilities,
                        required: true,
                    }
                ]
            },
            transaction
        ));

        if (!facilityLocation || !Object.keys(facilityLocation).length) {
            throw generateMessages('NO_FACILITY_LOCATION_FOUND');
        }

        const { faciltyTiming } = facilityLocation || {};
        
        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findOne(
            {
                deleted_at: null,
                id: specialityId
            },
            {},
            transaction
        ));

        const checkTimingData: CheckFacilityTimingI = {
            isMultiple: false,
            specialityId,
            specialityName: speciality.qualifier,
            facilityLocation,
        }

        const checkedFacilityTimings: boolean = await this.checkFacilityTimingsWithConflicts(checkTimingData, faciltyTiming, startDateString, endDateString, false);

        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        }

        const timeSlot: number = this.getTimeSlotOfAssignment(availableSpeciality);

        let noOfSlots: number = (endDate.getTime() - startDate.getTime()) / (timeSlot * 60000);
        noOfSlots = noOfSlots * noOfDoctors;

        const time: number = new Date(endDateString).getTime() - new Date(startDateString).getTime();

        let mins: number = time / 60000;

        mins = mins / timeSlot;

        return this[this.__updateDoctorMethod[`${doctorMethod}`]]({
            _authorization,
            availableDoctor,
            availableSpeciality,
            checkTimingData,
            dateListId,
            doctorDateListIds,
            doctorMethodId,
            doctors,
            endDate,
            endDateFromDateList,
            endDateString,
            existingDoctorMethod,
            facilityLocationId,
            faciltyTiming,
            id,
            mins,
            noOfDoctors,
            noOfSlots,
            speciality,
            specialityId,
            startDate,
            startDateFromDateList,
            startDateString,
            transaction,
            userId,
        });

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public updateDoctorAssignment = async (data: any, _authorization: string, transaction: Sequelize.Transaction): Promise<ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            available_doctor: {
                id,
                date_list_id: dateListId,
                start_date: startDateString,
                end_date: endDateString,
                facility_location_id: facilityLocationId,
                doctor_id: doctorId,
            },
            time_zone
        } = data;

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);

        const availableDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findById(id, {
            include:[
                {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where: {
                       deleted_at:null
                    }
                },
                {

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
        ]
        }));

        const { availableSpeciality: { speciality: avlDoctorSpeciality }, dateList } = availableDoctor;

        if (!availableDoctor || !Object.keys(availableDoctor).length) {

            throw generateMessages('INVALID_ASSIGNMENT_ID');
        }
        
        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findById(facilityLocationId, {
            include: [
                {
                    as: 'faciltyTiming',
                    model: models.facility_timings,
                    where: { deleted_at: null },
                }, {
                    as: 'facility',
                    model: models.facilities,
                    required: true,
                }
            ]
        }));

        const { faciltyTiming } = facilityLocation;

        const checkTimingData: CheckFacilityTimingI = {
            isMultiple: false,
            specialityId: avlDoctorSpeciality.id,
            specialityName: avlDoctorSpeciality.qualifier,
            facilityLocation,
        }

        const checkedFacilityTimings: boolean = await this.checkFacilityTimingsWithConflicts(checkTimingData, faciltyTiming, startDateString, endDateString, false);

        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
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

        //checking for the recurrence case
        if (dateList.length > 1) {

            const avilableDateLists: models.sch_recurrence_date_listsI[] = await this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                {
                    available_doctor_id: id,
                    deleted_at: null
                }
            ));

            await this.__recurrenceDateListRepo.update(dateListId, { deleted_at: new Date(), updated_by: userId });

            if (avilableDateLists.length === 1) {
                await this.__availableDoctorRepo.update(id, { deleted_at: new Date(), updated_by: userId });
            }

            const dataToSend = {
                facility_location_id: facilityLocationId,
                doctors: [doctorId],
                user_id: userId,
                specialities: [
                    {
                        start_date: startDateString,
                        end_date: endDateString,
                        speciality_id: avlDoctorSpeciality.id
                    }
                ],
                time_zone
            };

           return await this.createDoctorAssignments(
                { ...dataToSend },
                _authorization,
                transaction
            );
        }

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
     * @param date
     * @param days
     */
    private readonly addDaysForReccurence = (date: Date, days: number): Date => new Date(date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)));

    /**
     *
     * @param userTimings
     * @param startDate
     * @param endDate
     * @param withRecurrence
     * @param days
     * @param endingCriteriaId
     */
    private readonly checkDoctorTimings = async (userTimings: models.user_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteriaId?: number): Promise<models.user_timingsI[]> => {

        if (!withRecurrence) {

            const filteredTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): models.user_timingsI => {
 
                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;
 
                if (dayId === new Date(startDate).getDay()) {

                    const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const FormattedDoctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);
                    const doctorEndDate: Date = (new Date(`${endDate.slice(0, 10)}T${FormattedDoctorEndDate.toISOString().slice(-13)}`));

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

        const endingCriteria: models.sch_recurrence_ending_criteriasI = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(endingCriteriaId));

        const { slug } = endingCriteria;

        if (slug === 'daily') {

            let filteredTimings: models.user_timingsI[] = [];

            for (const x of days) {

                filteredTimings = [ ...filteredTimings, ...userTimings.filter((t: models.user_timingsI): models.user_timingsI => {

                    const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                    if (dayId === x) {

                        const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                        const doctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);

                        if (doctorStartDate.toISOString().slice(0, 10) !== doctorEndDate.toISOString().slice(0, 10)) {
                            doctorEndDate.setDate(doctorStartDate.getDate());
                        }

                        const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                        const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                        if (doctorStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= doctorEndDate.getTime() && doctorStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= doctorEndDate.getTime()) {
                            return t;
                        }
                    }

                })];

            }

            return filteredTimings;
            // Return [...userTimings];
        }

        const timings: models.user_timingsI[] = [];
        const count: number = days.map((d: number): number => d).reduce((acc: number, c: number): number => {
            const filteredTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): models.user_timingsI => {
                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;
                if (dayId === c) {

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
     * @param userTimings
     * @param startDate
     * @param endDate
     * @param withRecurrence
     * @param days
     * @param endingCriteriaId
     */
    private readonly checkDoctorTimingsWithConflicts = async (data: CheckFacilityTimingI, userTimings: models.user_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteriaId?: number): Promise<models.user_timingsI[]> => {

        if (!withRecurrence) {
            const { 
                isMultiple,
                specialityId,
                specialityName,
                facilityLocation
             } = data;
            const filteredTimings: models.user_timingsI[] = [];
            const conflicts: CheckFacilityTimingConflictI[] = [];

            for(const t of userTimings){

                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;
                
                if (dayId === new Date(startDate).getDay() && t.specialty_id === specialityId) {

                    const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const FormattedDoctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);
                    const doctorEndDate: Date = (new Date(`${endDate.slice(0, 10)}T${FormattedDoctorEndDate.toISOString().slice(-13)}`));

                    if (doctorStartDate.toISOString().slice(0, 10) !== doctorEndDate.toISOString().slice(0, 10)) {
                        doctorEndDate.setDate(doctorStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (doctorStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= doctorEndDate.getTime() && doctorStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= doctorEndDate.getTime()) {
                        filteredTimings.push(t);
                    }else{
                        conflicts.push({
                            // ...t,
                            userId: t.user_id,
                            doctorStartDate,
                            doctorEndDate,
                            specialityName,
                            facilityLocationName: facilityLocation.qualifier,
                            facilityName: facilityLocation.facility.qualifier,
                        });
                    }
                }
            }

            if(conflicts.length){
                if(!isMultiple){
                    const { doctorStartDate, doctorEndDate, userId, facilityLocationName, facilityName } = conflicts[0];
                    const doctor: models.usersI = await this.__userRepo.findOne(
                        {
                            id: userId,
                        },
                        {
                            include:
                                [
                                    {
                                        as: 'userBasicInfo',
                                        model: models.user_basic_info,
                                        required: true,
                                    },
                                    {
                                        as: 'medicalIdentifiers',
                                        model: models.medical_identifiers,
                                        required: false,
                                        include: {
                                            model: models.billing_titles,
                                            as: 'billingTitle',
                                            required: true
                                        }
                                    },
    
                                ],
                        }
                    );
                    const billingTitle = doctor?.medicalIdentifiers?.billingTitle?.name;
                    let fullName = `${doctor.userBasicInfo.first_name} ${doctor.userBasicInfo.middle_name ? doctor.userBasicInfo.middle_name +' ' : '' }${doctor.userBasicInfo.last_name}`;
                    const err = generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
                    const adjustedStartDate: String = doctorStartDate.toLocaleString("en-US", { weekday:'long', hour: 'numeric', minute: 'numeric', hour12: true });
                    const endTime: String = doctorEndDate.toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
                    err.message = `${err.message} of ${facilityName} - ${facilityLocationName} for ${fullName}, ${billingTitle ? billingTitle +' ': ''}for ${specialityName},${adjustedStartDate} - ${endTime}`
                    throw err;
                }
                data.conflict = conflicts[0];
            }
            return filteredTimings;
        }

        const endingCriteria: models.sch_recurrence_ending_criteriasI = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(endingCriteriaId));

        const { slug } = endingCriteria;

        if (slug === 'daily') {

            let filteredTimings: models.user_timingsI[] = [];

            for (const x of days) {

                filteredTimings = [ ...filteredTimings, ...userTimings.filter((t: models.user_timingsI): models.user_timingsI => {

                    const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                    if (dayId === x) {

                        const doctorStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                        const doctorEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);

                        if (doctorStartDate.toISOString().slice(0, 10) !== doctorEndDate.toISOString().slice(0, 10)) {
                            doctorEndDate.setDate(doctorStartDate.getDate());
                        }

                        const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                        const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                        if (doctorStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= doctorEndDate.getTime() && doctorStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= doctorEndDate.getTime()) {
                            return t;
                        }
                    }

                })];

            }

            return filteredTimings;
            // Return [...userTimings];
        }

        const timings: models.user_timingsI[] = [];
        const count: number = days.map((d: number): number => d).reduce((acc: number, c: number): number => {
            const filteredTimings: models.user_timingsI[] = userTimings.filter((t: models.user_timingsI): models.user_timingsI => {
                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;
                if (dayId === c) {

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
     * @param endingCriteriaId
     */
    private readonly checkFacilityTimings = async (faciltyTiming: models.facility_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteriaId?: number): Promise<boolean> => {

        if (!withRecurrence) {

            const filteredTimings: models.facility_timingsI[] = faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {
                const { day_id: dayId, start_time: facilityStartTime, end_time: facilityEndTime, time_zone: timeZone } = t;

                if (dayId === new Date(startDate).getDay()) {
                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(facilityStartTime)}.000Z`), timeZone);

                    const formatedEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(facilityEndTime)}.000Z`), timeZone);
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

        const endingCriteria: models.sch_recurrence_ending_criteriasI = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(endingCriteriaId));

        const { slug } = endingCriteria;

        if (slug === 'daily') {

            let filteredTimings: models.facility_timingsI[] = [];

            for (const day of days) {

                filteredTimings = [...filteredTimings, ...faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {
                    const { day_id: dayId, start_time: facilityStartTime, end_time: facilityEndTime, time_zone: timeZone } = t;

                    if (dayId === day) {

                        const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(facilityStartTime)}.000Z`), timeZone);
                        const formatedEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(facilityEndTime)}.000Z`), timeZone);

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

                })];

            }

            return filteredTimings && filteredTimings.length ? true : false;
            // return true;
        }

        const count: number = days.map((d: number): number => d).reduce((acc: number): number => {

            const filteredTimings: models.facility_timingsI[] = faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {

                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                if (dayId === new Date(startDate).getDay()) {

                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const facilityEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);

                    if (facilityStartDate.toISOString().slice(0, 10) !== facilityEndDate.toISOString().slice(0, 10)) {
                        facilityEndDate.setDate(facilityStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (facilityStartDate.getTime() <= startDateWithTimezone.getTime() &&
                        startDateWithTimezone.getTime() <= facilityEndDate.getTime() &&
                        facilityStartDate.getTime() <= endDateWithTimezone.getTime() &&
                        endDateWithTimezone.getTime() <= facilityEndDate.getTime()) {
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

    /**
     *
     * @param faciltyTiming
     * @param startDate
     * @param endDate
     * @param withRecurrence
     * @param days
     * @param endingCriteriaId
     */
     private readonly checkFacilityTimingsWithConflicts = async (data: CheckFacilityTimingI, faciltyTiming: models.facility_timingsI[], startDate: string, endDate: string, withRecurrence: boolean, days?: number[] | null | undefined, endingCriteriaId?: number): Promise<boolean|any> => {

        if (!withRecurrence) {
            const { 
                isMultiple,
                specialityName,
                facilityLocation
             } = data;
            const filteredTimings : models.facility_timingsI[] = [];
            const conflicts: CheckFacilityTimingConflictI[] = [];
            for(const t of faciltyTiming ){
                const { day_id: dayId, start_time: facilityStartTime, end_time: facilityEndTime, time_zone: timeZone } = t;

                if (dayId === new Date(startDate).getDay()) {
                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(facilityStartTime)}.000Z`), timeZone);

                    const formatedEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(facilityEndTime)}.000Z`), timeZone);
                    const facilityEndDate: Date = (new Date(`${endDate.slice(0, 10)}T${formatedEndDate.toISOString().slice(-13)}`));

                    if (facilityStartDate.toISOString().slice(0, 10) !== facilityEndDate.toISOString().slice(0, 10)) {
                        facilityEndDate.setDate(facilityStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (facilityStartDate.getTime() <= startDateWithTimezone.getTime() && startDateWithTimezone.getTime() <= facilityEndDate.getTime() && facilityStartDate.getTime() <= endDateWithTimezone.getTime() && endDateWithTimezone.getTime() <= facilityEndDate.getTime()) {
                        filteredTimings.push(t);
                    }else{
                        conflicts.push({
                            facilityStartDate,
                            facilityEndDate,
                            specialityName,
                            facilityLocationName: facilityLocation.qualifier,
                            facilityName: facilityLocation.facility.qualifier,
                        });

                    }
                }
            }

            if(conflicts.length){
                if(!isMultiple){
                    const { facilityStartDate, facilityEndDate, facilityLocationName, facilityName } = conflicts[0];
                    const err = generateMessages('ASSIGNMENT_DOES_NOT_FALL');
                    const adjustedStartDate: String = facilityStartDate.toLocaleString("en-US", { weekday:'long', hour: 'numeric', minute: 'numeric', hour12: true });
                    const endTime: String = facilityEndDate.toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
                    err.message = `${err.message} of ${facilityName} - ${facilityLocationName}, ${specialityName}, ${adjustedStartDate} - ${endTime}`
                    throw err;
                }
                data.conflict = conflicts[0];
            }

            return filteredTimings && filteredTimings.length ? true : false;
        }

        const endingCriteria: models.sch_recurrence_ending_criteriasI = this.shallowCopy(await this.__recurrenceEndingCriteriaRepo.findById(endingCriteriaId));

        const { slug } = endingCriteria;

        if (slug === 'daily') {

            let filteredTimings: models.facility_timingsI[] = [];

            for (const day of days) {

                filteredTimings = [...filteredTimings, ...faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {
                    const { day_id: dayId, start_time: facilityStartTime, end_time: facilityEndTime, time_zone: timeZone } = t;

                    if (dayId === day) {

                        const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(facilityStartTime)}.000Z`), timeZone);
                        const formatedEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(facilityEndTime)}.000Z`), timeZone);

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

                })];

            }

            return filteredTimings && filteredTimings.length ? true : false;
            // return true;
        }

        const count: number = days.map((d: number): number => d).reduce((acc: number): number => {

            const filteredTimings: models.facility_timingsI[] = faciltyTiming.filter((t: models.facility_timingsI): models.facility_timingsI => {

                const { day_id: dayId, start_time: startTime, end_time: endTime, time_zone: timeZone } = t;

                if (dayId === new Date(startDate).getDay()) {

                    const facilityStartDate: Date = this.convertDateToLocal(new Date(`${startDate.slice(0, 10)}T${String(startTime)}.000Z`), timeZone);
                    const facilityEndDate: Date = this.convertDateToLocal(new Date(`${endDate.slice(0, 10)}T${String(endTime)}.000Z`), timeZone);

                    if (facilityStartDate.toISOString().slice(0, 10) !== facilityEndDate.toISOString().slice(0, 10)) {
                        facilityEndDate.setDate(facilityStartDate.getDate());
                    }

                    const startDateWithTimezone: Date = this.convertDateToLocal(new Date(startDate), timeZone);
                    const endDateWithTimezone: Date = this.convertDateToLocal(new Date(endDate), timeZone);

                    if (facilityStartDate.getTime() <= startDateWithTimezone.getTime() &&
                        startDateWithTimezone.getTime() <= facilityEndDate.getTime() &&
                        facilityStartDate.getTime() <= endDateWithTimezone.getTime() &&
                        endDateWithTimezone.getTime() <= facilityEndDate.getTime()) {
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
    private readonly createAvailableDoctorsAutomatically = async (obj: CreateAvailableDoctorsI): Promise<ANY> => {

        const {
            allowMultipleAssignments,
            doctorMethodId,
            facilityLocationId,
            specialityId,
            startDate,
            endDate,
            checkForRecurrence,
            formatedDays,
            recurrenceEndingCriteriaId,
            mins,
            newAvailableSpecialityId,
            userId,
            formatDatesCriteria,
            noOfDoctors,
            noOfSlots,
            transaction,
            isProviderAssignment,
            specialityName,
            facilityLocationName,
            timezone,
            doctors
        } = obj;

        let availableDoctorDateList: models.sch_recurrence_date_listsI[];
        let availableDoctors: models.sch_available_doctorsI[];
        let specialityFilter :ANY =[];

        if(specialityId){
            specialityFilter.push(
                {
                    as: 'availableSpeciality',
                    model: models.sch_available_specialities,
                    required: true,
                    where: {
                        deleted_at: null,
                        speciality_id: specialityId
                    },
                    include: {
                        model: models.specialities,
                        require: true,
                    }
                }
            );
        }

        const userFacility: models.user_facilityI[] = this.shallowCopy(await this.__userFacilityRepo.findAll(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
                ...(isProviderAssignment && { user_id: doctors })
            },
            {
                include:
                {
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
                            required: false,
                            where: {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                            }
                        }
                    ],
                    model: models.users,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            },
            transaction
        ));

        if (!checkForRecurrence) {
           
            const DocTiming: models.user_timingsI[] = this.filterNonNull(userFacility.map((s: models.user_facilityI): models.user_timingsI[] => s.users?.userTimings).flat());

            let doctorIds: number[] = this.filterUnique(DocTiming.map((p: models.user_timingsI): number => p.user_id));

            const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimings(DocTiming, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);

            if (!checkedDoctorTimings.length) {
                throw generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
            }

            doctorIds = this.filterUnique(checkedDoctorTimings.filter((z: ANY): ANY => doctorIds.includes(z.user_id)).map((a: ANY): ANY => a.user_id));

            const getAvailableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll<models.sch_available_doctorsI>(
                {
                    deleted_at: null,
                    doctor_id: { [Op.in]: doctorIds },
                },
                {
                    include: [
                        {
                            as: 'dateList',
                            model: models.sch_recurrence_date_lists,
                            required: true,
                            where: {
                                deleted_at: null,
                                [Op.or]: [
                                    {
                                        end_date: { [Op.gt]: startDate },
                                        start_date: { [Op.lte]: startDate },
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
                            as: 'facilityLocations',
                            model: models.facility_locations,
                            include: {
                                as: 'facility',
                                model: models.facilities,
                                required: true,
                            },
                            required: true,
                        },
                        ...specialityFilter
                    ]
                },
                transaction
            ));

            if (!allowMultipleAssignments && getAvailableDoctors) {
                doctorIds = doctorIds.filter((d: number): boolean => !getAvailableDoctors.some((avlDoc) => d == avlDoc.doctor_id));
            }

            const checkDuplicate: models.sch_available_doctorsI = this.shallowCopy(await this.__availableDoctorRepo.findOne(
                {
                    deleted_at: null,
                    doctor_id: { [Op.in]: doctorIds },
                    facility_location_id: facilityLocationId
                },
                {
                    include: [
                        {
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
                },
                transaction
            ));

            if (checkDuplicate && Object.keys(checkDuplicate).length) {
                throw generateMessages('SAME_ASSIGNMENT_EXIST');
            }

            if (!doctorIds.length) {
                const err = generateMessages('PROVIDER_ALREADY_ASSIGN');
                const adjustedStartDate: String[] = this.convertDateToLocal(new Date(startDate), timezone).toLocaleString("en-US", { year: 'numeric', day:'numeric', month: 'numeric' , hour: 'numeric', minute: 'numeric', hour12: true }).split(',');
                const endTime: String = this.convertDateToLocal(new Date(endDate), timezone).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
                const dateOnly: String = adjustedStartDate[0];
                const startTime: String = adjustedStartDate[1];
                const avlDoctorAlreadyAssigned = getAvailableDoctors.filter((avlDoc) => facilityLocationId !== avlDoc.facility_location_id);
                if(avlDoctorAlreadyAssigned.length){
                    err.message = `${err.message} in ${avlDoctorAlreadyAssigned[0].facilityLocations.facility.qualifier} - ${avlDoctorAlreadyAssigned[0].facilityLocations.qualifier} - ${avlDoctorAlreadyAssigned[0].availableSpeciality.speciality.name}, on ${dateOnly} from${startTime} to ${endTime}`
                }else{
                    err.message = `${err.message} in ${facilityLocationName} - ${specialityName}, on ${dateOnly} from${startTime} to ${endTime}`
                }
                throw err;
            }

            const unAvailablityOfDoctor: number[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
                {
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
                    doctor_id: { [Op.in]: doctorIds }

                },
                {},
                transaction
            )).map((g: models.sch_unavailable_doctorsI): number => g.doctor_id);

            doctorIds = doctorIds.filter((d: number): boolean => !unAvailablityOfDoctor.includes(d));

            if (!doctorIds.length) {
                throw generateMessages('PROVIDER_NOT_AVAILABLE');
            }

            doctorIds = doctorIds.filter((c: number, i: number): boolean => i < noOfDoctors);

            const formatEndDate: Date = new Date(endDate);
            const formatStartDate: Date = new Date(startDate);

            const availableDoctorArray: models.sch_available_doctorsI[] = doctorIds?.map((p: number): models.sch_available_doctorsI =>
            ({
                available_speciality_id: newAvailableSpecialityId,
                doctor_id: p,
                end_date: formatEndDate,
                facility_location_id: facilityLocationId,
                no_of_slots: mins,
                start_date: formatStartDate,
                supervisor_id: userId,
                is_provider_assignment:isProviderAssignment
            }));

            availableDoctors = this.shallowCopy(await this.__availableDoctorRepo.bulkCreate([...availableDoctorArray], transaction));

            availableDoctorDateList = availableDoctors.map((d: models.sch_available_doctorsI): models.sch_recurrence_date_listsI =>
            ({
                available_doctor_id: d.id,
                end_date: d.end_date,
                no_of_slots: mins,
                start_date: d.start_date,
            }));

        } else {
            let doctorIds: number[];
            let finalDoctorIds: number[] = [];
            let docTiming: models.user_timingsI[] = [];
            const desireDatesObj: ANY = [];

            docTiming = this.filterNonNull(userFacility.map((p: models.user_facilityI): models.user_timingsI[] => p.users?.userTimings).flat());
            const reqDoctorIds: number[] = (this.filterUnique(docTiming.map((p: models.user_timingsI): number => p.user_id)));

            for (const s of formatDatesCriteria) {

                doctorIds = docTiming.map((doc: models.user_timingsI): ANY =>
                    reqDoctorIds.filter((dId: number): ANY => {
                        if (doc.day_id === new Date(s.start_date).getDay() && dId === doc.user_id) {
                            return true;
                        }
                    })).flat();

                const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimings(docTiming, startDate, endDate, checkForRecurrence, formatedDays, recurrenceEndingCriteriaId);

                if (checkedDoctorTimings.length) {

                    doctorIds = this.filterUnique(checkedDoctorTimings.filter((z: ANY): ANY => doctorIds.includes(z.user_id)).map((a: ANY): ANY => a.user_id));

                    const getAvailableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
                        {
                            deleted_at: null,
                            doctor_id: { [Op.in]: doctorIds },
                        },
                        {
                            include: [
                                {
                                    as: 'dateList',
                                    model: models.sch_recurrence_date_lists,
                                    required: true,
                                    where: {
                                        deleted_at: null,
                                        [Op.or]: [
                                            {
                                                end_date: { [Op.gt]: s.start_date },
                                                start_date: { [Op.lte]: s.start_date },
                                            },
                                            {
                                                start_date: {
                                                    [Op.gte]: s.start_date,
                                                    [Op.lt]: s.end_date,
                                                }
                                            }
                                        ]
                                    },
                                },
                                ...specialityFilter
                            ]
                        },
                        transaction
                    ));

                    const getAvailableDoctorIds: number[] = getAvailableDoctors.map((g: models.sch_available_doctorsI): number => g.doctor_id);
                    const getAvailableDoctorFacilityLocationIds: number[] = getAvailableDoctors.map((g: models.sch_available_doctorsI): number => g.facility_location_id);

                    if (allowMultipleAssignments) {
                        if (getAvailableDoctorFacilityLocationIds.includes(facilityLocationId)) {
                            doctorIds = doctorIds.filter((d: number): boolean => !getAvailableDoctorIds.includes(d));
                        }
                        else {
                            doctorIds = [...doctorIds];
                        }
                    } else {
                        doctorIds = doctorIds.filter((d: number): boolean => !getAvailableDoctorIds.includes(d));
                    }
                    
                    if (doctorIds.length) {
                        console.log('HIT 2');
                        const unAvailablityOfDoctor: number[] = this.shallowCopy(await this.__unAvailableDoctorRepo.findAll(
                            {
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
                                doctor_id: { [Op.in]: doctorIds }

                            },
                            {},
                            transaction)).map((g: models.sch_unavailable_doctorsI): number => g.doctor_id);

                        doctorIds = doctorIds.filter((d: number): boolean => !unAvailablityOfDoctor.includes(d));

                        if (doctorIds.length) {

                            for (const doctorId of doctorIds) {
                                desireDatesObj.push({ doctor_id: doctorId, ...s });
                            }
                            finalDoctorIds.push(...doctorIds);
                            // Return [s.start_date, s.end_date];
                        }

                    }
                }
            }

            if (!desireDatesObj?.length) {
                throw generateMessages('PROVIDER_NOT_AVAILABLE');
            }

            finalDoctorIds = this.filterUnique(finalDoctorIds).sort(function (a, b) { return a - b; });
            finalDoctorIds = finalDoctorIds.filter((c: number, i: number): boolean => i < noOfDoctors);

            const formatEndDate: Date = new Date(endDate);
            const formatStartDate: Date = new Date(startDate);

            const availableDoctorArray: models.sch_available_doctorsI[] = finalDoctorIds?.map((p: number): models.sch_available_doctorsI =>
            ({
                available_speciality_id: newAvailableSpecialityId,
                doctor_id: p,
                end_date: formatEndDate,
                facility_location_id: facilityLocationId,
                no_of_slots: mins,
                start_date: formatStartDate,
                supervisor_id: userId,
                is_provider_assignment: isProviderAssignment
            }));

            availableDoctors = this.shallowCopy(await this.__availableDoctorRepo.bulkCreate([...availableDoctorArray], transaction));

            availableDoctorDateList = this.filterNonNull(availableDoctors.map((d: models.sch_available_doctorsI): models.sch_recurrence_date_listsI =>
                desireDatesObj.map((o: ANY): ANY => {
                    if (o.doctor_id === d.doctor_id) {
                        return {
                            available_doctor_id: d.id,
                            doctor_method_id: doctorMethodId,
                            end_date: o.end_date,
                            no_of_slots: mins,
                            start_date: o.start_date,
                        };
                    }
                })).flat());
        }

        return this.__recurrenceDateListRepo.bulkCreate([...availableDoctorDateList], transaction);

    }

    /**
     *
     * @param obj
     */
    private readonly createAvailableDoctorsManually = async (obj: CreateAvailableDoctorsI): Promise<models.sch_recurrence_date_listsI[]> => {

        const { doctorMethodId, doctors, newAvailableSpecialityId, endDate, startDate, facilityLocationId, mins, userId, transaction } = obj;

        const formatEndDate: Date = new Date(endDate);
        const formatStartDate: Date = new Date(startDate);

        const doctorObj: models.sch_available_doctorsI[] = doctors.map((doc: number): models.sch_available_doctorsI => ({
            available_speciality_id: newAvailableSpecialityId,
            doctor_id: doc,
            end_date: formatEndDate,
            facility_location_id: facilityLocationId,
            no_of_slots: mins,
            start_date: formatStartDate,
            supervisor_id: userId,
        }));

        const availableDoctorsArray: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.bulkCreate([...doctorObj], transaction));

        const availableDoctorsDateList: models.sch_available_doctorsI[] = availableDoctorsArray.map((d: models.sch_available_doctorsI): models.sch_recurrence_date_listsI =>
        ({
            available_doctor_id: d.id,
            doctor_method_id: doctorMethodId,
            end_date: d.end_date,
            no_of_slots: mins,
            start_date: d.start_date,
        }));

        return this.__recurrenceDateListRepo.bulkCreate([...availableDoctorsDateList], transaction);

    }

    /**
     *
     * @param object
     */
    private readonly createAvailbleSpecialityWithoutDoctor = async (object: UpdateSpecialityReqI): Promise<models.sch_available_specialitiesI> => {

        const {
            _authorization,
            doctorMethodId,
            endDate,
            facilityLocationId,
            noOfDoctors,
            specialityId,
            startDate,
            transaction,
            userId,
        } = object;

        const filters: ANY = [
            {
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
                            start_date: {
                                [Op.and]: [
                                    {
                                        [Op.gt]: startDate
                                    },
                                    {
                                        [Op.lt]: endDate
                                    }
                                ]
                            }
                        },
                    ]
                }
            }
        ];

        const checkDuplicate: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
            {
                deleted_at: null,
                facility_location_id: facilityLocationId,
                speciality_id: specialityId,
            },
            {
                include: [
                    ...filters
                ]
            },
            transaction
        ));

        if (checkDuplicate && Object.keys(checkDuplicate).length) {
            throw generateMessages('SAME_ASSIGNMENT_EXIST');
        }

        const facilityLocation: models.facility_locationsI = this.shallowCopy(await this.__facilityLocationRepo.findOne(
            {
                deleted_at: null,
                id: facilityLocationId
            },
            {
                include: [
                    {
                        as: 'faciltyTiming',
                        model: models.facility_timings,
                        where: { deleted_at: null },
                    }, {
                        as: 'facility',
                        model: models.facilities,
                        required: true,
                    }
                ]
            },
            transaction
        ));

        if (!facilityLocation || !Object.keys(facilityLocation).length) {
            throw generateMessages('NO_FACILITY_LOCATION_FOUND');
        }

        const { faciltyTiming } = facilityLocation;

        const speciality: models.specialitiesI = this.shallowCopy(await this.__specialityRepo.findById(specialityId, {}, transaction));

        const { time_slot: timeSlot } = speciality;

        const checkForRecurrence: boolean = false;

        const formatedDays: number[] = this.filterUnique(faciltyTiming?.map((timing: models.facility_timingsI): number => timing.day_id));

        const checkTimingData: CheckFacilityTimingI = {
            isMultiple: false,
            specialityId,
            specialityName: speciality.qualifier,
            facilityLocation,
        }

        const checkedFacilityTimings: boolean = await this.checkFacilityTimingsWithConflicts(checkTimingData, faciltyTiming, startDate.toISOString(), endDate.toISOString(), checkForRecurrence, formatedDays, null);

        if (!checkedFacilityTimings) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL');
        }

        const formatEndDate: Date = new Date(endDate);
        const formatStartDate: Date = new Date(startDate);

        const time: number = formatEndDate.getTime() - formatStartDate.getTime();

        let mins: number = time / 60000;

        mins = mins / timeSlot;

        const noOfSlots: number = (mins * noOfDoctors);

        const newAvailableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.create(
            {
                end_date: endDate,
                facility_location_id: facilityLocationId,
                no_of_doctors: noOfDoctors,
                no_of_slots: noOfSlots,
                speciality_id: specialityId,
                start_date: startDate,
            },
            transaction
        )) as unknown as models.sch_available_specialitiesI;

        const daysAndDatesMethod: boolean = false;

        await this[this.__createDaysAndDatesMethod[`${daysAndDatesMethod}`]]({
            doctorMethodId,
            endDate,
            facilityLocationId,
            formatedDays,
            newAvailableSpecialityId: newAvailableSpeciality.id,
            noOfDoctors,
            noOfSlots,
            specialityId,
            startDate,
            transaction
        });

        return newAvailableSpeciality;

    }

    /**
     *
     * @param obj
     */
    private readonly createDaysAndDatesWithoutRecurrence = async (obj: CreateDaysAndDatesI): Promise<void> => {

        const { doctorMethodId, facilityLocationId, newAvailableSpecialityId, endDate, startDate, noOfDoctors, noOfSlots, specialityId, isProviderAssignment, transaction } = obj;

        if (isProviderAssignment) {
            return null
        }

        const day: models.sch_day_listsI = this.shallowCopy(await this.__dayListsRepo.findOne({ unit: new Date(startDate).getDay() }));

        await this.__recurrenceDayListRepo.create({ available_speciality_id: newAvailableSpecialityId, day_id: day.id }, transaction);

        await this.__recurrenceDateListRepo.create({ doctor_method_id: doctorMethodId, available_speciality_id: newAvailableSpecialityId, end_date: new Date(endDate), start_date: new Date(startDate), no_of_doctors: noOfDoctors, no_of_slots: noOfSlots, }, transaction);

        return null;
    }

    /**
     *
     * @param obj
     */
    private readonly createDaysAndDatesWithRecurrence = async (obj: CreateDaysAndDatesI): Promise<FormatedDatesI[]> => {

        const { doctorMethod, doctorMethodId, formatedDays, newAvailableSpecialityId, endDateForRecurrence, endDate, endingCriteria, endAfterOccurences, startDate, noOfDoctors, noOfSlots, specialityId, facilityLocationId, isProviderAssignment, transaction } = obj;

        const checkForDateCriteria: boolean = endDateForRecurrence ? true : false;

        const formatDates: FormatedDatesI[] = (await this[this.__formatDatesCriteriaMethod[`${checkForDateCriteria}`]]({

            daysList: formatedDays,
            endDateString: endDate,
            endingCriteria,
            facilityLocationId,
            numberOfRecurrsion: endAfterOccurences,
            recurrenceEndDateString: endDateForRecurrence,
            startDateString: startDate

        })).map((c: FormatedDatesI): FormatedDatesI => ({
            ...c,
            available_speciality_id: newAvailableSpecialityId,
            doctor_method_id: doctorMethodId,
            no_of_doctors: noOfDoctors,
            no_of_slots: noOfSlots,
        }));

        if (isProviderAssignment) {
            return formatDates;
        }
        
        if (doctorMethod !== 'automatic') {
            for (const formatedDate of formatDates) {

                const checkDuplicate: models.sch_available_specialitiesI = this.shallowCopy(await this.__repo.findOne(
                    {
                        deleted_at: null,
                        facility_location_id: facilityLocationId,
                        speciality_id: specialityId,
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
                                            end_date: {
                                                [Op.and]: [
                                                    {
                                                        [Op.gt]: formatedDate.start_date
                                                    },
                                                    {
                                                        [Op.lte]: formatedDate.end_date
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            start_date: { [Op.between]: [formatedDate.start_date, formatedDate.end_date] }
                                        }
                                    ],
                                    deleted_at: null,
                                },
                            },
                            {
                                model: models.specialities,
                                as : 'speciality'
                            }
                        ],
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
            available_speciality_id: newAvailableSpecialityId,
            day_id: d.id
        }));

        await this.__recurrenceDayListRepo.bulkCreate([...formatedRecurrenceDays], transaction);

        return formatDates;

    }

    /**
     *
     * @param object
     */
    private readonly deleteDoctorWithMultipleSpecilaity = async (object: DeleteAvailableSpeciality): Promise<models.sch_available_specialitiesI> => {

        const {
            availableSpecialityId,
            userId,
            transaction
        } = object;
        const availableDoctorIds: number[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: availableSpecialityId,
                deleted_at: null,
            }
        )).map((d: models.sch_available_doctorsI): number => d.id);

        await this.__availableDoctorRepo.updateByIds(availableDoctorIds, { updated_by: userId, deleted_at: new Date() }, transaction);

        await this.__recurrenceDateListRepo.updateByColumnMatched(
            { available_doctor_id: { [Op.in]: availableDoctorIds } },
            { updated_by: userId, deleted_at: new Date() },
            transaction
        );

        return this.__repo.update(availableSpecialityId, { updated_by: userId, deleted_at: new Date() }, transaction);

    }

    /**
     *
     * @param object
     */
    private readonly deleteDoctorWithSingleSpeciality = async (object: DeleteAvailableSpeciality): Promise<ANY> => {

        const {
            avilableDateLists,
            availableSpecialityId,
            dateListId,
            userId,
            transaction
        } = object;

        const SpecialityAvailabilities: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_speciality_id: availableSpecialityId,
                deleted_at: null,
            },
            {},
            transaction
        ));

        const checkMethod: boolean = SpecialityAvailabilities.length > 1 ? true : false;
        await this.__recurrenceDateListRepo.update(dateListId, { updated_by: userId, deleted_at: new Date() }, transaction);
        return this[this.__deleteMultipleSpecialityMethod[`${checkMethod}`]]({
            availableSpecialityId,
            dateListId,
            transaction,
            userId,
        });

    }

    /**
     *
     * @param object
     */
    private readonly deleteWithCheckForReccurence = async (object: DeleteAvailableSpeciality): Promise<ANY> => {

        const { dateListId, availableSpecialityId, userId, transaction } = object;

        const dateListOfDoctor: models.sch_available_doctorsI = this.shallowCopy(await this.__recurrenceDateListRepo.findById(dateListId));

        const availableDoctors: models.sch_available_doctorsI[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: availableSpecialityId,
                deleted_at: null,
            },
            {
                include: {
                    as: 'dateList',
                    model: models.sch_recurrence_date_lists,
                    required: true,
                    where:
                    {
                        deleted_at: null,
                        end_date: dateListOfDoctor.end_date,
                        start_date: dateListOfDoctor.start_date,
                    },
                },
            }

        ));

        const availableDoctorIds: number[] = availableDoctors.map((d: models.sch_available_doctorsI): number => d.id);
        const availableDoctorDateListIds: number[] = availableDoctors.map((d: models.sch_available_doctorsI): number[] => d.dateList.map((l: ANY): ANY => l.id)).flat();

        await this.__recurrenceDateListRepo.updateByIds(availableDoctorDateListIds, {
            deleted_at: new Date(),
            updated_by: userId
            // tslint:disable-next-line: align
        }, transaction);

        for (const availableDoctorId of availableDoctorIds) {

            const availableDoctorRecurrence: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll({
                available_doctor_id: availableDoctorId,
                deleted_at: null
            }));

            if (!availableDoctorRecurrence.length) {
                await this.__availableDoctorRepo.update(availableDoctorId, {
                    deleted_at: new Date(),
                    updated_by: userId
                    // tslint:disable-next-line: align
                }, transaction);
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

                    // tslint:disable-next-line: no-parameter-reassignment
                    daysToAdd = startDate.getMonth() !== endDate.getMonth() ? daysToAdd - 1 : daysToAdd;

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
    private readonly formatDatesCriteriaWithEndDate = async (obj: FormatDatesCriteriaI): Promise<FormatedDatesI[]> => {

        const {
            daysList, endDateString, endingCriteria, recurrenceEndDateString, startDateString
        } = obj;

        if (startDateString === recurrenceEndDateString) {
            return [];
        }

        const startDate: Date = new Date(startDateString);
        const endDate: Date = new Date(endDateString);
        const recurrenceEndDate: Date = new Date(recurrenceEndDateString);
        const endDateToCompare=new Date(recurrenceEndDate.setHours(23,59,59));

        const startDateTime: number = startDate.getTime();
        const endDateTime: number = endDate.getTime();

        const duration: number = endDateTime - startDateTime;

        let date: Date[] = [];
        let formatedDates: FormatedDatesI[] = [];

        if (endingCriteria === 'monthly') {

            const daysListLength: number = daysList.length;
            let counter: number = 1;

            while (startDate.getTime() <= endDateToCompare.getTime()) {
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

        while (startDate.getTime() <= endDateToCompare.getTime()) {
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
    private readonly formatDatesCriteriaWithOutEndDate = async (obj: FormatDatesCriteriaI): Promise<FormatedDatesI[]> => {

        const {
            endingCriteria,
            daysList,
            startDateString,
            endDateString,
            numberOfRecurrsion,
            transaction
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
     * @param appointment
     * @param overBooking
     */
    private readonly getNumberOfDoctors = (appointments: models.sch_appointmentsI[], overBooking: number): number => {

        const availableDoctors: models.sch_appointmentsI[] = appointments.filter((a: models.sch_appointmentsI): boolean => a.available_doctor_id !== null);
        const unAvailableDoctors: models.sch_appointmentsI[] = appointments.filter((a: models.sch_appointmentsI): boolean => a.available_doctor_id === null);

        const uniqueAppointmentTime: string[] = this.filterUnique(appointments.map((a: models.sch_appointmentsI): string => {
            const startdate: Date = new Date(a.scheduled_date_time);
            return `${startdate.getHours()}:${startdate.getMinutes()}`;
        }));

        const noOfDoctors: number = this.filterUnique(availableDoctors.map((d: models.sch_appointmentsI): number => d?.available_doctor_id)).length;

        if (availableDoctors.length && !unAvailableDoctors.length) {
            return noOfDoctors;
        }

        if (unAvailableDoctors.length && !availableDoctors.length) {

            const docs: number = Math.ceil(uniqueAppointmentTime.length / (overBooking + 1));

            return docs > noOfDoctors ? docs : noOfDoctors;

        }

        if (availableDoctors.length && unAvailableDoctors.length) {

            const unAvailableLength: number = unAvailableDoctors.filter((p: models.sch_appointmentsI): models.sch_appointmentsI => {

                const date: Date = new Date(p.scheduled_date_time);
                const value: string = `${date.getHours()}:${date.getMinutes()}`;

                if (uniqueAppointmentTime.find((c: string): boolean => c === value)) {
                    return p;
                }

            }).length;

            const docs: number = Math.ceil(unAvailableLength / (overBooking + 1));

            return noOfDoctors + docs;

        }

    }

    /**
     *
     * @param assignment
     */
    private readonly getTimeSlotOfAssignment = (assignment: models.sch_available_specialitiesI): number => {

        const { start_date, end_date, no_of_doctors, no_of_slots } = assignment;

        let diff: number = new Date(end_date).getTime() - new Date(start_date).getTime();
        diff = (diff / 60000);

        if (no_of_doctors && no_of_slots > 0) {
            const total: number = no_of_slots / no_of_doctors;
            return (Math.round(diff / total));
        }

        if (no_of_slots > 0) {
            return (Math.round(diff / no_of_slots));
        }

        return 0;

    }

    /**
     *
     * @param object
     */
    private readonly updateSpecialityWithAutomaticDoctor = async (object: UpdateSpecialityReqI): Promise<ANY> => {

        const {
            doctorMethodId,
            id,
            endDateFromDateList,
            startDateFromDateList,
            startDate,
            endDate,
            userId,
            noOfDoctors,
            noOfSlots,
            dateListId,
            faciltyTiming,
            endDateString,
            facilityLocationId,
            mins,
            specialityId,
            startDateString,
            _authorization,
            transaction
        } = object;

        const availableDoctorIds: number[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null
            },
            {},
            transaction
        )).map((d: models.sch_available_doctorsI): number => d.id);

        const numberOfSpecialityAvailablities: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null,
            },
            {},
            transaction
        ));

        if (numberOfSpecialityAvailablities.length === 1) {

            const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: id,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            available_doctor_id: { [Op.in]: availableDoctorIds },
                            available_speciality_id: null,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (checkAppointments && Object.keys(checkAppointments).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__availableDoctorRepo.updateByColumnMatched(
                {
                    available_speciality_id: id,
                    deleted_at: null
                },
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

            await this.__recurrenceDateListRepo.updateByReferenceIds({ available_doctor_id: { [Op.in]: availableDoctorIds } }, { deleted_at: new Date(), updated_by: userId }, transaction);

            await this.__repo.updateByIds([id], { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.update(
                dateListId,
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

        } else {

            const availableDoctorDateListIds: number[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                {
                    available_doctor_id: { [Op.in]: availableDoctorIds },
                    deleted_at: null,
                    end_date: endDateFromDateList,
                    start_date: startDateFromDateList,
                },
                {},
                transaction
            )).map((s: models.sch_recurrence_date_listsI): number => s.id);

            const appointmentsForDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__appointmentRepo.findOne(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: null,
                            cancelled: 0,
                            date_list_id: { [Op.in]: availableDoctorDateListIds },
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            cancelled: 0,
                            date_list_id: dateListId,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (appointmentsForDoctor && Object.keys(appointmentsForDoctor).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__recurrenceDateListRepo.update(dateListId, { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.updateByIds(availableDoctorDateListIds, { deleted_at: new Date(), updated_by: userId }, transaction);

        }

        const newAvailableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.createAvailbleSpecialityWithoutDoctor({
            _authorization,
            doctorMethodId,
            endDate,
            facilityLocationId,
            noOfDoctors,
            specialityId,
            startDate,
            transaction,
            userId,
        }));

        const formatedDays: number[] = this.filterUnique(faciltyTiming?.map((timing: models.facility_timingsI): number => timing.day_id));

        return this.createAvailableDoctorsAutomatically({
            checkForRecurrence: false,
            doctorMethodId,
            endDate: endDateString,
            facilityLocationId,
            formatedDays,
            mins,
            newAvailableSpecialityId: newAvailableSpeciality.id,
            noOfDoctors,
            noOfSlots,
            specialityId,
            startDate: startDateString,
            transaction,
            userId,
        });

    }

    /**
     *
     * @param object
     */
    private readonly updateSpecialityWithManualDoctor = async (object: UpdateSpecialityReqI): Promise<ANY> => {

        const {
            id,
            endDateFromDateList,
            startDateFromDateList,
            doctorMethodId,
            noOfDoctors,
            userId,
            dateListId,
            endDate,
            startDate,
            doctors,
            facilityLocationId,
            startDateString,
            endDateString,
            mins,
            specialityId,
            checkTimingData,
            _authorization,
            transaction
        } = object;

        if (!doctors || !doctors.length) {

            throw generateMessages('NO_MANUALLY_DOCTORS');
        }

        const availableDoctorIds: number[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null
            },
            {},
            transaction
        )).map((d: models.sch_available_doctorsI): number => d.id);

        const numberOfSpecialityAvailablities: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null,
            },
            {},
            transaction
        ));

        if (numberOfSpecialityAvailablities.length === 1) {

            const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: id,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            available_doctor_id: { [Op.in]: availableDoctorIds },
                            available_speciality_id: null,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (checkAppointments && Object.keys(checkAppointments).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__availableDoctorRepo.updateByColumnMatched(
                {
                    available_speciality_id: id,
                    deleted_at: null
                },
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

            await this.__recurrenceDateListRepo.updateByReferenceIds({ available_doctor_id: { [Op.in]: availableDoctorIds } }, { deleted_at: new Date(), updated_by: userId }, transaction);

            await this.__repo.updateByIds([id], { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.update(
                dateListId,
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

        } else {

            const availableDoctorDateListIds: number[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                {
                    available_doctor_id: { [Op.in]: availableDoctorIds },
                    deleted_at: null,
                    end_date: endDateFromDateList,
                    start_date: startDateFromDateList,
                },
                {},
                transaction
            )).map((s: models.sch_recurrence_date_listsI): number => s.id);

            const appointmentsForDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__appointmentRepo.findOne(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: null,
                            cancelled: 0,
                            date_list_id: { [Op.in]: availableDoctorDateListIds },
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            cancelled: 0,
                            date_list_id: dateListId,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (appointmentsForDoctor && Object.keys(appointmentsForDoctor).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__recurrenceDateListRepo.update(dateListId, { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.updateByIds(availableDoctorDateListIds, { deleted_at: new Date(), updated_by: userId }, transaction);

        }

        const expectedDoctors: models.usersI[] = this.shallowCopy(await this.__userRepo.findAll(
            {
                deleted_at: null,
                id: { [Op.in]: doctors },
            },
            {
                include:
                    [
                        {
                            as: 'userBasicInfo',
                            model: models.user_basic_info,
                            required: false,
                            where: { deleted_at: null }

                        },
                        {
                            as: 'userTimings',
                            model: models.user_timings,
                            required: false,
                            where: {
                                deleted_at: null,
                                facility_location_id: facilityLocationId,
                            }
                        }
                    ],
            },
            transaction
        ));

        if (!expectedDoctors || !expectedDoctors.length) {
            throw generateMessages('NO_DOCTOR_FOUND');
        }

        const userTimings: models.user_timingsI[] = expectedDoctors.map((f: models.usersI): models.user_timingsI[] => f.userTimings).flat() as unknown as models.user_timingsI[];

        const checkedDoctorTimings: models.user_timingsI[] = await this.checkDoctorTimingsWithConflicts(checkTimingData, userTimings, startDateString, endDateString, false);

        if (!checkedDoctorTimings.length) {
            throw generateMessages('ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR');
        }

        const newAvailableSpeciality: models.sch_available_specialitiesI = this.shallowCopy(await this.createAvailbleSpecialityWithoutDoctor({
            _authorization,
            doctorMethodId,
            endDate,
            facilityLocationId,
            noOfDoctors,
            specialityId,
            startDate,
            transaction,
            userId,
        }));

        return this.createAvailableDoctorsManually(
            {
                doctorMethodId,
                doctors,
                endDate: endDateString,
                facilityLocationId,
                mins,
                newAvailableSpecialityId: newAvailableSpeciality.id,
                startDate: startDateString,
                transaction,
                userId,
            });

    }

    /**
     *
     * @param object
     */
    private readonly updateSpecialityWithNoneDoctor = async (object: UpdateSpecialityReqI): Promise<ANY> => {

        const {
            doctorMethodId,
            startDateFromDateList,
            endDateFromDateList,
            id,
            facilityLocationId,
            specialityId,
            noOfDoctors,
            noOfSlots,
            userId,
            dateListId,
            endDate,
            startDate,
            _authorization,
            transaction
        } = object;

        const availableDoctorIds: number[] = this.shallowCopy(await this.__availableDoctorRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null
            },
            {},
            transaction
        )).map((d: models.sch_available_doctorsI): number => d.id);

        const numberOfSpecialityAvailablities: models.sch_recurrence_date_listsI[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
            {
                available_speciality_id: id,
                deleted_at: null,
            },
            {},
            transaction
        ));

        if (numberOfSpecialityAvailablities.length === 1) {

            const checkAppointments: models.sch_appointmentsI[] = this.shallowCopy(await this.__appointmentRepo.findAll(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: id,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            available_doctor_id: { [Op.in]: availableDoctorIds },
                            available_speciality_id: null,
                            cancelled: 0,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (checkAppointments && Object.keys(checkAppointments).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__availableDoctorRepo.updateByColumnMatched(
                {
                    available_speciality_id: id,
                    deleted_at: null
                },
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

            await this.__recurrenceDateListRepo.updateByReferenceIds({ available_doctor_id: { [Op.in]: availableDoctorIds } }, { deleted_at: new Date(), updated_by: userId }, transaction);

            await this.__repo.updateByIds([id], { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.update(
                dateListId,
                {
                    deleted_at: new Date(),
                    updated_by: userId,
                },
                transaction
            );

            // Const config: GenericHeadersI = {
            //     Headers: { Authorization: _authorization },
            // };

            // Await this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        } else {

            const availableDoctorDateListIds: number[] = this.shallowCopy(await this.__recurrenceDateListRepo.findAll(
                {
                    available_doctor_id: { [Op.in]: availableDoctorIds },
                    deleted_at: null,
                    end_date: endDateFromDateList,
                    start_date: startDateFromDateList,
                },
                {},
                transaction
            )).map((s: models.sch_recurrence_date_listsI): number => s.id);

            const appointmentsForDoctor: models.sch_appointmentsI = this.shallowCopy(await this.__appointmentRepo.findOne(
                {
                    [Op.or]: [
                        {
                            available_speciality_id: null,
                            cancelled: 0,
                            date_list_id: { [Op.in]: availableDoctorDateListIds },
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                        {
                            cancelled: 0,
                            date_list_id: dateListId,
                            deleted_at: null,
                            evaluation_date_time: null,
                            pushed_to_front_desk: 0,
                        },
                    ]
                },
                {},
                transaction
            ));

            if (appointmentsForDoctor && Object.keys(appointmentsForDoctor).length) {
                throw generateMessages('APPOINTMENT_EXISTS');
            }

            await this.__recurrenceDateListRepo.update(dateListId, { deleted_at: new Date(), updated_by: userId }, transaction);
            await this.__recurrenceDateListRepo.updateByIds(availableDoctorDateListIds, { deleted_at: new Date(), updated_by: userId }, transaction);

        }

        return this.createAvailbleSpecialityWithoutDoctor({
            _authorization,
            doctorMethodId,
            endDate,
            facilityLocationId,
            noOfDoctors,
            specialityId,
            startDate,
            transaction,
            userId,
        });

    }

}
