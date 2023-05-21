import * as dotenv from 'dotenv';

import { responses } from '../config/codes';
import { ANY } from '../shared/common';

dotenv.config({ path: '.env' });

interface GenerateMsgI {
    [key: string]: number | string;
}

/**
 *
 * @param code
 * @param validator
 * @param type
 */
export const generateMessages: (code: string, validator?: boolean, type?: string) => GenerateMsgI = (code: string, validator: boolean, type: string): GenerateMsgI => {

    const codes: ANY = JSON.parse(JSON.stringify(responses));

    if (validator) {
        return codes[`${process.env.NODE_ENVR}`][`${process.env.ENV_LANG}`].validator[`${type}`][`${code}`];
    }

    return codes[`${process.env.NODE_ENVR}`][`${process.env.ENV_LANG}`][`${code}`];

};
