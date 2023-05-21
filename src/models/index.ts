import { ANY } from '../shared/common';

import {
    case_referrals,
    clinics,
    clinic_locations,
    facilities,
    facility_locations,
    facility_timings,
    kiosk_cases,
    billing_case_status,
    billing_codes,
    kiosk_case_contact_persons,
    kiosk_case_purpose_of_visit,
    kiosk_case_accident_informations,
    kiosk_case_patient_session,
    kiosk_case_patient_session_statuses,
    kiosk_case_types,
    kiosk_contact_person,
    kiosk_contact_person_address,
    kiosk_contact_person_types,
    kiosk_patient,
    medical_identifiers,
    model_has_roles,
    roles,
    sch_action_preferences,
    sch_action_preferences_types,
    sch_action_preference_forward_facility_location,
    sch_appointments,
    sch_appointment_cancellation_comments,
    sch_appointment_cpt_codes,
    sch_appointment_priorities,
    sch_appointment_statuses,
    sch_appointment_types,
    sch_assign_provider_types,
    sch_available_doctors,
    sch_available_doctor_notifications,
    sch_available_specialities,
    sch_color_codes,
    sch_color_code_types,
    sch_day_lists,
    sch_doctor_instruction_for_facility_locations,
    sch_recurrence_date_lists,
    sch_recurrence_day_lists,
    sch_recurrence_ending_criterias,
    sch_transportations,
    sch_unavailable_doctors,
    sch_unavailable_doctor_notications,
    specialities,
    pt_session_diagnosis,
    pt_session,
    physicians,
    physician_clinics,
    users,
    user_basic_info,
    user_facility,
    user_prefrences,
    user_speciality,
    user_timings,
    visit_sessions,
    kiosk_case_patient_session_not_seen_reasons,
    visit_session_states, // # import_model
    billing_titles,
    technician_supervisors,
    speciality_visit_types,
    kiosk_case_employers,
    kiosk_case_employer_types,
    kiosk_case_categories,
    kiosk_case_insurances,
    billing_insurances,
} from '.';

type ModelType = ANY;

export * from './kiosk_case_insurances';
export * from './technician_supervisors';
export * from './sch_appointment_statuses';
export * from './kiosk_contact_person';
export * from './kiosk_contact_person_types';
export * from './kiosk_contact_person_address';
export * from './kiosk_case_patient_session';
export * from './sch_unavailable_doctor_notications';
export * from './sch_action_preferences';
export * from './sch_action_preferences_types';
export * from './sch_appointment_types';
export * from './sch_appointment_priorities';
export * from './sch_appointment_cancellation_comments';
export * from './users';
export * from './user_prefrences';
export * from './specialities';
export * from './roles';
export * from './facility_timings';
export * from './facility_locations';
export * from './user_facility';
export * from './user_basic_info';
export * from './user_timings';
export * from './model_has_roles';
export * from './sch_appointments';
export * from './sch_color_code_types';
export * from './sch_color_codes';
export * from './sch_available_specialities';
export * from './sch_available_doctors';
export * from './sch_recurrence_ending_criterias';
export * from './sch_day_lists';
export * from './sch_recurrence_day_lists';
export * from './sch_unavailable_doctors';
export * from './sch_available_doctor_notifications';
export * from './sch_action_preference_forward_facility_location';
export * from './sch_recurrence_date_lists';
export * from './kiosk_patient';
export * from './kiosk_case_patient_session_statuses';
export * from './facilities';
export * from './medical_identifiers';
export * from './billing_titles';
export * from './sch_doctor_instruction_for_facility_locations';
export * from './kiosk_case_types';
export * from './visit_sessions';
export * from './visit_session_states';
export * from './sch_assign_provider_types'; // # export_all
export * from './kiosk_cases';
export * from './billing_case_status'
export * from './kiosk_case_contact_persons';
export * from './kiosk_case_purpose_of_visit';
export * from './kiosk_case_accident_informations';
export * from './kiosk_case_patient_session_not_seen_reasons';
export * from './sch_transportations';
export * from './physician';
export * from './billing_codes';
export * from './sch_appointment_cpt_codes';
export * from './user_speciality';
export * from './case_referrals';
export * from './physician_clinics';
export * from './clinics';
export * from './clinic_locations';
export * from './pt_session_diagnosis';
export * from './pt_session';
export * from './speciality_visit_types'
export * from './kiosk_case_employers';
export * from './kiosk_case_employer_types';
export * from './kiosk_case_categories';
export * from './billing_insurances';


export const models: ModelType = [
    billing_insurances,
    kiosk_case_insurances,
    kiosk_case_employers,
    kiosk_case_categories,
    kiosk_case_employer_types,
    technician_supervisors,
    billing_codes,
    case_referrals,
    kiosk_case_patient_session,
    kiosk_contact_person,
    kiosk_contact_person_address,
    kiosk_contact_person_types,
    sch_unavailable_doctor_notications,
    sch_doctor_instruction_for_facility_locations,
    facilities,
    model_has_roles,
    medical_identifiers,
    billing_titles,
    kiosk_patient,
    kiosk_case_patient_session_statuses,
    sch_appointment_cpt_codes,
    sch_action_preferences,
    sch_action_preferences_types,
    sch_action_preference_forward_facility_location,
    sch_appointment_statuses,
    sch_appointment_types,
    sch_appointment_priorities,
    sch_appointment_cancellation_comments,
    sch_transportations,
    sch_color_code_types,
    sch_color_codes,
    sch_appointments,
    users,
    user_basic_info,
    user_facility,
    user_prefrences,
    user_speciality,
    user_timings,
    specialities,
    facility_timings,
    facility_locations,
    roles,
    sch_available_specialities,
    sch_available_doctors,
    sch_recurrence_ending_criterias,
    sch_day_lists,
    sch_recurrence_day_lists,
    sch_unavailable_doctors,
    sch_available_doctor_notifications,
    sch_recurrence_date_lists,
    kiosk_case_types,
    visit_sessions,
    visit_session_states,
    kiosk_cases,
    billing_case_status,
    kiosk_case_contact_persons,
    kiosk_case_purpose_of_visit,
    kiosk_case_accident_informations,
    kiosk_case_patient_session_not_seen_reasons,
    physicians,
    pt_session,
    pt_session_diagnosis,
    physician_clinics,
    clinics,
    clinic_locations,
    sch_assign_provider_types, // # export_single
    speciality_visit_types
];
