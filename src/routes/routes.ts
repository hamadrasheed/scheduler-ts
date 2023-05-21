import { NextFunction, Request, Response, Router } from 'express';

import { sequelize } from '../config/database';
import { ANY } from '../shared/common';

import { actionPreferencesTypeRouter } from './action-preferences-types.routes';
import { actionPreferencesRouter } from './action-preferences.routes';
import { appointmentCancellationCommentRouter } from './appointment-cancellation-comments.routes';
import { appointmentPriorityRouter } from './appointment-priority.routes';
import { appointmentStatusRouter } from './appointment-status.routes';
import { appointmentTypeRouter } from './appointment-type.routes';
import { appointmentRouter } from './appointment.routes';
import { assignProviderTypeRouter } from './assign-provider-types.routes';
import { availableDoctorRouter } from './available-doctor.routes';
import { availableSpecialityRouter } from './available-speciality.routes';
import { colorCodeRouter } from './color-code.routes';
import { doctorInstructionRouter } from './doctor-instruction-for-facility-locations.routes';
import { kioskRouter } from './kiosk.routes';
import { masterRouter } from './master.routes';
import { unAvailableDoctorNotificationRouter } from './unavailable-doctor-notification.routes';
import { unAvailableDoctorRouter } from './unavailable-doctor.routes';
import { userRouter } from './user.routes';

export const routes: Router = Router();

routes.use('/action-preferences', actionPreferencesRouter);
routes.use('/action-preferences-types', actionPreferencesTypeRouter);
routes.use('/users', userRouter);
routes.use('/unavailable-doctor-notification', unAvailableDoctorNotificationRouter);
routes.use('/color-codes', colorCodeRouter);
routes.use('/appointments', appointmentRouter);
routes.use('/available-specialities', availableSpecialityRouter);
routes.use('/available-doctors', availableDoctorRouter);
routes.use('/unavailable-doctors', unAvailableDoctorRouter);
routes.use('/appointment-cancellation-comments', appointmentCancellationCommentRouter);
routes.use('/appointment-types', appointmentTypeRouter);
routes.use('/appointment-status', appointmentStatusRouter);
routes.use('/appointment-priority', appointmentPriorityRouter);
routes.use('/kiosk', kioskRouter);
routes.use('/doctor-instruction-for-facility', doctorInstructionRouter);
routes.use('/assign-provider-types', assignProviderTypeRouter);
routes.use('/master', masterRouter);

routes.use('/health-checked', (req: Request, res: Response, next: NextFunction): ANY => {
    sequelize.authenticate()
    // tslint:disable-next-line: no-magic-numbers
    .then((): ANY => res.status(200).send('Database connected successfully!')).catch((error) => {
        // tslint:disable-next-line: no-magic-numbers
        res.status(500).send('Database authenticaion error...');
    });
});
