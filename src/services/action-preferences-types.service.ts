import * as Sequelize from 'sequelize';

import {

} from '../models';
import {
    actionPreferencesTypesRepository,
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ActionPreferencesTypesI } from '../shared/common/action-preferences-types';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class ActionPreferencesTypesService extends Helper {

    public __http: Http;

    /**
     *
     * @param __repo
     * @param http
     */
    public constructor(
        public __repo: typeof actionPreferencesTypesRepository,
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
    public getAll = async (_authorization: string): Promise<ActionPreferencesTypesI[]> =>

        this.__repo.findAll()

}
