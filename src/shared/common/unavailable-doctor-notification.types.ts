import * as models from '../../models';
export interface GetUnAvailableDoctorsNotificationReqObjI {
    facility_location_ids: number[];
    user_id: number;
}

export interface GetUnAvailableDoctorsNotificationResponseObjI {
    address?: string;
    appointment_count?: number;
    cell_no?: string;
    city?: string;
    created_at?: Date;
    created_by?: number;
    day_list?: string;
    deleted_at?: Date;
    email?: string;
    ext_no?: string;
    facility?: models.facilitiesI;
    facility_color?: string;
    facility_id?: number;
    facility_location_id?: number;
    faciltyTiming?: models.facility_timingsI[];
    fax?: string;
    floor?: string;
    id?: number;
    is_accessible?: number;
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
    state?: string;
    updated_at?: Date;
    updated_by?: number;
    zip?: string;
}
