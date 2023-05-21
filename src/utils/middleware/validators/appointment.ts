
// import { body, check, param, query, sanitize } from 'express-validator';

// import { ANY } from '../../../shared/common';
// import { generateMessages } from '../../generate-message';

// // -------------------------------------------------------------------------------------------//

// /**
//  * Appointment route validators
//  */

// // -------------------------------------------------------------------------------------------//

// export const getAppointmentListForHealthApp: ANY = [
//     query('patient_id')
//         .exists()
//         .isInt()
//         .withMessage(generateMessages('PATIENT_ID_REQUIRED', true, 'query')),
//     query('paginate')
//         .optional()
//         .isBoolean()
//         .withMessage(generateMessages('PAGINATE_IS_NOT_VALID', true, 'query')),
//     query('page')
//         .if(query('paginate').exists().isIn(['true']))
//         .isInt()
//         .withMessage(generateMessages('PAGE_IS_NOT_VALID', true, 'query')),
//     query('per_page')
//         .if(query('paginate').exists().isIn(['true']))
//         .isInt()
//         .withMessage(generateMessages('PER_PAGE_IS_NOT_VALID', true, 'query')),
//     query('case_id')
//         .optional()
//         .isInt()
//         .withMessage(generateMessages('CASE_IS_NOT_VALID', true, 'query')),
//     query('check')
//         .optional()
//         .isIn(['daily', 'weekly', 'previous', 'upcomming'])
//         .withMessage(generateMessages('CHECK_IS_NOT_VALID', true, 'query')),
//     query('date')
//         .optional()
//         .isDate()
//         .withMessage(generateMessages('DATE_IS_NOT_VALID', true, 'query'))
// ];
