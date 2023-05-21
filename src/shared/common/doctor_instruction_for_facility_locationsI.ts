export interface GetDoctorInstructionsI {
    doctor_ids?: number[];
    end_date?: string;
    start_date?: string;
    user_id?: number;

}

export interface AddDoctorInstructionsI {
    date: Date;
    doctor_id: number;
    facility_location_id: number;
    id?: number;
    instruction: string;
    user_id: number;

}
