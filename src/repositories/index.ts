import {
    case_referrals,
    facilities,
    facility_locations,
    facility_timings,
    kiosk_case_patient_session,
    kiosk_case_patient_session_statuses,
    kiosk_case_types,
    kiosk_contact_person,
    kiosk_contact_person_types,
    kiosk_patient,
    medical_identifiers,
    billing_codes,
    billing_titles,
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
    sch_unavailable_doctors,
    sch_unavailable_doctor_notications,
    specialities,
    pt_session,
    users,
    user_basic_info,
    user_facility,
    user_timings,
    kiosk_cases,
    user_speciality,
    visit_sessions,
    technician_supervisors,
    sch_transportations // # import_model
} from '../models';

import { TechnicianSupervisorsRepository } from './technician_supervisors.repository';
import { ActionPreferencesRepository } from './action_preferences.repository';
import { KioskCaseRepository } from './kiosk_case.repository';
import { ActionPreferencesTypesRepository } from './action_preferences_types.repository';
import { ActionPreferenceForwardFacilityLocationRepository } from './action_preference_forward_facility_location.repository';
import { AppointmentRepository } from './appointments.repository';
import { AppointmentCptCodesRepository } from './appointment_cpt_codes.repository';
import { AppointmentPrioritiesRepository } from './appointments_priorities.repository';
import { AppointmentStatusRepository } from './appointments_status.repository';
import { AppointmentCancellationCommentRepository } from './appointment_cancellation_comments.repository';
import { AppointmentTypesRepository } from './appointment_types.repository';
import { AssignProviderTypesRepository } from './assign_provider_types.repository';
import { AvailableDoctorRepository } from './available_doctors.repository';
import { AvailableDoctorNotificationRepository } from './available_doctor_notifications.repository';
import { AvailableSpecialityRepository } from './available_specialities.repository';
import { CaseReferralsRepository } from './case_referrals.repository';
import { CasePatientSessionStatusesRepository } from './case_patient_session_statuses.repository';
import { CaseTypesRepository } from './case_types.repository';
import { ColorCodeRepository } from './color_codes.repository';
import { ColorCodeTypeRepository } from './color_code_types.repository';
import { KioskContactPersonRepository } from './contact_person';
import { KioskContactPersonTypesRepository } from './contact_person_types';
import { DayListRepository } from './day_lists.repository';
import { DoctorInstructionForFacilityLocationsRepository } from './doctor_instruction_for_facility_locations';
import { FacilityRepository } from './facilities.repository';
import { FacilityLocationRepository } from './facility_locations.repository';
import { FacilityTimingsRepository } from './facility_timings.repository';
import { TransportationsRepository } from './transportations.repository';

import { MedicalIdentifierRepository } from './medical_identifiers.respository';
import { BillingCodesRepository } from './billing_codes.repository';
import { BillingTitlesRepository } from './billing_titles.respository';

import { ModelHasRoleRepository } from './model_has_roles.repository';
import { KioskPatientRepository } from './patient';
import { RecurrenceDateListRepository } from './recurrence_date_lists.repository';
import { RecurrenceDayListRepository } from './recurrence_day_lists.repository';
import { RecurrenceEndingCriteriaRepository } from './recurrence_ending_criterias.repository';
import { RoleRepository } from './roles.repository';
import { SpecialityRepository } from './specialities.repository';
import { UnAvailableDoctorRepository } from './unavailable_doctors.repository';
import { UnAvailableDoctorNotificationRepository } from './unAvailable_doctor_notifications.repository';
import { UserRepository } from './users.repository';
import { UserBasicInfoRepository } from './user_basic_info.repository';
import { UserFacilityRepository } from './user_facility.repository';
import { UserSpecialityRepository } from './user_specialities.repository';
import { UserTimingRepository } from './user_timings.repository';
import { VisitSessionRepository } from './visit_sessions.repository'; // # import_repository
import { CasePatientSessionRepository } from './case_patient_session.repository';
import { PtSessionRepository } from './pt_session.repository';

export const actionPreferencesRepository: ActionPreferencesRepository = new ActionPreferencesRepository(sch_action_preferences);
export const actionPreferencesTypesRepository: ActionPreferencesTypesRepository = new ActionPreferencesTypesRepository(sch_action_preferences_types);
export const actionPreferenceForwardFacilityLocationRepository: ActionPreferenceForwardFacilityLocationRepository = new ActionPreferenceForwardFacilityLocationRepository(sch_action_preference_forward_facility_location);
export const modelHasRoleRepository: ModelHasRoleRepository = new ModelHasRoleRepository(model_has_roles);
export const userRepository: UserRepository = new UserRepository(users);
export const unAvailableDoctorNotificationRepository: UnAvailableDoctorNotificationRepository = new UnAvailableDoctorNotificationRepository(sch_unavailable_doctor_notications);
export const doctorInstructionForFacilityLocationsRepository: DoctorInstructionForFacilityLocationsRepository = new DoctorInstructionForFacilityLocationsRepository(sch_doctor_instruction_for_facility_locations);
export const casePatientSessionStatusesRepository: CasePatientSessionStatusesRepository = new CasePatientSessionStatusesRepository(kiosk_case_patient_session_statuses);
export const appointmentPrioritiesRepository: AppointmentPrioritiesRepository = new AppointmentPrioritiesRepository(sch_appointment_priorities);
export const appointmentStatusRepository: AppointmentStatusRepository = new AppointmentStatusRepository(sch_appointment_statuses);
export const userBasicInfoRepository: UserBasicInfoRepository = new UserBasicInfoRepository(user_basic_info);
export const userFacilityRepository: UserFacilityRepository = new UserFacilityRepository(user_facility);
export const specialityRepository: SpecialityRepository = new SpecialityRepository(specialities);
export const facilityLocationRepository: FacilityLocationRepository = new FacilityLocationRepository(facility_locations);
export const facilityTimingsRepository: FacilityTimingsRepository = new FacilityTimingsRepository(facility_timings);

export const colorCodeRepository: ColorCodeRepository = new ColorCodeRepository(sch_color_codes);
export const colorCodeTypeRepository: ColorCodeTypeRepository = new ColorCodeTypeRepository(sch_color_code_types);
export const roleRepository: RoleRepository = new RoleRepository(roles);
export const appointmentRepository: AppointmentRepository = new AppointmentRepository(sch_appointments);
export const availableSpecialityRepository: AvailableSpecialityRepository = new AvailableSpecialityRepository(sch_available_specialities);
export const appointmentCancellationCommentRepository: AppointmentCancellationCommentRepository = new AppointmentCancellationCommentRepository(sch_appointment_cancellation_comments);
export const availableDoctorRepository: AvailableDoctorRepository = new AvailableDoctorRepository(sch_available_doctors);
export const recurrenceEndingCriteriaRepository: RecurrenceEndingCriteriaRepository = new RecurrenceEndingCriteriaRepository(sch_recurrence_ending_criterias);
export const dayListRepository: DayListRepository = new DayListRepository(sch_day_lists);
export const recurrenceDayListRepository: RecurrenceDayListRepository = new RecurrenceDayListRepository(sch_recurrence_day_lists);
export const userTimingRepository: UserTimingRepository = new UserTimingRepository(user_timings);
export const facilityRepository: FacilityRepository = new FacilityRepository(facilities);
export const unAvailableDoctorRepository: UnAvailableDoctorRepository = new UnAvailableDoctorRepository(sch_unavailable_doctors);
export const availableDoctorNotificationRepository: AvailableDoctorNotificationRepository = new AvailableDoctorNotificationRepository(sch_available_doctor_notifications);
export const recurrenceDateListRepository: RecurrenceDateListRepository = new RecurrenceDateListRepository(sch_recurrence_date_lists);
export const appointmentTypesRepository: AppointmentTypesRepository = new AppointmentTypesRepository(sch_appointment_types);
export const caseTypesRepository: CaseTypesRepository = new CaseTypesRepository(kiosk_case_types);
export const medicalIdentifierRepository: MedicalIdentifierRepository = new MedicalIdentifierRepository(medical_identifiers);
export const billingTitlesRepository: BillingTitlesRepository = new BillingTitlesRepository(billing_titles);
export const billingCodesRepository: BillingCodesRepository = new BillingCodesRepository(billing_codes);
export const visitSessionRepository: VisitSessionRepository = new VisitSessionRepository(visit_sessions);
export const kioskContactPersonRepository: KioskContactPersonRepository = new KioskContactPersonRepository(kiosk_contact_person);
export const kioskContactPersonTypesRepository: KioskContactPersonTypesRepository = new KioskContactPersonTypesRepository(kiosk_contact_person_types);
export const kioskPatientRepository: KioskPatientRepository = new KioskPatientRepository(kiosk_patient);
export const assignProviderTypesRepository: AssignProviderTypesRepository = new AssignProviderTypesRepository(sch_assign_provider_types);
export const kioskCaseRepository: KioskCaseRepository = new KioskCaseRepository(kiosk_cases);
export const casePatientSessionRepository: CasePatientSessionRepository = new CasePatientSessionRepository(kiosk_case_patient_session);
export const transportationsRepository: TransportationsRepository = new TransportationsRepository(sch_transportations);
export const appointmentCptCodesRepository: AppointmentCptCodesRepository = new AppointmentCptCodesRepository(sch_appointment_cpt_codes);
export const userSpecialityRepository: UserSpecialityRepository = new UserSpecialityRepository(user_speciality);// # export_repository
export const caseReferralsRepository: CaseReferralsRepository = new CaseReferralsRepository(case_referrals); // # export_repository
export const technicianSupervisorsRepository: TechnicianSupervisorsRepository = new TechnicianSupervisorsRepository(technician_supervisors); // # export_repository
export const ptSessionRepository: PtSessionRepository = new PtSessionRepository(pt_session);