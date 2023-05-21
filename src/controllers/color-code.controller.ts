import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { ColorCodeService } from '../services/color-code.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class ColorCodeController {

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: ColorCodeService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public setToDefault = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.setToDefault(body, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            // tslint:disable-next-line: no-magic-numbers
            // Res.status(200).json({
            //     ...generateMessages('SUCCESS'),
            //     Result: {
            //         Data: response
            //     }
            // });
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
    public update = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __updateColorCodeTransaction = await sequelize.transaction();
            
            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.update(body, authorization,__updateColorCodeTransaction);

                // tslint:disable-next-line: await-promise
                await __updateColorCodeTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                // tslint:disable-next-line: no-magic-numbers
                // Res.status(200).json({
                //     ...generateMessages('SUCCESS'),
                //     Result: {
                //         Data: response
                //     }
                // });
                return undefined;
             
            }catch(error){
                await __updateColorCodeTransaction.rollback();
                throw error;
            }

        } catch (error) {
            next(error);
        }
    }
}
