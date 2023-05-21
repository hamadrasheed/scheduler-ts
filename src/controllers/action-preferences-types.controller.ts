import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ActionPreferencesTypesService } from '../services/action-preferences-types.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class ActionPreferencesTypesController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: ActionPreferencesTypesService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization } } = req;

            const response: ANY = await this.__service.getAll(authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' }

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
