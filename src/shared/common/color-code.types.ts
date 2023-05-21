export interface AddColorCodesForNewFacilityReqObjI {
    facility_location_id: number;
}

export interface AddColorCodesForNewSpecialityReqObjI {
    speciality_id: number;
}

export interface AddColorCodesForNewUserReqObjI {
    facility_locations: number[];
    specialities: number[];
    user_id: number;
}

export interface FormatedColorCodesI {
    code: string;
    object_id: number;
    type_id: number;
    user_id: number;
}

export interface UpdateColorCodeReqObjI {
    color_code?: string;
    id?: number;
    object_id?: number;
    type_id?: number;
    user_id?: number;
}

export interface setToDefaultReqObjI {
    color_code?: string;
    object_ids?: number[];
    type_id?: number;
    user_id?: number;
}
