import * as Sequelize from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

/**
 * Appointment Service Class
 */

@Frozen
export class CasePatientSessionService extends Helper {

    public __http: Http;

    public constructor(
        public __repo: typeof repositories.casePatientSessionRepository,

        public http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    public getAputForMultipleAppointmentsll = async (data: typings.ANY, _authorization?: string): Promise<typings.ANY> => {

        const { appointment_ids: appointmentIds, status_id: statusId } = data;

        return this.__repo.updateByColumnMatched({
            appointment_id: {
                [Op.in]: appointmentIds
            },
            deleted_at: null
        },                                       {
             status_id: statusId
        });
    }

}
