import { kiosk_contact_person_types } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class KioskContactPersonTypesRepository extends BaseRepository<kiosk_contact_person_types> {
    /**
     * Constructor
     */
    public constructor(protected kioskContactPersonTypes: typeof kiosk_contact_person_types) {
        super(kioskContactPersonTypes);
    }

}
