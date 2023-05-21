import { sch_transportations } from '../models/sch_transportations';
import { BaseRepository } from '../shared/base-repository';

/**
 * Transportations Repository Class
 */
export class TransportationsRepository extends BaseRepository<sch_transportations> {
    /**
     * constructor
     * @param transportations
     */
    public constructor(protected transportations: typeof sch_transportations) {
        super(transportations);
    }

}
