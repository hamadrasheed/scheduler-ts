import { kiosk_cases } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * Prognosis Types Repository Class
 */
export class KioskCaseRepository extends BaseRepository<kiosk_cases> {
    /**
     * Constructor
     */
    public constructor(protected kioskCase: typeof kiosk_cases) {
        super(kioskCase);
    }

}
