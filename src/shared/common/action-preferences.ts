export interface AddActionPreferencesI {
    created_by?: number;
    id?: number;
    type_id: number;
    user_id?: number;
}

export interface FacilityLocationI {
    action_preference_id?: number;
    id?: number;
    origin_id: number;
    taget_id: number;
}

export interface UpdateActionPreferencesI {
    action_preference_id?: number;
    facility_location?: FacilityLocationI[];
    facility_location_type?: number;
    type_id?: number;
    user_id?: number;
}
