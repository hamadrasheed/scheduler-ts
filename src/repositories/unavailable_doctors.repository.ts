import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * Un Available Speciality Repository Class
 */
export class UnAvailableDoctorRepository extends BaseRepository<models.sch_unavailable_doctors> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param unavailableDoctors
     */
    public constructor(protected unavailableDoctors: typeof models.sch_unavailable_doctors) {
        super(unavailableDoctors);
        this.joinClause = {
        };
    }

    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
    this.joinClause[apiName]
}
