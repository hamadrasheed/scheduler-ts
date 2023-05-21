
import * as Sequelize from 'sequelize';

import * as models from '../models';
import * as repositories from '../repositories';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';
import { generateMessages } from '../utils';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

/**
 * Appointment Service Class
 */

@Frozen
export class  FacilityLocationsService extends Helper {

    public __http: Http;

    public constructor(
        public __repo: typeof repositories.facilityLocationRepository,

        public http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    public getAll = async (query: typings.ANY, _authorization?: string): Promise<typings.ANY> => {
        const { day_id: dayId } = query;
        return this.__repo.findAll(
            {
                deleted_at: null
            },
            {
            include:
                {
                    as: 'faciltyTiming',
                    model: models.facility_timings,
                    where: {
                        day_id: dayId,
                        deleted_at: null
                    }
                },
        });
    }

}
