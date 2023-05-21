import { facility_timingsI, users, user_facilityI } from '../../models';

import { ANY } from '.';

export interface GetUserInfoI {
    address?: string;
    cell_no?: string;
    city?: string;
    color?: string;
    Specility_qualifier?:string;
    created_at?: Date;
    created_by?: number;
    facility_qualifier?:string;
    day_list?: string;
    deleted_at?: Date;
    docId?: number;
    doctor?: ANY;
    email?: string;
    ext_no?: string;
    facility_id?: number;
    facility_location?: ANY;
    facility_location_id?: number;
    provide_title?:string | null;
    facility_name?: string;
    faciltyTiming?: facility_timingsI[];
    fax?: string;
    floor?: string;
    id?: number;
    is_main?: number;
    lat?: number;
    long?: number;
    name?: string;
    office_hours_end?: Date;
    office_hours_start?: Date;
    phone?: string;
    place_of_service_id?: number;
    region_id?: string;
    same_as_provider?: number;
    specialities?: ANY;
    state?: string;
    updated_at?: Date;
    updated_by?: number;
    user_id?: number;
    user_timings?: ANY;
    userFacilty?: user_facilityI[];
    users?: users;
    zip?: string;

}

export interface UserRoleI {

    comment?: string;
    created_at?: Date;
    created_by?: number;
    default?: number;
    deleted_at?: Date;
    guard_name?: string;
    id?: number;
    medical_identifier?: number;
    name?: string;
    qualifier?: string;
    slug?: string;
    updated_at?: Date;
    updated_by?: Date;
}

export interface ModelRoleI {

    model_id?: number;
    model_type?: string;
    role?: UserRoleI;
    role_id?: number;
}

export interface GetUserInfoBySpecialitieseI {
    created_at?:string;
    created_by_ids?:number[];
    doctor_ids?: number[];
    facility_location_ids?: [];
    is_provider_calendar?: boolean;
    is_single?: boolean;
    over_booking?: number;
    page?: number;
    pagination?: boolean;
    per_page?: number;
    speciality_id?: number;
    speciality_ids?: number[];
    speciality_name?: string;
    time_slot?: number;
    user_id?: number;
    updated_at?:string;
    updated_by_ids?:number[];
}

export interface GetDoctorsDetailQueryParamI {
    doctor_id?: number;
    user_id?: number;
}


export interface getMaxMinOfFacilityI {
    facility_location_ids?: number[];
    user_id?: number;
}


export interface DeleteAllAssignmentAndAppointmentBodyI {
    cancel: boolean;
    reschedule: boolean;
    user_id: number;
}

export type DeleteAllAssignmentAndAppointmentResponseI = ANY;

export interface AppointmentUpdateObjI {
    cancelled?: boolean;
    pushed_to_front_desk?: boolean;
}

export interface GetUserInfoBySpecialitieseResponseI {
    docs: GetUserInfoI[];
    pages: number;
    total: number;
}

export interface KioskPatientReqI {
    id?: number;
    user_id?: number;
}

export interface GetUserInfoByFacilitiesBodyI {
    created_at?:string;
    created_by_ids?:number[];
    doctor_ids?: number[];
    facility_location_ids: number[];
    facility_location_name?: string;
    filters?: string;
    is_provider_calendar?: boolean;
    page: number;
    pagination?: boolean;
    per_page: number;
    speciality_ids?: number[];
    user_id: number;
    updated_at?:string;
    updated_by_ids?:number[];
}

export interface UpdateSpecialityTimeSlotsSpecialitiesI {
    id: number;
    time_slot: number;
}

export interface UpdateSpecialityTimeSlotsBodyI {
    specialities: UpdateSpecialityTimeSlotsSpecialitiesI[];
    user_id: number;
}

export interface FormatedSpecialitiesI {
    id: number;
    new_time_slot: number;
    old_time_slot: number;
}

export interface GetUserInfoByFacilitiesResponseI {
    docs: GetUserInfoI[];
    pages: number;
    total: number;
}

export interface GetDoctorsInfoI {
    doctor_ids?: number[];
    facility_location_ids: number[];
    is_provider_calendar?: boolean;
    page: number;
    pagination?: boolean;
    per_page: number;
    provider_name?: string;
    provider_speciality?: string;
    speciality_ids?: number[];
    user_id: number;
    is_single?:boolean
}
