
import { AxiosResponse } from 'axios';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

/**
 * Kiosk service class
 */
@Frozen
export class KioskService extends Helper {
    public __http: Http;

    /**
     *
     * @param http
     */
    public constructor(
        public __patientRepo: typeof repositories.kioskPatientRepository,
        public __contactPersonRepo: typeof repositories.kioskContactPersonRepository,
        public __contactPersonTypesRepo: typeof repositories.kioskContactPersonTypesRepository,
        http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    public getPatient = async (data: typings.KioskPatientReqI, authorization: string): Promise<typings.ANY> => {

        const {
            user_id: userId = Number(process.env.USERID),
            id,
        } = data;

        const patient: models.kiosk_patientI = this.shallowCopy(await this.__patientRepo.findById(id));

        if (!patient || !Object.keys(patient).length) {
            throw generateMessages('INVALID_PATIENT_ID');
        }
        const contactPersonType: models.kiosk_contact_person_typesI = this.shallowCopy(await this.__contactPersonTypesRepo.findOne(
            {
                deleted_at: null,
                slug: 'self',
            }
        ));

        const contactPerson: models.kiosk_contact_personI = this.shallowCopy(await this.__contactPersonRepo.findOne(
            {
                case_id: null,
                contact_person_type_id: contactPersonType.id,
                deleted_at: null,
                object_id: id,
            },
            {
                include: {
                    as: 'patientAddress',
                    model: models.kiosk_contact_person_address,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            }
        ));

        return {
            ...patient,
            contact_info: contactPerson
        };

    }

    /**
     *
     * @param data
     * @param authorization
     */
    public getWalkInPatients = async (data: typings.GenericReqObjI, authorization: string): Promise<AxiosResponse> => {

        const config: typings.GenericHeadersI = {
            headers: { Authorization: `${authorization}` }
        };

        return this.__http.post(`${process.env.KIOSK_URL}case-patient-session/walk-in-patients   `, {
            ...data
        },                      config);
    }

}
