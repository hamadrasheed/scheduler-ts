
import {
    actionPreferencesService,
    actionPreferencesTypesService,
    appointmentCancellationCommentService,
    appointmentPriorityService,
    appointmentService,
    appointmentStatusService,
    appointmentTypeService,
    assignProviderTypesService,
    availableDoctorService,
    availableSpecialityService,
    colorCodeService,
    doctorInstructionForFacilityLocationsService,
    kioskService,
    masterService,
    unAvailableDoctorNoticationService,
    unAvailableDoctorService,
    userService // # import_service
} from '../services';

import { ActionPreferencesTypesController } from './action-preferences-types.controller';
import { ActionPreferencesController } from './action-preferences.controller';
import { AppointmentCancellationCommentController } from './appointment-cancellation-comments.controller';
import { AppointmentPriorityController } from './appointment-priority.controller';
import { AppointmentStatusController } from './appointment-status.controller';
import { AppointmentTypeController } from './appointment-type.controller';
import { AppointmentController } from './appointment.controller';
import { AssignProviderTypesController } from './assign-provider-types.controller';
import { AvailableDoctorController } from './available-doctor.controller';
import { AvailableSpecialityController } from './available-speciality.controller';
import { ColorCodeController } from './color-code.controller';
import { DoctorInstructionForFacilityLocationsController } from './doctor-instruction-for-facility-locations.controller';
import { KioskController } from './kiosk.controller';
import { MasterController } from './master.controller';
import { UnAvailableDoctorNotificationController } from './unavailable-doctor-notification.controller';
import { UnAvailableDoctorController } from './unavailable-doctor.controller';
import { UserController } from './user.controller'; // # import_controller

export const actionPreferencesController: ActionPreferencesController = new ActionPreferencesController(actionPreferencesService);
export const actionPreferenceTypesController: ActionPreferencesTypesController = new ActionPreferencesTypesController(actionPreferencesTypesService);
export const userController: UserController = new UserController(userService);
export const appointmentStatusController: AppointmentStatusController = new AppointmentStatusController(appointmentStatusService);
export const colorCodeController: ColorCodeController = new ColorCodeController(colorCodeService);
export const appointmentController: AppointmentController = new AppointmentController(appointmentService);
export const availableSpecialityController: AvailableSpecialityController = new AvailableSpecialityController(availableSpecialityService);
export const appointmentCancellationCommentController: AppointmentCancellationCommentController = new AppointmentCancellationCommentController(appointmentCancellationCommentService);
export const availableDoctorController: AvailableDoctorController = new AvailableDoctorController(availableDoctorService);
export const unAvailableDoctorController: UnAvailableDoctorController = new UnAvailableDoctorController(unAvailableDoctorService);
export const appointmentTypeController: AppointmentTypeController = new AppointmentTypeController(appointmentTypeService);
export const kioskController: KioskController = new KioskController(kioskService);
export const unAvailableDoctorNotificationController: UnAvailableDoctorNotificationController = new UnAvailableDoctorNotificationController(unAvailableDoctorNoticationService);
export const doctorInstructionForFacilityLocationsController: DoctorInstructionForFacilityLocationsController = new DoctorInstructionForFacilityLocationsController(doctorInstructionForFacilityLocationsService);
export const appointmentPriorityController: AppointmentPriorityController = new AppointmentPriorityController(appointmentPriorityService);
export const assignProviderTypesController: AssignProviderTypesController = new AssignProviderTypesController(assignProviderTypesService);
export const masterController: MasterController = new MasterController(masterService); // # export_controller
