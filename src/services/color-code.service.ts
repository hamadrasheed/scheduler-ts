import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import {
    ANY,
    setToDefaultReqObjI,
    UpdateColorCodeReqObjI
} from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class ColorCodeService extends Helper {

    public __http: Http;

    /**
     *
     * @param __repo
     * @param __userRepo
     * @param __colorCodeTypeRepo
     * @param __facilityLocationRepo
     * @param __userFacilityRepo
     * @param __rolesRepo
     * @param __specialityRepo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.colorCodeRepository,
        public __userRepo: typeof repositories.userRepository,
        public __colorCodeTypeRepo: typeof repositories.colorCodeTypeRepository,
        public __facilityLocationRepo: typeof repositories.facilityLocationRepository,
        public __userFacilityRepo: typeof repositories.userFacilityRepository,
        public __rolesRepo: typeof repositories.roleRepository,
        public __specialityRepo: typeof repositories.specialityRepository,
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
    public setToDefault = async (data: setToDefaultReqObjI, _authorization: string): Promise<ANY> => {

        const { user_id: userId = Number(process.env.USERID), object_ids: ObjectIds, type_id: typeId } = data;

        return this.__repo.updateByColumnMatched(
            {
                object_id: {
                    [Op.in]: ObjectIds
                },
                type_id : typeId
            },
            { deleted_at: new Date(), updated_by: userId }
        );

    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public update = async (data: UpdateColorCodeReqObjI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const { id, user_id: userId = Number(process.env.USERID), object_id: ObjectId, type_id: typeId, color_code: colorCode } = data;

        if (id) {
            return this.__repo.update(id, { code: colorCode, updated_by: userId }, transaction);
        }

        const existedColorCode: models.sch_color_codes = this.shallowCopy(await this.__repo.findOne({ user_id: userId, object_id: ObjectId, type_id: typeId, deleted_at: null }));

        if (!existedColorCode || !Object.keys(existedColorCode).length) {
            return this.__repo.create({ user_id: userId, object_id: ObjectId, type_id: typeId, code: colorCode }, transaction);
        }

        const { id: expectedId } = existedColorCode;

        return this.__repo.update(expectedId, { code: colorCode, updated_by: userId }, transaction);
    }

}
