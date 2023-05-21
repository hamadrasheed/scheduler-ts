
import * as models from '../../models/';
import { facilitiesI, medical_identifiersI, sch_appointment_cpt_codesI, sch_appointment_typesI, visit_sessionsI } from '../../models/';

import { ANY } from '.';

export interface GetAppointmentsBodyI {
    appointment_type: string;
    filters: {
        patient_ids: number[];
        appointment_status_ids?: number[];
        appointment_type_ids: number[];
        case_ids: number[];
        case_type_ids: number[];
        doctor_ids: number[];
        patient_status_ids: number[];
        speciality_ids: number[];
        patient_name: string,
        end_date: string;
        start_date: string;
        facility_location_ids: number[];
        comments: string;
        filter_with_or: boolean;
        created_at?:string;
        updated_at?:string;
        created_by_ids?:number[];
        updated_by_ids?:number[]
    };
    user_id: number;
    per_page: number;
    paginate: boolean;
    page: number;
}

export interface GenericWhereClauseForAppointmentsI {
    patientStatusIds: number[];
    facilityLocationIds: number[];
    specialityIds: number[];
    doctorIds: number[];
    patientId: number[];
    patientName: string;
    appointmentTypeIds: number[];
    appointmentStatusIds: number[];
    caseTypeIds: number[];
    caseIds: number[];
    startDate: string,
    endDate: string,
    appointmentListingType: string;
    comments: string;
    user_id?: number;
    filterType?: string;
    perPage: number;
    paginate: boolean;
    page: number;
    updatedByIds: number[];
    createdByIds: number[];
    updatedAt: string;
    createdAt: string;
}

export interface GetAllDoctorSpecialityAppointmentsI {
        id: number;
        start_date_time: string;
        case_id: number;
        patient_id: number;
        evaluation_date_time: string;
        available_speciality_id: number;
        priority_id: number;
        time_slot: number;
        appointment_title: number;
        appointment_type_id: number;
        confirmation_status: number;
        comments: string;
        first_name: string;
        date_of_check_in: string;
        time_of_check_in: string;
        middle_name: string;
        last_name: string;
        picture: string;
        facility_location_id: number;
        speciality_id: number;
        available_doctor_id: number;
        doctor_id: number;
        billable: boolean;
        document_uploaded: boolean;
        doctor_first_name: string;
        doctor_middle_name: string;
        doctor_last_name: string;
        visit_session_state_slug: string;
        visit_session_state_name: string;
        case_type_id: number;
        case_type: string;
        last_visit_session_deleted: Date;
}

export interface GenericWhereClauseForAppointmentsReturnObjectsI {
    whereClause: string;
    requiredCondition: string;
    requiredConditionForDoctor: string;
    applyLimit: string;
    dynamicQueryClause?: DynamicQueryClausesForAppointmentsI; 
}

export interface DynamicQueryClausesForAppointmentsI {
    queryColumns: string;
    queryJoins: string;
    queryOrderBy: string;
}

export interface GetAllAppointmentsBodyI {
    facility_location_ids?: number;
    id?: number;
    page?: number;
    per_page?: number;

}

export type GetAllAppointmentsResponseI = ANY;

export interface IsTodayAppointmentBodyI {
    appointment_id: number;
    user_id: number;
}

export type IsTodayAppointmentResponseI = ANY;

export interface FormattedDateForSugessionI {
    dateDay?: number;
    dateString?: string;
    end?: Date;
    start?: Date;
}

export interface AutoResolveAppointmentsBodyI {
    appointment_ids: number[];
    same_clinic: ANY;
    unavailibility_end_date: string;
    user_id: number;
}

export type AutoResolveAppointmentsResponseI = ANY;

export interface GetTodayAppointmentOfPatientBodyI {
    case_id: number;
    end_date: Date;
    start_date: Date;
    user_id: number;
}

export type GetTodayAppointmentOfPatientResponseI = ANY;

export interface GetAllAppointmentPushedToFrontDeskBodyI {
    appointment_type_ids?: number[];
    case_ids?: number[];
    case_type_ids?: number[];
    doctor_ids?: number[];
    end_date?: string;
    facility_location_ids?: number[];
    page?: number;
    paginate?: boolean;
    per_page?: number;
    speciality_ids?: number[];
    start_date?: string;
    user_id?: number;
}

export type GetAllAppointmentPushedToFrontDeskResponseI = ANY;

export interface CancelAppointmentsBodyI {
    appointment_ids?: number[];
    cancelled_comments?: string;
    is_redo?: boolean;
    origin_clinic_id?: number;
    request_from_php?: boolean;
    target_clinic_id?: number;
    trigger_socket?: boolean;
    user_id?: number;
}
export interface CancelAppointmentsWithAssignmentBodyI {
    appointment_ids?: number[];
    available_doctor_ids?: number[];
    user_id?: number;
}
export type CancelAppointmentsWithAssignmentResponseI = ANY;

export interface singleAppointmentBodyI {
    appointment_id?: number[];
    user_id?: number;
}

export interface GetSingleAppointmentBodyI {
    id?: number;
    appointment_type?: string;
    user_id?: number;
}
export interface CancelSoftPatientAppointmentsBodyI {
    patient_ids?: number[];
    user_id?: number;
}

export type CancelAppointmentsResponseI = ANY;

export interface DeleteAppointmentsBodyI {
    appointment_ids?: number[];
    case_ids?: number[];
    comments?: string;
    from_kiosk?: boolean;
    user_id?: number;
}

export type DeleteAppointmentsResponseI = ANY;

export interface ForwardAppointmentsToFDBodyI {
    appointment_ids?: number[];
    origin_clinic_id?: number;
    pushed_to_front_desk_comments?: string;
    target_clinic_id?: number;
    user_id?: number;
}

export type ForwardAppointmentsToFDResponseI = ANY;

export interface CheckInitialBodyI {
    case_id: number;
    patient_id: number;
    speciality_id: number;
}

export type CheckInitialResponseI = ANY;

export interface ResolveAppointmentsBodyI {
    appointment_ids?: number[];
    available_doctor_id?: number;
    facility_location_tpye?: string;
    unavailibility_end_date?: Date;
    user_id?: number;
}

export interface GetAppointmentsAgainstAvailablityBodyI {
    available_doctor_ids?: number[];
    available_speciality_id?: number;
    availablity_check?: string;
    date_list_ids?: number[];
    user_id?: number;
}

export type GetAppointmentsAgainstAvailablityResponseI = ANY;

export interface GetNextAndLastAppointmentBodyI {
    case_ids: number;
    user_id: number;
}

export interface GetAppointmentsAgainstAvailablityObjI {
    availableDoctorId?: number;
    availableSpecialityId?: number;
    dateListId?: number[];
}

export interface GetAppointmentListBodyI {
    appointment_status_ids?: number[];
    appointment_type_ids?: number[];
    case_id?: number;
    case_ids?: number[];
    case_type_ids?: number[];
    doctor_ids?: number[];
    end_date?: string;
    facility_location_ids?: number[];
    page?: number;
    paginate?: boolean;
    patient_id?: number;
    patient_name?: string;
    patient_status_ids?: number[];
    per_page?: number;
    speciality_ids?: number[];
    start_date?: string;
    user_id?: number;
}

export interface OptimizedListV1ReqBodyI {
    appointmentStatusIds?: number[];
    appointmentTypeIds?: number[];
    caseIds?: number[];
    caseTypeIds?: number[];
    comments?: string;
    dateFrom?: string;
    dateTo?: string;
    doctorIds?: number[];
    endDate?: string;
    endDateString?: string;
    facilityLocationIds?: number[];
    page?: number;
    paginate?: boolean;
    patientId?: number;
    patientName?: string;
    patientStatusIds?: number[];
    per_page?: number;
    perPage?: number;
    providerIds?: number[];
    specialityIds?: number[];
    startDate?: string;
    startDateString?: string;
    user_id?: number;
}

export interface GetPatientCancelledAppointmentsV1ReqBodyI {
    appointmentStatusIds?: number[];
    caseIds?: number[];
    endDate?: string;
    facilityLocationIds?: number[];
    page?: number;
    paginate?: boolean;
    patientId?: number;
    patientName?: string;
    per_page?: number;
    perPage?: number;
    specialityIds?: number[];
    startDate?: string;
    user_id?: number;
}

export interface OptimizedGetAllPatientReqBodyI {
    appointmentStatusId?: number,
    caseId?: number,
    endDateString?: string,
    isCancelledAppointments?: boolean,
    page?: number,
    paginate?: boolean,
    patientId?: number,
    perPage?: number,
    practiceLocationId?: number,
    specialityId?: number,
    startDateString?: string,
    visitStatusId?: number,
}
export interface GetAppointmentListByCaseBodyI {
    case_id?: number;
    facility_location_id?: number;
    scheduled_date_time?: string;
    speciality_id?: number;
    status_id?: number;
}

export interface GetSuggestionBodyI {
    appointment_title: string;
    case_id?: number;
    case_type?: string;
    case_type_id?: number;
    dates: ANY;
    days: number[];
    doctor_id?: number;
    end_date: string;
    end_time: string;
    facility_location_id?: number;
    over_booking: number;
    patient_id?: number;
    priority_slug: string;
    speciality_id?: number;
    start_date: string;
    start_time: string;
    status_id?: number;
    type_id?: number;
}

export interface GetTimeSlotOfAssignmentI {
    end_date: Date;
    no_of_doctors: number;
    no_of_slots: number;
    start_date: Date;
}

export interface UpdateAppointmentForIosI {
    confirm: boolean;
    doctor_id: number;
    id: number;
    slug: string;
    specialityId: number;
    startDate?: Date;
    superAdminId: number;
    user_id: number;
}

export interface GetAvailabilitiesReqI {
    end_date: string;
    facility_location_id?: number;
    speciality_id: number;
    start_date: string;
}

export interface GetAppointmentListForHealthAppBodyI {
    case_id?: number;
    check?: string;
    date?: string;
    page?: number;
    paginate?: string;
    patient_id?: number;
    per_page?: number;
}

export interface GetDoctorAppointmentsBodyI {
    doctor_ids?: number[];
    end_date?: string;
    facility_location_ids?: number[];
    speciality_ids: number[];
    start_date?: string;
    user_id?: number;

}

export interface GetDoctorAppointmentsByIdBodyI {
    doctor_id?: number;
    user_id?: number;
}

export interface GetPatientAppointmentsBodyI {
    appointment_status_id?: number[];
    case_id?: number;
    end_date: string;
    patient_id: number;
    practice_location_id?: number[];
    speciality_id: number[];
    start_date: string;
    user_id?: number;
}

export interface getSpecialityAppointmentsBodyI {
    end_date: string;
    facility_location_ids: number[];
    speciality_ids: number[];
    start_date: string;
    user_id: number;
}

export interface PatientCaseObjI {
    case_ids?: number[];
    current_date?: string;
    status_ids?: ANY;
}

export interface AddAppointmentBodyI {
    appointment_type_id?: number;
    billable?: boolean;
    case_id?: number;
    case_type_id?: number;
    cd_image?: boolean;
    comments?: string;
    confirm?: number;
    confirmation_status?: number;
    cpt_codes?: number[];
    days?: number[];
    doctor_id?: number;
    end_after_occurences?: number;
    end_date_for_recurrence?: Date;
    facility_location_id?: number;
    is_soft_registered?: boolean;
    is_speciality_base?: boolean;
    is_transferring_case?: boolean;
    is_transportation: boolean;
    patient_id?: number;
    physician_id?: number;
    priority_id?: number;
    reading_provider_id?: number;
    recurrence_ending_criteria_id?: number;
    session_status_id?: number;
    speciality_id?: number;
    start_date_time?: string;
    technician_id?: number;
    template_id?: number;
    template_type?: string;
    time_slot?: number;
    time_zone?: number;
    transportation?: models.sch_transportationI[];
    undo_appointment_status_id?: number;
    user_id?: number;
}

export interface AddAppointmentWithCptCodesBodyI{
    appointment_id: number;
    cpt_codes: number[];
    time_zone: number;
    user_id: number
}
export interface UpdateAppointmentBodyI {
    appointment_title?: string;
    appointment_type_id?: number;
    case_id?: number;
    cd_image?: boolean;
    comments?: string;
    confirmation_status?: number;
    cpt_codes: number[];
    doctor_id?: number;
    facility_location_id?: number;
    id?: number;
    is_speciality_base?: boolean;
    is_transferring_case?: boolean;
    is_transportation: boolean;
    patient_id?: number;
    physician_id?: number;
    reading_provider_id?: number;
    speciality_id?: number;
    start_date_time?: string;
    technician_id?: number;
    time_slot?: number;
    time_zone?: number;
    transportation?: updateTransportationsI[];
    update_initial_appointment_confirmation: boolean;
    user_id?: number;
}

export interface UpdateCptCodesI {
    billing_code_id?: number;
    id?: number;
    is_deleted?: boolean;
}

interface scheduledDateTime {
    [key: string]: (string | Date);
}

export interface FilterI {
    cancelled?: boolean;
    case_id?: number;
    deleted_at?: Date;
    id?: ANY;
    limit?: number;
    order?: string[][];
    patient_id?: number;
    pushed_to_front_desk?: boolean;
    scheduled_date_time?: scheduledDateTime;
}

export interface InitialWhereFilterI {
    cancelled?: boolean;
    case_id?: number;
    deleted_at?: Date;
    facility_location_id?: number;
    id?: ANY;
    patient_id?: number;
    pushed_to_front_desk?: boolean;
    speciality_id?: number;
    type_id?: number;

}

export interface FreeSlotsI {
    count?: number;
    startDateTime?: Date;
}

export interface CaseObjectI {
    case_id: number;
    current_date: string;
}

export interface GetAppointmentListSpecialityObjI {
    speciality?: string;
    speciality_id?: number;
    time_slot?: number;
}

export type GetAppointmentListResponseI = ANY;

export interface GetAppointmentListFinalI {
    appointment_comments?: string;
    appointment_confirmation_status?: number | boolean;
    appointment_cpt_codes?: sch_appointment_cpt_codesI[];
    appointment_id?: number;
    appointment_status?: string;
    appointment_status_id?: number;
    appointment_status_slug?: string;
    appointment_time?: Date;
    appointment_title?: string;
    appointment_type_id?: number;
    billable?: boolean;
    case_id?: number;
    case_status?: string;
    case_type_id?: number;
    case_type_name?: string;
    cd_image?: boolean;
    doctor_first_name?: string;
    doctor_id?: number;
    doctor_last_name?: string;
    doctor_middle_name?: string;
    duration?: number;
    facility?: facilitiesI;
    facility_location_id?: number;
    facility_location_name?: string;
    patient_first_name?: string;
    patient_id?: number;
    patient_last_name?: string;
    patient_middl_name?: string;
    patient_picture?: string;
    patient_session?: ANY;
    patient_status?: string;
    patient_status_slug?: string;
    physician?: models.physicianI;
    priority_id?: number;
    provider_title?: string;
    reading_provider?: models.usersI;
    reading_provider_id?: number;
    speciality_id?: number;
    speciality_name?: string;
    technician?: models.usersI;
    time_slot?: number;
    transportations?: models.sch_transportationI[];
    visit_type?: string;
    visit_type_id?: number;
    visitSessions?: visit_sessionsI;
}

export interface CheckedInPatientsI {
    age?: number;
    appointment_id?: number;
    by_health_app?: number;
    case_id?: number;
    case_type?: string;
    case_type_id?: number;
    category_id?: number;
    cell_phone?: number;
    created_at?: Date;
    date_of_check_in?: Date;
    dob?: Date;
    first_name?: string;
    gender?: string;
    height_ft?: number;
    height_in?: number;
    home_phone?: number;
    id?: number;
    is_law_enforcement_agent?: boolean;
    is_pregnant?: boolean;
    key?: number;
    language?: string;
    last_name?: string;
    meritial_status?: string;
    middle_name?: string;
    need_translator?: number;
    notes?: boolean;
    patient_id?: number;
    patient_not_seen_reason?: number;
    profile_avatar?: string;
    purpose_of_visit_id?: number;
    ssn?: number;
    status?: string;
    status_id?: number;
    time_of_check_in?: Date;
    updated_at?: Date;
    user_id?: number;
    weight_kg?: number;
    weight_lbs?: number;
    work_phone?: number;
}

export interface ConfirmDescriptionI {
    action_performed?: string;
    appointment_duration?: number;
    appointment_status?: number;
    appointment_title?: string;
    appointmentCptCodes?: sch_appointment_cpt_codesI[];
    appointmentType?: sch_appointment_typesI,
    appointmentStatus?: ANY;
    appointmentVisit?: visit_sessionsI;
    available_doctor_id?: number;
    available_speciality_id?: number;
    availableDoctor?: ANY;
    availableSpeciality?: ANY;
    billable?: boolean;
    cancelled?: boolean;
    case?: any;
    case_id?: number;
    case_type_id?: number;
    cd_image?: boolean;
    checked_in_time?: Date;
    checked_out_time?: Date;
    comments?: string;
    confirm_description?: string;
    confirmation_status?: number | boolean;
    created_at?: Date;
    created_by?: number;
    date_list_id?: number;
    deleted_at?: Date;
    evaluation_date_time?: Date;
    id?: number;
    in_session_time?: Date;
    is_active?: boolean;
    is_transportation?: boolean;
    key?: number;
    medicalIdentifiers?: medical_identifiersI[];
    origin_facility_id?: number;
    patient?: ANY;
    patient_id?: number;
    patient_status?: string;
    physicianClinic?: models.physician_clinicsI;
    priority?: ANY;
    priority_id?: number;
    provider_title?: string;
    pushed_to_front_desk?: boolean;
    reading_provider?: models.usersI;
    reading_provider_id?: number;
    recurrence_id?: number;
    scheduled_date_time?: Date;
    status_id?: number;
    target_facility_id?: number;
    technician?: models.usersI;
    time_slots?: number;
    transportations?: models.sch_transportationI[];
    type_id?: number;
    updated_at?: Date;
    updated_by?: number;
}

export interface PatientSessionsI {
    appointment_id: number;
    case_id: number;
    created_at: Date;
    date_of_check_in: Date;
    id: number;
    key: number;
    status: string;
    status_id: number;
    time_of_check_in: Date;
    updated_at: Date;
}

export interface CasePatientI {
    case_type_id: number;
    category_id: number;
    company_name: string;
    dob: Date;
    id: number;
    key: number;
    patient_id: number;
    patient_sessions: PatientSessionsI[];
    purpose_of_visit_id: number;
    status: string;
    type: string;
    url: string;
}

export interface KioskObjI {
    case_patients: CasePatientI[];
    checked_in_patients: CheckedInPatientsI[];
}

export interface SpecialityObjForfacilityWiseMappingI {
    appointments?: ANY[];
    date_list_id?: number;
    doctor_id?: number;
    end_date?: Date;
    facility_location_id?: number;
    facility_location_qualifier?: string;
    facility_qualifier?: string;
    id?: number;
    speciality_id?: number;
    speciality_key?: string;
    speciality_name?: string;
    speciality_qualifier?: string;
    start_date?: Date;
    supervisor_id?: number;
}

export interface FacilityWiseMappingI {
    availibilities: SpecialityObjForfacilityWiseMappingI[];
    color: string;
    facility_id: number;
    facility_name: string;
    facility_qualifier?: string;
}

export interface AssignmentObjectForSlots {
    appointments?: models.sch_appointmentsI[];
    available_speciality_id?: number;
    date_list_id?: number;
    end_date?: Date;
    facility_location_id?: number;
    id?: number;
    no_of_doctors?: number;
    no_of_slots?: number;
    start_date?: Date;
}

export interface updateAppointmentStatusReqI {
    appointment_type_id?: number;
    case_type_id: number;
    confirm: boolean;
    current_date_time: Date;
    doctor_id?: number;
    facility_location_id?: number;
    id: number;
    is_speciality_base?: boolean;
    is_transferring_case?: boolean;
    request_from_ios?: boolean;
    speciality_id: number;
    time_zone?: number;
    user_id: number;
}

export interface dataForGetAllTemplatesApiI {
    case_type_id: number[];
    facility_location_id: number[];
    filter: number;
    page: number;
    pagination: number;
    per_page: number;
    specialty_id: number[];
    user_id: number;
    visit_type_id: number[];
}
export interface FormattedAvailablitiesI {
    date_list_id: number;
    doctor_id?: number;
    end_date?: Date;
    facility_location_id?: number;
    id?: number;
    no_of_doctors?: number;
    no_of_slots?: number;
    speciality_id?: number;
    start_date?: Date;
    supervisor_id?: number;
}

export interface FacilityWiseMappedI {
    assignments: FormattedAvailablitiesI[];
    color: string;
    facility_location_id: number;
    facility_location_name: string;
}

export interface AvailableDoctorFromDateList {
    available_speciality_id?: number;
    date_list_id?: number;
    end_date?: Date;
    id?: number;
    no_of_slots?: number;
    start_date?: Date;
}

export interface GetCancelledAppointmentsBodyI {
    case_ids: number[];
    comments: string;
    end_date_time: string;
    facility_location_ids: number[];
    page?: number;
    paginate?: boolean;
    per_page?: number;
    provider_ids: number[];
    speciality_ids: number[];
    start_date_time: string;
}

export interface UpdateAppointmentVisitStatusBodyI {
    appointment_status: string;
    case_id: number;
    id: number;
    no_exit?: boolean;
    trigger_socket?: boolean;
    visit_status: string;
}

export interface UpdateStatusMultipleAppointmentsBodyI {
    appointment_ids: number[];
    status_id: number;
    trigger_socket?: boolean;
}

export interface GetRelatedInfoBodyI {
    case_id: number;
    id: number;
    speciality_key: string;
}

export interface VisitSessionStateI {
    id: number;
    name: string;
    slug: string;
}

export interface FormatedAppointmentI {
    action_performed?: string;
    appointment_title?: string;
    appointmentStatus?: models.sch_appointment_statusesI;
    appointmentType?: models.sch_appointment_typesI;
    available_doctor_id?: number;
    available_speciality_id?: number;
    availableDoctor?: models.sch_available_doctorsI;
    availableSpeciality?: models.sch_available_specialitiesI;
    by_health_app?: boolean;
    cancelled?: boolean;
    case_id?: number;
    case_type_id?: number;
    caseType?: models.kiosk_case_typesI;
    comments?: string;
    confirmation_status?: number | boolean;
    created_at?: Date;
    created_by?: number;
    date_list_id?: number;
    dateList?: models.sch_recurrence_date_listsI;
    deleted_at?: Date;
    evaluation_date_time?: Date;
    id?: number;
    key?: number;
    origin_facility_id?: number;
    originFacility?: models.facility_locationsI;
    patient?: models.kiosk_patient;
    patient_id?: number;
    priority?: models.sch_appointment_prioritiesI;
    priority_id?: number;
    pushed_to_front_desk?: boolean;
    scheduled_date_time?: Date;
    status_id?: number;
    target_facility_id?: number;
    targetFacility?: models.facility_locationsI;
    time_slots?: number;
    type_id?: number;
    updated_at?: Date;
    updated_by?: number;
    updatedBy?: models.usersI;
    visit_session_state?: VisitSessionStateI;
}

export interface SessionStatusDataI {
    appointment_id?: number;
    id?: number;
    no_of_days?: number;
    visit_date_format?: string;
    visit_session_state?: VisitSessionStateI;
    visit_session_state_id?: number;
}

export interface updateAppointmentStatusForSuperAdminI {
    arrivedStatus: models.sch_appointment_statuses;
    currentDateTime: Date;
    foundAppointment: models.sch_appointmentsI;
    id: number;
    userId: number;
    visitStatuses: models.kiosk_case_patient_session_statusesI[];
}

export interface kioskCasePatientSessionI {
    appointment_id: number;
    case_id: number;
    created_at: Date;
    created_by: number;
    date_of_check_in: Date;
    deleted_at: Date;
    id: number;
    key: number;
    status_id: number;
    time_of_check_in: Date;
    updated_at: Date;
    updated_by: number;
}

export interface FormatedAppointmentForIOSDataI {
    appointment_duration?: number;
    appointment_status?: string;
    appointment_title?: string;
    appointment_type_description?: string;
    appointment_type_id?: number;
    assign_to_me?: boolean;
    available_doctor_id?: number;
    available_speciality_id?: number;
    back_dated_check?: boolean;
    case_id?: number;
    case_patient_sessions: ANY;
    case_type?: string;
    case_type_id?: number;
    comments?: string;
    confirmation_status?: boolean | number;
    created_at?: Date;
    created_by?: number;
    date_list_id?: number;
    doctor_first_name?: string;
    doctor_id?: number;
    doctor_last_name?: string;
    doctor_middle_name?: string;
    evaluation_date_time?: Date;
    facility_location_id?: number;
    first_name?: string;
    has_app?: number;
    id?: number;
    is_speciality_base: boolean;
    last_name?: string;
    middle_name?: string;
    patient_id?: number;
    picture?: string;
    priority_description?: string;
    priority_id?: number;
    profile_avatar?: string;
    scheduled_date_time?: Date;
    speciality?: string;
    speciality_id?: number;
    speciality_key?: string;
    start_date_time?: Date;
    time_slot?: number;
    updated_at?: Date;
    updated_by?: number;
    visit_session_state_id?: number;
    visit_session_state_name?: string;
    visit_session_state_slug?: string;
}

export interface GetAllDoctorSpecialityAppointmentsBodyI {
    date_time_range: Date[];
    doctor_ids: number[];
    facility_location_ids: number[];
    speciality_ids: number[];
    user_id: number;
}

export interface GetAllDoctorSpecialityAppointmentsRawQueryBodyI {
    startDate: Date;
    endDate: Date;
    doctorIds: number[];
    facilityLocationIds: number[];
    specialityIds: number[];
}

export interface FreeSlotsBodyI {
    case_id: number;
    patient_id: number;
    slots: FreeSlotsI[];
}

export interface ResolvedAppointmentRequiredObjectI {
    available_doctor_id: number;
    available_speciality_id: number;
    scheduled_date_time: Date;
    status_id: number;
    time_slots: number;
}

export type GetAllDoctorSpecialityAppointmentsResponseI = ANY;

export interface GetCancelledAppointmentFilterI {
    available_doctor_id?: number;
    available_speciality_id?: number;
    scheduled_date_time?: Date;
}

export interface DeleteOldStatusFromKioskI {
    appointment_id?: number;
    case_id?: number;
}

export interface DeleteOldStatusFromKioskObjectI {
    appointments?: DeleteOldStatusFromKioskI[];
    deleted_at?: Date;
    status_id?: number;
    updated_by?: number;
}

export interface ResolveDoctorAssignmentsObjI {
    available_speciality_id?: number;
    doctor_id?: number;
    end_date?: Date;
    facility_location_id?: number;
    id?: number;
    no_of_slots?: number;
    over_booking?: number;
    speciality_id?: number;
    start_date?: Date;
    supervisor_id?: number;
    time_slot?: number;
}

export interface ResolvedDoctorAndAppointmentArrayI {

    appointment_title?: string;
    available_doctor_id?: number;
    available_speciality_id?: number;
    case_id?: number;
    comments?: string;
    confirmation_status?: number | boolean;
    doctor_id?: number;
    end_date?: Date;
    evaluation_date_time?: Date;
    facility_location_id?: number;
    id?: number;
    no_of_slots?: number;
    over_booking?: number;
    patient_id?: number;
    priority_id?: number;
    scheduled_date_time?: Date;
    speciality_id?: number;
    start_date?: Date;
    status_id?: number;
    supervisor_id?: number;
    time_slot?: number;
    time_slots?: number;
    type_id?: 1;
}

export interface GroupedAppointmentI {
    appointments: models.sch_appointmentsI[];
    case_id: number;
}

export interface CreateAppointmentI {
    appointmentStatus: models.sch_appointment_statusesI[];
    appointmentType: models.sch_appointment_typesI;
    appointmentTypeId: number;
    caseId: number;
    caseType: string;
    caseTypeId: number;
    cdImage?: boolean;
    comments: string;
    confirmationStatus: number;
    cptCodes?: number[];
    desiredTimeSlot: number;
    doctorId: number;
    existingCasePatientSession: models.kiosk_case_patient_sessionI;
    facilityLocationId: number;
    formatDates: Date[];
    is_transferring_case?: boolean;
    isAlradyCheckedIn: boolean;
    isSoftRegistered: boolean;
    isSpecialityBase: boolean;
    isTransportation?: boolean;
    patientId: number;
    physicianId?: number;
    priorityId: number;
    readingProviderId?: number;
    sessionStatusId?: number;
    slotsForThisAppointment: number;
    speciality: models.specialitiesI;
    specialityId: number;
    startDateTime: string;
    technicianId?: number;
    time_zone: number;
    transportation?: models.sch_transportationI[];
    undoAppointmentStatusId?: number;
    userId: number;
}

export interface updateTransportationsI {
    city?: string;
    comments?: string;
    id?: number;
    is_deleted?: boolean;
    is_dropoff?: boolean;
    is_pickup?: boolean;
    phone?: string;
    state?: string;
    street_address?: string;
    suit?: string;
    type?: string;
    zip?: string;
}

export interface AppointmentCptCodesI {
    code_type_id?: number;
    comments?: string;
    created_by?: number;
    deleted_at?: Date;
    description?: string;
    id?: number;
    long_description?: string;
    medium_description?: string;
    name?: string;
    short_description?: string;
    type?: string;
    updated_by?: number;
}

export interface GetStartTimeToCreateI {
    appointmentEndTime: Date;
    startDateTime: Date;
    specialityId: number;
    doctorId: number;
    caseId: number;
    patientId: number;
    time_zone: number;
    speciality: models.specialitiesI,
    desiredTimeSlot: number
}
export interface CreateMultipleCptAppointmentI {
    caseId: number;
    cptCodes: number[];
    desiredTimeSlot: number;
    doctorId: number;
    formatDates: Date[];
    patientId: number;
    speciality: models.specialities;
    specialityId: number;
    startDateTime: string;
    time_zone: number;
    facilityLocationId: number;
}