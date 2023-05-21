import * as AWS from 'aws-sdk';
import { Request, Response } from 'express';

import { Frozen } from '../shared';
import { _http } from '../shared/';
import { ANY } from '../shared/common';

const cloudwatchlogs: AWS.CloudWatchLogs = new AWS.CloudWatchLogs();

@Frozen
export class LoggerService {

    public logData = async (request: Request, response: Response, response_type?: string, additionalInfo?: ANY, resObjMessage?: ANY, formatedResultData?: ANY, resultData?: ANY, count?: number, checkReccursive?: boolean): Promise<ANY> => {

        try {

            const { method, originalUrl } = request;
            const postGroupName: string = process.env.NODE_ENVR === 'production' ? 'prod' : process.env.NODE_ENVR;
            const logGroup: string = `${process.env.AWS_CLOUDWATCH_GROUP_NAME}_${postGroupName}`;
            const reqTag: string = 'http';
            const requestMethod: string = method;
            const requestUrl: string = originalUrl;
            const responseMessage: string = 'Requesting';
            const responseType: string =  response_type ?? 'info';

            const userId: string = (request.body.user_id == undefined) ? (request.query.user_id as string) : (request.body.user_id as string);
            if (!response.locals.executionTimeInMs){
                const executionTime = process.hrtime(response.locals.receptionTime);
                response.locals.executionTimeInMs = (executionTime[0] * 1000) + (executionTime[1] / 1000000);
            }

            const requestToGetToken: AWS.CloudWatchLogs.DescribeLogStreamsRequest = {
                descending: true,
                limit: 1,
                logGroupName: logGroup,
            };

            const params: AWS.CloudWatchLogs.PutLogEventsRequest = {
                logEvents: [
                    {
                        message: `[${responseType}], userId:${userId}, executionTime:${response.locals.executionTimeInMs} ${responseMessage} ${requestMethod} ${requestUrl}, ${JSON.stringify({ tags: reqTag, additionalInfo })} `,
                        timestamp: new Date().getTime()
                    },
                ],
                logGroupName: logGroup,
                logStreamName: logGroup,
                sequenceToken: (await cloudwatchlogs.describeLogStreams(requestToGetToken).promise()).logStreams[0].uploadSequenceToken
            };

            await cloudwatchlogs.putLogEvents(params).promise();
            return null;

        } catch (error) {
            if (count < 5) {
                await this.logToCloudWatch(request, response, response_type, additionalInfo, resObjMessage, formatedResultData, resultData, count, true);
            } else {
                console.log('error', error);
            }

            return null;
        }

    }

    public logToCloudWatch = async (request: Request, response: Response, response_type?: string, additionalInfo?: ANY, resObjMessage?: ANY, formatedResultData?: ANY, resultData?: ANY,  count?: number, checkReccursive?: boolean): Promise<ANY> => {

        try {

            let numberOfTries = count ? count : 0;
            
            if (checkReccursive) {
                numberOfTries = count + 1;
            }

            await this.logData(request, response, response_type, additionalInfo, resObjMessage, formatedResultData, resultData, numberOfTries, checkReccursive);
            return null;

        } catch (error) {
            return null;
        }

    }

    private readonly sendlogsToOATS = (req: Request, resultData: ANY): void => {

            // tslint:disable-next-line: typedef
            const logRestuest = {
            datetime: new Date(),
            name : 'scheduler',
            reqObj : {
                baseUrl: req.baseUrl,
                body : req.body,
                fullUrl: req.originalUrl,
                headers: req.headers,
                hostName: req.hostname,
                ip: req.ip,
                ips: req.ips,
                lastUrl: req.url,
                method: req.method,
                params : req.params,
                query : req.query,
                userAgent: req.get('user-agent'),
                xhr: req.xhr,
            },
            resObj : { ...resultData }
            };

            _http.logger('http://test.ovadamd.org:5005', { ...logRestuest });

    }

}

export const loggerService: LoggerService = new LoggerService();
