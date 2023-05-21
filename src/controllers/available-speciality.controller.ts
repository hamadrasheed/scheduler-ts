import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { AvailableSpecialityService } from '../services/available-speciality.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class AvailableSpecialityController {
    /**
     *
     * @param __service
     */
    public constructor(
        public __service: AvailableSpecialityService
    ) {
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public delete = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __deleteAvailableSpecialityTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, query } = req;

                const response: ANY = await this.__service.delete(query, authorization, __deleteAvailableSpecialityTransaction);

                // tslint:disable-next-line: await-promise
                await __deleteAvailableSpecialityTransaction.commit();

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

            }
            catch(error){
                await __deleteAvailableSpecialityTransaction.rollback();
                throw error;

            }

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
    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getAll(body, authorization);

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
    public getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: ANY = await this.__service.getAppointments(query, authorization);

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
    public getPreCheckForUpdation = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getPreCheckForUpdation(body, authorization);

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
    public getSpecialityAssignments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getSpecialityAssignments(body, authorization);

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
    public post = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __createAvailableSpecialityTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.post(body, authorization,__createAvailableSpecialityTransaction);

                // tslint:disable-next-line: await-promise
                await __createAvailableSpecialityTransaction.commit();

                res.locals.data = { result: { data: response.data }, message_code: response?.message ? 'ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT' : 'SUCCESS' };

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
                await  __createAvailableSpecialityTransaction.rollback();
                throw error;
            }

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
     public postV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __createAvailableSpecialityTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.postV1(body, authorization,__createAvailableSpecialityTransaction);

                // tslint:disable-next-line: await-promise
                await __createAvailableSpecialityTransaction.commit();

                res.locals.data = { result: { data: response.data }, message_code: response?.message ? 'ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT' : 'SUCCESS' };

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
                await  __createAvailableSpecialityTransaction.rollback();
                throw error;
            }

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
    public createDoctorAssignments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __createDoctorAssignmentTransaction = await sequelize.transaction();

            try {

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.createDoctorAssignments(body, authorization, __createDoctorAssignmentTransaction);

                // tslint:disable-next-line: await-promise
                await __createDoctorAssignmentTransaction.commit();

                res.locals.data = { result: { data: response.data }, message_code: response?.message ? 'ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT' : 'SUCCESS' };

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
                console.log('error',error.stack);
                
                await __createDoctorAssignmentTransaction.rollback();
                throw error;
            }

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
            const __updateAvailableSpecialityTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.update(body, authorization, __updateAvailableSpecialityTransaction);

                // tslint:disable-next-line: await-promise
                await __updateAvailableSpecialityTransaction.commit();

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
               await __updateAvailableSpecialityTransaction.rollback();
               throw error;

            }

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
      public updateDoctorAssignment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __updateDoctorAssignmentTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.updateDoctorAssignment(body, authorization, __updateDoctorAssignmentTransaction);

                // tslint:disable-next-line: await-promise
                await __updateDoctorAssignmentTransaction.commit();

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
                console.log('error',error.stack)
               await __updateDoctorAssignmentTransaction.rollback();
               throw error;

            }

        } catch (error) {
            console.log('error',error.stack)
            next(error);
        }
    }

}
