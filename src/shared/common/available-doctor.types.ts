import { Transaction } from 'sequelize/types';

import * as models from '../../models';

import { ANY } from '.';

export interface DoctorDataObjI {
    date_list_id?: number;
    days: number[];
    doctor_id: number;
    end_after_occurences: number;
    end_date: string;
    end_date_for_recurrence: string;
    ending_criteria?: string;
    facility_location_id: number;
    id?: number;
    recurrence_ending_criteria_id: number;
    start_date: string;
}

export interface GetFreeSlotsoOfDoctorsBodyI {
    doctor_id: number;
    end_date: string;
    facility_location_ids: number[];
    start_date: string;
    time_zone?: number;
}
export interface DoctorFreeSlotsI {
    facility_location_id: number;
    slot_time: Date;
}

export interface AvailableDoctorsReqObjI {
    available_doctor?: DoctorDataObjI;
    doctor?: DoctorDataObjI;
    doctor_method: string;
    user_id: number;
}

export interface AppointmentsAgainstAavailablityResponseDataI {
    appointment_billable?: boolean;
    appointment_id?: number;
    appointment_status?: string;
    appointment_status_slug?: string;
    available_doctor_id?: number;
    available_speciality_id?: number;
    case_id?: number;
    doctor_id?: number;
    doctor_info?: models.user_basic_info;
    patient_id?: number;
    patient_info?: models.kiosk_patient;
    scheduled_date_time?: Date;
    speciality_id?: number;
    time_slots?: number;
}

export interface FiltersAvailableDoctorsI {
    color?: string;
    facility_location_id?: number;
    user_timings?: models.user_timingsI;
}

export interface isDoctorTimingSychronizedI {
    end_date: string;
    start_date: string;
}

export interface FiltersAvailableDoctorsResponseI {
    cell_phone_no: string;
    doc_email: string;
    first_name: string;
    id: number;
    last_name: string;
    middle_name: string;
    phone_extension: string;
    specialities: FiltersAvailableDoctorsI;
    URI: string;
    user_id: number;
}

export interface GetAllAvailableDoctorsReqObjI {
    end_date: Date;
    facility_location_id: number;
    speciality_id: number;
    start_date: Date;
    user_id: number;
}

export interface GetAllAvailableDoctorsMultiSpecReqObjI {
    end_date: Date;
    facility_location_id: number;
    speciality_ids: number[];
    start_date: Date;
    user_id: number;
}

export interface DeleteAvailableDoctorsReqObjI {
    _authorization?: string;
    appointmentAgainstDoctor?: ANY;
    availableDoctorId?: number;
    dateListId?: number;
    transaction: Transaction;
    userId?: number;
}

export interface getDoctorAssignmentsI {
    doctor_ids: number[];
    end_date: Date;
    facility_location_ids: number[];
    speciality_ids: number[];
    start_date: Date;
    user_id: number;
}

export interface GetFilterDoctorReqObjI {
    doctor_id?: number;
    end_date: Date;
    facility_location_ids: number[];
    start_date: Date;
    user_id: number;
}

export interface ModifiedAvailableDoctorsReqObjI {
    date_list_id: number;
    doctor_id: number;
    end_date: Date;
    facility_color: string;
    facility_id: number;
    facility_name: string;
    id: number;
    is_facility_supervisor: boolean;
    start_date: Date;
}

export interface DoctorResponseObjI {
    assignments: ModifiedAvailableDoctorsReqObjI;
    email: string;
    speciality_id: 2;
    unavailability: string;
    user_id: number;
    userInfo: models.user_basic_infoI;
}

export interface DoctorAssignmentResponseObjI {
    address: string;
    cell_phone_no: string;
    dayList: string;
    doc_email: string;
    facility_color: string;
    facility_location_id: number;
    first_name: string;
    id: number;
    last_name: string;
    middle_name: string;
    name: string;
    phone_extension: string;
    region: string;
    speciality_id: number;
    uri: string;
    user_id: number;
}

interface UserTimingsI {
    created_at: Date;
    created_by: number;
    day_id: number;
    deleted_at: Date;
    end_time: Date;
    end_time_isb: Date;
    facility_location_id: number;
    id: number;
    start_time: Date;
    start_time_isb: Date;
    time_zone: number;
    time_zone_string: string;
    updated_at: Date;
    updated_by: number;
    user_id: number;
}

export interface SpecialitiesDesireObjI {
    color: string;
    facility_location_id: number;
    user_timings: UserTimingsI;
}

export interface GetAppointmentsResponseDataI {
    chart_no: string;
    doctor_first_name: string;
    doctor_last_name: string;
    doctor_middle_name: string;
    first_name: string;
    id: number;
    last_name: string;
    middle_name: string;
    patient_id: number;
    scheduled_date_time: Date;
    time_slots: number;
}
