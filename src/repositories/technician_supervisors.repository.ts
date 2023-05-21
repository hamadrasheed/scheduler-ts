import { technician_supervisors } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Facility Repository Class
 */
export class TechnicianSupervisorsRepository extends BaseRepository<technician_supervisors> {
    /**
     * constructor
     * @param technicianSupervisors
     */
    public constructor(protected technicianSupervisors: typeof technician_supervisors) {
        super(technicianSupervisors);
    }

}
