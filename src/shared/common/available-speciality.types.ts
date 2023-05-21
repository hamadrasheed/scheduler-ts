import { Transaction } from 'sequelize/types';

import * as models from '../../models';

import { ANY } from '.';

export interface GetAllAvailableSpecialitiesReqObjI {
    end_date: Date;
    facility_location_ids: number[];
    speciality_ids: number[];
    start_date: Date;
}

export interface SpecialityDoctorDataObjI {
    id: number;
    name: string;
}

export interface AutomateDoctorReqObjI {
    doctor_ids?: number[];
    facility_location_ids?: number[];
    number_of_weeks?: number;
    speciality_ids?: number[];
    start_date?: Date;
    user_id?: number;

}

export interface formatWeeklyArrayI {
    doctor_id?: number;
    end_date?: string;
    facility_location_id?: number;
    start_date?: string;
}

export interface formatedWeekI {
    end_of_week: Date;
    start_of_week: Date;
}

export interface AvailableDoctorObjectI {
    available_speciality_id?: number;
    date_list_id?: number;
    doctor_id?: number;
    end_date: Date;
    facility_location_id?: number;
    id?: number;
    no_of_slots?: number;
    start_date: Date;
    supervisor_id?: number;
}
export interface AssignedReqObjI {
    end_date: Date;
    facility_location_id: number;
    speciality_id: number;
    start_date: Date;
    user_id: number;
}

export interface UpdateSpecialtyWithAutomaticDoctorI {
    doctor_id: number;
    doctor_info: models.user_basic_info;
}

export interface SpecialityDataObjI {
    date_list_id?: number;
    days?: number[];
    doctors?: SpecialityDoctorDataObjI[];
    end_after_occurences?: number;
    end_date?: string;
    end_date_for_recurrence?: string;
    ending_criteria?: string;
    facility_location_id?: number;
    id?: number;
    no_of_doctors?: number;
    number_of_entries?: number;
    recurrence_ending_criteria_id?: number;
    speciality_id?: number;
    start_date?: string;
}

export interface UpdateAvailableSpecialitiesReqObjI {
    available_speciality?: SpecialityDataObjI;
    doctor_date_list_ids?: number[];
    doctor_method?: string;
    doctor_method_id?: number;
    doctors?: number[];
    user_id?: number;
    time_zone?: number;
}

export interface AvailableDoctorObjI {
    available_speciality_id?: number;
    doctor_id?: number;
    end_date?: string;
    facility_location_id?: number;
    no_of_slots?: number;
    start_date?: string;
    supervisor_id?: number;
}

export interface AvailableSpecialitiesReqObjI {
    doctor_method: string;
    doctor_method_id: number;
    doctors: number[];
    speciality: SpecialityDataObjI;
    user_id: number;
    timeZone: number;
}

export interface TimeZoneI {
    time_zone?: number
    time_zone_string: string;
}

export interface AvailableMultiSpecialitiesReqObjI {
    doctor_method?: string;
    doctor_method_id?: number;
    doctors: number[];
    specialities: SpecialityDataObjI[];
    user_id: number;
    facility_location_id?: number,
    no_of_doctors?: number,
    is_provider_assignment?: boolean
    time_zone?: TimeZoneI
}
    
export interface FacilityLocationObjI {
    address: string;
    cell_no: string;
    city: string;
    created_at: Date;
    created_by: Date;
    day_list: number[];
    deleted_at: Date;
    email: string;
    ext_no: string;
    facility_id: number;
    fax: string;
    floor: string;
    id: number;
    is_main: number;
    lat: number;
    long: number;
    name: string;
    office_hours_end: Date;
    office_hours_start: Date;
    phone: string;
    place_of_service_id: number;
    region_id: string;
    same_as_provider: number;
    state: string;
    updated_at: Date;
    updated_by: number;
    zip: string;

}

export interface UserBasicInfoObjI {
    address?: string;
    apartment_suite?: string;
    area_id?: number;
    biography?: string;
    cell_no?: string;
    city?: string;
    created_at?: Date;
    created_by?: number;
    date_of_birth?: string;
    deleted_at?: Date;
    department_id?: number;
    designation_id?: number;
    emergency_phone?: string;
    employed_by_id?: number;
    employment_type_id?: number;
    extension?: string;
    fax?: string;
    file_id?: number;
    first_name?: string;
    from?: Date;
    gender?: string;
    hiring_date?: Date;
    id?: number;
    last_name?: string;
    middle_name?: string;
    profile_pic?: string;
    profile_pic_url?: string;
    social_security?: string;
    state?: string;
    title?: string;
    to?: Date;
    updated_at?: Date;
    updated_by?: number;
    user_id?: number;
    work_phone?: string;
    zip?: string;
}

export interface FormatedDatesI {
    available_doctor_id?: number;
    available_speciality_id?: number;
    doctor_method_id?: number;
    end_date?: Date;
    no_of_doctors?: number;
    no_of_slots?: number;
    start_date?: Date;
}

export interface DeleteAvailableSpeciality {
    availableSpecialityId?: number;
    avilableDateLists?: ANY;
    dateListId?: number;
    transaction: Transaction;
    userId?: number;
}

export interface UpdateSpecialityReqI {
    _authorization: string;
    availableDoctor?: models.sch_available_doctorsI[];
    availableSpeciality?: models.sch_available_specialitiesI;
    dateListId?: number;
    doctorDateListIds?: number[];
    doctorMethodId?: number;
    doctors?: number[];
    endDate?: Date;
    endDateFromDateList?: Date;
    endDateString?: string;
    existingDoctorMethod?: number;
    facilityLocationId?: number;
    faciltyTiming?: models.facility_timingsI[];
    id?: number;
    mins?: number;
    noOfDoctors?: number;
    noOfSlots?: number;
    numberOfAvailableSpecialities?: models.sch_recurrence_date_listsI[];
    speciality?: models.specialitiesI;
    specialityId?: number;
    startDate?: Date;
    startDateFromDateList?: Date;
    startDateString?: string;
    transaction: Transaction;
    userId?: number;
    checkTimingData?: CheckFacilityTimingI;
}
export interface FormatDatesCriteriaI {
    daysList: number[];
    endDateString: string;
    endingCriteria: string;
    numberOfRecurrsion?: number;
    recurrenceEndDateString?: string;
    recurrenceEndingCriteriaId?: number;
    startDateString: string;
    transaction: Transaction;
}

export interface CreateAvailableDoctorsI {
    allowMultipleAssignments?: boolean;
    checkForRecurrence?: boolean;
    doctorMethodId?: number;
    doctors?: number[];
    endDate?: string;
    endDateString?: string;
    endingCriteria?: string;
    facilityLocationId?: number;
    formatDatesCriteria?: FormatedDatesI[];
    formatedDays?: number[];
    id?: number;
    mins?: number;
    newAvailableSpecialityId?: number;
    noOfDoctors?: number;
    noOfSlots?: number;
    recurrenceEndingCriteriaId?: number;
    specialityId?: number;
    startDate?: string;
    startDateString?: string;
    transaction: Transaction;
    userId?: number;
    isProviderAssignment?:boolean
    specialityName?:string
    facilityLocationName?:string
    timezone?: number;
}

export interface CreateDaysAndDatesI {
    doctorId?: number;
    doctorMethod?: string;
    doctorMethodId?: number;
    endAfterOccurences: number;
    endDate: string;
    endDateForRecurrence: string;
    endingCriteria: string;
    facilityLocationId: number;
    formatedDays: number[];
    newAvailableDoctorId?: number;
    newAvailableSpecialityId: number;
    noOfDoctors?: number;
    noOfSlots?: number;
    recurrenceEndingCriteriaId?: number;
    isProviderAssignment?: boolean;
    slots?: number;
    specialityId: number;
    startDate: string;
    transaction: Transaction;
    userTimings: models.user_timingsI[];
}

export interface getSpecialityAssignmentsReqObjI {
    end_date: Date;
    facility_location_ids: number[];
    speciality_ids: number[];
    start_date: Date;
}

export interface UpdateSpecialityAssignmentsPreCheckReqObjI {
    available_doctor_id: number;
    available_speciality_id: number;
    date_list_id: number;
    user_id: number;
}

export interface SpecificAppointmentsReqObjI {
    available_doctor_id: number;
    end_date: string;
    start_date: string;
}

export interface UpdateSpecialityAssignmentsPreCheckResponseObjI {
    endDateTime: Date;
    startDateTime: Date;
}

export interface UpdateRequiredAvailableDoctorIdsObjI {
    assigned?: boolean;
    available_doctor_id: number;
    doctor_id: number;
}

export interface UpdateleftOversObjI {
    assigned?: boolean;
    id?: number;
}
export interface AvailableAppointmentsReturnObjI {
    available_doctor_id: number;
    available_speciality_id: number;
    doctor_first_name: string;
    doctor_id: number;
    doctor_last_name: string;
    doctor_middle_name: string;
    first_name: string;
    id: number;
    last_name: string;
    middle_name: string;
    patient_id: number;
    scheduled_date_time: Date;
    speciality_id: number;
    time_slot: number;
}

export interface GetAvailableAppointmentsReqObjI {
    available_speciality_id?: number;
    user_id?: number;
}

export interface checkIsProviderAlreadyAssignedI {
    startDate: string;
    endDate: string;
    timeZone: number;
    doctors: number[];
    availableSpecialityId?: number;
}

export interface CheckFacilityTimingConflictI {
    facilityStartDate?: Date;
    facilityEndDate?: Date;
    doctorStartDate?: Date;
    doctorEndDate?: Date;
    specialityName: String;
    facilityLocationName: String;
    facilityName: String;
    userId?: number;
}

export interface CheckFacilityTimingI {
    isMultiple: boolean;
    specialityName: String;
    specialityId?: number;
    facilityLocation: models.facility_locationsI;
    conflict?: CheckFacilityTimingConflictI;
}