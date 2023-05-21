import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Transaction } from 'sequelize';

import { sequelize } from '../config/database';
import { UserService } from '../services/user.service';
import { Frozen } from '../shared';
import { ANY } from '../shared/common';

@Frozen
export class UserController {

    

    /**
     *
     * @param __service
     */
    public constructor(
        public __service: UserService
    ) { }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public deleteAllAssignmentAndAppointment = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __deleteAllAssignmentAndAppointmentTransaction = await sequelize.transaction();

            try{

                const { headers: { authorization }, body } = req;

                const response: ANY = await this.__service.deleteAllAssignmentAndAppointment(body, authorization, __deleteAllAssignmentAndAppointmentTransaction);

                // tslint:disable-next-line: await-promise
                await __deleteAllAssignmentAndAppointmentTransaction.commit();

                res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

                next();

                return undefined;

            }catch(error){

                await __deleteAllAssignmentAndAppointmentTransaction.rollback();
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
    public getDoctorsDetail = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, query } = req;

            const response: ANY = await this.__service.getDoctorsDetail(query, authorization);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;

        } catch (error) {
            next(error);
        }
    }

    public getMaxMinOfFacility = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;


            const response: ANY = await this.__service.getMaxMinOfFacility(body, authorization);

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
    public getDoctorsInfo = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getDoctorsInfo(body, authorization);

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
    public getDoctorsInfoV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getDoctorsInfoV1(body, authorization);

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
    public getUserInfoByFacilities = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getUserInfoByFacilities(body, authorization);

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
    public getUserInfoBySpecialities = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getUserInfoBySpecialities(body, authorization);

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
    public getUserInfoBySpecialitiesV1 = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.getUserInfoBySpecialitiesV1(body, authorization);

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
    public updateSpecialityTimeSlots = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> => {
        try {

            // tslint:disable-next-line: await-promise
            const __updateSpecialityTimeSlotsTransaction = await sequelize.transaction();

            try{

            const { headers: { authorization }, body } = req;

            const response: ANY = await this.__service.updateSpecialityTimeSlots(body, authorization, __updateSpecialityTimeSlotsTransaction);

            res.locals.data = { result: { data: response }, message_code: 'SUCCESS' };

            next();

            return undefined;
            
            }
            catch(error){
                await __updateSpecialityTimeSlotsTransaction.rollback();
                throw error;
            }

        } catch (error) {
            next(error);
        }
    }

}
