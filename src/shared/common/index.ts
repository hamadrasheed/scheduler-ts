import * as Sequelize from 'sequelize';

// tslint:disable-next-line: no-any
export type ANY = any;

export interface Filter {
    /** Where clause */
    [key: string]: ANY;
}

export type SequelizeTransaction = Sequelize.Transaction;

export interface Where {
    [key: string]: ANY;
}

export interface Options {
    [key: string]: ANY;
}

export interface Paginate {
    page?: number;
    paginate?: number;
}

interface FileOptionI {
    contentType: ANY;
    filename: ANY;
    mimeType: ANY;
}

interface FileDataI {
    mimeType: ANY;
    options: FileOptionI;
    value: ANY;
}

export interface FileDataReqI {
    chiropractor_signature?: FileDataI;
    file?: FileDataI;
    patient_sign?: FileDataI;
}

interface AuthorizationI {
    Authorization: string;
}

export interface GenericQueryParamsI { [key: string ]: number | string | null | undefined | [string | number] ; }

export interface GenericHeadersI {
    [key: string]: ANY;
    headers?: AuthorizationI;
    params?: GenericQueryParamsI;
}

export type GenericReqObjI = ANY;

export interface UserTimingsI {
    created_at?: Date;
    created_by?: number;
    day_id?: number;
    deleted_at?: Date;
    end_time?: Date;
    end_time_isb?: Date;
    facility_location_id?: number;
    id?: number;
    start_time?: Date;
    start_time_isb?: Date;
    time_zone?: number;
    time_zone_string?: string;
    updated_at?: Date;
    updated_by?: number;
    user_id?: number;
}

export interface DocSpecialitiesI {
    comments?: string;
    created_at?: Date;
    created_by?: number;
    default_name?: string;
    deleted_at?: Date;
    description?: string;
    has_app?: number;
    id?: number;
    is_available?: number;
    is_create_appointment?: number;
    is_defualt?: number;
    name?: string;
    over_booking?: number;
    speciality_key?: string;
    time_slot?: number;
    updated_at?: Date;
    updated_by?: number;
}

export interface GeneralResponseDataI<I> {
    data: unknown[] | I;
    total?: number;
}

export interface GeneralApiResponseI<I> {
    message: string;
    result: GeneralResponseDataI<I>;
    status: boolean;
}

export * from './unavailable-doctor-notification.types';
export * from './appointment.types';
export * from './color-code.types';
export * from './user.types';
export * from './available-speciality.types';
export * from './available-doctor.types';
export * from './unavailable-doctor.types';
export * from './doctor_instruction_for_facility_locationsI';
export * from './master.types';
