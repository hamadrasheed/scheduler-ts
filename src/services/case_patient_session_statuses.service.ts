import * as Sequelize from 'sequelize';

import {
    kiosk_case_patient_session_statusesI
} from '../models';
import {
   casePatientSessionStatusesRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY } from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class CasePatientSessionStatusService extends Helper {
    public __http: Http;
    public __repo: typeof casePatientSessionStatusesRepository;

    /**
     *
     * @param schAppointmentType
     * @param http
     */
    public constructor(
        public casePatientSessionStatusesRepo: typeof casePatientSessionStatusesRepository,
        public http: typeof Http

    ) {
        super();
        this.__repo = casePatientSessionStatusesRepo;
        this.__http = new http();

    }

    /**
     *
     */
    public getCasePatientSessionNoShowStatus = async (): Promise<kiosk_case_patient_session_statusesI> =>

      (this.__repo.findOne({ slug: 'no_show' }) as unknown as kiosk_case_patient_session_statusesI)

}
