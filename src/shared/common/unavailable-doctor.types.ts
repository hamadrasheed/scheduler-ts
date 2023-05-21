import { NumberDataType } from "sequelize/types";

export interface UnAvailableDoctorsReqObjI {
    description?: string;
    doctor_id?: number;
    end_date?: string;
    id?: NumberDataType;
    start_date?: string;
    subject?: string;
    user_id?: number;
}

export interface UpdateUnAvailableDoctorsReqObjI {
    approval_status: number;
    id?: number;
    updated_by?: number;
    user_id?: number;
}

export interface DeleteUnAvailableDoctorsReqObjI {
    comments?: string;
    id?: number;
    user_id?: number;
}

export interface UnAvailableDoctorsResponseObjI {
    approval_status?: number;
    description: string;
    doctor_id: number;
    end_date: string;
    start_date: string;
    subject: string;
    updated_by?: number;
}
