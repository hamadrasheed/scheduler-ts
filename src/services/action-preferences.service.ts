import * as Sequelize from 'sequelize';
import { Transaction } from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import { ANY } from '../shared/common';
import {
    AddActionPreferencesI,
    FacilityLocationI,
    UpdateActionPreferencesI
} from '../shared/common/action-preferences';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class ActionPreferencesService extends Helper {

    public __http: Http;

    /**
     *
     * @param __repo
     * @param http
     */
    public constructor(
        public __repo: typeof repositories.actionPreferencesRepository,
        public __actionPreferenceForwardrepo: typeof repositories.actionPreferenceForwardFacilityLocationRepository,
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
    public add = async (data: AddActionPreferencesI, _authorization: string): Promise<AddActionPreferencesI> => {

        const {
            user_id: userId = Number(process.env.USERID),
            type_id: typeId,
        } = data;

        const existedUser: boolean = await this.__repo.exists(userId);

        if (existedUser) {
            throw generateMessages('USER_EXISTS');
        }

        // Default to 'Cancel' as 1 refers to it
        const typeID: number = typeId ? typeId : 1;

        return this.__repo.create({
            type_id: typeID,
            user_id: userId,
        });

    }

    /**
     *
     * @param data
     * @param _authorization
     * @returns
     */
    public get = async (data: ANY, _authorization: string): Promise<AddActionPreferencesI> => {

        const {
            user_id: userId = Number(process.env.USERID),
        } = data;

        return this.__repo.findOne(
            { deleted_at: null, user_id: userId },
            {
                include:
                    {
                        as: 'actionPreferencesFacilityLocations',
                        model: models.sch_action_preference_forward_facility_location,
                        required: false,
                        where: { deleted_at: null },
                    }
            });
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public update = async (data: UpdateActionPreferencesI, _authorization: string, transaction: Transaction): Promise<ANY> => {

        const {
            facility_location_type,
            type_id: typeId,
            facility_location: facilityLocation,
            user_id: userId = Number(process.env.USERID),
        } = data;

        let { action_preference_id: actionPerferenceId } = data;

        const facilityLocationType: number = facility_location_type ?? null;

        if (!actionPerferenceId) {
            actionPerferenceId = (this.shallowCopy(await this.__repo.create({
                facility_location_type: facilityLocationType,
                type_id: typeId,
                user_id: userId,
            })) as unknown as models.sch_action_preferences).id;
        }

        const existedUser: models.sch_action_preference_forward_facility_location = await this.__actionPreferenceForwardrepo.findOne({
            action_preference_id: actionPerferenceId,
            deleted_at: null,
        });

        if (existedUser && Object.keys(existedUser).length) {
            await this.__actionPreferenceForwardrepo.updateByColumnMatched({ action_preference_id: actionPerferenceId }, { deleted_at: new Date(), updated_by: userId }, transaction);
        }

        if (typeId === 2) {

            return this.__repo.updateByColumnMatched({ user_id: userId }, { type_id: typeId, facility_location_type: facilityLocationType, updated_by: userId }, transaction);

        }

        if (typeId === 3) {

            const facilityLocationData: FacilityLocationI[] = facilityLocation.map((p: FacilityLocationI): FacilityLocationI => ({
                ...p,
                action_preference_id: actionPerferenceId,
            }));

            await this.__actionPreferenceForwardrepo.bulkCreate([...facilityLocationData], transaction);

            return this.__repo.update(actionPerferenceId, { type_id: typeId, facility_location_type: null, updated_by: userId }, transaction);

        }

        return this.__repo.update(actionPerferenceId, { type_id: typeId, facility_location_type: null, updated_by: userId }, transaction);

    }

}
