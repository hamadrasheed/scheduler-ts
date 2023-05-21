import {
    actionPreferenceForwardFacilityLocationRepository,
    actionPreferencesRepository,
    actionPreferencesTypesRepository,
    appointmentCancellationCommentRepository,
    appointmentCptCodesRepository,
    appointmentPrioritiesRepository,
    appointmentRepository,
    appointmentStatusRepository,
    appointmentTypesRepository,
    assignProviderTypesRepository,
    availableDoctorNotificationRepository,
    availableDoctorRepository,
    availableSpecialityRepository,
    billingCodesRepository,
    casePatientSessionStatusesRepository,
    caseTypesRepository,
    colorCodeRepository,
    colorCodeTypeRepository,
    dayListRepository,
    doctorInstructionForFacilityLocationsRepository,
    facilityLocationRepository,
    kioskContactPersonRepository,
    kioskContactPersonTypesRepository,
    kioskPatientRepository,
    medicalIdentifierRepository,
    modelHasRoleRepository,
    ptSessionRepository,
    recurrenceDateListRepository,
    recurrenceDayListRepository,
    recurrenceEndingCriteriaRepository,
    roleRepository,
    specialityRepository,
    unAvailableDoctorNotificationRepository,
    unAvailableDoctorRepository,
    userBasicInfoRepository,
    userFacilityRepository,
    userRepository,
    userSpecialityRepository,
    casePatientSessionRepository,
    kioskCaseRepository,
    visitSessionRepository,
    transportationsRepository,
    technicianSupervisorsRepository,
    facilityTimingsRepository // # import_repository
} from '../repositories';
import { Http } from '../shared/http';

import { ActionPreferencesTypesService } from './action-preferences-types.service';
import { ActionPreferencesService } from './action-preferences.service';
import { AppointmentCancellationCommentService } from './appointment-cancellation-comments.service';
import { AppointmentPriorityService } from './appointment-priorities.service';
import { AppointmentStatusService } from './appointment-status.service';
import { AppointmentTypeService } from './appointment-type.service';
import { AppointmentService } from './appointment.service';
import { AssignProviderTypesService } from './assign-provider-types.service';
import { AvailableDoctorService } from './available-doctor.service';
import { AvailableSpecialityService } from './available-speciality.service';
import { ColorCodeService } from './color-code.service';
import { DoctorInstructionForFacilityLocationsService } from './doctor-instruction-for-facility-locations.service';
import { FacilityLocationsService } from './facility-locations.service';
import { KioskService } from './kiosk.service';
import { MasterService } from './master.service';
import { UnavailableDoctorNoticationService } from './unavailable-doctor-notications.service';
import { UnAvailableDoctorService } from './unavailable-doctor.service';
import { UserService } from './user.service'; // # import_service
import { CasePatientSessionService } from './case_patient_session.service';
import { CasePatientSessionStatusService } from './case_patient_session_statuses.service';

export const userService: UserService = new UserService(
    modelHasRoleRepository,
    userFacilityRepository,
    userRepository,
    facilityLocationRepository,
    specialityRepository,
    availableDoctorRepository,
    availableSpecialityRepository,
    appointmentRepository,
    unAvailableDoctorRepository,
    appointmentTypesRepository,
    appointmentStatusRepository,
    casePatientSessionStatusesRepository,
    kioskCaseRepository,
    caseTypesRepository,
    facilityTimingsRepository,
    userSpecialityRepository,
    roleRepository,
    technicianSupervisorsRepository,
    Http
);

export const facilityLocationsService: FacilityLocationsService = new FacilityLocationsService(
    facilityLocationRepository,
    Http
);

export const colorCodeService: ColorCodeService = new ColorCodeService(
    colorCodeRepository,
    userRepository,
    colorCodeTypeRepository,
    facilityLocationRepository,
    userFacilityRepository,
    roleRepository,
    specialityRepository,
    Http
);

export const appointmentService: AppointmentService = new AppointmentService(
    appointmentRepository,
    userRepository,
    userFacilityRepository,
    modelHasRoleRepository,
    appointmentTypesRepository,
    appointmentStatusRepository,
    casePatientSessionStatusesRepository,
    specialityRepository,
    availableSpecialityRepository,
    unAvailableDoctorRepository,
    facilityLocationRepository,
    availableDoctorRepository,
    caseTypesRepository,
    medicalIdentifierRepository,
    recurrenceEndingCriteriaRepository,
    colorCodeRepository,
    recurrenceDateListRepository,
    appointmentPrioritiesRepository,
    visitSessionRepository,
    kioskContactPersonRepository,
    kioskContactPersonTypesRepository,
    casePatientSessionRepository,
    kioskCaseRepository,
    transportationsRepository,
    appointmentCptCodesRepository,
    ptSessionRepository,
    billingCodesRepository,
    Http
);

export const actionPreferencesService: ActionPreferencesService = new ActionPreferencesService(
    actionPreferencesRepository,
    actionPreferenceForwardFacilityLocationRepository,
    Http
);

export const actionPreferencesTypesService: ActionPreferencesTypesService = new ActionPreferencesTypesService(
    actionPreferencesTypesRepository,
    Http
);

export const availableSpecialityService: AvailableSpecialityService = new AvailableSpecialityService(
    availableSpecialityRepository,
    availableDoctorRepository,
    facilityLocationRepository,
    userRepository,
    userFacilityRepository,
    userBasicInfoRepository,
    specialityRepository,
    recurrenceEndingCriteriaRepository,
    dayListRepository,
    recurrenceDayListRepository,
    recurrenceDateListRepository,
    unAvailableDoctorRepository,
    appointmentRepository,
    assignProviderTypesRepository,
    Http
);

export const availableDoctorService: AvailableDoctorService = new AvailableDoctorService(
    availableDoctorRepository,
    availableSpecialityRepository,
    facilityLocationRepository,
    userBasicInfoRepository,
    specialityRepository,
    recurrenceEndingCriteriaRepository,
    dayListRepository,
    recurrenceDayListRepository,
    userRepository,
    unAvailableDoctorRepository,
    availableDoctorNotificationRepository,
    userFacilityRepository,
    roleRepository,
    modelHasRoleRepository,
    recurrenceDateListRepository,
    appointmentRepository,
    Http
);

export const unAvailableDoctorService: UnAvailableDoctorService = new UnAvailableDoctorService(
    unAvailableDoctorRepository,
    userRepository,
    availableDoctorRepository,
    appointmentRepository,
    recurrenceDateListRepository,
    actionPreferencesRepository,
    userFacilityRepository,
    modelHasRoleRepository,
    appointmentStatusRepository,
    kioskCaseRepository,
    caseTypesRepository,
    Http
);

export const appointmentCancellationCommentService: AppointmentCancellationCommentService = new AppointmentCancellationCommentService(
    appointmentCancellationCommentRepository,
    Http
);

export const appointmentTypeService: AppointmentTypeService = new AppointmentTypeService(
    appointmentTypesRepository,
    Http
);

export const appointmentStatusService: AppointmentStatusService = new AppointmentStatusService(
    appointmentStatusRepository,
    Http
);

export const appointmentPriorityService: AppointmentPriorityService = new AppointmentPriorityService(
    appointmentPrioritiesRepository,
    Http
);

export const kioskService: KioskService = new KioskService(
    kioskPatientRepository,
    kioskContactPersonRepository,
    kioskContactPersonTypesRepository,
    Http
);

export const doctorInstructionForFacilityLocationsService: DoctorInstructionForFacilityLocationsService = new DoctorInstructionForFacilityLocationsService(
    doctorInstructionForFacilityLocationsRepository,
    Http
);

export const unAvailableDoctorNoticationService: UnavailableDoctorNoticationService = new UnavailableDoctorNoticationService(
    unAvailableDoctorNotificationRepository,
    userFacilityRepository,
    facilityLocationRepository,
    userRepository,
    availableDoctorRepository,
    appointmentRepository,
    modelHasRoleRepository,
    unAvailableDoctorRepository,
    Http
);

export const assignProviderTypesService: AssignProviderTypesService = new AssignProviderTypesService(assignProviderTypesRepository, Http);

export const masterService: MasterService = new MasterService(
    facilityLocationRepository,
    specialityRepository,
    userRepository,
    Http
); // # export_service'

export const casePatientSessionService: CasePatientSessionService = new CasePatientSessionService(
    casePatientSessionRepository,
    Http
);

export const casePatientSessionStatusService: CasePatientSessionStatusService = new CasePatientSessionStatusService(
    casePatientSessionStatusesRepository,
    Http
);
