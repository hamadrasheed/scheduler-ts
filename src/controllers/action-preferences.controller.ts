import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { ActionPreferencesService } from '../services/action-preferences.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class ActionPreferencesController {
    /**
     *
     * @param __service
     */
    public constructor(
        public __service: ActionPreferencesService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public get = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: ANY = await this.__service.get(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public post = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.add(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public put = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __updateActionPreferencesTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.update(body, authorization,__updateActionPreferencesTransaction);

                await __updateActionPreferencesTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;
                
            }catch(error){
                await __updateActionPreferencesTransaction.rollback();
                throw error;
            }

        } catch (error) {

            next(error);
        }
    }

}
