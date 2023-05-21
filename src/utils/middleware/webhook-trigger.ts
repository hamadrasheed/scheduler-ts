import { NextFunction, Request, RequestHandler, Response } from 'express';

import { Http } from '../../shared';
import { GenericHeadersI } from '../../shared/common';

class WebHookTriggerMiddleWare {

    private readonly __http: Http;

    public constructor() {
        this.__http = new Http();
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    public changeInAppointments = async (req: Request, res: Response, next: NextFunction): Promise<RequestHandler> =>  {
        try {
            const { headers: { authorization }, originalUrl } = req;
            const { user_id,case_id } = req.body;
            const config: GenericHeadersI = {
                headers: { Authorization: authorization },
            };
            
            let bodyObj: any = {};
            let caseIds = [];
            if ( originalUrl === '/api/appointments/cancel-appointments') {
                // caseId = res.locals.data.result.data[0].case_id
                caseIds = res.locals.data.result.socketData.map((e)=>{return e.case_id})
            }
            if(originalUrl === '/api/appointments/manually-update-status'){
                caseIds = [res.locals.data.result.data.case_id]
            }
            if(originalUrl === '/api/appointments/create-with-cptCodes'){
                caseIds = [res.locals.data.result.data.appointments[0]?.case_id]
            }
            if(user_id){
                bodyObj = { user_id};
            }
            bodyObj["case_ids"] = case_id?[case_id]:caseIds 
            // }

            // tslint:disable-next-line: no-floating-promises
            this.__http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, bodyObj, config);
            // this.__http.webhook(`${process.env.SOCKET_SERVER_URL}case-patient-session/change-in-waiting-list`, {}, config);

            next();

            return undefined;

        } catch (err) {
            next(err);
        }
    }

}

export const webHookTriggerMiddleWare: WebHookTriggerMiddleWare = new WebHookTriggerMiddleWare();
