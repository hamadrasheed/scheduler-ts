import { kiosk_contact_person } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class KioskContactPersonRepository extends BaseRepository<kiosk_contact_person> {
    /**
     * Constructor
     */
    public constructor(protected kioskContactPerson: typeof kiosk_contact_person) {
        super(kioskContactPerson);
    }

}
