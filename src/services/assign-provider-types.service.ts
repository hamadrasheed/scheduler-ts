import * as Sequelize from 'sequelize';

import {
    sch_assign_provider_typesI
} from '../models';
import {
    assignProviderTypesRepository,
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AssignProviderTypesService extends Helper {

    public __http: Http;

    /**
     *
     * @param __repo
     * @param http
     */
    public constructor(
        public __repo: typeof assignProviderTypesRepository,
        public http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAll = async (_authorization: string): Promise<sch_assign_provider_typesI[]> =>

        this.__repo.findAll()

}
