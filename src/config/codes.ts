import { ANY } from '../shared/common';

export const responses: ANY = {
    development: {
        en: {
            SPECIALITY_REQUIRED: {
                message: 'Specialty field is required',
                status: 406
            },
            FACILITY_REQUIRED: {
                message: 'Facility field is required',
                status: 406
            },
            CPT_CODES_REQUIRED: {
                message: 'Cpt Code  field is required',
                status: 406
            },
            UNAVAILBILITY_SAME_TIME: {
                message: 'Provider already has unavailability at this time',
                status: 406
            },
            PATIENT_APPOINTMENT_EXIST:{
                message: 'First delete follow-Up & Re-Evaluation Appointments',
                status: 406
            },
            NO_SAME_APPOINTMENT: {
            message: 'No same appointment',
            status: 406
            },
            CLINIC_NOT_FOUND: {
                message: 'clinic not found!',
                status: 406
            },
            NO_FIND_SPECIALIYT: {
                message: 'Cannot find specialty of already assigned provider',
                status: 406
            },
            NO_USER_PRACTICE: {
                message: 'User has not allowed any practice',
                status: 406
            },
            NO_PROVIDE_PARACTICE: {
                message: 'Provider is not allowed any practice',
                status: 406
            },
            NO_PROVIDER_AVAILABLE: {
                message: 'Provider is not available at this time',
                status: 406
            },
            NO_DAYS_FOUND: {
                message: 'No Days Found',
                status: 406
            },
            NO_RESCHEDULED_APPOINTMENT: {
                message: 'Initial Appointment cannot be rescheduled after follow-up/re-evaluation appointment.',
                status: 406
            },
            NO_RESCHEDULED_INTIAL_APPONTMENT: {
                message: 'Appointment cannot be rescheduled before initial appointment.',
                status: 406
            },
            EVALUATION_ALREADY_STARTED: {
                message: `Appointment can't be updated because the evaluation has been already started.`,
                status: 406
            },
            NO_SHOW_STATUS: {
                message: `Appointment can't be updated because status is No Show.`,
                status: 406
            },
            NO_CREATED_APPOINTMENT: {
                message: `Initial Appointment cannot be created after follow-up/re-evaluation appointment.`,
                status: 406
            },
            APPOINTMENT_NOT_CREATED_BEFORE_INTIAL: {
                message: `Follow-up/Re-evaluation Appointment cannot be created before initial appointment.`,
                status: 406
            },
            NO_APPOINTMENT_CREATED_RECCURENCE: {
                message: `Initial Evaluation Appointment cannot be created in recurrence!`,
                status: 406
            },
            ERROR_FROM_KIOSK: {
                message: `Error from Kiosk`,
                status: 406
            },
            NO_SUPER_ADMIN: {
                message: `User is not super admin or is not practice supervisor on these facilities`,
                status: 406  
            },
            APPOINTMENT_WITHOUT_DOCTOR: {
                message: `This appointment can not be created without doctor`,
                status: 406
            },
            NO_TIME_FALL: {
                message: `New time doesn't fall in provider day/timings`,
                status: 406
            },
            NO_MANUALLY_DOCTORS: {
                message: `No manually selected doctors provided.`,
                status: 406
            },
            ID_MUST_PROVIDED: {
                message: 'Id must be provided',
                status: 406
            },
            USER_NOT_SUPERADMIN: {
                message: 'User is not superAdmin',
                status: 406
            },
            USER_ID_MUST_PROVIDED: {
                message: 'User Id must be provided',
                status: 406
            },
            ALREADY_ACTION: {
                message: 'Action already performed',
                status: 406
            },
            NO_UNAVAILABILTY_FOUND: {
                message: 'Unavailability not found',
                status: 406
            },
            ASSIGNMENT_NOT_FOUND: {
                message: 'Provider assignment not found!',
                status: 406
            },
            APPOINTMENT_NOT_FOUND: {
                message: 'Appointment not found!',
                status: 406
            },
            EVALUATION_ALREADY_UPDATE: {
                message: 'Appointment Evaluation Already Update!',
                status: 406
            },
            PROVIDER_DOES_NOT_HAVE_WC_AUTH: {
                message: 'Provider does not have WC authorization!',
                status: 406
            },
            APPOINTMENT_ALREADY_IN_PROCESS: {
                message: 'Appontment cannot be updated because Initial Evaluation Appointment is already in progress!',
                status: 406
            },
            APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE: {
                message: 'Appointment cannot be created on previous Date',
                status: 406
            },
            APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION: {
                message: 'Appointment cannot be done before or on Initial Evaluation Appointment Datetime',
                status: 406
            },
            APPOINTMENT_CAN_NOT_RESOLVED: {
                message: 'ALL appointments cannot be resolved.',
                status: 406
            },
            APPOINTMENT_EXISTS: {
                message: 'Could not update because appointment exists for this assignment!',
                status: 406
            },
            APPOINTMENT_MUST_END_BEFORE_PROGRESS: {
                message: 'Initial Appointment must end before re-evaluation/progress',
                status: 406
            },
            ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT: {
                message: 'Assignment Added/Created successfully but Providers are not available for complete Assignment',
                status: 200
            },
            ASSIGNMENT_DOES_NOT_FALL: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_TO_YOURSELF: {
                message: 'This appointment has already been assigned to another provider. Please refresh your calendar.',
                status: 400
            },
            CANNOT_CREATE_SPECIALITY_APPOINTMENT: {
                message: 'You cannot create specialty appointment for given specialty. Please update specialty information.',
                status: 406
            },
            CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT: {
                message: 'Assignment with Appointments cannot be deleted',
                status: 406
            },
            CANNOT_FIND_FREESLOTS: {
                message: 'Cannot find freeSlots for all given appointments',
                status: 406
            },
            CANNOT_GET_VISIT_STATUS: {
                message: 'Error occured while getting visit status!',
                status: 406
            },
            DOES_NOT_HAVE_PRACTISE: {
                message: `Each provider doesn't have specified practice as primary/secondary location.`,
                status: 406
            },
            ERROR_WHILE_FETCHING_FINALIZE_STATUS: {
                message: 'Error occured while getting finalize status!',
                status: 406
            },
            ERROR_WHILE_GETTING_STATUS_FROM_KIOSK: {
                message: 'Error occured while getting status from kiosk!',
                status: 406
            },
            ERROR_WHILE_UPDATING_STATUS: {
                message: 'Error occured while updating visit status!',
                status: 406
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_APPOINTMENT_IDS: {
                message: 'Appointment id(s) not valid!',
                status: 406
            },
            INVALID_APPOINTMENT_TYPE_ID: {
                message: 'Invalid Appointment type id.',
                status: 406
            },
            INVALID_ASSIGNMENT_ID: {
                message: 'Invalid Assignment id.',
                status: 406
            },
            INVALID_PATIENT_ID: {
                message: 'Invalid Patient Id',
                status: 406
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type.',
                status: 400
            },
            INVALID_SPECIALITY_IDS: {
                message: 'Invalid specialty id(s)',
                status: 406
            },
            LOGGED_IN_NOT_FOUND: {
                message: 'Logged-In User not found!',
                status: 406
            },
            LOGGED_IN_NOT_PROVIDER: {
                message: 'Logged In user is not a provider.',
                status: 406
            },
            MANUAL_ASSIGNMENT_NO_OF_DOCTORS: {
                message: 'Selected providers should be equal to no of providers',
                status: 406
            },
            NO_APPOINTMENT_FOUND: {
                message: 'No appointments Found!',
                status: 406
            },
            NO_APPOINTMENT_OF_GIVEN_ID: {
                message: 'Cannot find appointment against given id.',
                status: 406
            },
            NO_APPOINTMENT_TO_SHOW: {
                message: 'No appointments to show as per users rights.',
                status: 406
            },
            NO_ASSIGNMENT_FOUND: {
                message: 'No assignment found',
                status: 406
            },
            NO_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find assignment for given appointment time.',
                status: 406
            },
            NO_PROVIDER_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find provider assignment at the given time.',
                status: 406
            },
            NO_ASSIGNMENT_PROPOSED: {
                message: 'No new assignment proposed',
                status: 406
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id.',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 406
            },
            NO_FREE_SLOTS_FOUND: {
                message: 'No freeslots on practice(s)',
                status: 406
            },
            NO_HISTORY_FOUND: {
                message: `Assignment history doesn't exist`,
                status: 406
            },
            NO_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'No Initial Evaluation Appointment of this patient for this case and specialty!',
                status: 406
            },
            NO_OTHER_ASSIGNMENTS_FOUND: { 
                message: 'No other assignments of provider.',
                status: 406
            },
            NO_PRACTICES_FOUND: {
                message: 'Practice(s) not found',
                status: 406
            },
            NO_PROVIDER_FOUND: {
                message: 'No provider found for this specialty.',
                status: 406
            },
            NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION: {
                message: 'No provider found for Worker Compensation Case!',
                status: 406
            },
            NO_PROVIDER_OF_SPECIALITY_FOUND: {
                message: 'No Providers of this specialty found! TimeSlot of specialty is changed',
                status: 406
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 406
            },
            NO_SLOTS_REMAINING: {
                message: 'No slots remaining at this time.',
                status: 406
            },
            NO_SLOT_FOUND: {
                message: 'No Slots found',
                status: 406
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 406
            },
            NO_SPECIALITY_FOUND: {
                message: 'No speciality exist for specified id.',
                status: 400
            },
            NO_SPECIALITY_FOUND_FOR_KEY: {
                message: 'No speciality exist for specified speciality_key.',
                status: 400
            },
            NO_WC_AUTHORIZE: {
                message: 'Provider does not have WC authorizatio.',
                status: 400
            },
            PAST_APPOINTMENTS: {
                message: 'Past Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY: {
                message: 'Patient already has appointment on the same day.',
                status: 406
            },
            APPOINTMENT_ALREADY_EXIST: {
                message: 'Appointment already exist',
                status: 406
            },
            FUTURE_APPOINTMENTS: {
                message: 'Future Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_ASSIGNMENT: {
                message: 'Patient already has appointment at this time.',
                status: 406
            },
            PATIENT_ALREADY_IN_SESSION: {
                message: 'Patient already in In-Session.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'Patient already has Initial Evaluation Appointment for this case and specialty!',
                status: 406
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 406
            },
            PROVIDER_IS_NOT_ASSIGNED_TO_ANY_SPECIALITY: {
                message: 'Provider is not assigned any specialty',
                status: 406
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 406
            },
            PROVIDER_NOT_FOUND: {
                message: 'Provider not found',
                status: 406
            },
            SAME_ASSIGNMENT_EXIST: {
                message: 'Same assignment already exist',
                status: 406
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 406
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 406
            },
            USER_HAS_NO_ROLES: {
                message: 'No roles found against Logged-In User!',
                status: 406
            },
            USER_NOT_ALLOWED: {
                message: 'User is not allowed this practice!',
                status: 406
            },
            VISIT_STATUS_IS_NOT_CHECKED_IN: {
                message: `Visit status is not 'Checked-In'. This evaluation cannot be started!`,
                status: 406
            },
            VISIT_STATUS_IS_NO_SHOW: {
                message: 'Appointment and Visit status is No Show. Evaluation cannot be started',
                status: 406
            },
            CASE_ID_REQUIRED: {
                message: 'Case id must be provided',
                status: 406
            },
            APPOINTMENT_WITH_SAME_CRITERIA_EXIST: {
                message: 'Appointment is already created with same criteria',
                status: 406
            },
            APPOINTMENT_CANNOT_UPDATED: {
                message: 'Appointment can not be updated as Appointment is already created with same criteria',
                status: 406
            },
            REQUIRED_APPOINTMENT_NOT_EXIST: {
                message: `Required Appointment doesn't exist`,
                status: 406
            },
            SELECTED_APPOINTMENT_SPECIALITY_ERROR: {
                message: `Selected appointment type doesn't exist in selected speciality`,
                status: 406
            },
            SAME_TIME_APPOINTMENT_ERROR: {
                message: `Pateint already have scheduled appointment selected time!`,
                status: 406
            },
            VISIT_SESSION_ERROR: {
                message: `Visit Session doesn't exist`,
                status: 406
            },
            VALID_APPOINTMENT_NAME_ERROR: {
                message: 'Provide valid appointment type',
                status: 406
            },
            TIME_SLOTS_ISSUE: {
                message: 'Selected Time slot is reserved.',
                status: 406
            },
            CHECK_MASTER_VISIT_TYPE: {
                message: 'Please check Specialty Master, Someone has updated the information!',
                status: 406
            },
            validator: {
                body: {
                    BODY_NOT_EMPTY: 'request body should not empty',
                    DOCTOR_ID_INTEGER: 'doctor_id must be integer',
                    DOCTOR_ID_REQUIRED: 'doctor_id must cannot be empty',
                    SPECIALITY_ID_INTEGER: 'speciality_id must be integer',
                    SPECIALITY_ID_REQUIRED: 'speciality_id cannot be empty',
                    USER_ID_INTEGER: 'user_id must be integer',
                    USER_ID_REQUIRED: 'user_id must cannot be empty',
                },
                query: {
                    CASE_IS_NOT_VALID: 'case_id must cannot be integer',
                    CHECK_IS_NOT_VALID: 'check must be [daily, weekly, previous, upcomming]',
                    DATE_IS_NOT_VALID: 'date must be 0000-00-00',
                    PAGE_IS_NOT_VALID: 'page must be integer',
                    PAGINATE_IS_NOT_VALID: 'paginate must be boolean',
                    PATIENT_ID_REQUIRED: 'patient_id must cannot be empty',
                    PER_PAGE_IS_NOT_VALID: 'per_page must be integer',
                    TEST: 'test'
                }
            },
        },
    },
    production: {
        en: {
            SPECIALITY_REQUIRED: {
                message: 'Specialty field is required',
                status: 406
            },
            FACILITY_REQUIRED: {
                message: 'Facility field is required',
                status: 406
            },
            CPT_CODES_REQUIRED: {
                message: 'Cpt Code  field is required',
                status: 406
            },
            UNAVAILBILITY_SAME_TIME: {
                message: 'Provider already has unavailability at this time',
                status: 406
            },
            PATIENT_APPOINTMENT_EXIST:{
                message: 'First delete follow-Up & Re-Evaluation Appointments',
                status: 406
            },
            NO_SAME_APPOINTMENT: {
                message: 'No same appointment',
                status: 406
            },
            CLINIC_NOT_FOUND: {
                message: 'clinic not found!',
                status: 406
            },
            NO_FIND_SPECIALIYT: {
                message: 'Cannot find specialty of already assigned provider',
                status: 406
            },
            NO_USER_PRACTICE: {
                message: 'User has not allowed any practice',
                status: 406
            },
            NO_PROVIDE_PARACTICE: {
                message: 'Provider is not allowed any practice',
                status: 406
            },
            NO_PROVIDER_AVAILABLE: {
                message: 'Provider is not available at this time',
                status: 406
            },
            NO_DAYS_FOUND: {
                message: 'No Days Found',
                status: 406
            },
            NO_RESCHEDULED_APPOINTMENT: {
                message: 'Initial Appointment cannot be rescheduled after follow-up/re-evaluation appointment.',
                status: 406
            },
            NO_RESCHEDULED_INTIAL_APPONTMENT: {
                message: 'Appointment cannot be rescheduled before initial appointment.',
                status: 406
            },
            EVALUATION_ALREADY_STARTED: {
                message: `Appointment can't be updated because the evaluation has been already started.`,
                status: 406
            },
            NO_SHOW_STATUS: {
                message: `Appointment can't be updated because status is No Show.`,
                status: 406
            },
            NO_CREATED_APPOINTMENT: {
                message: `Initial Appointment cannot be created after follow-up/re-evaluation appointment.`,
                status: 406
            },
            APPOINTMENT_NOT_CREATED_BEFORE_INTIAL: {
                message: `Follow-up/Re-evaluation Appointment cannot be created before initial appointment.`,
                status: 406
            },
            NO_APPOINTMENT_CREATED_RECCURENCE: {
                message: `Initial Evaluation Appointment cannot be created in recurrence!`,
                status: 406
            },
            ERROR_FROM_KIOSK: {
                message: `Error from Kiosk`,
                status: 406
            },
            NO_SUPER_ADMIN: {
                message: `User is not super admin or is not practice supervisor on these facilities`,
                status: 406  
            },
            APPOINTMENT_WITHOUT_DOCTOR: {
                message: `This appointment can not be created without doctor`,
                status: 406
            },
            NO_TIME_FALL: {
                message: `New time doesn't fall in provider day/timings`,
                status: 406
            },
            NO_MANUALLY_DOCTORS: {
                message: `No manually selected doctors provided.`,
                status: 406
            },
            ID_MUST_PROVIDED: {
                message: 'Id must be provided',
                status: 406
            },
            USER_NOT_SUPERADMIN: {
                message: 'User is not superAdmin',
                status: 406
            },
            USER_ID_MUST_PROVIDED: {
                message: 'User Id must be provided',
                status: 406
            },
            ALREADY_ACTION: {
                message: 'Action already performed',
                status: 406
            },
            NO_UNAVAILABILTY_FOUND: {
                message: 'Unavailability not found',
                status: 406
            },
            ASSIGNMENT_NOT_FOUND: {
                message: 'Provider assignment not found!',
                status: 406
            },
            APPOINTMENT_NOT_FOUND: {
                message: 'Appointment not found!',
                status: 406
            },
            EVALUATION_ALREADY_UPDATE: {
                message: 'Appointment Evaluation Already Update!',
                status: 406
            },
            PROVIDER_DOES_NOT_HAVE_WC_AUTH: {
                message: 'Provider does not have WC authorization!',
                status: 406
            },
            APPOINTMENT_ALREADY_IN_PROCESS: {
                message: 'Appontment cannot be updated because Initial Evaluation Appointment is already in progress!',
                status: 406
            },
            APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE: {
                message: 'Appointment cannot be created on previous Date',
                status: 406
            },
            APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION: {
                message: 'Appointment cannot be done before or on Initial Evaluation Appointment Datetime',
                status: 406
            },
            APPOINTMENT_CAN_NOT_RESOLVED: {
                message: 'ALL appointments cannot be resolved.',
                status: 406
            },
            APPOINTMENT_EXISTS: {
                message: 'Could not update because appointment exists for this assignment!',
                status: 406
            },
            APPOINTMENT_MUST_END_BEFORE_PROGRESS: {
                message: 'Initial Appointment must end before re-evaluation/progress',
                status: 406
            },
            ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT: {
                message: 'Assignment Added/Created successfully but Providers are not available for complete Assignment',
                status: 200
            },
            ASSIGNMENT_DOES_NOT_FALL: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_TO_YOURSELF: {
                message: 'This appointment has already been assigned to another provider. Please refresh your calendar.',
                status: 400
            },
            CANNOT_CREATE_SPECIALITY_APPOINTMENT: {
                message: 'You cannot create specialty appointment for given specialty. Please update specialty information.',
                status: 406
            },
            CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT: {
                message: 'Assignment with Appointments cannot be deleted',
                status: 406
            },
            CANNOT_FIND_FREESLOTS: {
                message: 'Cannot find freeSlots for all given appointments',
                status: 406
            },
            CANNOT_GET_VISIT_STATUS: {
                message: 'Error occured while getting visit status!',
                status: 406
            },
            DOES_NOT_HAVE_PRACTISE: {
                message: `Each provider doesn't have specified practice as primary/secondary location.`,
                status: 406
            },
            ERROR_WHILE_FETCHING_FINALIZE_STATUS: {
                message: 'Error occured while getting finalize status!',
                status: 406
            },
            ERROR_WHILE_GETTING_STATUS_FROM_KIOSK: {
                message: 'Error occured while getting status from kiosk!',
                status: 406
            },
            ERROR_WHILE_UPDATING_STATUS: {
                message: 'Error occured while updating visit status!',
                status: 406
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_APPOINTMENT_IDS: {
                message: 'Appointment id(s) not valid!',
                status: 406
            },
            INVALID_APPOINTMENT_TYPE_ID: {
                message: 'Invalid Appointment type id.',
                status: 406
            },
            INVALID_ASSIGNMENT_ID: {
                message: 'Invalid Assignment id.',
                status: 406
            },
            INVALID_PATIENT_ID: {
                message: 'Invalid Patient Id',
                status: 406
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type.',
                status: 400
            },
            INVALID_SPECIALITY_IDS: {
                message: 'Invalid specialty id(s)',
                status: 406
            },
            LOGGED_IN_NOT_FOUND: {
                message: 'Logged-In User not found!',
                status: 406
            },
            LOGGED_IN_NOT_PROVIDER: {
                message: 'Logged In user is not a provider.',
                status: 406
            },
            MANUAL_ASSIGNMENT_NO_OF_DOCTORS: {
                message: 'Selected providers should be equal to no of providers',
                status: 406
            },
            NO_APPOINTMENT_FOUND: {
                message: 'No appointments Found!',
                status: 406
            },
            NO_APPOINTMENT_OF_GIVEN_ID: {
                message: 'Cannot find appointment against given id.',
                status: 406
            },
            NO_APPOINTMENT_TO_SHOW: {
                message: 'No appointments to show as per users rights.',
                status: 406
            },
            NO_ASSIGNMENT_FOUND: {
                message: 'No assignment found',
                status: 406
            },
            NO_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find assignment for given appointment time.',
                status: 406
            },
            NO_PROVIDER_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find provider assignment at the given time.',
                status: 406
            },
            NO_ASSIGNMENT_PROPOSED: {
                message: 'No new assignment proposed',
                status: 406
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id.',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 406
            },
            NO_FREE_SLOTS_FOUND: {
                message: 'No freeslots on practice(s)',
                status: 406
            },
            NO_HISTORY_FOUND: {
                message: `Assignment history doesn't exist`,
                status: 406
            },
            NO_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'No Initial Evaluation Appointment of this patient for this case and specialty!',
                status: 406
            },
            NO_OTHER_ASSIGNMENTS_FOUND: {
                message: 'No other assignments of provider.',
                status: 406
            },
            NO_PRACTICES_FOUND: {
                message: 'Practice(s) not found',
                status: 406
            },
            NO_PROVIDER_FOUND: {
                message: 'No provider found for this specialty.',
                status: 406
            },
            NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION: {
                message: 'No provider found for Worker Compensation Case!',
                status: 406
            },
            NO_PROVIDER_OF_SPECIALITY_FOUND: {
                message: 'No Providers of this specialty found! TimeSlot of specialty is changed',
                status: 406
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 406
            },
            NO_SLOTS_REMAINING: {
                message: 'No slots remaining at this time.',
                status: 406
            },
            NO_SLOT_FOUND: {
                message: 'No Slots found',
                status: 406
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 406
            },
            NO_SPECIALITY_FOUND: {
                message: 'No speciality exist for specified id.',
                status: 400
            },
            NO_SPECIALITY_FOUND_FOR_KEY: {
                message: 'No speciality exist for specified speciality_key.',
                status: 400
            },
            NO_WC_AUTHORIZE: {
                message: 'Provider does not have WC authorizatio.',
                status: 400
            },
            PAST_APPOINTMENTS: {
                message: 'Past Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY: {
                message: 'Patient already has appointment on the same day.',
                status: 406
            },
            APPOINTMENT_ALREADY_EXIST: {
                message: 'Appointment already exist',
                status: 406
            },
            FUTURE_APPOINTMENTS: {
                message: 'Future Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_ASSIGNMENT: {
                message: 'Patient already has appointment at this time.',
                status: 406
            },
            PATIENT_ALREADY_IN_SESSION: {
                message: 'Patient already in In-Session.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'Patient already has Initial Evaluation Appointment for this case and specialty!',
                status: 406
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 406
            },
            PROVIDER_IS_NOT_ASSIGNED_TO_ANY_SPECIALITY: {
                message: 'Provider is not assigned any specialty',
                status: 406
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 406
            },
            PROVIDER_NOT_FOUND: {
                message: 'Provider not found',
                status: 406
            },
            SAME_ASSIGNMENT_EXIST: {
                message: 'Same assignment already exist',
                status: 406
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 406
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 406
            },
            USER_HAS_NO_ROLES: {
                message: 'No roles found against Logged-In User!',
                status: 406
            },
            USER_NOT_ALLOWED: {
                message: 'User is not allowed this practice!',
                status: 406
            },
            VISIT_STATUS_IS_NOT_CHECKED_IN: {
                message: `Visit status is not 'Checked-In'. This evaluation cannot be started!`,
                status: 406
            },
            VISIT_STATUS_IS_NO_SHOW: {
                message: 'Appointment and Visit status is No Show. Evaluation cannot be started',
                status: 406
            },
            CASE_ID_REQUIRED: {
                message: 'Case id must be provided',
                status: 406
            },
            APPOINTMENT_WITH_SAME_CRITERIA_EXIST: {
                message: 'Appointment is already created with same criteria',
                status: 406
            },
            APPOINTMENT_CANNOT_UPDATED: {
                message: 'Appointment can not be updated as Appointment is already created with same criteria',
                status: 406
            },
            REQUIRED_APPOINTMENT_NOT_EXIST: {
                message: `Required Appointment doesn't exist`,
                status: 406
            },
            SELECTED_APPOINTMENT_SPECIALITY_ERROR: {
                message: `Selected appointment type doesn't exist in selected speciality`,
                status: 406
            },
            SAME_TIME_APPOINTMENT_ERROR: {
                message: `Pateint already have scheduled appointment selected time!`,
                status: 406
            },
            VISIT_SESSION_ERROR: {
                message: `Visit Session doesn't exist`,
                status: 406
            },
            VALID_APPOINTMENT_NAME_ERROR: {
                message: 'Provide valid appointment type',
                status: 406
            },
            TIME_SLOTS_ISSUE: {
                message: 'Selected Time slot is reserved.',
                status: 406
            },
            CHECK_MASTER_VISIT_TYPE: {
                message: 'Please check Specialty Master, Someone has updated the information!',
                status: 406
            },
            validator: {
                body: {
                    BODY_NOT_EMPTY: 'request body should not empty',
                    DOCTOR_ID_INTEGER: 'doctor_id must be integer',
                    DOCTOR_ID_REQUIRED: 'doctor_id must cannot be empty',
                    SPECIALITY_ID_INTEGER: 'speciality_id must be integer',
                    SPECIALITY_ID_REQUIRED: 'speciality_id cannot be empty',
                    USER_ID_INTEGER: 'user_id must be integer',
                    USER_ID_REQUIRED: 'user_id must cannot be empty',
                },
                query: {
                    CASE_IS_NOT_VALID: 'case_id must cannot be integer',
                    CHECK_IS_NOT_VALID: 'check must be [daily, weekly, previous, upcomming]',
                    DATE_IS_NOT_VALID: 'date must be 0000-00-00',
                    PAGE_IS_NOT_VALID: 'page must be integer',
                    PAGINATE_IS_NOT_VALID: 'paginate must be boolean',
                    PATIENT_ID_REQUIRED: 'patient_id must cannot be empty',
                    PER_PAGE_IS_NOT_VALID: 'per_page must be integer',
                    TEST: 'test'
                }
            },
        },
    },
    qa: {
        en: {
            SPECIALITY_REQUIRED: {
                message: 'Specialty field is required',
                status: 406
            },
            FACILITY_REQUIRED: {
                message: 'Facility field is required',
                status: 406
            },
            CPT_CODES_REQUIRED: {
                message: 'Cpt Code  field is required',
                status: 406
            },
            UNAVAILBILITY_SAME_TIME: {
                message: 'Provider already has unavailability at this time',
                status: 406
            },
            PATIENT_APPOINTMENT_EXIST:{
                message: 'First delete follow-Up & Re-Evaluation Appointments',
                status: 406
            },
            NO_SAME_APPOINTMENT: {
                message: 'No same appointment',
                status: 406
            },
            CLINIC_NOT_FOUND: {
                message: 'clinic not found!',
                status: 406
            },
            NO_FIND_SPECIALIYT: {
                message: 'Cannot find specialty of already assigned provider',
                status: 406
            },
            NO_USER_PRACTICE: {
                message: 'User has not allowed any practice',
                status: 406
            },
            NO_PROVIDE_PARACTICE: {
                message: 'Provider is not allowed any practice',
                status: 406
            },
            NO_PROVIDER_AVAILABLE: {
                message: 'Provider is not available at this time',
                status: 406
            },
            NO_DAYS_FOUND: {
                message: 'No Days Found',
                status: 406
            },
            NO_RESCHEDULED_APPOINTMENT: {
                message: 'Initial Appointment cannot be rescheduled after follow-up/re-evaluation appointment.',
                status: 406
            },
            NO_RESCHEDULED_INTIAL_APPONTMENT: {
                message: 'Appointment cannot be rescheduled before initial appointment.',
                status: 406
            },
            EVALUATION_ALREADY_STARTED: {
                message: `Appointment can't be updated because the evaluation has been already started.`,
                status: 406
            },
            NO_SHOW_STATUS: {
                message: `Appointment can't be updated because status is No Show.`,
                status: 406
            },
            NO_CREATED_APPOINTMENT: {
                message: `Initial Appointment cannot be created after follow-up/re-evaluation appointment.`,
                status: 406
            },
            APPOINTMENT_NOT_CREATED_BEFORE_INTIAL: {
                message: `Follow-up/Re-evaluation Appointment cannot be created before initial appointment.`,
                status: 406
            },
            NO_APPOINTMENT_CREATED_RECCURENCE: {
                message: `Initial Evaluation Appointment cannot be created in recurrence!`,
                status: 406
            },
            ERROR_FROM_KIOSK: {
                message: `Error from Kiosk`,
                status: 406
            },
            NO_SUPER_ADMIN: {
                message: `User is not super admin or is not practice supervisor on these facilities`,
                status: 406  
            },
            APPOINTMENT_WITHOUT_DOCTOR: {
                message: `This appointment can not be created without doctor`,
                status: 406
            },
            NO_TIME_FALL: {
                message: `New time doesn't fall in provider day/timings`,
                status: 406
            },
            NO_MANUALLY_DOCTORS: {
                message: `No manually selected doctors provided.`,
                status: 406
            },
            ID_MUST_PROVIDED: {
                message: 'Id must be provided',
                status: 406
            },
            USER_NOT_SUPERADMIN: {
                message: 'User is not superAdmin',
                status: 406
            },
            USER_ID_MUST_PROVIDED: {
                message: 'User Id must be provided',
                status: 406
            },
            ALREADY_ACTION: {
                message: 'Action already performed',
                status: 406
            },
            NO_UNAVAILABILTY_FOUND: {
                message: 'Unavailability not found',
                status: 406
            },
            APPOINTMENT_NOT_FOUND: {
                message: 'Appointment not found!',
                status: 406
            },
            EVALUATION_ALREADY_UPDATE: {
                message: 'Appointment Evaluation Already Update!',
                status: 406
            },
            ASSIGNMENT_NOT_FOUND: {
                message: 'Provider assignment not found!',
                status: 406
            },
            PROVIDER_DOES_NOT_HAVE_WC_AUTH: {
                message: 'Provider does not have WC authorization!',
                status: 406
            },
            APPOINTMENT_ALREADY_IN_PROCESS: {
                message: 'Appontment cannot be updated because Initial Evaluation Appointment is already in progress!',
                status: 406
            },
            APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE: {
                message: 'Appointment cannot be created on previous Date',
                status: 406
            },
            APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION: {
                message: 'Appointment cannot be done before or on Initial Evaluation Appointment Datetime',
                status: 406
            },
            APPOINTMENT_CAN_NOT_RESOLVED: {
                message: 'ALL appointments cannot be resolved.',
                status: 406
            },
            APPOINTMENT_EXISTS: {
                message: 'Could not update because appointment exists for this assignment!',
                status: 406
            },
            APPOINTMENT_MUST_END_BEFORE_PROGRESS: {
                message: 'Initial Appointment must end before re-evaluation/progress',
                status: 406
            },
            ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT: {
                message: 'Assignment Added/Created successfully but Providers are not available for complete Assignment',
                status: 200
            },
            ASSIGNMENT_DOES_NOT_FALL: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_TO_YOURSELF: {
                message: 'This appointment has already been assigned to another provider. Please refresh your calendar.',
                status: 400
            },
            CANNOT_CREATE_SPECIALITY_APPOINTMENT: {
                message: 'You cannot create specialty appointment for given specialty. Please update specialty information.',
                status: 406
            },
            CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT: {
                message: 'Assignment with Appointments cannot be deleted',
                status: 406
            },
            CANNOT_FIND_FREESLOTS: {
                message: 'Cannot find freeSlots for all given appointments',
                status: 406
            },
            CANNOT_GET_VISIT_STATUS: {
                message: 'Error occured while getting visit status!',
                status: 406
            },
            DOES_NOT_HAVE_PRACTISE: {
                message: `Each provider doesn't have specified practice as primary/secondary location.`,
                status: 406
            },
            ERROR_WHILE_FETCHING_FINALIZE_STATUS: {
                message: 'Error occured while getting finalize status!',
                status: 406
            },
            ERROR_WHILE_GETTING_STATUS_FROM_KIOSK: {
                message: 'Error occured while getting status from kiosk!',
                status: 406
            },
            ERROR_WHILE_UPDATING_STATUS: {
                message: 'Error occured while updating visit status!',
                status: 406
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_APPOINTMENT_IDS: {
                message: 'Appointment id(s) not valid!',
                status: 406
            },
            INVALID_APPOINTMENT_TYPE_ID: {
                message: 'Invalid Appointment type id.',
                status: 406
            },
            INVALID_ASSIGNMENT_ID: {
                message: 'Invalid Assignment id.',
                status: 406
            },
            INVALID_PATIENT_ID: {
                message: 'Invalid Patient Id',
                status: 406
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type.',
                status: 400
            },
            INVALID_SPECIALITY_IDS: {
                message: 'Invalid specialty id(s)',
                status: 406
            },
            LOGGED_IN_NOT_FOUND: {
                message: 'Logged-In User not found!',
                status: 406
            },
            LOGGED_IN_NOT_PROVIDER: {
                message: 'Logged In user is not a provider.',
                status: 406
            },
            MANUAL_ASSIGNMENT_NO_OF_DOCTORS: {
                message: 'Selected providers should be equal to no of providers',
                status: 406
            },
            NO_APPOINTMENT_FOUND: {
                message: 'No appointments Found!',
                status: 406
            },
            NO_APPOINTMENT_OF_GIVEN_ID: {
                message: 'Cannot find appointment against given id.',
                status: 406
            },
            NO_APPOINTMENT_TO_SHOW: {
                message: 'No appointments to show as per users rights.',
                status: 406
            },
            NO_ASSIGNMENT_FOUND: {
                message: 'No assignment found',
                status: 406
            },
            NO_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find assignment for given appointment time.',
                status: 406
            },
            NO_PROVIDER_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find provider assignment at the given time.',
                status: 406
            },
            NO_ASSIGNMENT_PROPOSED: {
                message: 'No new assignment proposed',
                status: 406
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id.',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 406
            },
            NO_FREE_SLOTS_FOUND: {
                message: 'No freeslots on practice(s)',
                status: 406
            },
            NO_HISTORY_FOUND: {
                message: `Assignment history doesn't exist`,
                status: 406
            },
            NO_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'No Initial Evaluation Appointment of this patient for this case and specialty!',
                status: 406
            },
            NO_OTHER_ASSIGNMENTS_FOUND: {
                message: 'No other assignments of provider.',
                status: 406
            },
            NO_PRACTICES_FOUND: {
                message: 'Practice(s) not found',
                status: 406
            },
            NO_PROVIDER_FOUND: {
                message: 'No provider found for this specialty.',
                status: 406
            },
            NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION: {
                message: 'No provider found for Worker Compensation Case!',
                status: 406
            },
            NO_PROVIDER_OF_SPECIALITY_FOUND: {
                message: 'No Providers of this specialty found! TimeSlot of specialty is changed',
                status: 406
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 406
            },
            NO_SLOTS_REMAINING: {
                message: 'No slots remaining at this time.',
                status: 406
            },
            NO_SLOT_FOUND: {
                message: 'No Slots found',
                status: 406
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 406
            },
            NO_SPECIALITY_FOUND: {
                message: 'No speciality exist for specified id.',
                status: 400
            },
            NO_SPECIALITY_FOUND_FOR_KEY: {
                message: 'No speciality exist for specified speciality_key.',
                status: 400
            },
            NO_WC_AUTHORIZE: {
                message: 'Provider does not have WC authorizatio.',
                status: 400
            },
            PAST_APPOINTMENTS: {
                message: 'Past Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY: {
                message: 'Patient already has appointment on the same day.',
                status: 406
            },
            APPOINTMENT_ALREADY_EXIST: {
                message: 'Appointment already exist',
                status: 406
            },
            FUTURE_APPOINTMENTS: {
                message: 'Future Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_ASSIGNMENT: {
                message: 'Patient already has appointment at this time.',
                status: 406
            },
            PATIENT_ALREADY_IN_SESSION: {
                message: 'Patient already in In-Session.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'Patient already has Initial Evaluation Appointment for this case and specialty!',
                status: 406
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 406
            },
            PROVIDER_IS_NOT_ASSIGNED_TO_ANY_SPECIALITY: {
                message: 'Provider is not assigned any specialty',
                status: 406
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 406
            },
            PROVIDER_NOT_FOUND: {
                message: 'Provider not found',
                status: 406
            },
            SAME_ASSIGNMENT_EXIST: {
                message: 'Same assignment already exist',
                status: 406
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 406
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 406
            },
            USER_HAS_NO_ROLES: {
                message: 'No roles found against Logged-In User!',
                status: 406
            },
            USER_NOT_ALLOWED: {
                message: 'User is not allowed this practice!',
                status: 406
            },
            VISIT_STATUS_IS_NOT_CHECKED_IN: {
                message: `Visit status is not 'Checked-In'. This evaluation cannot be started!`,
                status: 406
            },
            VISIT_STATUS_IS_NO_SHOW: {
                message: 'Appointment and Visit status is No Show. Evaluation cannot be started',
                status: 406
            },
            CASE_ID_REQUIRED: {
                message: 'Case id must be provided',
                status: 406
            },
            APPOINTMENT_WITH_SAME_CRITERIA_EXIST: {
                message: 'Appointment is already created with same criteria',
                status: 406
            },
            APPOINTMENT_CANNOT_UPDATED: {
                message: 'Appointment can not be updated as Appointment is already created with same criteria',
                status: 406
            },
            REQUIRED_APPOINTMENT_NOT_EXIST: {
                message: `Required Appointment doesn't exist`,
                status: 406
            },
            SELECTED_APPOINTMENT_SPECIALITY_ERROR: {
                message: `Selected appointment type doesn't exist in selected speciality`,
                status: 406
            },
            SAME_TIME_APPOINTMENT_ERROR: {
                message: `Pateint already have scheduled appointment selected time!`,
                status: 406
            },
            VISIT_SESSION_ERROR: {
                message: `Visit Session doesn't exists`,
                status: 406
            },
            VALID_APPOINTMENT_NAME_ERROR: {
                message: 'Provide valid appointment type',
                status: 406
            },
            TIME_SLOTS_ISSUE: {
                message: 'Selected Time slot is reserved.',
                status: 406
            },
            CHECK_MASTER_VISIT_TYPE: {
                message: 'Please check Specialty Master, Someone has updated the information!',
                status: 406
            },
            validator: {
                body: {
                    BODY_NOT_EMPTY: 'request body should not empty',
                    DOCTOR_ID_INTEGER: 'doctor_id must be integer',
                    DOCTOR_ID_REQUIRED: 'doctor_id must cannot be empty',
                    SPECIALITY_ID_INTEGER: 'speciality_id must be integer',
                    SPECIALITY_ID_REQUIRED: 'speciality_id cannot be empty',
                    USER_ID_INTEGER: 'user_id must be integer',
                    USER_ID_REQUIRED: 'user_id must cannot be empty',
                },
                query: {
                    CASE_IS_NOT_VALID: 'case_id must cannot be integer',
                    CHECK_IS_NOT_VALID: 'check must be [daily, weekly, previous, upcomming]',
                    DATE_IS_NOT_VALID: 'date must be 0000-00-00',
                    PAGE_IS_NOT_VALID: 'page must be integer',
                    PAGINATE_IS_NOT_VALID: 'paginate must be boolean',
                    PATIENT_ID_REQUIRED: 'patient_id must cannot be empty',
                    PER_PAGE_IS_NOT_VALID: 'per_page must be integer',
                    TEST: 'test'
                }
            },
        },
    },
    staging: {
        en: {
            SPECIALITY_REQUIRED: {
                message: 'Specialty field is required',
                status: 406
            },
            FACILITY_REQUIRED: {
                message: 'Facility field is required',
                status: 406
            },
            CPT_CODES_REQUIRED: {
                message: 'Cpt Code  field is required',
                status: 406
            },
            UNAVAILBILITY_SAME_TIME: {
                message: 'Provider already has unavailability at this time',
                status: 406
            },
            PATIENT_APPOINTMENT_EXIST:{
                message: 'First delete follow-Up & Re-Evaluation Appointments',
                status: 406
            },
            CLINIC_NOT_FOUND: {
                message: 'clinic not found!',
                status: 406
            },
            NO_FIND_SPECIALIYT: {
                message: 'Cannot find specialty of already assigned provider',
                status: 406
            },
            NO_USER_PRACTICE: {
                message: 'User has not allowed any practice',
                status: 406
            },
            NO_PROVIDE_PARACTICE: {
                message: 'Provider is not allowed any practice',
                status: 406
            },
            NO_PROVIDER_AVAILABLE: {
                message: 'Provider is not available at this time',
                status: 406
            },
            NO_DAYS_FOUND: {
                message: 'No Days Found',
                status: 406
            },
            NO_RESCHEDULED_APPOINTMENT: {
                message: 'Initial Appointment cannot be rescheduled after follow-up/re-evaluation appointment.',
                status: 406
            },
            NO_RESCHEDULED_INTIAL_APPONTMENT: {
                message: 'Appointment cannot be rescheduled before initial appointment.',
                status: 406
            },
            EVALUATION_ALREADY_STARTED: {
                message: `Appointment can't be updated because the evaluation has been already started.`,
                status: 406
            },
            NO_SHOW_STATUS: {
                message: `Appointment can't be updated because status is No Show.`,
                status: 406
            },
            NO_CREATED_APPOINTMENT: {
                message: `Initial Appointment cannot be created after follow-up/re-evaluation appointment.`,
                status: 406
            },
            APPOINTMENT_NOT_CREATED_BEFORE_INTIAL: {
                message: `Follow-up/Re-evaluation Appointment cannot be created before initial appointment.`,
                status: 406
            },
            NO_APPOINTMENT_CREATED_RECCURENCE: {
                message: `Initial Evaluation Appointment cannot be created in recurrence!`,
                status: 406
            },
            ERROR_FROM_KIOSK: {
                message: `Error from Kiosk`,
                status: 406
            },
            NO_SUPER_ADMIN: {
                message: `User is not super admin or is not practice supervisor on these facilities`,
                status: 406  
            },
            APPOINTMENT_WITHOUT_DOCTOR: {
                message: `This appointment can not be created without doctor`,
                status: 406
            },
            NO_TIME_FALL: {
                message: `New time doesn't fall in provider day/timings`,
                status: 406
            },
            NO_MANUALLY_DOCTORS: {
                message: `No manually selected doctors provided.`,
                status: 406
            },
            ID_MUST_PROVIDED: {
                message: 'Id must be provided',
                status: 406
            },
            USER_NOT_SUPERADMIN: {
                message: 'User is not superAdmin',
                status: 406
            },
            USER_ID_MUST_PROVIDED: {
                message: 'User Id must be provided',
                status: 406
            },
            ALREADY_ACTION: {
                message: 'Action already performed',
                status: 406
            },
            NO_UNAVAILABILTY_FOUND: {
                message: 'Unavailability not found',
                status: 406
            },
            APPOINTMENT_NOT_FOUND: {
                message: 'Appointment not found!',
                status: 406
            },
            EVALUATION_ALREADY_UPDATE: {
                message: 'Appointment Evaluation Already Update!',
                status: 406
            },
            ASSIGNMENT_NOT_FOUND: {
                message: 'Provider assignment not found!',
                status: 406
            },
            PROVIDER_DOES_NOT_HAVE_WC_AUTH: {
                message: 'Provider does not have WC authorization!',
                status: 406
            },
            APPOINTMENT_ALREADY_IN_PROCESS: {
                message: 'Appontment cannot be updated because Initial Evaluation Appointment is already in progress!',
                status: 406
            },
            APPOINTMENT_CAN_NOT_CREATED_ON_PREVIOUS_DATE: {
                message: 'Appointment cannot be created on previous Date',
                status: 406
            },
            APPOINTMENT_CAN_NOT_DONE_BEFORE_INITIAL_EVALUATION: {
                message: 'Appointment cannot be done before or on Initial Evaluation Appointment Datetime',
                status: 406
            },
            APPOINTMENT_CAN_NOT_RESOLVED: {
                message: 'ALL appointments cannot be resolved.',
                status: 406
            },
            APPOINTMENT_EXISTS: {
                message: 'Could not update because appointment exists for this assignment!',
                status: 406
            },
            APPOINTMENT_MUST_END_BEFORE_PROGRESS: {
                message: 'Initial Appointment must end before re-evaluation/progress',
                status: 406
            },
            ASSIGNMENT_CREATED_SUCCESSFULLY_WITH_NO_DOCTOR_ASSIGNMENT: {
                message: 'Assignment Added/Created successfully but Providers are not available for complete Assignment',
                status: 200
            },
            ASSIGNMENT_DOES_NOT_FALL: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall within office hours',
                status: 400
            },
            ASSIGNMENT_TO_YOURSELF: {
                message: 'This appointment has already been assigned to another provider. Please refresh your calendar.',
                status: 400
            },
            CANNOT_CREATE_SPECIALITY_APPOINTMENT: {
                message: 'You cannot create specialty appointment for given specialty. Please update specialty information.',
                status: 406
            },
            CANNOT_DELETE_ASSIGNMENT_WITH_APPOINTMENT: {
                message: 'Assignment with Appointments cannot be deleted',
                status: 406
            },
            CANNOT_FIND_FREESLOTS: {
                message: 'Cannot find freeSlots for all given appointments',
                status: 406
            },
            CANNOT_GET_VISIT_STATUS: {
                message: 'Error occured while getting visit status!',
                status: 406
            },
            DOES_NOT_HAVE_PRACTISE: {
                message: `Each provider doesn't have specified practice as primary/secondary location.`,
                status: 406
            },
            ERROR_WHILE_FETCHING_FINALIZE_STATUS: {
                message: 'Error occured while getting finalize status!',
                status: 406
            },
            ERROR_WHILE_GETTING_STATUS_FROM_KIOSK: {
                message: 'Error occured while getting status from kiosk!',
                status: 406
            },
            ERROR_WHILE_UPDATING_STATUS: {
                message: 'Error occured while updating visit status!',
                status: 406
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_APPOINTMENT_IDS: {
                message: 'Appointment id(s) not valid!',
                status: 406
            },
            INVALID_APPOINTMENT_TYPE_ID: {
                message: 'Invalid Appointment type id.',
                status: 406
            },
            INVALID_ASSIGNMENT_ID: {
                message: 'Invalid Assignment id.',
                status: 406
            },
            INVALID_PATIENT_ID: {
                message: 'Invalid Patient Id',
                status: 406
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type.',
                status: 400
            },
            INVALID_SPECIALITY_IDS: {
                message: 'Invalid specialty id(s)',
                status: 406
            },
            LOGGED_IN_NOT_FOUND: {
                message: 'Logged-In User not found!',
                status: 406
            },
            LOGGED_IN_NOT_PROVIDER: {
                message: 'Logged In user is not a provider.',
                status: 406
            },
            MANUAL_ASSIGNMENT_NO_OF_DOCTORS: {
                message: 'Selected providers should be equal to no of providers',
                status: 406
            },
            NO_APPOINTMENT_FOUND: {
                message: 'No appointments Found!',
                status: 406
            },
            NO_APPOINTMENT_OF_GIVEN_ID: {
                message: 'Cannot find appointment against given id.',
                status: 406
            },
            NO_APPOINTMENT_TO_SHOW: {
                message: 'No appointments to show as per users rights.',
                status: 406
            },
            NO_SAME_APPOINTMENT: {
                message: 'No same appointment',
                status: 406
            },
            NO_ASSIGNMENT_FOUND: {
                message: 'No assignment found',
                status: 406
            },
            NO_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Cannot find assignment for given appointment time.',
                status: 406
            },
            NO_PROVIDER_ASSIGNMENT_FOUND_FOR_GIVEN_APPOINTMENT_TIME: {
                message: 'Provider cannot start this appointment, as provider assignment not found at the given time.',
                status: 406
            },
            NO_ASSIGNMENT_PROPOSED: {
                message: 'No new assignment proposed',
                status: 406
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id.',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 406
            },
            NO_FREE_SLOTS_FOUND: {
                message: 'No freeslots on practice(s)',
                status: 406
            },
            NO_HISTORY_FOUND: {
                message: `Assignment history doesn't exist`,
                status: 406
            },
            NO_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'No Initial Evaluation Appointment of this patient for this case and specialty!',
                status: 406
            },
            NO_OTHER_ASSIGNMENTS_FOUND: {
                message: 'No other assignments of provider.',
                status: 406
            },
            NO_PRACTICES_FOUND: {
                message: 'Practice(s) not found',
                status: 406
            },
            NO_PROVIDER_FOUND: {
                message: 'No provider found for this specialty.',
                status: 406
            },
            NO_PROVIDER_FOUND_FOR_WORKER_COMPENSATION: {
                message: 'No provider found for Worker Compensation Case!',
                status: 406
            },
            NO_PROVIDER_OF_SPECIALITY_FOUND: {
                message: 'No Providers of this specialty found! TimeSlot of specialty is changed',
                status: 406
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 406
            },
            NO_SLOTS_REMAINING: {
                message: 'No slots remaining at this time.',
                status: 406
            },
            NO_SLOT_FOUND: {
                message: 'No Slots found',
                status: 406
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 406
            },
            NO_SPECIALITY_FOUND: {
                message: 'No speciality exist for specified id.',
                status: 400
            },
            NO_SPECIALITY_FOUND_FOR_KEY: {
                message: 'No speciality exist for specified speciality_key.',
                status: 400
            },
            NO_WC_AUTHORIZE: {
                message: 'Provider does not have WC authorizatio.',
                status: 400
            },
            PAST_APPOINTMENTS: {
                message: 'Past Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_APPOINTMENT_SAME_DAY: {
                message: 'Patient already has appointment on the same day.',
                status: 406
            },
            APPOINTMENT_ALREADY_EXIST: {
                message: 'Appointment already exist',
                status: 406
            },
            FUTURE_APPOINTMENTS: {
                message: 'Future Appointment can not be evaluated.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_ASSIGNMENT: {
                message: 'Patient already has appointment at this time.',
                status: 406
            },
            PATIENT_ALREADY_IN_SESSION: {
                message: 'Patient already in In-Session.',
                status: 406
            },
            PATIENT_ALREADY_HAVE_INITIAL_EVALUATION_ASSIGNMENT: {
                message: 'Patient already has Initial Evaluation Appointment for this case and specialty!',
                status: 406
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 406
            },
            PROVIDER_IS_NOT_ASSIGNED_TO_ANY_SPECIALITY: {
                message: 'Provider is not assigned any specialty',
                status: 406
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 406
            },
            PROVIDER_NOT_FOUND: {
                message: 'Provider not found',
                status: 406
            },
            SAME_ASSIGNMENT_EXIST: {
                message: 'Same assignment already exist',
                status: 406
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 406
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 406
            },
            USER_HAS_NO_ROLES: {
                message: 'No roles found against Logged-In User!',
                status: 406
            },
            USER_NOT_ALLOWED: {
                message: 'User is not allowed this practice!',
                status: 406
            },
            VISIT_STATUS_IS_NOT_CHECKED_IN: {
                message: `Visit status is not 'Checked-In'. This evaluation cannot be started!`,
                status: 406
            },
            VISIT_STATUS_IS_NO_SHOW: {
                message: 'Appointment and Visit status is No Show. Evaluation cannot be started',
                status: 406
            },
            CASE_ID_REQUIRED: {
                message: 'Case id must be provided',
                status: 406
            },
            APPOINTMENT_WITH_SAME_CRITERIA_EXIST: {
                message: 'Appointment is already created with same criteria',
                status: 406
            },
            APPOINTMENT_CANNOT_UPDATED: {
                message: 'Appointment can not be updated as Appointment is already created with same criteria',
                status: 406
            },
            REQUIRED_APPOINTMENT_NOT_EXIST: {
                message: `Required Appointment doesn't exist`,
                status: 406
            },
            SELECTED_APPOINTMENT_SPECIALITY_ERROR: {
                message: `Selected appointment type doesn't exist in selected speciality`,
                status: 406
            },
            SAME_TIME_APPOINTMENT_ERROR: {
                message: `Pateint already have scheduled appointment selected time!`,
                status: 406
            },
            VISIT_SESSION_ERROR: {
                message: `Visit Session doesn't exists`,
                status: 406
            },
            VALID_APPOINTMENT_NAME_ERROR: {
                message: 'Provide valid appointment type',
                status: 406
            },
            TIME_SLOTS_ISSUE: {
                message: 'Selected Time slot is reserved.',
                status: 406
            },
            CHECK_MASTER_VISIT_TYPE: {
                message: 'Please check Specialty Master, Someone has updated the information!',
                status: 406
            },
            validator: {
                body: {
                    BODY_NOT_EMPTY: 'request body should not empty',
                    DOCTOR_ID_INTEGER: 'doctor_id must be integer',
                    DOCTOR_ID_REQUIRED: 'doctor_id must cannot be empty',
                    SPECIALITY_ID_INTEGER: 'speciality_id must be integer',
                    SPECIALITY_ID_REQUIRED: 'speciality_id cannot be empty',
                    USER_ID_INTEGER: 'user_id must be integer',
                    USER_ID_REQUIRED: 'user_id must cannot be empty',
                },
                query: {
                    CASE_IS_NOT_VALID: 'case_id must cannot be integer',
                    CHECK_IS_NOT_VALID: 'check must be [daily, weekly, previous, upcomming]',
                    DATE_IS_NOT_VALID: 'date must be 0000-00-00',
                    PAGE_IS_NOT_VALID: 'page must be integer',
                    PAGINATE_IS_NOT_VALID: 'paginate must be boolean',
                    PATIENT_ID_REQUIRED: 'patient_id must cannot be empty',
                    PER_PAGE_IS_NOT_VALID: 'per_page must be integer',
                    TEST: 'test'
                }
            },
        },
    }
};
