import { NextFunction, Request, RequestHandler, Response } from 'express';

import { AssignProviderTypesService } from '../services/assign-provider-types.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AssignProviderTypesController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: AssignProviderTypesService
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

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

}
