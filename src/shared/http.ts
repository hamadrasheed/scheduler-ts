// tslint:disable-next-line: match-default-export-name
import axios, { AxiosResponse } from 'axios';

import { ANY, FileDataReqI, GenericHeadersI, GenericReqObjI } from './common';

export class Http {

    public emailGenator = (url: string, data: GenericReqObjI, headers?: GenericHeadersI) => {
        try {
            const result = axios.post(url, data, headers);
            return null;
        } catch (error) {
            console.log('error', error);
            throw error.response ? error.response.data : { ...error.data };
        }
    }

    public get = async (url: string, headers: GenericHeadersI): Promise<AxiosResponse> => {
        try {
            const response: AxiosResponse = await axios.get(url, headers);
            return response?.data;
        } catch (error) {
            throw { ...error?.response?.data, status: error?.response?.status };
        }
    }

    public logger =  (url: string, data: ANY, headers?: ANY): ANY => {

        try {
            const response = axios.post(url, data, headers);
            return null;
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.log('error', error);
            throw error.response ? error.response.data : { ...error.data };

        }

    }
    public post = async (url: string, data: GenericReqObjI, headers?: GenericHeadersI): Promise<AxiosResponse> => {
        try {
            const response: AxiosResponse = await axios.post(url, data, headers);
            return response.data;
        } catch (error) {
            throw { ...error?.response?.data, status: error?.response?.status };
        }
    }

    public put = async (url: string, data: GenericReqObjI, headers?: GenericHeadersI): Promise<AxiosResponse> => {
        try {
            const response: AxiosResponse = await axios.put(url, data, headers);
            return response.data;
        } catch (error) {
            throw { ...error?.response?.data, status: error?.response?.status };
        }
    }

    public webhook = (url: string, data: GenericReqObjI, headers?: GenericHeadersI): ANY => {
        try {
            const result = axios.post(url, data, headers);
            return null;
        } catch (error) {
            console.log('error', error);
            throw error.response ? error.response.data : { ...error.data };
        }
    }
}

export const _http: Http = new Http();
