import * as Sequelize from 'sequelize';

import * as models from '../models';
import { Frozen, Helper, Http } from '../shared';
import * as typings from '../shared/common';

// tslint:disable-next-line: typedef
const Op = Sequelize.Op;

@Frozen
export class AppointmentHelperService extends Helper {

    public constructor() {
        super();
    }

    public appointmentListResultMapping =  (rawQueryResult: typings.ANY, appointmentWithOtherData: models.sch_appointmentsI[]): Promise<typings.ANY> =>

        rawQueryResult.map((e) => {

            const formattedPhysicianClinicResponse: typings.ANY = e.physician_clinics_id ? {
                physician: {
                    clinic_location_id: e?.clinic_location_id,
                    physician_clinic_id: e?.physician_clinics_id,
                    id: e?.clinic_id,
                    name: e?.clinic_name,
                    city: e?.clinic_location_city,
                    clinic_id: e?.clinic_location_clinic_id,
                    email: e?.physician_email,
                    extension: e?.clinic_location_extension,
                    fax: e?.clinic_location_fax,
                    floor: e?.clinic_location_floor,
                    is_primary: e?.clinic_location_is_primary,
                    phone: e?.clinic_location_phone,
                    state: e?.clinic_location_state,
                    status: e?.clinic_location_status,
                    street_address: e?.clinic_location_street_address,
                    zip: e?.clinic_location_zip,
                    cell_no: e?.physician_cell_no,
                    first_name: e?.physician_first_name,
                    last_name: e?.physician_last_name,
                    license_no: e?.physician_license_no,
                    middle_name: e?.physician_middle_name,
                    npi_no: e?.physician_npi_no
                }
            } : null;

            const appointmentData: models.sch_appointmentsI = appointmentWithOtherData?.find((x) => x?.id === e?.appointment_id);

            return {
                appointment_cpt_codes: appointmentData?.appointmentCptCodes ?? null,
                appointment_comments: e.appointment_comments,
                appointment_confirmation_status: e.appointment_confirmation_status,
                appointment_id: e.appointment_id,
                appointment_status: e.sch_appointment_statuses_name,
                appointment_status_id: e.appointment_status_id,
                appointment_status_slug: e.sch_appointment_statuses_slug,
                appointment_time: e.appointment_scheduled_date_time,
                appointment_title: e.appointment_title,
                appointment_type_id: e.appointment_type_id,
                billable: e.appointment_billable,
                case_id: e.appointment_case_id,
                case_type_id: e.appointment_case_type_id,
                case_type_name: e.kiosk_case_types_name,
                cd_image: e.appointment_cd_image,
                doctor_first_name: e.doctorBasicInfo_first_name,
                doctor_id: e.doctorBasicInfo_user_id,
                doctor_last_name: e.doctorBasicInfo_last_name,
                doctor_middle_name: e.doctorBasicInfo_middle_name,
                billing_title_id : e.billingTitles_id,
                billing_title_name : e.billingTitles_name,
                duration: e.appointment_time_slot,
                facility: {
                    id: e.facilities_id,
                    name: e.facilities_name,
                    slug: e.facilities_slug,
                    qualifier: e.facilities_qualifier
                },
                facility_location_id: e.availableSpeciality_facility_location_id,
                facility_location_name: e.facilityLocation_name,
                facility_location_qualifier: e.facilityLocation_qualifier,
                is_transportation: e.appointment_is_transportation,
                patient_first_name: e.patient_first_name,
                patient_id: e.patient_id,
                patient_last_name: e.patient_last_name,
                patient_middle_name: e.patient_middle_name,
                patient_picture: e.patient_profile_avatar,
                patient_session: {
                    id: e.kiosk_case_patient_session_id,
                    key: e.kiosk_case_patient_session_key,
                    status_id: e.kiosk_case_patient_session_status_id,
                    case_id: e.kiosk_case_patient_session_case_id,
                    date_of_check_in: e.kiosk_case_patient_session_date_of_check_in,
                    time_of_check_in: e.kiosk_case_patient_session_time_of_check_in,
                    date_of_check_out: e.kiosk_case_patient_session_date_of_check_out,
                    time_of_check_out: e.kiosk_case_patient_session_time_of_check_out,
                    created_by: e.kiosk_case_patient_session_created_by,
                    updated_by: e.kiosk_case_patient_session_updated_by,
                    created_at: e.kiosk_case_patient_session_created_at,
                    updated_at: e.kiosk_case_patient_session_updated_at,
                    deleted_at: e.kiosk_case_patient_session_deleted_at,
                    appointment_id: e.kiosk_case_patient_session_appointment_id,
                },
                patient_status: e.kiosk_case_patient_session_statuses_name,
                patient_status_slug: e.kiosk_case_patient_session_statuses_slug,
                priority_id: e.appointment_priority_id,
                reading_provider_id: e.appointment_reading_provider_id,
                reading_provider: e.appointment_reading_provider_id ? {
                    first_name: e.readingProvider_first_name ?? null,
                    id: e.appointment_reading_provider_id,
                    last_name: e.readingProvider_last_name ?? null,
                    middle_name: e.readingProvider_middle_name ?? null,
                } : null,
                technician_id : e.technician_id,
                technician_email : e.technician_email,
                technician_basic_info: e.technician_id ? {
                    technician_basic_info_id : e.technician_basic_info_id,
                    technician_basic_info_first_name : e.technician_first_name,
                    technician_basic_info_middle_name : e.technician_middle_name,
                    technician_basic_info_last_name : e.technician_last_name,
                    technician_basic_info_date_of_birth : e.technician_date_of_birth,
                    technician_basic_info_gender : e.technician_gender,
                    technician_basic_info_user_id : e.technician_user_id,
                    technician_basic_info_area_id : e.technician_area_id,
                    technician_basic_info_title : e.technician_title,
                    technician_basic_info_cell_no : e.technician_cell_no,
                    technician_basic_info_address : e.technician_address,
                    technician_basic_info_work_phone : e.technician_work_phone,
                    technician_basic_info_fax : e.technician_fax,
                    technician_basic_info_extension : e.technician_extension,
                    technician_basic_info_home_phone : e.technician_home_phone,
                    technician_basic_info_emergency_name : e.technician_emergency_name,
                    technician_basic_info_emergency_phone : e.technician_emergency_phone,
                    technician_basic_info_biography : e.technician_biography,
                    technician_basic_info_hiring_date : e.technician_hiring_date,
                    technician_basic_info_from : e.technician_from,
                    technician_basic_info_to : e.technician_to,
                    technician_basic_info_profile_pic : e.technician_profile_pic,
                    technician_basic_info_city : e.technician_city,
                    technician_basic_info_state : e.technician_state,
                    technician_basic_info_zip : e.technician_zip,
                    technician_basic_info_social_security : e.technician_social_security,
                    technician_basic_info_profile_pic_url : e.technician_profile_pic_url,
                    technician_basic_info_apartment_suite : e.technician_apartment_suite,
                    technician_basic_info_file_id : e.technician_file_id,
                    technician_basic_info_deleted_at : e.technician_deleted_at,
                } : null,
                speciality_id: e.availableSpeciality_speciality_id,
                speciality_name: e.specialities_name,
                speciality_qualifier: e.specialities_qualifier,
                time_slot: e.specialities_time_slot,
                visit_type: e.sch_appointment_types_name,
                visit_type_qualifier: e.sch_appointment_types_qualifier,
                visit_type_id: e.appointment_type_id,
                case_status: e.billing_case_status_name,
                medicalIdentifier_id: e.medicalIdentifier_id,
                billing_titles_id: e.billingTitles_id,
                billing_titles_name: e.billingTitles_name,
                physician_clinic: formattedPhysicianClinicResponse,
                transportations: appointmentData?.transportations ?? null,
            };
        })

    public generateAppointmentListCount = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            paginate = false,
            page,
            per_page,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * per_page;
            applyLimit = `LIMIT ${offset} , ${per_page}`;
        }

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`specialities.id in (${String(specialityIds)})`);
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (facilityLocationIds?.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (patientStatusIds?.length) {
            whereFilter.push(`kiosk_case_patient_session.status_id in (${String(patientStatusIds)})`);
        }

        if (doctorIds && doctorIds.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(doctorIds)})`);
        }

        if (patientId) {
            whereFilter.push(`appointments.patient_id = ${patientId}`);
        }
        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }
        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereFilter.push(`appointments.type_id in (${String(appointmentTypeIds)})`);
        }
        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`appointments.status_id in (${String(appointmentStatusIds)})`);
        }
        if (caseTypeIds && caseTypeIds.length) {
            whereFilter.push(`appointments.case_type_id in (${String(caseTypeIds)})`);
        }
        if (caseIds && caseIds.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }
        if (startDate && endDate) {
            whereFilter.push(`appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
        }
        whereFilter.push(`appointments.cancelled = 0`);
        whereFilter.push(`appointments.pushed_to_front_desk = 0`);
        whereFilter.push('appointments.deleted_at IS NULL');

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            COUNT(DISTINCT appointments.id) as total_appointment
            FROM sch_appointments as appointments

            left join kiosk_cases on kiosk_cases.id = appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join billing_case_status on billing_case_status.id = kiosk_cases.status_id and billing_case_status.deleted_at IS NULL
            inner join kiosk_patient on kiosk_patient.id = appointments.patient_id and kiosk_patient.deleted_at IS NULL
            inner join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            inner join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL

            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            ${finalWhereFilter}
            GROUP BY appointments.id
            )`;

        return query;

    }

    public generateAppointmentListCountV1 = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            paginate = false,
            page,
            per_page,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * per_page;
            applyLimit = `LIMIT ${offset} , ${per_page}`;
        }

        let requiredCondition: string = 'left';
        let requiredConditionForDoc: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (facilityLocationIds?.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (patientStatusIds?.length) {
            whereFilter.push(`kiosk_case_patient_session.status_id in (${String(patientStatusIds)})`);
        }

        if (doctorIds && doctorIds.length) {
            requiredConditionForDoc = 'inner';
            whereFilter.push(`sch_available_doctors.doctor_id in (${String(doctorIds)})`);
        }

        if (patientId) {
            whereFilter.push(`sch_appointments.patient_id = ${patientId}`);
        }

        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereFilter.push(`sch_appointments.type_id in (${String(appointmentTypeIds)})`);
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`sch_appointments.status_id in (${String(appointmentStatusIds)})`);
        }

        if (caseTypeIds && caseTypeIds.length) {
            whereFilter.push(`sch_appointments.case_type_id in (${String(caseTypeIds)})`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`sch_appointments.case_id in (${String(caseIds)})`);
        }

        if (startDate && endDate) {
            whereFilter.push(`sch_appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
        }

        whereFilter.push(`sch_appointments.cancelled = 0`);
        whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);
        whereFilter.push(`sch_appointments.deleted_at IS NULL`);

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            COUNT(DISTINCT(sch_appointments.id)) as total_count
            FROM sch_appointments

            left join kiosk_patient on kiosk_patient.id = sch_appointments.patient_id and kiosk_patient.deleted_at IS NULL
            inner join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id and kiosk_case_patient_session.deleted_at IS NULL

            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = sch_appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            ${requiredConditionForDoc} join sch_available_doctors on sch_available_doctors.id = sch_appointments.available_doctor_id and sch_available_doctors.deleted_at IS NULL
            ${finalWhereFilter}
            )`;
            // GROUP BY sch_appointments.id

        return query;

    }

    public generateAppointmentListRawQuery = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            paginate,
            page,
            perPage,

        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `LIMIT ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`specialities.id in (${String(specialityIds)})`);
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (patientStatusIds?.length) {
            whereFilter.push(`kiosk_case_patient_session.status_id in (${String(patientStatusIds)})`);
        }

        if (facilityLocationIds?.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (doctorIds && doctorIds.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(doctorIds)})`);
        }

        if (patientId) {
            whereFilter.push(`appointments.patient_id = ${patientId}`);
        }
        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }
        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereFilter.push(`appointments.type_id in (${String(appointmentTypeIds)})`);
        }
        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`appointments.status_id in (${String(appointmentStatusIds)})`);
        }
        if (caseTypeIds && caseTypeIds.length) {
            whereFilter.push(`appointments.case_type_id in (${String(caseTypeIds)})`);
        }
        if (caseIds && caseIds.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }
        if (startDate && endDate) {
            whereFilter.push(`appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
        }
        whereFilter.push(`appointments.cancelled = 0`);
        whereFilter.push(`appointments.pushed_to_front_desk = 0`);
        whereFilter.push('appointments.deleted_at IS NULL');

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            appointments.id as appointment_id,
            appointments.key as appointment_key,
            appointments.scheduled_date_time as appointment_scheduled_date_time,
            appointments.evaluation_date_time as appointment_evaluation_date_time,
            appointments.time_slots as appointment_time_slot,
            appointments.appointment_title as appointment_title,
            appointments.action_performed as appointment_action_performed,
            appointments.confirmation_status as appointment_confirmation_status,
            appointments.cancelled as appointment_cancelled,
            appointments.pushed_to_front_desk as appointment_pushed_to_front_dest,
            appointments.comments as appointment_comments,
            appointments.by_health_app as appointment_by_health_app,
            appointments.date_list_id as appointment_date_list_id,
            appointments.target_facility_id as appointment_target_facility_id,
            appointments.origin_facility_id as appointment_origin_facility_id,
            appointments.case_id as appointment_case_id,
            appointments.case_type_id as appointment_case_type_id,
            appointments.patient_id as appointment_patient_id,
            appointments.type_id as appointment_type_id,
            appointments.status_id as appointment_status_id,
            appointments.priority_id as appointment_priority_id,
            appointments.available_doctor_id as appointment_available_doctor_id,
            appointments.available_speciality_id as appointment_available_speciality_id,
            appointments.billable as appointment_billable,
            appointments.pushed_to_front_desk_comments as appointment_pushed_to_front_desk_comments,
            appointments.cancelled_comments as appointment_cancelled_comments,
            appointments.is_speciality_base as appointment_is_speciality_base,
            appointments.created_by as appointment_created_by,
            appointments.updated_by as appointment_updated_by,
            appointments.created_at as appointment_created_at,
            appointments.updated_at as appointment_updated_at,
            appointments.deleted_at as appointment_deleted_at,
            appointments.is_redo as appointment_is_redo,
            appointments.is_active as appointment_is_active,
            appointments.is_soft_registered as appointment_is_soft_registered,
            appointments.physician_id as appointment_physician_id,
            appointments.technician_id as appointment_technician_id,

            appointments.reading_provider_id as appointment_reading_provider_id,
            appointments.cd_image as appointment_cd_image,
            appointments.is_transportation as appointment_is_transportation,

            kiosk_cases.id as patient_case_id,

            billing_case_status.id as billing_case_status_id,
            billing_case_status.name as billing_case_status_name,

            kiosk_case_patient_session.id as kiosk_case_patient_session_id,
            kiosk_case_patient_session.key as kiosk_case_patient_session_key,
            kiosk_case_patient_session.status_id as kiosk_case_patient_session_status_id,
            kiosk_case_patient_session.case_id as kiosk_case_patient_session_case_id,
            kiosk_case_patient_session.date_of_check_in as kiosk_case_patient_session_date_of_check_in,
            kiosk_case_patient_session.time_of_check_in as kiosk_case_patient_session_time_of_check_in,
            kiosk_case_patient_session.date_of_check_out as kiosk_case_patient_session_date_of_check_out,
            kiosk_case_patient_session.time_of_check_out as kiosk_case_patient_session_time_of_check_out,
            kiosk_case_patient_session.created_by as kiosk_case_patient_session_created_by,
            kiosk_case_patient_session.updated_by as kiosk_case_patient_session_updated_by,
            kiosk_case_patient_session.created_at as kiosk_case_patient_session_created_at,
            kiosk_case_patient_session.updated_at as kiosk_case_patient_session_updated_at,
            kiosk_case_patient_session.deleted_at as kiosk_case_patient_session_deleted_at,
            kiosk_case_patient_session.appointment_id as kiosk_case_patient_session_appointment_id,

            kiosk_case_patient_session_statuses.name as kiosk_case_patient_session_statuses_name,
            kiosk_case_patient_session_statuses.slug as kiosk_case_patient_session_statuses_slug,

            kiosk_case_types.id as kiosk_case_types_id,
            kiosk_case_types.key as kiosk_case_types_key,
            kiosk_case_types.name as kiosk_case_types_name,
            kiosk_case_types.slug as kiosk_case_types_slug,
            kiosk_case_types.description as kiosk_case_types_description,
            kiosk_case_types.comments as kiosk_case_types_comments,
            kiosk_case_types.remainder_days as kiosk_case_types_remainder_days,
            kiosk_case_types.created_by as kiosk_case_types_created_by,
            kiosk_case_types.updated_by as kiosk_case_types_updated_by,
            kiosk_case_types.created_at as kiosk_case_types_created_at,
            kiosk_case_types.updated_at as kiosk_case_types_updated_at,
            kiosk_case_types.deleted_at as kiosk_case_types_deleted_at,

            sch_appointment_types.id as sch_appointment_types_id,
            sch_appointment_types.name as sch_appointment_types_name,
            sch_appointment_types.slug as sch_appointment_types_slug,
            sch_appointment_types.description as sch_appointment_types_description,
            sch_appointment_types.is_all_cpt_codes as sch_appointment_types_is_all_cpt_codes,
            sch_appointment_types.enable_cpt_codes as sch_appointment_types_enable_cpt_codes,
            sch_appointment_types.qualifier as sch_appointment_types_qualifier,
            sch_appointment_types.created_by as sch_appointment_types_created_by,
            sch_appointment_types.updated_by as sch_appointment_types_updated_by,
            sch_appointment_types.created_at as sch_appointment_types_created_at,
            sch_appointment_types.updated_at as sch_appointment_types_updated_at,
            sch_appointment_types.deleted_at as sch_appointment_types_deleted_at,
            sch_appointment_types.is_editable as sch_appointment_types_is_editable,
            sch_appointment_types.avoid_checkedin as sch_appointment_types_avoid_checkedin,
            sch_appointment_types.is_reading_provider as sch_appointment_types_is_reading_provider,

            sch_appointment_statuses.id as sch_appointment_statuses_id,
            sch_appointment_statuses.name as sch_appointment_statuses_name,
            sch_appointment_statuses.slug as sch_appointment_statuses_slug,
            sch_appointment_statuses.created_by as sch_appointment_statuses_created_by,
            sch_appointment_statuses.updated_by as sch_appointment_statuses_updated_by,
            sch_appointment_statuses.created_at as sch_appointment_statuses_created_at,
            sch_appointment_statuses.updated_at as sch_appointment_statuses_updated_at,
            sch_appointment_statuses.deleted_at as sch_appointment_statuses_deleted_at,

            kiosk_patient.id as patient_id,
            kiosk_patient.key as patient_key,
            kiosk_patient.first_name as patient_first_name,
            kiosk_patient.middle_name as patient_middle_name,
            kiosk_patient.last_name as patient_last_name,
            kiosk_patient.dob as patient_dob,
            kiosk_patient.gender as patient_gender,
            kiosk_patient.age as patient_age,
            kiosk_patient.ssn as patient_ssn,
            kiosk_patient.cell_phone as patient_cell_phone,
            kiosk_patient.home_phone as patient_home_phone,
            kiosk_patient.work_phone as patient_work_phone,
            kiosk_patient.height_ft as patient_height_ft,
            kiosk_patient.height_in as patient_height_in,
            kiosk_patient.weight_lbs as patient_weight_lbs,
            kiosk_patient.weight_kg as patient_weight_kg,
            kiosk_patient.meritial_status as patient_meritial_status,
            kiosk_patient.profile_avatar as patient_profile_avatar,
            kiosk_patient.need_translator as patient_need_translator,
            kiosk_patient.language as patient_language,
            kiosk_patient.is_pregnant as patient_pregnant,
            kiosk_patient.is_law_enforcement_agent as patient_is_law_enforcement_agent,
            kiosk_patient.status as patient_status,
            kiosk_patient.notes as patient_notes,
            kiosk_patient.created_by as patient_created_by,
            kiosk_patient.updated_by as patient_updated_by,
            kiosk_patient.created_at as patient_created_at,
            kiosk_patient.updated_at as patient_updated_at,
            kiosk_patient.deleted_at as patient_deleted_at,
            kiosk_patient.user_id as patient_user_id,
            kiosk_patient.title as patient_title,
            kiosk_patient.ethnicity as patient_ethnicity,
            kiosk_patient.race as patient_race,
            kiosk_patient.suffix as patient_suffix,
            kiosk_patient.by_health_app as patient_by_health_app,
            kiosk_patient.creation_source as patient_creation_source,
            kiosk_patient.is_active as patient_is_active,
            kiosk_patient.is_soft_registered as patient_is_soft_registered,

            physician_clinics.id as physician_clinics_id,
            physician_clinics.clinic_id as physician_clinics_clinic_id,
            physician_clinics.clinic_locations_id as physician_clinic_location,
            physician_clinics.physician_id as physician_clinics_physician_id,

            physicians.id as physician_id,
            physicians.first_name as physician_first_name,
            physicians.middle_name as physician_middle_name,
            physicians.last_name as physician_last_name,
            physicians.cell_no as physician_cell_no,
            physicians.email as physician_email,
            physicians.npi_no as physician_npi_no,
            physicians.license_no as physician_license_no,

            clinics.id as clinic_id,
            clinics.name as clinic_name,

            clinic_locations.id as clinic_location_id,
            clinic_locations.clinic_id as clinic_location_clinic_id,
            clinic_locations.city as clinic_location_city,
            clinic_locations.state as clinic_location_state,
            clinic_locations.zip as clinic_location_zip,
            clinic_locations.phone as clinic_location_phone,
            clinic_locations.fax as clinic_location_fax,
            clinic_locations.email as clinic_location_email,
            clinic_locations.street_address as clinic_location_street_address,
            clinic_locations.extension as clinic_location_extension,
            clinic_locations.floor as clinic_location_floor,
            clinic_locations.is_primary as clinic_location_is_primary,
            clinic_locations.status as clinic_location_status,

            technician.id as technician_id,
            technician.email as technician_email,

            technician_basic_info.id as technician_basic_info_id,
            technician_basic_info.first_name as technician_first_name,
            technician_basic_info.middle_name as technician_middle_name,
            technician_basic_info.last_name as technician_last_name,
            technician_basic_info.date_of_birth as technician_date_of_birth,
            technician_basic_info.gender as technician_gender,
            technician_basic_info.user_id as technician_user_id,
            technician_basic_info.area_id as technician_area_id,
            technician_basic_info.title as technician_title,
            technician_basic_info.cell_no as technician_cell_no,
            technician_basic_info.address as technician_address,
            technician_basic_info.work_phone as technician_work_phone,
            technician_basic_info.fax as technician_fax,
            technician_basic_info.extension as technician_extension,
            technician_basic_info.home_phone as technician_home_phone,
            technician_basic_info.emergency_name as technician_emergency_name,
            technician_basic_info.emergency_phone as technician_emergency_phone,
            technician_basic_info.biography as technician_biography,
            technician_basic_info.hiring_date as technician_hiring_date,
            technician_basic_info.from as technician_from,
            technician_basic_info.to as technician_to,
            technician_basic_info.profile_pic as technician_profile_pic,
            technician_basic_info.city as technician_city,
            technician_basic_info.state as technician_state,
            technician_basic_info.zip as technician_zip,
            technician_basic_info.social_security as technician_social_security,
            technician_basic_info.profile_pic_url as technician_profile_pic_url,
            technician_basic_info.apartment_suite as technician_apartment_suite,
            technician_basic_info.file_id as technician_file_id,
            technician_basic_info.deleted_at as technician_deleted_at,


            readingProvider.id as readingProvider_id,
            readingProvider.email as readingProvider_email,

            readingProvider_basic_info.id as readingProvider_basic_info_id,
            readingProvider_basic_info.first_name as readingProvider_first_name,
            readingProvider_basic_info.middle_name as readingProvider_middle_name,
            readingProvider_basic_info.last_name as readingProvider_last_name,
            readingProvider_basic_info.date_of_birth as readingProvider_date_of_birth,
            readingProvider_basic_info.gender as readingProvider_gender,
            readingProvider_basic_info.user_id as readingProvider_user_id,
            readingProvider_basic_info.area_id as readingProvider_area_id,
            readingProvider_basic_info.title as readingProvider_title,
            readingProvider_basic_info.cell_no as readingProvider_cell_no,
            readingProvider_basic_info.address as readingProvider_address,
            readingProvider_basic_info.work_phone as readingProvider_work_phone,
            readingProvider_basic_info.fax as readingProvider_fax,
            readingProvider_basic_info.extension as readingProvider_extension,
            readingProvider_basic_info.home_phone as readingProvider_home_phone,
            readingProvider_basic_info.emergency_name as readingProvider_emergency_name,
            readingProvider_basic_info.emergency_phone as readingProvider_emergency_phone,
            readingProvider_basic_info.biography as readingProvider_biography,
            readingProvider_basic_info.hiring_date as readingProvider_hiring_date,
            readingProvider_basic_info.from as readingProvider_from,
            readingProvider_basic_info.to as readingProvider_to,
            readingProvider_basic_info.profile_pic as readingProvider_profile_pic,
            readingProvider_basic_info.city as readingProvider_city,
            readingProvider_basic_info.state as readingProvider_state,
            readingProvider_basic_info.zip as readingProvider_zip,
            readingProvider_basic_info.social_security as readingProvider_social_security,
            readingProvider_basic_info.profile_pic_url as readingProvider_profile_pic_url,
            readingProvider_basic_info.apartment_suite as readingProvider_apartment_suite,
            readingProvider_basic_info.file_id as readingProvider_file_id,
            readingProvider_basic_info.deleted_at as readingProvider_deleted_at,

            billing_codes.id as billing_codes_id,
            billing_codes.name as billing_codes_name,
            billing_codes.type as billing_codes_type,
            billing_codes.code_type_id as billing_codes_code_type_id,
            billing_codes.description as billing_codes_description,
            billing_codes.short_description as billing_codes_short_description,
            billing_codes.long_description as billing_codes_long_description,
            billing_codes.comments as billing_codes_comments,

            availableSpeciality.id as availableSpeciality_id,
            availableSpeciality.key as availableSpeciality_key,
            availableSpeciality.start_date as availableSpeciality_start_date,
            availableSpeciality.end_date as availableSpeciality_end_date,
            availableSpeciality.end_date_for_recurrence as availableSpeciality_end_date_for_recurrence,
            availableSpeciality.no_of_doctors as availableSpeciality_no_of_doctors,
            availableSpeciality.no_of_slots as availableSpeciality_no_of_slots,
            availableSpeciality.end_after_occurences as availableSpeciality_end_after_occurences,
            availableSpeciality.number_of_entries as availableSpeciality_number_of_entries,
            availableSpeciality.speciality_id as availableSpeciality_speciality_id,
            availableSpeciality.facility_location_id as availableSpeciality_facility_location_id,
            availableSpeciality.recurrence_ending_criteria_id as availableSpeciality_recurrence_ending_criteria_id,
            availableSpeciality.deleted_at as availableSpeciality_deleted_at,

            availableSpecialityDoctor.id as availableSpecialityDoctor_id,
            availableSpecialityDoctor.key as availableSpecialityDoctor_key,
            availableSpecialityDoctor.start_date as availableSpecialityDoctor_start_date,
            availableSpecialityDoctor.end_date as availableSpecialityDoctor_end_date,
            availableSpecialityDoctor.no_of_slots as availableSpecialityDoctor_no_of_slots,
            availableSpecialityDoctor.doctor_id as availableSpecialityDoctor_doctor_id,
            availableSpecialityDoctor.facility_location_id as availableSpecialityDoctor_facility_location_id,
            availableSpecialityDoctor.available_speciality_id as availableSpecialityDoctor_available_speciality_id,
            availableSpecialityDoctor.supervisor_id as availableSpecialityDoctor_supervisor_id,
            availableSpecialityDoctor.is_provider_assignment as availableSpecialityDoctor_is_provider_assignment,

            facilityLocation.id as facilityLocation_id,
            facilityLocation.facility_id as facilityLocation_facility_id,
            facilityLocation.name as facilityLocation_name,
            facilityLocation.city as facilityLocation_city,
            facilityLocation.state as facilityLocation_state,
            facilityLocation.zip as facilityLocation_zip,
            facilityLocation.region_id as facilityLocation_region_id,
            facilityLocation.address as facilityLocation_address,
            facilityLocation.phone as facilityLocation_phone,
            facilityLocation.fax as facilityLocation_fax,
            facilityLocation.email as facilityLocation_email,
            facilityLocation.office_hours_start as facilityLocation_office_hours_start,
            facilityLocation.office_hours_end as facilityLocation_office_hours_end,
            facilityLocation.lat as facilityLocation_lat,
            facilityLocation.long as facilityLocation_long,
            facilityLocation.day_list as facilityLocation_day_list,
            facilityLocation.floor as facilityLocation_floor,
            facilityLocation.place_of_service_id as facilityLocation_place_of_service_id,
            facilityLocation.qualifier as facilityLocation_qualifier,
            facilityLocation.ext_no as facilityLocation_ext_no,
            facilityLocation.cell_no as facilityLocation_cell_no,
            facilityLocation.is_main as facilityLocation_is_main,
            facilityLocation.same_as_provider as facilityLocation_same_as_provider,
            facilityLocation.dean as facilityLocation_dean,

            specialities.id as specialities_id,
            specialities.name as specialities_name,
            specialities.description as specialities_description,
            specialities.time_slot as specialities_time_slot,
            specialities.over_booking as specialities_over_booking,
            specialities.has_app as specialities_has_app,
            specialities.speciality_key as specialities_speciality_key,
            specialities.comments as specialities_comments,
            specialities.default_name as specialities_default_name,
            specialities.qualifier as specialities_qualifier,
            specialities.is_defualt as specialities_is_defualt,
            specialities.is_available as specialities_is_available,
            specialities.is_create_appointment as specialities_is_create_appointment,
            specialities.is_editable as specialities_is_editable,

            doctor.id as doctor_id,
            doctor.email as doctor_email,
            doctor.reset_key as doctor_reset_key,
            doctor.status as doctor_status,
            doctor.is_loggedIn as doctor_is_loggedIn,
            doctor.remember_token as doctor_remember_token,

            doctorBasicInfo.id as doctorBasicInfo_id,
            doctorBasicInfo.first_name as doctorBasicInfo_first_name,
            doctorBasicInfo.middle_name as doctorBasicInfo_middle_name,
            doctorBasicInfo.last_name as doctorBasicInfo_last_name,
            doctorBasicInfo.date_of_birth as doctorBasicInfo_date_of_birth,
            doctorBasicInfo.gender as doctorBasicInfo_gender,
            doctorBasicInfo.user_id as doctorBasicInfo_user_id,
            doctorBasicInfo.area_id as doctorBasicInfo_area_id,
            doctorBasicInfo.title as doctorBasicInfo_title,
            doctorBasicInfo.cell_no as doctorBasicInfo_cell_no,
            doctorBasicInfo.address as doctorBasicInfo_address,
            doctorBasicInfo.work_phone as doctorBasicInfo_work_phone,
            doctorBasicInfo.fax as doctorBasicInfo_fax,
            doctorBasicInfo.extension as doctorBasicInfo_extension,
            doctorBasicInfo.home_phone as doctorBasicInfo_home_phone,
            doctorBasicInfo.emergency_name as doctorBasicInfo_emergency_name,
            doctorBasicInfo.emergency_phone as doctorBasicInfo_emergency_phone,
            doctorBasicInfo.biography as doctorBasicInfo_biography,
            doctorBasicInfo.hiring_date as doctorBasicInfo_hiring_date,
            doctorBasicInfo.from as doctorBasicInfo_from,
            doctorBasicInfo.to as doctorBasicInfo_to,
            doctorBasicInfo.profile_pic as doctorBasicInfo_profile_pic,
            doctorBasicInfo.city as doctorBasicInfo_city,
            doctorBasicInfo.state as doctorBasicInfo_state,
            doctorBasicInfo.zip as doctorBasicInfo_zip,
            doctorBasicInfo.social_security as doctorBasicInfo_social_security,
            doctorBasicInfo.profile_pic_url as doctorBasicInfo_profile_pic_url,
            doctorBasicInfo.apartment_suite as doctorBasicInfo_apartment_suite,

            medicalIdentifier.id as medicalIdentifier_id,
            medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

            billingTitles.id as billingTitles_id,
            billingTitles.name as billingTitles_name,
            billingTitles.description as billingTitles_description,

            facilities.id as facilities_id,
            facilities.name as facilities_name,
            facilities.slug as facilities_slug,
            facilities.qualifier as facilities_qualifier

            FROM sch_appointments as appointments

            left join kiosk_cases on kiosk_cases.id = appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join billing_case_status on billing_case_status.id = kiosk_cases.status_id and billing_case_status.deleted_at IS NULL

            inner join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            inner join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL

            left join kiosk_case_types on kiosk_case_types.id = appointments.case_type_id and kiosk_case_types.deleted_at IS NULL

            left join sch_appointment_types on sch_appointment_types.id = appointments.type_id and sch_appointment_types.deleted_at IS NULL

            left join sch_appointment_statuses on sch_appointment_statuses.id = appointments.status_id and sch_appointment_statuses.deleted_at IS NULL

            inner join kiosk_patient on kiosk_patient.id = appointments.patient_id and kiosk_patient.deleted_at IS NULL

            left join physician_clinics on physician_clinics.id = appointments.physician_id and physician_clinics.deleted_at IS NULL
            left join physicians on physicians.id = physician_clinics.physician_id and physicians.deleted_at IS NULL
            left join clinics on clinics.id = physician_clinics.clinic_id and clinics.deleted_at IS NULL
            left join clinic_locations on clinic_locations.id = physician_clinics.clinic_locations_id and clinic_locations.deleted_at IS NULL

            left join users as technician on technician.id = appointments.technician_id and technician.deleted_at IS NULL
            left join user_basic_info as technician_basic_info on technician_basic_info.user_id = technician.id and technician_basic_info.deleted_at IS NULL

            left join users as readingProvider on readingProvider.id = appointments.reading_provider_id and readingProvider.deleted_at IS NULL
            left join user_basic_info as readingProvider_basic_info on readingProvider_basic_info.user_id = readingProvider.id and readingProvider_basic_info.deleted_at IS NULL

            left join sch_transportations on sch_transportations.appointment_id = appointments.id and sch_transportations.deleted_at IS NULL

            left join sch_appointment_cpt_codes on sch_appointment_cpt_codes.appointment_id = appointments.id and sch_appointment_cpt_codes.deleted_at IS NULL
            left join billing_codes on billing_codes.id = sch_appointment_cpt_codes.billing_code_id and billing_codes.deleted_at IS NULL


            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
            left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
            left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
            left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
            ${finalWhereFilter}
            GROUP BY appointments.id
            ORDER BY appointment_scheduled_date_time DESC
            ${applyLimit})`;

        return query;
    }

    public generateAppointmentListRawQueryV1 = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            paginate,
            page,
            perPage,

        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `LIMIT ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';
        let requiredConditionForDoctor: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`sch_available_specialities.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (patientStatusIds?.length) {
            whereFilter.push(`kiosk_case_patient_session.status_id in (${String(patientStatusIds)})`);
        }

        if (facilityLocationIds?.length) {
            whereFilter.push(`sch_available_specialities.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (doctorIds && doctorIds.length) {
            whereFilter.push(`sch_available_doctors.doctor_id in (${String(doctorIds)})`);
            requiredConditionForDoctor = 'inner';
        }

        if (patientId) {
            whereFilter.push(`sch_appointments.patient_id = ${patientId}`);
        }

        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereFilter.push(`sch_appointments.type_id in (${String(appointmentTypeIds)})`);
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`sch_appointments.status_id in (${String(appointmentStatusIds)})`);
        }

        if (caseTypeIds && caseTypeIds.length) {
            whereFilter.push(`sch_appointments.case_type_id in (${String(caseTypeIds)})`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`sch_appointments.case_id in (${String(caseIds)})`);
        }

        if (startDate && endDate) {
            whereFilter.push(`sch_appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
        }

        whereFilter.push(`sch_appointments.cancelled = 0`);
        whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);
        whereFilter.push(`sch_appointments.deleted_at IS NULL`);

        let index: number = 0;
        let finalWhereFilter = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            sch_appointments.id,
            sch_appointments.scheduled_date_time,
            sch_appointments.confirmation_status,
            sch_appointments.comments,
            sch_appointments.case_id,
            sch_appointments.patient_id,
            sch_appointments.billable,

            billing_case_status.name as case_status,

            kiosk_case_patient_session.id as kiosk_case_patient_session_id,
            kiosk_case_patient_session.date_of_check_in as kiosk_case_patient_session_date_of_check_in,
            kiosk_case_patient_session.time_of_check_in as kiosk_case_patient_session_time_of_check_in,
            concat_ws(' ',kiosk_case_patient_session.date_of_check_in, kiosk_case_patient_session.time_of_check_in) as date_time,
            
            kiosk_case_patient_session_statuses.id as visit_status_id,
            kiosk_case_patient_session_statuses.name as visit_status_name,
            kiosk_case_patient_session_statuses.slug as visit_status_slug,

            kiosk_case_types.id as case_type_id,
            kiosk_case_types.name as case_type_name,
            kiosk_case_types.slug as case_type_slug,

            sch_appointment_types.id as appointment_type_id,
            sch_appointment_types.name as appointment_type_name,
            sch_appointment_types.slug as appointment_type_slug,
            sch_appointment_types.qualifier as appointment_type_qualifier,

            sch_appointment_statuses.id as appointment_status_id,
            sch_appointment_statuses.name as appointment_status_name,
            sch_appointment_statuses.slug as appointment_status_slug,

            kiosk_patient.first_name as patient_first_name,
            kiosk_patient.middle_name as patient_middle_name,
            kiosk_patient.last_name as patient_last_name,

            facility_locations.id as facility_location_id,
            facility_locations.name as facility_location_name,
            facility_locations.qualifier as facility_location_qualifier,

            specialities.id as speciality_id,
            specialities.name as speciality_name,
            specialities.qualifier as speciality_qualifier,
            specialities.speciality_key as speciality_key,

            user_basic_info.first_name as doctor_first_name,
            user_basic_info.middle_name as doctor_middle_name,
            user_basic_info.last_name as doctor_last_name,

            medicalIdentifier.id as medicalIdentifier_id,
            medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

            billingTitles.id as billing_titles_id,
            billingTitles.name as billing_titles_name,
            billingTitles.description as billing_titles_description,

            facilities.id as facility_id,
            facilities.name as facility_name,
            facilities.slug as facility_slug,
            facilities.qualifier as facility_qualifier,

            visit_sessions.id as visit_session_id
            
            FROM sch_appointments

            left join kiosk_cases on kiosk_cases.id = sch_appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join billing_case_status on billing_case_status.id = kiosk_cases.status_id and billing_case_status.deleted_at IS NULL
            inner join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            left join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL
            left join kiosk_case_types on kiosk_case_types.id = sch_appointments.case_type_id and kiosk_case_types.deleted_at IS NULL
            left join sch_appointment_types on sch_appointment_types.id = sch_appointments.type_id and sch_appointment_types.deleted_at IS NULL
            left join sch_appointment_statuses on sch_appointment_statuses.id = sch_appointments.status_id and sch_appointment_statuses.deleted_at IS NULL
            left join kiosk_patient on kiosk_patient.id = sch_appointments.patient_id and kiosk_patient.deleted_at IS NULL
            left join visit_sessions on visit_sessions.appointment_id = sch_appointments.id and visit_sessions.deleted_at IS NULL



            ${requiredCondition} join sch_available_specialities on sch_available_specialities.id = sch_appointments.available_speciality_id and sch_available_specialities.deleted_at IS NULL
            left join specialities on specialities.id = sch_available_specialities.speciality_id and specialities.deleted_at IS NULL
            left join facility_locations on facility_locations.id = sch_available_specialities.facility_location_id and facility_locations.deleted_at IS NULL
            left join facilities on facilities.id = facility_locations.facility_id and facilities.deleted_at IS NULL

            ${requiredConditionForDoctor} join sch_available_doctors on sch_available_doctors.id = sch_appointments.available_doctor_id and sch_available_doctors.deleted_at IS NULL
            left join users as doctor on doctor.id = sch_available_doctors.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info on user_basic_info.user_id = doctor.id and user_basic_info.deleted_at IS NULL
            left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
            left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
            ${finalWhereFilter}
            ORDER BY -kiosk_case_patient_session.date_of_check_in DESC, date_time ASC
            ${applyLimit})`;
            // GROUP BY appointments.id

        return query;
    }

    public getAllDoctorSpecialityAppointmentsRawQuery = (data: typings.GetAllDoctorSpecialityAppointmentsRawQueryBodyI): string => {

        const {
            facilityLocationIds,
            specialityIds,
            doctorIds,
            endDate,
            startDate
        } = data;

        const whereFilter: string[] = [];
        let docWhereFilter: string = '';

        if (doctorIds && doctorIds.length) {
            docWhereFilter = `and (CASE 
                WHEN sch_appointments.available_doctor_id IS NOT NULL THEN sch_available_doctors.doctor_id in (${String(doctorIds)}) and sch_available_specialities.facility_location_id in (${String(facilityLocationIds)}) and sch_available_specialities.speciality_id in (${String(specialityIds)})
                ELSE sch_available_specialities.facility_location_id in (${String(facilityLocationIds)}) and sch_available_specialities.speciality_id in (${String(specialityIds)})
            END)`
        } else if (specialityIds && specialityIds.length) {
            whereFilter.push(`sch_available_specialities.speciality_id in (${String(specialityIds)})`);
            if (facilityLocationIds?.length) {
                whereFilter.push(`sch_available_specialities.facility_location_id in (${String(facilityLocationIds)})`);
            }
        }

        if (startDate && endDate) {
            whereFilter.push(`sch_appointments.scheduled_date_time BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`);
        }

        whereFilter.push(`sch_appointments.cancelled = 0`);
        whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);
        whereFilter.push(`sch_appointments.deleted_at IS NULL`);

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            sch_appointments.id,
            sch_appointments.scheduled_date_time as start_date_time,
            sch_appointments.case_id,
            sch_appointments.patient_id,
            sch_appointments.evaluation_date_time,
            sch_appointments.available_speciality_id,
            sch_appointments.priority_id,
            sch_appointments.time_slots as time_slot,
            sch_appointments.case_id,
            sch_appointments.appointment_title,
            sch_appointments.type_id as appointment_type_id,
            sch_appointments.confirmation_status,
            sch_appointments.comments,
            sch_appointments.billable,

            kiosk_patient.first_name,
            kiosk_patient.middle_name,
            kiosk_patient.last_name,
            kiosk_patient.profile_avatar as picture,

            facility_locations.id as facility_location_id,

            specialities.id as speciality_id,

            sch_available_doctors.id as available_doctor_id,
            sch_available_doctors.doctor_id,
            user_basic_info.first_name as doctor_first_name,
            user_basic_info.middle_name as doctor_middle_name,
            user_basic_info.last_name as doctor_last_name,

            visit_sessions.document_uploaded,
            visit_session_states.slug as visit_session_state_slug,
            visit_session_states.name as visit_session_state_name,

            kiosk_case_types.id as case_type_id,
            kiosk_case_types.name as case_type,

            kiosk_case_patient_session.date_of_check_in,
            kiosk_case_patient_session.time_of_check_in,

            appointmentVisitSession.deleted_at as last_visit_session_deleted

            FROM sch_appointments

            left join kiosk_patient on kiosk_patient.id = sch_appointments.patient_id and kiosk_patient.deleted_at IS NULL
            left join kiosk_cases on kiosk_cases.id = sch_appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join kiosk_case_types on kiosk_case_types.id = sch_appointments.case_type_id and kiosk_case_types.deleted_at IS NULL

            left join sch_appointment_statuses on sch_appointment_statuses.id = sch_appointments.status_id and sch_appointment_statuses.deleted_at IS NULL
            left join visit_sessions as appointmentVisitSession on appointmentVisitSession.appointment_id = sch_appointments.id and appointmentVisitSession.deleted_at IS NOT NULL
           
            left join visit_sessions on visit_sessions.appointment_id = sch_appointments.id and visit_sessions.deleted_at IS NULL
            left join visit_session_states on visit_session_states.id = visit_sessions.visit_session_state_id and visit_session_states.deleted_at IS NULL
            
            left join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id and kiosk_case_patient_session.deleted_at IS NULL

            left join sch_available_specialities on sch_available_specialities.id = sch_appointments.available_speciality_id and sch_available_specialities.deleted_at IS NULL
            left join specialities on specialities.id = sch_available_specialities.speciality_id and specialities.deleted_at IS NULL
            left join facility_locations on facility_locations.id = sch_available_specialities.facility_location_id and facility_locations.deleted_at IS NULL

            left join sch_available_doctors on sch_available_doctors.id = sch_appointments.available_doctor_id and sch_available_doctors.deleted_at IS NULL
            left join users as doctor on doctor.id = sch_available_doctors.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info on user_basic_info.user_id = doctor.id and user_basic_info.deleted_at IS NULL

            ${finalWhereFilter}            
            ${docWhereFilter}

            Group by sch_appointments.id
            )`;

        return query;
        
    }

    // New Generic appointment query
    public generateGenericAppointmentRawQuery = (data: typings.GenericWhereClauseForAppointmentsReturnObjectsI): string => {

        const {
            applyLimit,
            requiredCondition,
            requiredConditionForDoctor,
            whereClause: finalWhereFilter,
            dynamicQueryClause: {
                queryColumns,
                queryJoins,
                queryOrderBy
            }
        } = data;

        const query: string = `(SELECT
            sch_appointments.id,
            sch_appointments.scheduled_date_time,
            sch_appointments.case_id,
            sch_appointments.patient_id,
            sch_appointments.billable,

            sch_appointment_types.id as appointment_type_id,
            sch_appointment_types.name as appointment_type_name,
            sch_appointment_types.slug as appointment_type_slug,
            sch_appointment_types.qualifier as appointment_type_qualifier,

            kiosk_patient.first_name as patient_first_name,
            kiosk_patient.middle_name as patient_middle_name,
            kiosk_patient.last_name as patient_last_name,

            facility_locations.id as facility_location_id,
            facility_locations.name as facility_location_name,
            facility_locations.qualifier as facility_location_qualifier,

            specialities.id as speciality_id,
            specialities.name as speciality_name,
            specialities.qualifier as speciality_qualifier,
            specialities.speciality_key as speciality_key,

            facilities.id as facility_id,
            facilities.name as facility_name,
            facilities.slug as facility_slug,
            facilities.qualifier as facility_qualifier,

            ${queryColumns}

            sch_available_doctors.doctor_id,
            user_basic_info.first_name as doctor_first_name,
            user_basic_info.middle_name as doctor_middle_name,
            user_basic_info.last_name as doctor_last_name,

            billing_titles.name as billing_title
            
            FROM sch_appointments

            left join sch_appointment_types on sch_appointment_types.id = sch_appointments.type_id and sch_appointment_types.deleted_at IS NULL
            left join kiosk_patient on kiosk_patient.id = sch_appointments.patient_id and kiosk_patient.deleted_at IS NULL

            ${requiredCondition} join sch_available_specialities on sch_available_specialities.id = sch_appointments.available_speciality_id and sch_available_specialities.deleted_at IS NULL
            left join specialities on specialities.id = sch_available_specialities.speciality_id and specialities.deleted_at IS NULL
            left join facility_locations on facility_locations.id = sch_available_specialities.facility_location_id and facility_locations.deleted_at IS NULL
            left join facilities on facilities.id = facility_locations.facility_id and facilities.deleted_at IS NULL

            ${requiredConditionForDoctor} join sch_available_doctors on sch_available_doctors.id = sch_appointments.available_doctor_id and sch_available_doctors.deleted_at IS NULL
            left join users as doctor on doctor.id = sch_available_doctors.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info on user_basic_info.user_id = doctor.id and user_basic_info.deleted_at IS NULL

            left join medical_identifiers on medical_identifiers.user_id = doctor.id and medical_identifiers.deleted_at IS NULL
            left join billing_titles on billing_titles.id = medical_identifiers.billing_title_id and billing_titles.deleted_at IS NULL
            
            ${queryJoins}

            ${finalWhereFilter}
            ${queryOrderBy}
            ${applyLimit})`;

        return query;
        
    }

    public generateGenericAppointmentRawQueryCount = (data: typings.GenericWhereClauseForAppointmentsReturnObjectsI): string => {

        const {
            applyLimit,
            requiredCondition,
            requiredConditionForDoctor,
            whereClause: finalWhereFilter,
        } = data;

        const query: string = `(SELECT
            COUNT(DISTINCT(sch_appointments.id)) as total_count

            FROM sch_appointments

            left join sch_appointment_types on sch_appointment_types.id = sch_appointments.type_id and sch_appointment_types.deleted_at IS NULL
            left join kiosk_patient on kiosk_patient.id = sch_appointments.patient_id and kiosk_patient.deleted_at IS NULL

            ${requiredCondition} join sch_available_specialities on sch_available_specialities.id = sch_appointments.available_speciality_id and sch_available_specialities.deleted_at IS NULL
            left join specialities on specialities.id = sch_available_specialities.speciality_id and specialities.deleted_at IS NULL
            left join facility_locations on facility_locations.id = sch_available_specialities.facility_location_id and facility_locations.deleted_at IS NULL

            ${requiredConditionForDoctor} join sch_available_doctors on sch_available_doctors.id = sch_appointments.available_doctor_id and sch_available_doctors.deleted_at IS NULL
            
            ${finalWhereFilter}
            )`;

        return query;
        
    }

    public appointmentListQuery = (): typings.DynamicQueryClausesForAppointmentsI => {

        const queryColumns: string = `
            sch_appointments.confirmation_status,
            sch_appointments.comments,
    
            billing_case_status.name as case_status,

            kiosk_case_patient_session_statuses.id as visit_status_id,
            kiosk_case_patient_session_statuses.name as visit_status_name,
            kiosk_case_patient_session_statuses.slug as visit_status_slug,

            kiosk_case_types.id as case_type_id,
            kiosk_case_types.name as case_type_name,
            kiosk_case_types.slug as case_type_slug,


            sch_appointment_statuses.id as appointment_status_id,
            sch_appointment_statuses.name as appointment_status_name,
            sch_appointment_statuses.slug as appointment_status_slug,

            visit_sessions.id as visit_session_id,

            sch_appointments.created_at,
            sch_appointments.updated_at,

            concat_ws(' ', created_by_user.first_name, created_by_user.middle_name ,created_by_user.last_name) as created_by_name,
            concat_ws(' ', updated_by_user.first_name, updated_by_user.middle_name ,updated_by_user.last_name) as updated_by_name,
            
            `;

        const queryJoins: string = `
            left join kiosk_cases on kiosk_cases.id = sch_appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join billing_case_status on billing_case_status.id = kiosk_cases.status_id and billing_case_status.deleted_at IS NULL
            left join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            left join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL
            left join kiosk_case_types on kiosk_case_types.id = sch_appointments.case_type_id and kiosk_case_types.deleted_at IS NULL
            left join sch_appointment_statuses on sch_appointment_statuses.id = sch_appointments.status_id and sch_appointment_statuses.deleted_at IS NULL
            left join visit_sessions on visit_sessions.appointment_id = sch_appointments.id and visit_sessions.deleted_at IS NULL
            left join user_basic_info as created_by_user on created_by_user.user_id = sch_appointments.created_by and created_by_user.deleted_at  is NULL
            left join user_basic_info as updated_by_user on updated_by_user.user_id = sch_appointments.updated_by and updated_by_user.deleted_at  is NULL
            `;
            
        const queryOrderBy: string = `ORDER BY sch_appointments.scheduled_date_time DESC`;
        
        return {
            queryColumns,
            queryJoins,
            queryOrderBy
        };
    }

    public cancelledListQuery = (): typings.DynamicQueryClausesForAppointmentsI => {

        const queryColumns: string = `
        sch_appointments.updated_at,
        sch_appointments.created_at,
        sch_appointments.cancelled_comments,
        sch_appointments.is_redo,
        sch_appointments.priority_id, 
        sch_appointments.case_type_id,
        sch_appointments.time_slots,
        sch_appointments.appointment_title,
        sch_appointments.status_id,
        sch_appointments.confirmation_status,
        sch_appointments.created_by,
        sch_appointments.updated_by,
        kiosk_case_patient_session.status_id as session_status_id,
        concat_ws(' ', created_by_user.first_name, created_by_user.middle_name ,created_by_user.last_name) as created_by_name,
        concat_ws(' ', updated_by_user.first_name, updated_by_user.middle_name ,updated_by_user.last_name) as updated_by_name,
        `;

        const queryJoins: string = `
        left join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id
        left join user_basic_info as created_by_user on created_by_user.user_id = sch_appointments.created_by and created_by_user.deleted_at  is NULL
        left join user_basic_info as updated_by_user on updated_by_user.user_id = sch_appointments.updated_by and updated_by_user.deleted_at  is NULL
        `;
            
        const queryOrderBy: string = ` GROUP BY sch_appointments.id ORDER BY sch_appointments.updated_at DESC , kiosk_case_patient_session.deleted_at DESC`;
        
        return {
            queryColumns,
            queryJoins,
            queryOrderBy
        };
    }

    public rescheduledListQuery = (): typings.DynamicQueryClausesForAppointmentsI => {

        const queryColumns: string = `
            sch_appointments.time_slots,
            sch_appointments.pushed_to_front_desk_comments,
            sch_appointments.updated_at,
            sch_appointments.created_at,
    
            kiosk_case_types.id as case_type_id,
            kiosk_case_types.name as case_type_name,
            kiosk_case_types.slug as case_type_slug,

            targetFacilityLocation.id as target_facility_location_id,
            targetFacilityLocation.name as target_facility_location_name,
            targetFacilityLocation.qualifier as target_facility_location_qualifier,
    
            targetFacilities.id AS target_facility_id,
            targetFacilities.name AS target_facility_name,
            targetFacilities.slug AS target_facility_slug,
            targetFacilities.qualifier AS target_facility_qualifier,
    
            originFacilityLocation.id as origin_facility_location_id,
            originFacilityLocation.name as origin_facility_location_name,
            originFacilityLocation.qualifier as origin_facility_location_qualifier,

            originFacilities.id AS origin_facility_id,
            originFacilities.name AS origin_facility_name,
            originFacilities.slug AS origin_facility_slug,
            originFacilities.qualifier AS origin_facility_qualifier,

            updatedByUserBasicInfo.first_name AS updated_by_first_name,
            updatedByUserBasicInfo.last_name AS updated_by_last_name,
            updatedByUserBasicInfo.middle_name AS updated_by_middle_name,

            createdByUserBasicInfo.first_name AS created_by_first_name,
            createdByUserBasicInfo.last_name AS created_by_last_name,
            createdByUserBasicInfo.middle_name AS created_by_middle_name,
            `;

        const queryJoins: string = `
            left join kiosk_case_types on kiosk_case_types.id = sch_appointments.case_type_id and kiosk_case_types.deleted_at IS NULL
            left join facility_locations as targetFacilityLocation on targetFacilityLocation.id = sch_appointments.target_facility_id and targetFacilityLocation.deleted_at IS NULL
            left join facilities as targetFacilities on targetFacilities.id = targetFacilityLocation.facility_id and targetFacilities.deleted_at IS NULL
            left join facility_locations as originFacilityLocation on originFacilityLocation.id = sch_appointments.origin_facility_id and originFacilityLocation.deleted_at IS NULL
            left join facilities as originFacilities on originFacilities.id = originFacilityLocation.facility_id and originFacilities.deleted_at IS NULL
            left join users as updatedBy on sch_appointments.updated_by = updatedBy.id AND updatedBy.deleted_at IS NULL
            left join user_basic_info as updatedByUserBasicInfo on updatedBy.id = updatedByUserBasicInfo.user_id AND updatedByUserBasicInfo.deleted_at IS NULL
            left join users as createdBy on sch_appointments.created_by = createdBy.id AND createdBy.deleted_at IS NULL
            left join user_basic_info as createdByUserBasicInfo on updatedBy.id = createdByUserBasicInfo.user_id AND createdByUserBasicInfo.deleted_at IS NULL
            `;
            
        const queryOrderBy: string = `ORDER BY sch_appointments.updated_at DESC`;
        
        return {
            queryColumns,
            queryJoins,
            queryOrderBy
        };
    }

    public patientAppointmentQuery = (): typings.DynamicQueryClausesForAppointmentsI => {

        const queryColumns: string = `
            sch_appointments.pushed_to_front_desk,
            sch_appointments.pushed_to_front_desk_comments,
            sch_appointments.cancelled,
            sch_appointments.cancelled_comments,
            sch_appointments.updated_at,
            sch_appointments.action_performed,

            sch_appointment_statuses.id as appointment_status_id,
            sch_appointment_statuses.name as appointment_status_name,
            sch_appointment_statuses.slug as appointment_status_slug,
    
            kiosk_case_types.id as case_type_id,
            kiosk_case_types.name as case_type_name,
            kiosk_case_types.slug as case_type_slug,

            kiosk_case_patient_session_statuses.id as visit_status_id,
            kiosk_case_patient_session_statuses.name as visit_status_name,
            kiosk_case_patient_session_statuses.slug as visit_status_slug,
            `;

        const queryJoins: string = `
            left join sch_appointment_statuses on sch_appointment_statuses.id = sch_appointments.status_id and sch_appointment_statuses.deleted_at IS NULL
            left join kiosk_case_types on kiosk_case_types.id = sch_appointments.case_type_id and kiosk_case_types.deleted_at IS NULL
            left join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = sch_appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            left join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL
            `;
            
        const queryOrderBy: string = ``;
        
        return {
            queryColumns,
            queryJoins,
            queryOrderBy
        };
    }

    public generateGetSinglePatientAppointmentsRawQuery = (data: typings.GetPatientCancelledAppointmentsV1ReqBodyI): string => {

        const {
            facilityLocationIds,
            specialityIds,
            patientId,
            patientName,
            appointmentStatusIds,
            caseIds,
            startDate,
            endDate,
            paginate,
            page,
            perPage,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `LIMIT ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`specialities.id in (${String(specialityIds)})`);
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (facilityLocationIds?.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`appointments.status_id in (${String(appointmentStatusIds)})`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }

        if (startDate && endDate) {
            whereFilter.push(`appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
        }

        whereFilter.push(`appointments.patient_id = ${patientId}`);
        // WhereFilter.push(`appointments.cancelled = 1`);
        whereFilter.push(`appointments.pushed_to_front_desk = 0`);
        whereFilter.push('appointments.deleted_at IS NULL');

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const query: string = `(SELECT
            appointments.id as appointment_id,
            appointments.key as appointment_key,
            appointments.scheduled_date_time as appointment_scheduled_date_time,
            appointments.evaluation_date_time as appointment_evaluation_date_time,
            appointments.time_slots as appointment_time_slot,
            appointments.appointment_title as appointment_title,
            appointments.action_performed as appointment_action_performed,
            appointments.confirmation_status as appointment_confirmation_status,
            appointments.cancelled as appointment_cancelled,
            appointments.pushed_to_front_desk as appointment_pushed_to_front_dest,
            appointments.comments as appointment_comments,
            appointments.by_health_app as appointment_by_health_app,
            appointments.date_list_id as appointment_date_list_id,
            appointments.target_facility_id as appointment_target_facility_id,
            appointments.origin_facility_id as appointment_origin_facility_id,
            appointments.case_id as appointment_case_id,
            appointments.case_type_id as appointment_case_type_id,
            appointments.patient_id as appointment_patient_id,
            appointments.type_id as appointment_type_id,
            appointments.status_id as appointment_status_id,
            appointments.priority_id as appointment_priority_id,
            appointments.available_doctor_id as appointment_available_doctor_id,
            appointments.available_speciality_id as appointment_available_speciality_id,
            appointments.billable as appointment_billable,
            appointments.pushed_to_front_desk_comments as appointment_pushed_to_front_desk_comments,
            appointments.cancelled_comments as appointment_cancelled_comments,
            appointments.is_speciality_base as appointment_is_speciality_base,
            appointments.created_by as appointment_created_by,
            appointments.updated_by as appointment_updated_by,
            appointments.created_at as appointment_created_at,
            appointments.updated_at as appointment_updated_at,
            appointments.deleted_at as appointment_deleted_at,
            appointments.is_redo as appointment_is_redo,
            appointments.is_active as appointment_is_active,
            appointments.is_soft_registered as appointment_is_soft_registered,
            appointments.physician_id as appointment_physician_id,
            appointments.technician_id as appointment_technician_id,

            appointments.reading_provider_id as appointment_reading_provider_id,
            appointments.cd_image as appointment_cd_image,
            appointments.is_transportation as appointment_is_transportation,

            kiosk_cases.id as patient_case_id,

            billing_case_status.id as billing_case_status_id,
            billing_case_status.name as billing_case_status_name,

            kiosk_case_patient_session.id as kiosk_case_patient_session_id,
            kiosk_case_patient_session.key as kiosk_case_patient_session_key,
            kiosk_case_patient_session.status_id as kiosk_case_patient_session_status_id,
            kiosk_case_patient_session.case_id as kiosk_case_patient_session_case_id,
            kiosk_case_patient_session.date_of_check_in as kiosk_case_patient_session_date_of_check_in,
            kiosk_case_patient_session.time_of_check_in as kiosk_case_patient_session_time_of_check_in,
            kiosk_case_patient_session.date_of_check_out as kiosk_case_patient_session_date_of_check_out,
            kiosk_case_patient_session.time_of_check_out as kiosk_case_patient_session_time_of_check_out,
            kiosk_case_patient_session.created_by as kiosk_case_patient_session_created_by,
            kiosk_case_patient_session.updated_by as kiosk_case_patient_session_updated_by,
            kiosk_case_patient_session.created_at as kiosk_case_patient_session_created_at,
            kiosk_case_patient_session.updated_at as kiosk_case_patient_session_updated_at,
            kiosk_case_patient_session.deleted_at as kiosk_case_patient_session_deleted_at,
            kiosk_case_patient_session.appointment_id as kiosk_case_patient_session_appointment_id,

            kiosk_case_patient_session_statuses.name as kiosk_case_patient_session_statuses_name,
            kiosk_case_patient_session_statuses.slug as kiosk_case_patient_session_statuses_slug,

            kiosk_case_types.id as kiosk_case_types_id,
            kiosk_case_types.key as kiosk_case_types_key,
            kiosk_case_types.name as kiosk_case_types_name,
            kiosk_case_types.slug as kiosk_case_types_slug,
            kiosk_case_types.description as kiosk_case_types_description,
            kiosk_case_types.comments as kiosk_case_types_comments,
            kiosk_case_types.remainder_days as kiosk_case_types_remainder_days,
            kiosk_case_types.created_by as kiosk_case_types_created_by,
            kiosk_case_types.updated_by as kiosk_case_types_updated_by,
            kiosk_case_types.created_at as kiosk_case_types_created_at,
            kiosk_case_types.updated_at as kiosk_case_types_updated_at,
            kiosk_case_types.deleted_at as kiosk_case_types_deleted_at,

            sch_appointment_types.id as sch_appointment_types_id,
            sch_appointment_types.name as sch_appointment_types_name,
            sch_appointment_types.slug as sch_appointment_types_slug,
            sch_appointment_types.description as sch_appointment_types_description,
            sch_appointment_types.is_all_cpt_codes as sch_appointment_types_is_all_cpt_codes,
            sch_appointment_types.enable_cpt_codes as sch_appointment_types_enable_cpt_codes,
            sch_appointment_types.qualifier as sch_appointment_types_qualifier,
            sch_appointment_types.created_by as sch_appointment_types_created_by,
            sch_appointment_types.updated_by as sch_appointment_types_updated_by,
            sch_appointment_types.created_at as sch_appointment_types_created_at,
            sch_appointment_types.updated_at as sch_appointment_types_updated_at,
            sch_appointment_types.deleted_at as sch_appointment_types_deleted_at,
            sch_appointment_types.is_editable as sch_appointment_types_is_editable,
            sch_appointment_types.avoid_checkedin as sch_appointment_types_avoid_checkedin,
            sch_appointment_types.is_reading_provider as sch_appointment_types_is_reading_provider,

            sch_appointment_statuses.id as sch_appointment_statuses_id,
            sch_appointment_statuses.name as sch_appointment_statuses_name,
            sch_appointment_statuses.slug as sch_appointment_statuses_slug,
            sch_appointment_statuses.created_by as sch_appointment_statuses_created_by,
            sch_appointment_statuses.updated_by as sch_appointment_statuses_updated_by,
            sch_appointment_statuses.created_at as sch_appointment_statuses_created_at,
            sch_appointment_statuses.updated_at as sch_appointment_statuses_updated_at,
            sch_appointment_statuses.deleted_at as sch_appointment_statuses_deleted_at,

            kiosk_patient.id as patient_id,
            kiosk_patient.key as patient_key,
            kiosk_patient.first_name as patient_first_name,
            kiosk_patient.middle_name as patient_middle_name,
            kiosk_patient.last_name as patient_last_name,
            kiosk_patient.dob as patient_dob,
            kiosk_patient.gender as patient_gender,
            kiosk_patient.age as patient_age,
            kiosk_patient.ssn as patient_ssn,
            kiosk_patient.cell_phone as patient_cell_phone,
            kiosk_patient.home_phone as patient_home_phone,
            kiosk_patient.work_phone as patient_work_phone,
            kiosk_patient.height_ft as patient_height_ft,
            kiosk_patient.height_in as patient_height_in,
            kiosk_patient.weight_lbs as patient_weight_lbs,
            kiosk_patient.weight_kg as patient_weight_kg,
            kiosk_patient.meritial_status as patient_meritial_status,
            kiosk_patient.profile_avatar as patient_profile_avatar,
            kiosk_patient.need_translator as patient_need_translator,
            kiosk_patient.language as patient_language,
            kiosk_patient.is_pregnant as patient_pregnant,
            kiosk_patient.is_law_enforcement_agent as patient_is_law_enforcement_agent,
            kiosk_patient.status as patient_status,
            kiosk_patient.notes as patient_notes,
            kiosk_patient.created_by as patient_created_by,
            kiosk_patient.updated_by as patient_updated_by,
            kiosk_patient.created_at as patient_created_at,
            kiosk_patient.updated_at as patient_updated_at,
            kiosk_patient.deleted_at as patient_deleted_at,
            kiosk_patient.user_id as patient_user_id,
            kiosk_patient.title as patient_title,
            kiosk_patient.ethnicity as patient_ethnicity,
            kiosk_patient.race as patient_race,
            kiosk_patient.suffix as patient_suffix,
            kiosk_patient.by_health_app as patient_by_health_app,
            kiosk_patient.creation_source as patient_creation_source,
            kiosk_patient.is_active as patient_is_active,
            kiosk_patient.is_soft_registered as patient_is_soft_registered,

            physician_clinics.id as physician_clinics_id,
            physician_clinics.clinic_id as physician_clinics_clinic_id,
            physician_clinics.clinic_locations_id as physician_clinic_location,
            physician_clinics.physician_id as physician_clinics_physician_id,

            physicians.id as physician_id,
            physicians.first_name as physician_first_name,
            physicians.middle_name as physician_middle_name,
            physicians.last_name as physician_last_name,
            physicians.cell_no as physician_cell_no,
            physicians.email as physician_email,
            physicians.npi_no as physician_npi_no,
            physicians.license_no as physician_license_no,

            clinics.id as clinic_id,
            clinics.name as clinic_name,

            clinic_locations.id as clinic_location_id,
            clinic_locations.clinic_id as clinic_location_clinic_id,
            clinic_locations.city as clinic_location_city,
            clinic_locations.state as clinic_location_state,
            clinic_locations.zip as clinic_location_zip,
            clinic_locations.phone as clinic_location_phone,
            clinic_locations.fax as clinic_location_fax,
            clinic_locations.email as clinic_location_email,
            clinic_locations.street_address as clinic_location_street_address,
            clinic_locations.extension as clinic_location_extension,
            clinic_locations.floor as clinic_location_floor,
            clinic_locations.is_primary as clinic_location_is_primary,
            clinic_locations.status as clinic_location_status,

            technician.id as technician_id,
            technician.email as technician_email,

            technician_basic_info.id as technician_basic_info_id,
            technician_basic_info.first_name as technician_first_name,
            technician_basic_info.middle_name as technician_middle_name,
            technician_basic_info.last_name as technician_last_name,
            technician_basic_info.date_of_birth as technician_date_of_birth,
            technician_basic_info.gender as technician_gender,
            technician_basic_info.user_id as technician_user_id,
            technician_basic_info.area_id as technician_area_id,
            technician_basic_info.title as technician_title,
            technician_basic_info.cell_no as technician_cell_no,
            technician_basic_info.address as technician_address,
            technician_basic_info.work_phone as technician_work_phone,
            technician_basic_info.fax as technician_fax,
            technician_basic_info.extension as technician_extension,
            technician_basic_info.home_phone as technician_home_phone,
            technician_basic_info.emergency_name as technician_emergency_name,
            technician_basic_info.emergency_phone as technician_emergency_phone,
            technician_basic_info.biography as technician_biography,
            technician_basic_info.hiring_date as technician_hiring_date,
            technician_basic_info.from as technician_from,
            technician_basic_info.to as technician_to,
            technician_basic_info.profile_pic as technician_profile_pic,
            technician_basic_info.city as technician_city,
            technician_basic_info.state as technician_state,
            technician_basic_info.zip as technician_zip,
            technician_basic_info.social_security as technician_social_security,
            technician_basic_info.profile_pic_url as technician_profile_pic_url,
            technician_basic_info.apartment_suite as technician_apartment_suite,
            technician_basic_info.file_id as technician_file_id,
            technician_basic_info.deleted_at as technician_deleted_at,


            readingProvider.id as readingProvider_id,
            readingProvider.email as readingProvider_email,

            readingProvider_basic_info.id as readingProvider_basic_info_id,
            readingProvider_basic_info.first_name as readingProvider_first_name,
            readingProvider_basic_info.middle_name as readingProvider_middle_name,
            readingProvider_basic_info.last_name as readingProvider_last_name,
            readingProvider_basic_info.date_of_birth as readingProvider_date_of_birth,
            readingProvider_basic_info.gender as readingProvider_gender,
            readingProvider_basic_info.user_id as readingProvider_user_id,
            readingProvider_basic_info.area_id as readingProvider_area_id,
            readingProvider_basic_info.title as readingProvider_title,
            readingProvider_basic_info.cell_no as readingProvider_cell_no,
            readingProvider_basic_info.address as readingProvider_address,
            readingProvider_basic_info.work_phone as readingProvider_work_phone,
            readingProvider_basic_info.fax as readingProvider_fax,
            readingProvider_basic_info.extension as readingProvider_extension,
            readingProvider_basic_info.home_phone as readingProvider_home_phone,
            readingProvider_basic_info.emergency_name as readingProvider_emergency_name,
            readingProvider_basic_info.emergency_phone as readingProvider_emergency_phone,
            readingProvider_basic_info.biography as readingProvider_biography,
            readingProvider_basic_info.hiring_date as readingProvider_hiring_date,
            readingProvider_basic_info.from as readingProvider_from,
            readingProvider_basic_info.to as readingProvider_to,
            readingProvider_basic_info.profile_pic as readingProvider_profile_pic,
            readingProvider_basic_info.city as readingProvider_city,
            readingProvider_basic_info.state as readingProvider_state,
            readingProvider_basic_info.zip as readingProvider_zip,
            readingProvider_basic_info.social_security as readingProvider_social_security,
            readingProvider_basic_info.profile_pic_url as readingProvider_profile_pic_url,
            readingProvider_basic_info.apartment_suite as readingProvider_apartment_suite,
            readingProvider_basic_info.file_id as readingProvider_file_id,
            readingProvider_basic_info.deleted_at as readingProvider_deleted_at,

            billing_codes.id as billing_codes_id,
            billing_codes.name as billing_codes_name,
            billing_codes.type as billing_codes_type,
            billing_codes.code_type_id as billing_codes_code_type_id,
            billing_codes.description as billing_codes_description,
            billing_codes.short_description as billing_codes_short_description,
            billing_codes.long_description as billing_codes_long_description,
            billing_codes.comments as billing_codes_comments,

            availableSpeciality.id as availableSpeciality_id,
            availableSpeciality.key as availableSpeciality_key,
            availableSpeciality.start_date as availableSpeciality_start_date,
            availableSpeciality.end_date as availableSpeciality_end_date,
            availableSpeciality.end_date_for_recurrence as availableSpeciality_end_date_for_recurrence,
            availableSpeciality.no_of_doctors as availableSpeciality_no_of_doctors,
            availableSpeciality.no_of_slots as availableSpeciality_no_of_slots,
            availableSpeciality.end_after_occurences as availableSpeciality_end_after_occurences,
            availableSpeciality.number_of_entries as availableSpeciality_number_of_entries,
            availableSpeciality.speciality_id as availableSpeciality_speciality_id,
            availableSpeciality.facility_location_id as availableSpeciality_facility_location_id,
            availableSpeciality.recurrence_ending_criteria_id as availableSpeciality_recurrence_ending_criteria_id,
            availableSpeciality.deleted_at as availableSpeciality_deleted_at,

            availableSpecialityDoctor.id as availableSpecialityDoctor_id,
            availableSpecialityDoctor.key as availableSpecialityDoctor_key,
            availableSpecialityDoctor.start_date as availableSpecialityDoctor_start_date,
            availableSpecialityDoctor.end_date as availableSpecialityDoctor_end_date,
            availableSpecialityDoctor.no_of_slots as availableSpecialityDoctor_no_of_slots,
            availableSpecialityDoctor.doctor_id as availableSpecialityDoctor_doctor_id,
            availableSpecialityDoctor.facility_location_id as availableSpecialityDoctor_facility_location_id,
            availableSpecialityDoctor.available_speciality_id as availableSpecialityDoctor_available_speciality_id,
            availableSpecialityDoctor.supervisor_id as availableSpecialityDoctor_supervisor_id,
            availableSpecialityDoctor.is_provider_assignment as availableSpecialityDoctor_is_provider_assignment,

            facilityLocation.id as facilityLocation_id,
            facilityLocation.facility_id as facilityLocation_facility_id,
            facilityLocation.name as facilityLocation_name,
            facilityLocation.city as facilityLocation_city,
            facilityLocation.state as facilityLocation_state,
            facilityLocation.zip as facilityLocation_zip,
            facilityLocation.region_id as facilityLocation_region_id,
            facilityLocation.address as facilityLocation_address,
            facilityLocation.phone as facilityLocation_phone,
            facilityLocation.fax as facilityLocation_fax,
            facilityLocation.email as facilityLocation_email,
            facilityLocation.office_hours_start as facilityLocation_office_hours_start,
            facilityLocation.office_hours_end as facilityLocation_office_hours_end,
            facilityLocation.lat as facilityLocation_lat,
            facilityLocation.long as facilityLocation_long,
            facilityLocation.day_list as facilityLocation_day_list,
            facilityLocation.floor as facilityLocation_floor,
            facilityLocation.place_of_service_id as facilityLocation_place_of_service_id,
            facilityLocation.qualifier as facilityLocation_qualifier,
            facilityLocation.ext_no as facilityLocation_ext_no,
            facilityLocation.cell_no as facilityLocation_cell_no,
            facilityLocation.is_main as facilityLocation_is_main,
            facilityLocation.same_as_provider as facilityLocation_same_as_provider,
            facilityLocation.dean as facilityLocation_dean,

            specialities.id as specialities_id,
            specialities.name as specialities_name,
            specialities.description as specialities_description,
            specialities.time_slot as specialities_time_slot,
            specialities.over_booking as specialities_over_booking,
            specialities.has_app as specialities_has_app,
            specialities.speciality_key as specialities_speciality_key,
            specialities.comments as specialities_comments,
            specialities.default_name as specialities_default_name,
            specialities.qualifier as specialities_qualifier,
            specialities.is_defualt as specialities_is_defualt,
            specialities.is_available as specialities_is_available,
            specialities.is_create_appointment as specialities_is_create_appointment,
            specialities.is_editable as specialities_is_editable,

            doctor.id as doctor_id,
            doctor.email as doctor_email,
            doctor.reset_key as doctor_reset_key,
            doctor.status as doctor_status,
            doctor.is_loggedIn as doctor_is_loggedIn,
            doctor.remember_token as doctor_remember_token,

            doctorBasicInfo.id as doctorBasicInfo_id,
            doctorBasicInfo.first_name as doctorBasicInfo_first_name,
            doctorBasicInfo.middle_name as doctorBasicInfo_middle_name,
            doctorBasicInfo.last_name as doctorBasicInfo_last_name,
            doctorBasicInfo.date_of_birth as doctorBasicInfo_date_of_birth,
            doctorBasicInfo.gender as doctorBasicInfo_gender,
            doctorBasicInfo.user_id as doctorBasicInfo_user_id,
            doctorBasicInfo.area_id as doctorBasicInfo_area_id,
            doctorBasicInfo.title as doctorBasicInfo_title,
            doctorBasicInfo.cell_no as doctorBasicInfo_cell_no,
            doctorBasicInfo.address as doctorBasicInfo_address,
            doctorBasicInfo.work_phone as doctorBasicInfo_work_phone,
            doctorBasicInfo.fax as doctorBasicInfo_fax,
            doctorBasicInfo.extension as doctorBasicInfo_extension,
            doctorBasicInfo.home_phone as doctorBasicInfo_home_phone,
            doctorBasicInfo.emergency_name as doctorBasicInfo_emergency_name,
            doctorBasicInfo.emergency_phone as doctorBasicInfo_emergency_phone,
            doctorBasicInfo.biography as doctorBasicInfo_biography,
            doctorBasicInfo.hiring_date as doctorBasicInfo_hiring_date,
            doctorBasicInfo.from as doctorBasicInfo_from,
            doctorBasicInfo.to as doctorBasicInfo_to,
            doctorBasicInfo.profile_pic as doctorBasicInfo_profile_pic,
            doctorBasicInfo.city as doctorBasicInfo_city,
            doctorBasicInfo.state as doctorBasicInfo_state,
            doctorBasicInfo.zip as doctorBasicInfo_zip,
            doctorBasicInfo.social_security as doctorBasicInfo_social_security,
            doctorBasicInfo.profile_pic_url as doctorBasicInfo_profile_pic_url,
            doctorBasicInfo.apartment_suite as doctorBasicInfo_apartment_suite,

            medicalIdentifier.id as medicalIdentifier_id,
            medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

            billingTitles.id as billingTitles_id,
            billingTitles.name as billingTitles_name,
            billingTitles.description as billingTitles_description,

            facilities.id as facilities_id,
            facilities.name as facilities_name,
            facilities.slug as facilities_slug,
            facilities.qualifier as facilities_qualifier

            FROM sch_appointments as appointments

            left join kiosk_cases on kiosk_cases.id = appointments.case_id and kiosk_cases.deleted_at IS NULL
            left join billing_case_status on billing_case_status.id = kiosk_cases.status_id and billing_case_status.deleted_at IS NULL

            left join kiosk_case_patient_session on kiosk_case_patient_session.appointment_id = appointments.id and kiosk_case_patient_session.deleted_at IS NULL
            left join kiosk_case_patient_session_statuses on kiosk_case_patient_session_statuses.id = kiosk_case_patient_session.status_id and kiosk_case_patient_session_statuses.deleted_at IS NULL

            left join kiosk_case_types on kiosk_case_types.id = appointments.case_type_id and kiosk_case_types.deleted_at IS NULL

            left join sch_appointment_types on sch_appointment_types.id = appointments.type_id and sch_appointment_types.deleted_at IS NULL

            left join sch_appointment_statuses on sch_appointment_statuses.id = appointments.status_id and sch_appointment_statuses.deleted_at IS NULL

            inner join kiosk_patient on kiosk_patient.id = appointments.patient_id and kiosk_patient.deleted_at IS NULL

            left join physician_clinics on physician_clinics.id = appointments.physician_id and physician_clinics.deleted_at IS NULL
            left join physicians on physicians.id = physician_clinics.physician_id and physicians.deleted_at IS NULL
            left join clinics on clinics.id = physician_clinics.clinic_id and clinics.deleted_at IS NULL
            left join clinic_locations on clinic_locations.id = physician_clinics.clinic_locations_id and clinic_locations.deleted_at IS NULL

            left join users as technician on technician.id = appointments.technician_id and technician.deleted_at IS NULL
            left join user_basic_info as technician_basic_info on technician_basic_info.user_id = technician.id and technician_basic_info.deleted_at IS NULL

            left join users as readingProvider on readingProvider.id = appointments.reading_provider_id and readingProvider.deleted_at IS NULL
            left join user_basic_info as readingProvider_basic_info on readingProvider_basic_info.user_id = readingProvider.id and readingProvider_basic_info.deleted_at IS NULL

            left join sch_transportations on sch_transportations.appointment_id = appointments.id and sch_transportations.deleted_at IS NULL

            left join sch_appointment_cpt_codes on sch_appointment_cpt_codes.appointment_id = appointments.id and sch_appointment_cpt_codes.deleted_at IS NULL
            left join billing_codes on billing_codes.id = sch_appointment_cpt_codes.billing_code_id and billing_codes.deleted_at IS NULL


            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
            left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
            left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
            left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
            ${finalWhereFilter}
            GROUP BY appointments.id
            ORDER BY appointment_scheduled_date_time DESC
            ${applyLimit})`;

        return query;
    }

    public getGetPatientCancelledAppointmentsMapping = (rawQueryResult: typings.ANY, appointmentWithOtherData: models.sch_appointmentsI[], colorCodes: models.sch_color_codesI[]): typings.ANY =>

        rawQueryResult?.map((o: typings.ANY): typings.ANY => {

            const appointmentData: models.sch_appointmentsI = appointmentWithOtherData?.find((x) => x?.id === o?.appointment_id);

            let availableSpeciality: typings.ANY = {};
            let availableSpecialityDoctor: typings.ANY = {};
            let facilityLocation: typings.ANY = {};
            let facility: typings.ANY = {};
            let doctor: typings.ANY = {};
            let speciality: typings.ANY = {};
            let appointment: typings.ANY = {};
            let doctorBasicInfo: typings.ANY = {};
            let patient: typings.ANY = {};
            let appointmentType: typings.ANY = {};
            let appointmentStatus: typings.ANY = {};
            let medicalIdentifier: typings.ANY = {};
            let billingTitles: typings.ANY = {};

            if(o.medicalIdentifier_id) {
                medicalIdentifier = {
                    id : o.medicalIdentifier_id,
                    clinic_name : o.medicalIdentifier_clinic_name,
                }
            }
            if(o.billingTitles_id) {
                billingTitles = {
                    id : o.billingTitles_id,
                    name : o.billingTitles_name,
                    description : o.billingTitles_description,
                } 
            }

            if (o?.doctorBasicInfo_id) {
                doctorBasicInfo = {
                    id: o?.doctorBasicInfo_id,
                    first_name: o?.doctorBasicInfo_first_name,
                    middle_name: o?.doctorBasicInfo_middle_name,
                    last_name: o?.doctorBasicInfo_last_name,
                    date_of_birth: o?.doctorBasicInfo_date_of_birth,
                    gender: o?.doctorBasicInfo_gender,
                    user_id: o?.doctorBasicInfo_user_id,
                    area_id: o?.doctorBasicInfo_area_id,
                    title: o?.doctorBasicInfo_title,
                    cell_no: o?.doctorBasicInfo_cell_no,
                    address: o?.doctorBasicInfo_address,
                    work_phone: o?.doctorBasicInfo_work_phone,
                    fax: o?.doctorBasicInfo_fax,
                    extension: o?.doctorBasicInfo_extension,
                    home_phone: o?.doctorBasicInfo_home_phone,
                    emergency_name: o?.doctorBasicInfo_emergency_name,
                    emergency_phone: o?.doctorBasicInfo_emergency_phone,
                    biography: o?.doctorBasicInfo_biography,
                    hiring_date: o?.doctorBasicInfo_hiring_date,
                    from: o?.doctorBasicInfo_from,
                    to: o?.doctorBasicInfo_to,
                    profile_pic: o?.doctorBasicInfo_profile_pic,
                    city: o?.doctorBasicInfo_city,
                    state: o?.doctorBasicInfo_state,
                    zip: o?.doctorBasicInfo_zip,
                    social_security: o?.doctorBasicInfo_social_security,
                    profile_pic_url: o?.doctorBasicInfo_profile_pic_url,
                    apartment_suite: o?.doctorBasicInfo_apartment_suite,
                };
            }

            if (o?.appointment_id) {
                appointment = {
                    id: o?.appointment_id,
                    key: o?.appointment_key,
                    scheduled_date_time: o?.appointment_scheduled_date_time,
                    evaluation_date_time: o?.appointment_evaluation_date_time,
                    time_slots: o?.appointment_time_slot,
                    appointment_title: o?.appointment_title,
                    action_performed: o?.appointment_action_performed,
                    confirmation_status: o?.appointment_confirmation_status,
                    cancelled: o?.appointment_cancelled,
                    pushed_to_front_desk: o?.appointment_pushed_to_front_dest,
                    comments: o?.appointment_comments,
                    by_health_app: o?.appointment_by_health_app,
                    date_list_id: o?.appointment_date_list_id,
                    target_facility_id: o?.appointment_target_facility_id,
                    origin_facility_id: o?.appointment_origin_facility_id,
                    case_id: o?.appointment_case_id,
                    case_type_id: o?.appointment_case_type_id,
                    patient_id: o?.appointment_patient_id,
                    type_id: o?.appointment_type_id,
                    status_id: o?.appointment_status_id,
                    priority_id: o?.appointment_priority_id,
                    available_doctor_id: o?.appointment_available_doctor_id,
                    available_speciality_id: o?.appointment_available_speciality_id,
                    billable: o?.appointment_billable,
                    pushed_to_front_desk_comments: o?.appointment_pushed_to_front_desk_comments,
                    cancelled_comments: o?.appointment_cancelled_comments,
                    is_speciality_base: o?.appointment_is_speciality_base,
                    created_by: o?.appointment_created_by,
                    updated_by: o?.appointment_updated_by,
                    created_at: o?.appointment_created_at,
                    updated_at: o?.appointment_updated_at,
                    deleted_at: o?.appointment_deleted_at,
                    is_redo: o?.appointment_is_redo,
                    is_active: o?.appointment_is_active,
                    is_soft_registered: o?.appointment_is_soft_registered,
                    physician_id: o?.appointment_physician_id,
                    technician_id: o?.appointment_technician_id,
                    reading_provider_id: o?.appointment_reading_provider_id,
                    cd_image: o?.appointment_cd_image,
                    is_transportation: o?.appointment_is_transportation,
                };
            }

            if (o?.patient_id) {
                patient = {
                    age: o?.patient_age,
                    cell_phone: o?.patient_cell_phone,
                    created_at: o?.patient_created_at,
                    created_by: o?.patient_created_by,
                    deleted_at: o?.patient_deleted_at,
                    dob: o?.patient_dob,
                    first_name: o?.patient_first_name,
                    gender: o?.patient_gender,
                    height_ft: o?.patient_height_ft,
                    height_in: o?.patient_height_in,
                    home_phone: o?.patient_home_phone,
                    id: o?.patient_id,
                    is_law_enforcement_agent: o?.patient_is_law_enforcement_agent,
                    is_pregnant: o?.patient_is_pregnant,
                    key: o?.patient_key,
                    language: o?.patient_language,
                    last_name: o?.patient_last_name,
                    meritial_status: o?.patient_meritial_status,
                    middle_name: o?.patient_middle_name,
                    need_translator: o?.patient_need_translator,
                    notes: o?.patient_notes,
                    profile_avatar: o?.patient_profile_avatar,
                    ssn: o?.patient_ssn,
                    status: o?.patient_status,
                    updated_at: o?.patient_updated_at,
                    updated_by: o?.patient_updated_by,
                    weight_kg: o?.patient_weight_kg,
                    weight_lbs: o?.patient_weight_lbs,
                    work_phone: o?.patient_work_phone,
                };
            }

            if (o?.appointment_status_id) {
                appointmentStatus = {
                    created_at: o?.sch_appointment_statuses_created_at,
                    created_by: o?.sch_appointment_statuses_created_by,
                    deleted_at: o?.sch_appointment_statuses_deleted_at,
                    id: o?.sch_appointment_statuses_id,
                    name: o?.sch_appointment_statuses_name,
                    slug: o?.sch_appointment_statuses_slug,
                    updated_at: o?.sch_appointment_statuses_updated_at,
                    updated_by: o?.sch_appointment_statuses_updated_by,
                };
            }

            if (o?.availableSpeciality_id) {
                availableSpeciality = {
                    id: o?.availableSpeciality_id,
                    key: o?.availableSpeciality_key,
                    start_date: o?.availableSpeciality_start_date,
                    end_date: o?.availableSpeciality_end_date,
                    end_date_for_recurrence: o?.availableSpeciality_end_date_for_recurrence,
                    no_of_doctors: o?.availableSpeciality_no_of_doctors,
                    no_of_slots: o?.availableSpeciality_no_of_slots,
                    end_after_occurences: o?.availableSpeciality_end_after_occurences,
                    number_of_entries: o?.availableSpeciality_number_of_entries,
                    speciality_id: o?.availableSpeciality_speciality_id,
                    facility_location_id: o?.availableSpeciality_facility_location_id,
                    recurrence_ending_criteria_id: o?.availableSpeciality_recurrence_ending_criteria_id,
                    deleted_at: o?.availableSpeciality_deleted_at,
                };
            }

            if (o?.availableSpecialityDoctor_id) {
                availableSpecialityDoctor = {
                    id: o?.availableSpecialityDoctor_id,
                    key: o?.availableSpecialityDoctor_key,
                    start_date: o?.availableSpecialityDoctor_start_date,
                    end_date: o?.availableSpecialityDoctor_end_date,
                    no_of_slots: o?.availableSpecialityDoctor_no_of_slots,
                    doctor_id: o?.availableSpecialityDoctor_doctor_id,
                    facility_location_id: o?.availableSpecialityDoctor_facility_location_id,
                    available_speciality_id: o?.availableSpecialityDoctor_available_speciality_id,
                    supervisor_id: o?.availableSpecialityDoctor_supervisor_id,
                    is_provider_assignment: o?.availableSpecialityDoctor_is_provider_assignment
                };
            }

            if (o?.doctor_id) {
                doctor = {
                    id: o?.doctor_id,
                    email: o?.doctor_email,
                    reset_key: o?.doctor_reset_key,
                    status: o?.doctor_status,
                    is_loggedIn: o?.doctor_is_loggedIn,
                    remember_token: o?.doctor_remember_token,
                };
            }

            if (o?.facilityLocation_id) {
                facilityLocation = {
                    id: o?.facilityLocation_id,
                    facility_id: o?.facilityLocation_facility_id,
                    name: o?.facilityLocation_name,
                    city: o?.facilityLocation_city,
                    state: o?.facilityLocation_state,
                    zip: o?.facilityLocation_zip,
                    region_id: o?.facilityLocation_region_id,
                    address: o?.facilityLocation_address,
                    phone: o?.facilityLocation_phone,
                    fax: o?.facilityLocation_fax,
                    email: o?.facilityLocation_email,
                    office_hours_start: o?.facilityLocation_office_hours_start,
                    office_hours_end: o?.facilityLocation_office_hours_end,
                    lat: o?.facilityLocation_lat,
                    long: o?.facilityLocation_long,
                    day_list: o?.facilityLocation_day_list,
                    floor: o?.facilityLocation_floor,
                    place_of_service_id: o?.facilityLocation_place_of_service_id,
                    qualifier: o?.facilityLocation_qualifier,
                    ext_no: o?.facilityLocation_ext_no,
                    cell_no: o?.facilityLocation_cell_no,
                    is_main: o?.facilityLocation_is_main,
                    same_as_provider: o?.facilityLocation_same_as_provider,
                    dean: o?.facilityLocation_dean,
                    // State_id: o?.facilityLocation_state_id,
                };
            }

            if (o?.specialities_id) {
                speciality = {
                    id: o?.specialities_id,
                    name: o?.specialities_name,
                    description: o?.specialities_description,
                    time_slot: o?.specialities_time_slot,
                    over_booking: o?.specialities_over_booking,
                    has_app: o?.specialities_has_app,
                    speciality_key: o?.specialities_speciality_key,
                    comments: o?.specialities_comments,
                    default_name: o?.specialities_default_name,
                    qualifier: o?.specialities_qualifier,
                    is_defualt: o?.specialities_is_defualt,
                    is_available: o?.specialities_is_available,
                    is_create_appointment: o?.specialities_is_create_appointment,
                    is_editable: o?.specialities_is_editable,
                };
            }

            if (o?.facilities_id) {
                facility = {
                    created_at: o?.facilities_created_at,
                    created_by: o?.facilities_created_by,
                    deleted_at: o?.facilities_deleted_at,
                    id: o?.facilities_id,
                    name: o?.facilities_name,
                    slug: o?.facilities_slug,
                    qualifier: o?.facilities_qualifier,
                    updated_at: o?.facilities_updated_at,
                    updated_by: o?.facilities_updated_by,
                };
            }

            if (o?.appointment_type_id) {
                appointmentType = {
                    id: o?.sch_appointment_types_id,
                    name: o?.sch_appointment_types_name,
                    slug: o?.sch_appointment_types_slug,
                    description: o?.sch_appointment_types_description,
                    is_all_cpt_codes: o?.sch_appointment_types_is_all_cpt_codes,
                    enable_cpt_codes: o?.sch_appointment_types_enable_cpt_codes,
                    qualifier: o?.sch_appointment_types_qualifier,
                    created_by: o?.sch_appointment_types_created_by,
                    updated_by: o?.sch_appointment_types_updated_by,
                    created_at: o?.sch_appointment_types_created_at,
                    updated_at: o?.sch_appointment_types_updated_at,
                    deleted_at: o?.sch_appointment_types_deleted_at,
                    is_editable: o?.sch_appointment_types_is_editable,
                    avoid_checkedin: o?.sch_appointment_types_avoid_checkedin,
                    is_reading_provider: o?.sch_appointment_types_is_reading_provider,
                };
            }

            const formattedPhysicianClinicResponse: typings.ANY = o?.physician_clinics_id ? {
                physician: {
                    clinic_location_id: o?.clinic_location_id,
                    physician_clinic_id: o?.physician_clinics_id,
                    id: o?.clinic_id,
                    name: o?.clinic_name,
                    city: o?.clinic_location_city,
                    clinic_id: o?.clinic_location_clinic_id,
                    email: o?.physician_email,
                    extension: o?.clinic_location_extension,
                    fax: o?.clinic_location_fax,
                    floor: o?.clinic_location_floor,
                    is_primary: o?.clinic_location_is_primary,
                    phone: o?.clinic_location_phone,
                    state: o?.clinic_location_state,
                    status: o?.clinic_location_status,
                    street_address: o?.clinic_location_street_address,
                    zip: o?.clinic_location_zip,
                    cell_no: o?.physician_cell_no,
                    first_name: o?.physician_first_name,
                    last_name: o?.physician_last_name,
                    license_no: o?.physician_license_no,
                    middle_name: o?.physician_middle_name,
                    npi_no: o?.physician_npi_no
                }
            } : null;

            let facility_location_code: string;
            let speciality_code: string;

            if (availableSpecialityDoctor && Object.keys(availableSpecialityDoctor).length) {
                facility_location_code = colorCodes?.find((c: models.sch_color_codesI): boolean => c.object_id === availableSpecialityDoctor?.facility_location_id &&  c.type.slug === 'facility_location')?.code ?? '#9d9d9d';
            }

            if (availableSpeciality && Object.keys(availableSpeciality).length) {
                speciality_code = (colorCodes?.find((c: models.sch_color_codesI): boolean => c.object_id === availableSpeciality.speciality_id && c.type.slug === 'speciality'))?.code ?? '#9d9d9d';
            }

            return {
                ...appointment,
                facility_location_code,
                speciality_code,
                physician_clinic: formattedPhysicianClinicResponse,
                available_speciality: o.availableSpeciality_id ? {
                    ...availableSpeciality,
                    facilityLocation: o.facilityLocation_id ? {
                        ...facilityLocation,
                        facility: o.facilities_id ? facility : null
                    } : null,
                    speciality: o.specialities_id ? speciality : null
                } : null,
                available_doctor: o.availableSpecialityDoctor_id ? {
                    ...availableSpecialityDoctor,
                    doctor: o.doctor_id ? {
                        billingTitles: o.billingTitles_id ? billingTitles : null,
                        ...doctor,
                        doctorBasicInfo: o.doctorBasicInfo_id ? doctorBasicInfo : null,
                        medicalIdentifier: o.medicalIdentifier_id ? medicalIdentifier : null,
                    } : null,
                } : null,
                reading_provider_id: o?.appointment_reading_provider_id,
                reading_provider: o?.appointment_reading_provider_id ? {
                    first_name: o?.readingProvider_first_name ?? null,
                    id: o?.appointment_reading_provider_id,
                    last_name: o?.readingProvider_last_name ?? null,
                    middle_name: o?.readingProvider_middle_name ?? null,
                } : null,
                patient: o.patient_id ? patient : null,
                appointmentType: o.appointment_type_id ? appointmentType : null,
                appointmentStatus: o.appointment_status_id ? appointmentStatus : null,
                appointment_status: appointmentStatus?.name ?? null,
                appointment_status_slug: appointmentStatus?.slug ?? null,
                transportation: appointmentData?.transportations ?? [],
                appointmentCptCodes: appointmentData?.appointmentCptCodes ?? [],
                visit_status_name: o?.kiosk_case_patient_session_statuses_name ?? null,
                visit_status_slug: o?.kiosk_case_patient_session_statuses_slug ?? null,
            };

        })

    public rawQueryForAppointmentPushedToFrontDesk = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            caseIds,
            facilityLocationIds,
            startDateString,
            endDateString,
            appointmentTypeIds,
            doctorIds,
            specialityIds,
            caseTypeIds,
            page,
            perPage,
            paginate

        } = data;

        let applyLimit: string = '';
        const whereFilter = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `LIMIT ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds?.length) {
            whereFilter.push(`specialities.id in (${String(specialityIds)})`);
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (doctorIds && doctorIds?.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(doctorIds)})`);
        }

        if (facilityLocationIds && facilityLocationIds?.length) {
            whereFilter.push(`appointments.target_facility_id in (${String(facilityLocationIds)})`);
            // whereFilter.push(`targetFacilityLocation.id in (${String(facilityLocationIds)})`);
        }

        if (appointmentTypeIds && appointmentTypeIds?.length) {
            whereFilter.push(`appointments.type_id in (${String(appointmentTypeIds)})`);
        }
        if (caseIds && caseIds?.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }
        if (caseTypeIds && caseTypeIds?.length) {
            whereFilter.push(`caseType.id in (${String(caseTypeIds)})`);
        }

        whereFilter.push('(appointments.deleted_at IS NULL');
        whereFilter.push(`(appointments.pushed_to_front_desk = true`);

        if (startDateString && endDateString) {
            whereFilter.push(`appointments.updated_at BETWEEN '${startDateString}' AND '${endDateString}'))`);
        }

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const raw: string = `(SELECT
        appointments.id as appointment_id,
        appointments.key as appointment_key,
        appointments.scheduled_date_time as appointment_scheduled_date_time,
        appointments.evaluation_date_time as appointment_evaluation_date_time,
        appointments.time_slots as appointment_time_slot,
        appointments.appointment_title as appointment_title,
        appointments.action_performed as appointment_action_performed,
        appointments.confirmation_status as appointment_confirmation_status,
        appointments.cancelled as appointment_cancelled,
        appointments.pushed_to_front_desk as appointment_pushed_to_front_dest,
        appointments.comments as appointment_comments,
        appointments.by_health_app as appointment_by_health_app,
        appointments.date_list_id as appointment_date_list_id,
        appointments.target_facility_id as appointment_target_facility_id,
        appointments.origin_facility_id as appointment_origin_facility_id,
        appointments.case_id as appointment_case_id,
        appointments.case_type_id as appointment_case_type_id,
        appointments.patient_id as appointment_patient_id,
        appointments.type_id as appointment_type_id,
        appointments.status_id as appointment_status_id,
        appointments.priority_id as appointment_priority_id,
        appointments.available_doctor_id as appointment_available_doctor_id,
        appointments.available_speciality_id as appointment_available_speciality_id,
        appointments.billable as appointment_billable,
        appointments.pushed_to_front_desk_comments as appointment_pushed_to_front_desk_comments,
        appointments.cancelled_comments as appointment_cancelled_comments,
        appointments.is_speciality_base as appointment_is_speciality_base,
        appointments.created_by as appointment_created_by,
        appointments.updated_by as appointment_updated_by,
        appointments.created_at as appointment_created_at,
        appointments.updated_at as appointment_updated_at,
        appointments.deleted_at as appointment_deleted_at,
        appointments.is_redo as appointment_is_redo,
        appointments.is_active as appointment_is_active,
        appointments.is_soft_registered as appointment_is_soft_registered,
        appointments.physician_id as appointment_physician_id,
        appointments.technician_id as appointment_technician_id,
        appointments.reading_provider_id as appointment_reading_provider_id,
        appointments.cd_image as appointment_cd_image,
        appointments.is_transportation as appointment_is_transportation,

        availableSpeciality.id as availableSpeciality_id,
        availableSpeciality.key as availableSpeciality_key,
        availableSpeciality.start_date as availableSpeciality_start_date,
        availableSpeciality.end_date as availableSpeciality_end_date,
        availableSpeciality.end_date_for_recurrence as availableSpeciality_end_date_for_recurrence,
        availableSpeciality.no_of_doctors as availableSpeciality_no_of_doctors,
        availableSpeciality.no_of_slots as availableSpeciality_no_of_slots,
        availableSpeciality.end_after_occurences as availableSpeciality_end_after_occurences,
        availableSpeciality.number_of_entries as availableSpeciality_number_of_entries,
        availableSpeciality.speciality_id as availableSpeciality_speciality_id,
        availableSpeciality.facility_location_id as availableSpeciality_facility_location_id,
        availableSpeciality.recurrence_ending_criteria_id as availableSpeciality_recurrence_ending_criteria_id,
        availableSpeciality.deleted_at as availableSpeciality_deleted_at,

        availableSpecialityDoctor.id as availableSpecialityDoctor_id,
        availableSpecialityDoctor.key as availableSpecialityDoctor_key,
        availableSpecialityDoctor.start_date as availableSpecialityDoctor_start_date,
        availableSpecialityDoctor.end_date as availableSpecialityDoctor_end_date,
        availableSpecialityDoctor.no_of_slots as availableSpecialityDoctor_no_of_slots,
        availableSpecialityDoctor.doctor_id as availableSpecialityDoctor_doctor_id,
        availableSpecialityDoctor.facility_location_id as availableSpecialityDoctor_facility_location_id,
        availableSpecialityDoctor.available_speciality_id as availableSpecialityDoctor_available_speciality_id,
        availableSpecialityDoctor.supervisor_id as availableSpecialityDoctor_supervisor_id,
        availableSpecialityDoctor.is_provider_assignment as availableSpecialityDoctor_is_provider_assignment,

        doctor.id as doctor_id,
        doctor.email as doctor_email,
        doctor.reset_key as doctor_reset_key,
        doctor.status as doctor_status,
        doctor.is_loggedIn as doctor_is_loggedIn,
        doctor.remember_token as doctor_remember_token,

        doctorBasicInfo.id as doctorBasicInfo_id,
        doctorBasicInfo.first_name as doctorBasicInfo_first_name,
        doctorBasicInfo.middle_name as doctorBasicInfo_middle_name,
        doctorBasicInfo.last_name as doctorBasicInfo_last_name,
        doctorBasicInfo.date_of_birth as doctorBasicInfo_date_of_birth,
        doctorBasicInfo.gender as doctorBasicInfo_gender,
        doctorBasicInfo.user_id as doctorBasicInfo_user_id,
        doctorBasicInfo.area_id as doctorBasicInfo_area_id,
        doctorBasicInfo.title as doctorBasicInfo_title,
        doctorBasicInfo.cell_no as doctorBasicInfo_cell_no,
        doctorBasicInfo.address as doctorBasicInfo_address,
        doctorBasicInfo.work_phone as doctorBasicInfo_work_phone,
        doctorBasicInfo.fax as doctorBasicInfo_fax,
        doctorBasicInfo.extension as doctorBasicInfo_extension,
        doctorBasicInfo.home_phone as doctorBasicInfo_home_phone,
        doctorBasicInfo.emergency_name as doctorBasicInfo_emergency_name,
        doctorBasicInfo.emergency_phone as doctorBasicInfo_emergency_phone,
        doctorBasicInfo.biography as doctorBasicInfo_biography,
        doctorBasicInfo.hiring_date as doctorBasicInfo_hiring_date,
        doctorBasicInfo.from as doctorBasicInfo_from,
        doctorBasicInfo.to as doctorBasicInfo_to,
        doctorBasicInfo.profile_pic as doctorBasicInfo_profile_pic,
        doctorBasicInfo.city as doctorBasicInfo_city,
        doctorBasicInfo.state as doctorBasicInfo_state,
        doctorBasicInfo.zip as doctorBasicInfo_zip,
        doctorBasicInfo.social_security as doctorBasicInfo_social_security,
        doctorBasicInfo.profile_pic_url as doctorBasicInfo_profile_pic_url,
        doctorBasicInfo.apartment_suite as doctorBasicInfo_apartment_suite,

        medicalIdentifier.id as medicalIdentifier_id,
        medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

        billingTitles.id as billingTitles_id,
        billingTitles.name as billingTitles_name,
        billingTitles.description as billingTitles_description,
        
        facilityLocation.id as facilityLocation_id,
        facilityLocation.facility_id as facilityLocation_facility_id,
        facilityLocation.name as facilityLocation_name,
        facilityLocation.city as facilityLocation_city,
        facilityLocation.state as facilityLocation_state,
        facilityLocation.zip as facilityLocation_zip,
        facilityLocation.region_id as facilityLocation_region_id,
        facilityLocation.address as facilityLocation_address,
        facilityLocation.phone as facilityLocation_phone,
        facilityLocation.fax as facilityLocation_fax,
        facilityLocation.email as facilityLocation_email,
        facilityLocation.office_hours_start as facilityLocation_office_hours_start,
        facilityLocation.office_hours_end as facilityLocation_office_hours_end,
        facilityLocation.lat as facilityLocation_lat,
        facilityLocation.long as facilityLocation_long,
        facilityLocation.day_list as facilityLocation_day_list,
        facilityLocation.floor as facilityLocation_floor,
        facilityLocation.place_of_service_id as facilityLocation_place_of_service_id,
        facilityLocation.qualifier as facilityLocation_qualifier,
        facilityLocation.ext_no as facilityLocation_ext_no,
        facilityLocation.cell_no as facilityLocation_cell_no,
        facilityLocation.is_main as facilityLocation_is_main,
        facilityLocation.same_as_provider as facilityLocation_same_as_provider,
        facilityLocation.dean as facilityLocation_dean,

        facilities.created_at AS facilities_created_at,
        facilities.created_by AS facilities_created_by,
        facilities.deleted_at AS facilities_deleted_at,
        facilities.id AS facilities_id,
        facilities.name AS facilities_name,
        facilities.slug AS facilities_slug,
        facilities.qualifier AS facilities_qualifier,
        facilities.updated_at AS facilities_updated_at,
        facilities.updated_by AS facilities_updated_by,

        specialities.id as specialities_id,
        specialities.name as specialities_name,
        specialities.description as specialities_description,
        specialities.time_slot as specialities_time_slot,
        specialities.over_booking as specialities_over_booking,
        specialities.has_app as specialities_has_app,
        specialities.speciality_key as specialities_speciality_key,
        specialities.comments as specialities_comments,
        specialities.default_name as specialities_default_name,
        specialities.qualifier as specialities_qualifier,
        specialities.is_defualt as specialities_is_defualt,
        specialities.is_available as specialities_is_available,
        specialities.is_create_appointment as specialities_is_create_appointment,
        specialities.is_editable as specialities_is_editable,

        caseTypes.id as caseTypes_id,
        caseTypes.key as caseTypes_key,
        caseTypes.name as caseTypes_name,
        caseTypes.slug as caseTypes_slug,
        caseTypes.description as caseTypes_description,
        caseTypes.comments as caseTypes_comments,
        caseTypes.remainder_days as caseTypes_remainder_days,
        caseTypes.created_by as caseTypes_created_by,
        caseTypes.updated_by as caseTypes_udpated_by,
        caseTypes.created_at as caseTypes_created_at,
        caseTypes.updated_at as caseTypes_updated_at,
        caseTypes.deleted_at as caseTypes_deleted_at,

        targetFacilityLocation.id as targetFacilityLocation_id,
        targetFacilityLocation.facility_id as targetFacilityLocation_facility_id,
        targetFacilityLocation.name as targetFacilityLocation_name,
        targetFacilityLocation.city as targetFacilityLocation_city,
        targetFacilityLocation.state as targetFacilityLocation_state,
        targetFacilityLocation.zip as targetFacilityLocation_zip,
        targetFacilityLocation.region_id as targetFacilityLocation_region_id,
        targetFacilityLocation.address as targetFacilityLocation_address,
        targetFacilityLocation.phone as targetFacilityLocation_phone,
        targetFacilityLocation.fax as targetFacilityLocation_fax,
        targetFacilityLocation.email as targetFacilityLocation_email,
        targetFacilityLocation.office_hours_start as targetFacilityLocation_office_hours_start,
        targetFacilityLocation.office_hours_end as targetFacilityLocation_office_hours_end,
        targetFacilityLocation.lat as targetFacilityLocation_lat,
        targetFacilityLocation.long as targetFacilityLocation_long,
        targetFacilityLocation.day_list as targetFacilityLocation_day_list,
        targetFacilityLocation.floor as targetFacilityLocation_floor,
        targetFacilityLocation.place_of_service_id as targetFacilityLocation_place_of_service_id,
        targetFacilityLocation.qualifier as targetFacilityLocation_qualifier,
        targetFacilityLocation.ext_no as targetFacilityLocation_ext_no,
        targetFacilityLocation.cell_no as targetFacilityLocation_cell_no,
        targetFacilityLocation.is_main as targetFacilityLocation_is_main,
        targetFacilityLocation.same_as_provider as targetFacilityLocation_same_as_provider,
        targetFacilityLocation.created_by as targetFacilityLocation_created_by,
        targetFacilityLocation.updated_by as targetFacilityLocation_updated_by,
        targetFacilityLocation.created_at as targetFacilityLocation_created_at,
        targetFacilityLocation.updated_at as targetFacilityLocation_updated_at,
        targetFacilityLocation.deleted_at as targetFacilityLocation_deleted_at,
        targetFacilityLocation.dean as targetFacilityLocation_dean,

        targetFacilities.created_at AS targetFacilities_created_at,
        targetFacilities.created_by AS targetFacilities_created_by,
        targetFacilities.deleted_at AS targetFacilities_deleted_at,
        targetFacilities.id AS targetFacilities_id,
        targetFacilities.name AS targetFacilities_name,
        targetFacilities.slug AS targetFacilities_slug,
        targetFacilities.qualifier AS targetFacilities_qualifier,
        targetFacilities.updated_at AS targetFacilities_updated_at,
        targetFacilities.updated_by AS targetFacilities_updated_by,

        originFacilityLocation.id as originFacilityLocation_id,
        originFacilityLocation.facility_id as originFacilityLocation_facility_id,
        originFacilityLocation.name as originFacilityLocation_name,
        originFacilityLocation.city as originFacilityLocation_city,
        originFacilityLocation.state as originFacilityLocation_state,
        originFacilityLocation.zip as originFacilityLocation_zip,
        originFacilityLocation.region_id as originFacilityLocation_region_id,
        originFacilityLocation.address as originFacilityLocation_address,
        originFacilityLocation.phone as originFacilityLocation_phone,
        originFacilityLocation.fax as originFacilityLocation_fax,
        originFacilityLocation.email as originFacilityLocation_email,
        originFacilityLocation.office_hours_start as originFacilityLocation_office_hours_start,
        originFacilityLocation.office_hours_end as originFacilityLocation_office_hours_end,
        originFacilityLocation.lat as originFacilityLocation_lat,
        originFacilityLocation.long as originFacilityLocation_long,
        originFacilityLocation.day_list as originFacilityLocation_day_list,
        originFacilityLocation.floor as originFacilityLocation_floor,
        originFacilityLocation.place_of_service_id as originFacilityLocation_place_of_service_id,
        originFacilityLocation.qualifier as originFacilityLocation_qualifier,
        originFacilityLocation.ext_no as originFacilityLocation_ext_no,
        originFacilityLocation.cell_no as originFacilityLocation_cell_no,
        originFacilityLocation.is_main as originFacilityLocation_is_main,
        originFacilityLocation.same_as_provider as originFacilityLocation_same_as_provider,
        originFacilityLocation.created_by as originFacilityLocation_created_by,
        originFacilityLocation.updated_by as originFacilityLocation_updated_by,
        originFacilityLocation.created_at as originFacilityLocation_created_at,
        originFacilityLocation.updated_at as originFacilityLocation_updated_at,
        originFacilityLocation.deleted_at as originFacilityLocation_deleted_at,
        originFacilityLocation.dean as originFacilityLocation_dean,

        originFacilities.created_at AS originFacilities_created_at,
        originFacilities.created_by AS originFacilities_created_by,
        originFacilities.deleted_at AS originFacilities_deleted_at,
        originFacilities.id AS originFacilities_id,
        originFacilities.name AS originFacilities_name,
        originFacilities.slug AS originFacilities_slug,
        originFacilities.qualifier AS originFacilities_qualifier,
        originFacilities.updated_at AS originFacilities_updated_at,
        originFacilities.updated_by AS originFacilities_updated_by,

        patient.age AS patient_age,
        patient.cell_phone AS patient_cell_phone,
        patient.created_at AS patient_created_at,
        patient.created_by AS patient_created_by,
        patient.deleted_at AS patient_deleted_at,
        patient.dob AS patient_dob,
        patient.first_name AS patient_first_name,
        patient.gender AS patient_gender,
        patient.height_ft AS patient_height_ft,
        patient.height_in AS patient_height_in,
        patient.home_phone AS patient_home_phone,
        patient.id AS patient_id,
        patient.is_law_enforcement_agent AS patient_is_law_enforcement_agent,
        patient.is_pregnant AS patient_is_pregnant,
        patient.key AS patient_key,
        patient.language AS patient_language,
        patient.last_name AS patient_last_name,
        patient.meritial_status AS patient_meritial_status,
        patient.middle_name AS patient_middle_name,
        patient.need_translator AS patient_need_translator,
        patient.notes AS patient_notes,
        patient.profile_avatar AS patient_profile_avatar,
        patient.ssn AS patient_ssn,
        patient.status AS patient_status,
        patient.updated_at AS patient_updated_at,
        patient.updated_by AS patient_updated_by,
        patient.weight_kg AS patient_weight_kg,
        patient.weight_lbs AS patient_weight_lbs,
        patient.work_phone AS patient_work_phone,

        appointmentType.id as appointmentType_id,
        appointmentType.name as appointmentType_name,
        appointmentType.slug as appointmentType_slug,
        appointmentType.description as appointmentType_description,
        appointmentType.is_all_cpt_codes as appointmentType_is_all_cpt_codes,
        appointmentType.enable_cpt_codes as appointmentType_enable_cpt_codes,
        appointmentType.qualifier as appointmentType_qualifier,
        appointmentType.created_by as appointmentType_created_by,
        appointmentType.updated_by as appointmentType_updated_by,
        appointmentType.created_at as appointmentType_created_at,
        appointmentType.updated_at as appointmentType_updated_at,
        appointmentType.deleted_at as appointmentType_deleted_at,
        appointmentType.is_editable as appointmentType_is_editable,
        appointmentType.avoid_checkedin as appointmentType_avoid_checkedin,
        appointmentType.is_reading_provider as appointmentType_is_reading_provider,

        appointmentStatus.created_at AS appointmentStatus_created_at,
        appointmentStatus.created_by AS appointmentStatus_created_by,
        appointmentStatus.deleted_at AS appointmentStatus_deleted_at,
        appointmentStatus.id AS appointmentStatus_id,
        appointmentStatus.name AS appointmentStatus_name,
        appointmentStatus.slug AS appointmentStatus_slug,
        appointmentStatus.updated_at AS appointmentStatus_updated_at,
        appointmentStatus.updated_by AS appointmentStatus_updated_by,


        updatedBy.created_at AS updatedBy_created_at,
        updatedBy.created_by AS updatedBy_created_by,
        updatedBy.deleted_at AS updatedBy_deleted_at,
        updatedBy.email AS updatedBy_email,
        updatedBy.id AS updatedBy_id,
        updatedBy.is_loggedin AS updatedBy_is_loggedIn,
        updatedBy.remember_token AS updatedBy_remember_token,
        updatedBy.reset_key AS updatedBy_reset_key,
        updatedBy.status AS updatedBy_status,
        updatedBy.updated_at AS updatedBy_updated_at,
        updatedBy.updated_by AS updatedBy_updated_by,


        updatedByUserBasicInfo.address AS updatedByUserBasicInfo_address,
        updatedByUserBasicInfo.apartment_suite AS updatedByUserBasicInfo_apartment_suite,
        updatedByUserBasicInfo.area_id AS updatedByUserBasicInfo_area_id,
        updatedByUserBasicInfo.biography AS updatedByUserBasicInfo_biography,
        updatedByUserBasicInfo.cell_no AS updatedByUserBasicInfo_cell_no,
        updatedByUserBasicInfo.city AS updatedByUserBasicInfo_city,
        updatedByUserBasicInfo.created_at AS updatedByUserBasicInfo_created_at,
        updatedByUserBasicInfo.created_by AS updatedByUserBasicInfo_created_by,
        updatedByUserBasicInfo.date_of_birth AS updatedByUserBasicInfo_date_of_birth,
        updatedByUserBasicInfo.deleted_at AS updatedByUserBasicInfo_deleted_at,
        updatedByUserBasicInfo.department_id AS updatedByUserBasicInfo_department_id,
        updatedByUserBasicInfo.designation_id AS updatedByUserBasicInfo_designation_id,
        updatedByUserBasicInfo.emergency_phone AS updatedByUserBasicInfo_emergency_phone,
        updatedByUserBasicInfo.employed_by_id AS updatedByUserBasicInfo_employed_by_id,
        updatedByUserBasicInfo.employment_type_id AS updatedByUserBasicInfo_employment_type_id,
        updatedByUserBasicInfo.extension AS updatedByUserBasicInfo_extension,
        updatedByUserBasicInfo.fax AS updatedByUserBasicInfo_fax,
        updatedByUserBasicInfo.file_id AS updatedByUserBasicInfo_file_id,
        updatedByUserBasicInfo.first_name AS updatedByUserBasicInfo_first_name,
        updatedByUserBasicInfo.from AS updatedByUserBasicInfo_from,
        updatedByUserBasicInfo.gender AS updatedByUserBasicInfo_gender,
        updatedByUserBasicInfo.hiring_date AS updatedByUserBasicInfo_hiring_date,
        updatedByUserBasicInfo.id AS updatedByUserBasicInfo_id,
        updatedByUserBasicInfo.last_name AS updatedByUserBasicInfo_last_name,
        updatedByUserBasicInfo.middle_name AS updatedByUserBasicInfo_middle_name,
        updatedByUserBasicInfo.profile_pic AS updatedByUserBasicInfo_profile_pic,
        updatedByUserBasicInfo.profile_pic_url AS updatedByUserBasicInfo_profile_pic_url,
        updatedByUserBasicInfo.social_security AS updatedByUserBasicInfo_social_security,
        updatedByUserBasicInfo.state AS updatedByUserBasicInfo_state,
        updatedByUserBasicInfo.title AS updatedByUserBasicInfo_title,
        updatedByUserBasicInfo.to AS updatedByUserBasicInfo_to,
        updatedByUserBasicInfo.updated_at AS updatedByUserBasicInfo_updated_at,
        updatedByUserBasicInfo.updated_by AS updatedByUserBasicInfo_updated_by,
        updatedByUserBasicInfo.user_id AS updatedByUserBasicInfo_user_id,
        updatedByUserBasicInfo.work_phone AS updatedByUserBasicInfo_work_phone,
        updatedByUserBasicInfo.zip AS updatedByUserBasicInfo_zip
        FROM sch_appointments AS appointments

        ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL

        left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
        left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
        left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
        left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
        left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
        
        left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
        left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
        ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

        inner join kiosk_case_types as caseTypes on caseTypes.id = appointments.case_type_id and caseTypes.deleted_at IS NULL

        left join facility_locations as targetFacilityLocation on targetFacilityLocation.id = appointments.target_facility_id and targetFacilityLocation.deleted_at IS NULL
        left join facilities as targetFacilities on targetFacilities.id = targetFacilityLocation.facility_id and targetFacilities.deleted_at IS NULL
        left join facility_locations as originFacilityLocation on originFacilityLocation.id = appointments.origin_facility_id and originFacilityLocation.deleted_at IS NULL
        left join facilities as originFacilities on originFacilities.id = originFacilityLocation.facility_id and originFacilities.deleted_at IS NULL

        left join kiosk_patient as patient on appointments.patient_id = patient.id AND patient.deleted_at IS NULL

        left join sch_appointment_types as appointmentType on appointmentType.id = appointments.type_id and appointmentType.deleted_at IS NULL

        left join sch_appointment_statuses as appointmentStatus ON appointments.status_id = appointmentStatus.id and appointmentStatus.deleted_at IS NULL

        inner join users as updatedBy on appointments.updated_by = updatedBy.id AND updatedBy.deleted_at IS NULL

        left join user_basic_info as updatedByUserBasicInfo on updatedBy.id = updatedByUserBasicInfo.user_id AND updatedByUserBasicInfo.deleted_at IS NULL

        ${finalWhereFilter}
        group BY appointments.id
        order  BY appointments.updated_at DESC
        ${applyLimit})`;
        return raw;

    }

    public rawQueryForAppointmentPushedToFrontDeskCount = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            caseIds,
            facilityLocationIds,
            startDateString,
            endDateString,
            appointmentTypeIds,
            doctorIds,
            specialityIds,
            caseTypeIds,
        } = data;

        const whereFilter = [];

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds?.length) {
            whereFilter.push(`specialities.id in (${String(specialityIds)})`);
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (doctorIds && doctorIds?.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(doctorIds)})`);
        }

        if (facilityLocationIds && facilityLocationIds?.length) {
            whereFilter.push(`appointments.target_facility_id in (${String(facilityLocationIds)})`);
            whereFilter.push(`targetFacilityLocation.id in (${String(facilityLocationIds)})`);
        }

        if (caseIds && caseIds?.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }
        if (appointmentTypeIds && appointmentTypeIds?.length) {
            whereFilter.push(`appointments.type_id in (${String(appointmentTypeIds)})`);
        }

        if (caseTypeIds && caseTypeIds?.length) {
            whereFilter.push(`caseType.id in (${String(caseTypeIds)})`);
        }

        whereFilter.push('(appointments.deleted_at IS NULL');
        whereFilter.push(`(appointments.pushed_to_front_desk = true`);

        if (startDateString && endDateString) {
            whereFilter.push(`appointments.updated_at BETWEEN '${startDateString}' AND '${endDateString}'))`);
        }

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const raw: string = `(SELECT
            COUNT(DISTINCT appointments.id) as total_appointment
            FROM sch_appointments AS appointments

            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
            ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            inner join kiosk_case_types as caseTypes on caseTypes.id = appointments.case_type_id and caseTypes.deleted_at IS NULL

            left join facility_locations as targetFacilityLocation on targetFacilityLocation.id = appointments.target_facility_id and targetFacilityLocation.deleted_at IS NULL
            left join facilities as targetFacilities on targetFacilities.id = targetFacilityLocation.facility_id and targetFacilities.deleted_at IS NULL
            left join facility_locations as originFacilityLocation on originFacilityLocation.id = appointments.origin_facility_id and originFacilityLocation.deleted_at IS NULL
            left join facilities as originFacilities on originFacilities.id = originFacilityLocation.facility_id and originFacilities.deleted_at IS NULL

            left join kiosk_patient as patient on appointments.patient_id = patient.id AND patient.deleted_at IS NULL

            left join sch_appointment_types as appointmentType on appointmentType.id = appointments.type_id and appointmentType.deleted_at IS NULL

            left join sch_appointment_statuses as appointmentStatus ON appointments.status_id = appointmentStatus.id and appointmentStatus.deleted_at IS NULL

            inner join users as updatedBy on appointments.updated_by = updatedBy.id AND updatedBy.deleted_at IS NULL

            left join user_basic_info as updatedByUserBasicInfo on updatedBy.id = updatedByUserBasicInfo.user_id AND updatedByUserBasicInfo.deleted_at IS NULL

            ${finalWhereFilter}
            group BY appointments.id
            order  BY appointments.updated_at DESC
        )`;

        return raw;

    }

    public rawQueryForCancelledAppointment = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            facilityLocationIds,
            specialityIds,
            providerIds,
            dateFrom,
            dateTo,
            comments,
            page,
            perPage: per_page,
            caseIds,
            paginate,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * per_page;
            applyLimit = `limit ${offset} , ${per_page}`;
        }

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (facilityLocationIds && facilityLocationIds.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (providerIds && providerIds.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(providerIds)})`);
        }

        whereFilter.push('(appointments.deleted_at IS NULL');
        whereFilter.push(`(appointments.cancelled = true`);

        if (comments && comments.length) {
            whereFilter.push(`appointments.comments LIKE '%${comments}%'`);
        }

        if (!dateFrom && dateTo) {
            whereFilter.push(`appointments.updated_at <= '${dateTo}'))`);
        }

        if (dateFrom && !dateTo) {
            whereFilter.push(`appointments.updated_at >= '${dateFrom}'))`);
        }

        if (dateFrom && dateTo) {
            whereFilter.push(`appointments.updated_at BETWEEN '${dateFrom}' AND '${dateTo}'))`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const raw2: string = `(SELECT
        appointments.id as appointment_id,
        appointments.key as appointment_key,
        appointments.scheduled_date_time as appointment_scheduled_date_time,
        appointments.evaluation_date_time as appointment_evaluation_date_time,
        appointments.time_slots as appointment_time_slot,
        appointments.appointment_title as appointment_title,
        appointments.action_performed as appointment_action_performed,
        appointments.confirmation_status as appointment_confirmation_status,
        appointments.cancelled as appointment_cancelled,
        appointments.pushed_to_front_desk as appointment_pushed_to_front_dest,
        appointments.comments as appointment_comments,
        appointments.by_health_app as appointment_by_health_app,
        appointments.date_list_id as appointment_date_list_id,
        appointments.target_facility_id as appointment_target_facility_id,
        appointments.origin_facility_id as appointment_origin_facility_id,
        appointments.case_id as appointment_case_id,
        appointments.case_type_id as appointment_case_type_id,
        appointments.patient_id as appointment_patient_id,
        appointments.type_id as appointment_type_id,
        appointments.status_id as appointment_status_id,
        appointments.priority_id as appointment_priority_id,
        appointments.available_doctor_id as appointment_available_doctor_id,
        appointments.available_speciality_id as appointment_available_speciality_id,
        appointments.billable as appointment_billable,
        appointments.pushed_to_front_desk_comments as appointment_pushed_to_front_desk_comments,
        appointments.cancelled_comments as appointment_cancelled_comments,
        appointments.is_speciality_base as appointment_is_speciality_base,
        appointments.created_by as appointment_created_by,
        appointments.updated_by as appointment_updated_by,
        appointments.created_at as appointment_created_at,
        appointments.updated_at as appointment_updated_at,
        appointments.deleted_at as appointment_deleted_at,
        appointments.is_redo as appointment_is_redo,
        appointments.is_active as appointment_is_active,
        appointments.is_soft_registered as appointment_is_soft_registered,
        appointments.physician_id as appointment_physician_id,
        appointments.technician_id as appointment_technician_id,
        appointments.reading_provider_id as appointment_reading_provider_id,
        appointments.cd_image as appointment_cd_image,
        appointments.is_transportation as appointment_is_transportation,

        availableSpeciality.id as availableSpeciality_id,
        availableSpeciality.key as availableSpeciality_key,
        availableSpeciality.start_date as availableSpeciality_start_date,
        availableSpeciality.end_date as availableSpeciality_end_date,
        availableSpeciality.end_date_for_recurrence as availableSpeciality_end_date_for_recurrence,
        availableSpeciality.no_of_doctors as availableSpeciality_no_of_doctors,
        availableSpeciality.no_of_slots as availableSpeciality_no_of_slots,
        availableSpeciality.end_after_occurences as availableSpeciality_end_after_occurences,
        availableSpeciality.number_of_entries as availableSpeciality_number_of_entries,
        availableSpeciality.speciality_id as availableSpeciality_speciality_id,
        availableSpeciality.facility_location_id as availableSpeciality_facility_location_id,
        availableSpeciality.recurrence_ending_criteria_id as availableSpeciality_recurrence_ending_criteria_id,
        availableSpeciality.deleted_at as availableSpeciality_deleted_at,

        availableSpecialityDoctor.id as availableSpecialityDoctor_id,
        availableSpecialityDoctor.key as availableSpecialityDoctor_key,
        availableSpecialityDoctor.start_date as availableSpecialityDoctor_start_date,
        availableSpecialityDoctor.end_date as availableSpecialityDoctor_end_date,
        availableSpecialityDoctor.no_of_slots as availableSpecialityDoctor_no_of_slots,
        availableSpecialityDoctor.doctor_id as availableSpecialityDoctor_doctor_id,
        availableSpecialityDoctor.facility_location_id as availableSpecialityDoctor_facility_location_id,
        availableSpecialityDoctor.available_speciality_id as availableSpecialityDoctor_available_speciality_id,
        availableSpecialityDoctor.supervisor_id as availableSpecialityDoctor_supervisor_id,
        availableSpecialityDoctor.is_provider_assignment as availableSpecialityDoctor_is_provider_assignment,

        doctor.id as doctor_id,
        doctor.email as doctor_email,
        doctor.reset_key as doctor_reset_key,
        doctor.status as doctor_status,
        doctor.is_loggedIn as doctor_is_loggedIn,
        doctor.remember_token as doctor_remember_token,

        doctorBasicInfo.id as doctorBasicInfo_id,
        doctorBasicInfo.first_name as doctorBasicInfo_first_name,
        doctorBasicInfo.middle_name as doctorBasicInfo_middle_name,
        doctorBasicInfo.last_name as doctorBasicInfo_last_name,
        doctorBasicInfo.date_of_birth as doctorBasicInfo_date_of_birth,
        doctorBasicInfo.gender as doctorBasicInfo_gender,
        doctorBasicInfo.user_id as doctorBasicInfo_user_id,
        doctorBasicInfo.area_id as doctorBasicInfo_area_id,
        doctorBasicInfo.title as doctorBasicInfo_title,
        doctorBasicInfo.cell_no as doctorBasicInfo_cell_no,
        doctorBasicInfo.address as doctorBasicInfo_address,
        doctorBasicInfo.work_phone as doctorBasicInfo_work_phone,
        doctorBasicInfo.fax as doctorBasicInfo_fax,
        doctorBasicInfo.extension as doctorBasicInfo_extension,
        doctorBasicInfo.home_phone as doctorBasicInfo_home_phone,
        doctorBasicInfo.emergency_name as doctorBasicInfo_emergency_name,
        doctorBasicInfo.emergency_phone as doctorBasicInfo_emergency_phone,
        doctorBasicInfo.biography as doctorBasicInfo_biography,
        doctorBasicInfo.hiring_date as doctorBasicInfo_hiring_date,
        doctorBasicInfo.from as doctorBasicInfo_from,
        doctorBasicInfo.to as doctorBasicInfo_to,
        doctorBasicInfo.profile_pic as doctorBasicInfo_profile_pic,
        doctorBasicInfo.city as doctorBasicInfo_city,
        doctorBasicInfo.state as doctorBasicInfo_state,
        doctorBasicInfo.zip as doctorBasicInfo_zip,
        doctorBasicInfo.social_security as doctorBasicInfo_social_security,
        doctorBasicInfo.profile_pic_url as doctorBasicInfo_profile_pic_url,
        doctorBasicInfo.apartment_suite as doctorBasicInfo_apartment_suite,

        medicalIdentifier.id as medicalIdentifier_id,
        medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

        billingTitles.id as billingTitles_id,
        billingTitles.name as billingTitles_name,
        billingTitles.description as billingTitles_description,

        facilityLocation.id as facilityLocation_id,
        facilityLocation.facility_id as facilityLocation_facility_id,
        facilityLocation.name as facilityLocation_name,
        facilityLocation.city as facilityLocation_city,
        facilityLocation.state as facilityLocation_state,
        facilityLocation.zip as facilityLocation_zip,
        facilityLocation.region_id as facilityLocation_region_id,
        facilityLocation.address as facilityLocation_address,
        facilityLocation.phone as facilityLocation_phone,
        facilityLocation.fax as facilityLocation_fax,
        facilityLocation.email as facilityLocation_email,
        facilityLocation.office_hours_start as facilityLocation_office_hours_start,
        facilityLocation.office_hours_end as facilityLocation_office_hours_end,
        facilityLocation.lat as facilityLocation_lat,
        facilityLocation.long as facilityLocation_long,
        facilityLocation.day_list as facilityLocation_day_list,
        facilityLocation.floor as facilityLocation_floor,
        facilityLocation.place_of_service_id as facilityLocation_place_of_service_id,
        facilityLocation.qualifier as facilityLocation_qualifier,
        facilityLocation.ext_no as facilityLocation_ext_no,
        facilityLocation.cell_no as facilityLocation_cell_no,
        facilityLocation.is_main as facilityLocation_is_main,
        facilityLocation.same_as_provider as facilityLocation_same_as_provider,
        facilityLocation.dean as facilityLocation_dean,

        facilities.created_at AS facilities_created_at,
        facilities.created_by AS facilities_created_by,
        facilities.deleted_at AS facilities_deleted_at,
        facilities.id AS facilities_id,
        facilities.name AS facilities_name,
        facilities.slug AS facilities_slug,
        facilities.qualifier AS facilities_qualifier,
        facilities.updated_at AS facilities_updated_at,
        facilities.updated_by AS facilities_updated_by,

        specialities.id as specialities_id,
        specialities.name as specialities_name,
        specialities.description as specialities_description,
        specialities.time_slot as specialities_time_slot,
        specialities.over_booking as specialities_over_booking,
        specialities.has_app as specialities_has_app,
        specialities.speciality_key as specialities_speciality_key,
        specialities.comments as specialities_comments,
        specialities.default_name as specialities_default_name,
        specialities.qualifier as specialities_qualifier,
        specialities.is_defualt as specialities_is_defualt,
        specialities.is_available as specialities_is_available,
        specialities.is_create_appointment as specialities_is_create_appointment,
        specialities.is_editable as specialities_is_editable,

        patient.age AS patient_age,
        patient.cell_phone AS patient_cell_phone,
        patient.created_at AS patient_created_at,
        patient.created_by AS patient_created_by,
        patient.deleted_at AS patient_deleted_at,
        patient.dob AS patient_dob,
        patient.first_name AS patient_first_name,
        patient.gender AS patient_gender,
        patient.height_ft AS patient_height_ft,
        patient.height_in AS patient_height_in,
        patient.home_phone AS patient_home_phone,
        patient.id AS patient_id,
        patient.is_law_enforcement_agent AS patient_is_law_enforcement_agent,
        patient.is_pregnant AS patient_is_pregnant,
        patient.key AS patient_key,
        patient.language AS patient_language,
        patient.last_name AS patient_last_name,
        patient.meritial_status AS patient_meritial_status,
        patient.middle_name AS patient_middle_name,
        patient.need_translator AS patient_need_translator,
        patient.notes AS patient_notes,
        patient.profile_avatar AS patient_profile_avatar,
        patient.ssn AS patient_ssn,
        patient.status AS patient_status,
        patient.updated_at AS patient_updated_at,
        patient.updated_by AS patient_updated_by,
        patient.weight_kg AS patient_weight_kg,
        patient.weight_lbs AS patient_weight_lbs,
        patient.work_phone AS patient_work_phone,


        appointmentStatus.created_at AS appointmentStatus_created_at,
        appointmentStatus.created_by AS appointmentStatus_created_by,
        appointmentStatus.deleted_at AS appointmentStatus_deleted_at,
        appointmentStatus.id AS appointmentStatus_id,
        appointmentStatus.name AS appointmentStatus_name,
        appointmentStatus.slug AS appointmentStatus_slug,
        appointmentStatus.updated_at AS appointmentStatus_updated_at,
        appointmentStatus.updated_by AS appointmentStatus_updated_by,


        updatedBy.created_at AS updatedBy_created_at,
        updatedBy.created_by AS updatedBy_created_by,
        updatedBy.deleted_at AS updatedBy_deleted_at,
        updatedBy.email AS updatedBy_email,
        updatedBy.id AS updatedBy_id,
        updatedBy.is_loggedin AS updatedBy_is_loggedIn,
        updatedBy.password AS updatedBy_password,
        updatedBy.remember_token AS updatedBy_remember_token,
        updatedBy.reset_key AS updatedBy_reset_key,
        updatedBy.status AS updatedBy_status,
        updatedBy.updated_at AS updatedBy_updated_at,
        updatedBy.updated_by AS updatedBy_updated_by,


        updatedByUserBasicInfo.address AS updatedByUserBasicInfo_address,
        updatedByUserBasicInfo.apartment_suite AS updatedByUserBasicInfo_apartment_suite,
        updatedByUserBasicInfo.area_id AS updatedByUserBasicInfo_area_id,
        updatedByUserBasicInfo.biography AS updatedByUserBasicInfo_biography,
        updatedByUserBasicInfo.cell_no AS updatedByUserBasicInfo_cell_no,
        updatedByUserBasicInfo.city AS updatedByUserBasicInfo_city,
        updatedByUserBasicInfo.created_at AS updatedByUserBasicInfo_created_at,
        updatedByUserBasicInfo.created_by AS updatedByUserBasicInfo_created_by,
        updatedByUserBasicInfo.date_of_birth AS updatedByUserBasicInfo_date_of_birth,
        updatedByUserBasicInfo.deleted_at AS updatedByUserBasicInfo_deleted_at,
        updatedByUserBasicInfo.department_id AS updatedByUserBasicInfo_department_id,
        updatedByUserBasicInfo.designation_id AS updatedByUserBasicInfo_designation_id,
        updatedByUserBasicInfo.emergency_phone AS updatedByUserBasicInfo_emergency_phone,
        updatedByUserBasicInfo.employed_by_id AS updatedByUserBasicInfo_employed_by_id,
        updatedByUserBasicInfo.employment_type_id AS updatedByUserBasicInfo_employment_type_id,
        updatedByUserBasicInfo.extension AS updatedByUserBasicInfo_extension,
        updatedByUserBasicInfo.fax AS updatedByUserBasicInfo_fax,
        updatedByUserBasicInfo.file_id AS updatedByUserBasicInfo_file_id,
        updatedByUserBasicInfo.first_name AS updatedByUserBasicInfo_first_name,
        updatedByUserBasicInfo.from AS updatedByUserBasicInfo_from,
        updatedByUserBasicInfo.gender AS updatedByUserBasicInfo_gender,
        updatedByUserBasicInfo.hiring_date AS updatedByUserBasicInfo_hiring_date,
        updatedByUserBasicInfo.id AS updatedByUserBasicInfo_id,
        updatedByUserBasicInfo.last_name AS updatedByUserBasicInfo_last_name,
        updatedByUserBasicInfo.middle_name AS updatedByUserBasicInfo_middle_name,
        updatedByUserBasicInfo.profile_pic AS updatedByUserBasicInfo_profile_pic,
        updatedByUserBasicInfo.profile_pic_url AS updatedByUserBasicInfo_profile_pic_url,
        updatedByUserBasicInfo.social_security AS updatedByUserBasicInfo_social_security,
        updatedByUserBasicInfo.state AS updatedByUserBasicInfo_state,
        updatedByUserBasicInfo.title AS updatedByUserBasicInfo_title,
        updatedByUserBasicInfo.to AS updatedByUserBasicInfo_to,
        updatedByUserBasicInfo.updated_at AS updatedByUserBasicInfo_updated_at,
        updatedByUserBasicInfo.updated_by AS updatedByUserBasicInfo_updated_by,
        updatedByUserBasicInfo.user_id AS updatedByUserBasicInfo_user_id,
        updatedByUserBasicInfo.work_phone AS updatedByUserBasicInfo_work_phone,
        updatedByUserBasicInfo.zip AS updatedByUserBasicInfo_zip
        FROM sch_appointments AS appointments

        ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
        left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
        left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
        left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
        left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
        left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
        ${facilityLocationIds && facilityLocationIds.length ? 'inner' : 'left'} join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
        left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
        ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

        ${(specialityIds && specialityIds.length) ? 'inner' : 'left'} join kiosk_patient AS patient ON appointments.patient_id = patient.id AND patient.deleted_at IS NULL

        left join sch_appointment_statuses AS appointmentStatus ON appointments.status_id = appointmentStatus.id AND appointmentStatus.deleted_at IS NULL

        ${(specialityIds && specialityIds.length) ? 'inner' : 'left'} join users AS updatedBy ON appointments.updated_by = updatedBy.id AND updatedBy.deleted_at IS NULL

        left join user_basic_info AS updatedByUserBasicInfo ON updatedBy.id = updatedByUserBasicInfo.user_id AND updatedByUserBasicInfo.deleted_at IS NULL

        ${finalWhereFilter}
        group BY appointments.id
        order BY appointments.updated_at DESC
        ${applyLimit})`;
        console.log('finalWhereFilter cancel',finalWhereFilter);
        return raw2;

    }

    public rawQueryForCancelledAppointmentCount = (data: typings.OptimizedListV1ReqBodyI): typings.ANY => {

        const {
            facilityLocationIds,
            specialityIds,
            providerIds,
            dateFrom,
            dateTo,
            comments,
            caseIds,
        } = data;

        const whereFilter: string[] = [];

        let requiredCondition: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`availableSpeciality.speciality_id in (${String(specialityIds)})`);
            requiredCondition = 'inner';
        }

        if (facilityLocationIds && facilityLocationIds.length) {
            whereFilter.push(`availableSpeciality.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (providerIds && providerIds.length) {
            whereFilter.push(`availableSpecialityDoctor.doctor_id in (${String(providerIds)})`);
        }

        whereFilter.push('(appointments.deleted_at IS NULL');
        whereFilter.push(`(appointments.cancelled = true`);

        if (comments && comments.length) {
            whereFilter.push(`appointments.comments LIKE '%${comments}%'`);
        }

        if (!dateFrom && dateTo) {
            whereFilter.push(`appointments.updated_at <= '${dateTo}'))`);
        }

        if (dateFrom && !dateTo) {
            whereFilter.push(`appointments.updated_at >= '${dateFrom}'))`);
        }

        if (dateFrom && dateTo) {
            whereFilter.push(`appointments.updated_at BETWEEN '${dateFrom}' AND '${dateTo}'))`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`appointments.case_id in (${String(caseIds)})`);
        }

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const raw2: string = `(SELECT
            COUNT(DISTINCT appointments.id) as total_appointment
            FROM sch_appointments AS appointments

            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
            ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL

            left join kiosk_patient AS patient ON appointments.patient_id = patient.id AND patient.deleted_at IS NULL
            left join sch_appointment_statuses AS appointmentStatus ON appointments.status_id = appointmentStatus.id AND appointmentStatus.deleted_at IS NULL
            left join users AS updatedBy ON appointments.updated_by = updatedBy.id AND updatedBy.deleted_at IS NULL
            left join user_basic_info AS updatedByUserBasicInfo ON updatedBy.id = updatedByUserBasicInfo.user_id AND updatedByUserBasicInfo.deleted_at IS NULL

            ${finalWhereFilter}
            GROUP BY appointments.id
            )`;

        return raw2;

    }

    public rawQueryForGetAllPatientAppointments = (data: typings.OptimizedGetAllPatientReqBodyI): string => {

        const {
            page,
            perPage,
            paginate,
            patientId,
            isCancelledAppointments,
            appointmentStatusId,
            endDateString,
            startDateString,
            practiceLocationId,
            specialityId,
            caseId,
            visitStatusId,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `limit ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';
        let visitStatusJoin: string = 'left';

        if (isCancelledAppointments) {
            whereFilter.push(`appointments.cancelled = ${isCancelledAppointments}`);
        }

        if (startDateString && endDateString) {
            whereFilter.push(`appointments.scheduled_date_time between '${startDateString}' and '${endDateString}'`);
        }

        if (caseId) {
            whereFilter.push(`appointments.case_id = ${caseId}`);
        }

        if (appointmentStatusId) {
            whereFilter.push(`appointments.status_id = ${appointmentStatusId}`);
        }

        if (patientId) {
            whereFilter.push(`appointments.patient_id = ${patientId}`);
        }

        if (specialityId) {
            whereFilter.push(`specialities.id = ${String(specialityId)}`);
            whereFilter.push(`availableSpeciality.speciality_id = ${String(specialityId)}`);
            requiredCondition = 'inner';
        }

        if (practiceLocationId) {
            whereFilter.push(`availableSpeciality.facility_location_id = (${practiceLocationId})`);
        }

        if (visitStatusId) {
            whereFilter.push(`visitStatus.id = ${visitStatusId}`);
            visitStatusJoin = 'inner';
        }

        whereFilter.push(`appointments.deleted_at IS NULL`);
        whereFilter.push(`appointments.pushed_to_front_desk = false`);

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        // Return finalWhereFilter;
        const raw2: string = `(SELECT
        appointments.id as appointment_id,
        appointments.key as appointment_key,
        appointments.scheduled_date_time as appointment_scheduled_date_time,
        appointments.evaluation_date_time as appointment_evaluation_date_time,
        appointments.time_slots as appointment_time_slot,
        appointments.appointment_title as appointment_title,
        appointments.action_performed as appointment_action_performed,
        appointments.confirmation_status as appointment_confirmation_status,
        appointments.cancelled as appointment_cancelled,
        appointments.pushed_to_front_desk as appointment_pushed_to_front_dest,
        appointments.comments as appointment_comments,
        appointments.by_health_app as appointment_by_health_app,
        appointments.date_list_id as appointment_date_list_id,
        appointments.target_facility_id as appointment_target_facility_id,
        appointments.origin_facility_id as appointment_origin_facility_id,
        appointments.case_id as appointment_case_id,
        appointments.case_type_id as appointment_case_type_id,
        appointments.patient_id as appointment_patient_id,
        appointments.type_id as appointment_type_id,
        appointments.status_id as appointment_status_id,
        appointments.priority_id as appointment_priority_id,
        appointments.available_doctor_id as appointment_available_doctor_id,
        appointments.available_speciality_id as appointment_available_speciality_id,
        appointments.billable as appointment_billable,
        appointments.pushed_to_front_desk_comments as appointment_pushed_to_front_desk_comments,
        appointments.cancelled_comments as appointment_cancelled_comments,
        appointments.is_speciality_base as appointment_is_speciality_base,
        appointments.created_by as appointment_created_by,
        appointments.updated_by as appointment_updated_by,
        appointments.created_at as appointment_created_at,
        appointments.updated_at as appointment_updated_at,
        appointments.deleted_at as appointment_deleted_at,
        appointments.is_redo as appointment_is_redo,
        appointments.is_active as appointment_is_active,
        appointments.is_soft_registered as appointment_is_soft_registered,
        appointments.physician_id as appointment_physician_id,
        appointments.technician_id as appointment_technician_id,
        appointments.reading_provider_id as appointment_reading_provider_id,
        appointments.cd_image as appointment_cd_image,
        appointments.is_transportation as appointment_is_transportation,

        caseType.id as caseType_id,
        caseType.key as caseType_key,
        caseType.name as caseType_name,
        caseType.slug as caseType_slug,
        caseType.description as caseType_description,
        caseType.comments as caseType_comments,
        caseType.remainder_days as caseType_remainder_days,

        availableSpeciality.id as availableSpeciality_id,
        availableSpeciality.key as availableSpeciality_key,
        availableSpeciality.start_date as availableSpeciality_start_date,
        availableSpeciality.end_date as availableSpeciality_end_date,
        availableSpeciality.end_date_for_recurrence as availableSpeciality_end_date_for_recurrence,
        availableSpeciality.no_of_doctors as availableSpeciality_no_of_doctors,
        availableSpeciality.no_of_slots as availableSpeciality_no_of_slots,
        availableSpeciality.end_after_occurences as availableSpeciality_end_after_occurences,
        availableSpeciality.number_of_entries as availableSpeciality_number_of_entries,
        availableSpeciality.speciality_id as availableSpeciality_speciality_id,
        availableSpeciality.facility_location_id as availableSpeciality_facility_location_id,
        availableSpeciality.recurrence_ending_criteria_id as availableSpeciality_recurrence_ending_criteria_id,
        availableSpeciality.deleted_at as availableSpeciality_deleted_at,

        availableSpecialityDoctor.id as availableSpecialityDoctor_id,
        availableSpecialityDoctor.key as availableSpecialityDoctor_key,
        availableSpecialityDoctor.start_date as availableSpecialityDoctor_start_date,
        availableSpecialityDoctor.end_date as availableSpecialityDoctor_end_date,
        availableSpecialityDoctor.no_of_slots as availableSpecialityDoctor_no_of_slots,
        availableSpecialityDoctor.doctor_id as availableSpecialityDoctor_doctor_id,
        availableSpecialityDoctor.facility_location_id as availableSpecialityDoctor_facility_location_id,
        availableSpecialityDoctor.available_speciality_id as availableSpecialityDoctor_available_speciality_id,
        availableSpecialityDoctor.supervisor_id as availableSpecialityDoctor_supervisor_id,
        availableSpecialityDoctor.is_provider_assignment as availableSpecialityDoctor_is_provider_assignment,

        doctor.id as doctor_id,
        doctor.email as doctor_email,
        doctor.reset_key as doctor_reset_key,
        doctor.status as doctor_status,
        doctor.is_loggedIn as doctor_is_loggedIn,
        doctor.remember_token as doctor_remember_token,

        doctorBasicInfo.id as doctorBasicInfo_id,
        doctorBasicInfo.first_name as doctorBasicInfo_first_name,
        doctorBasicInfo.middle_name as doctorBasicInfo_middle_name,
        doctorBasicInfo.last_name as doctorBasicInfo_last_name,
        doctorBasicInfo.date_of_birth as doctorBasicInfo_date_of_birth,
        doctorBasicInfo.gender as doctorBasicInfo_gender,
        doctorBasicInfo.user_id as doctorBasicInfo_user_id,
        doctorBasicInfo.area_id as doctorBasicInfo_area_id,
        doctorBasicInfo.title as doctorBasicInfo_title,
        doctorBasicInfo.cell_no as doctorBasicInfo_cell_no,
        doctorBasicInfo.address as doctorBasicInfo_address,
        doctorBasicInfo.work_phone as doctorBasicInfo_work_phone,
        doctorBasicInfo.fax as doctorBasicInfo_fax,
        doctorBasicInfo.extension as doctorBasicInfo_extension,
        doctorBasicInfo.home_phone as doctorBasicInfo_home_phone,
        doctorBasicInfo.emergency_name as doctorBasicInfo_emergency_name,
        doctorBasicInfo.emergency_phone as doctorBasicInfo_emergency_phone,
        doctorBasicInfo.biography as doctorBasicInfo_biography,
        doctorBasicInfo.hiring_date as doctorBasicInfo_hiring_date,
        doctorBasicInfo.from as doctorBasicInfo_from,
        doctorBasicInfo.to as doctorBasicInfo_to,
        doctorBasicInfo.profile_pic as doctorBasicInfo_profile_pic,
        doctorBasicInfo.city as doctorBasicInfo_city,
        doctorBasicInfo.state as doctorBasicInfo_state,
        doctorBasicInfo.zip as doctorBasicInfo_zip,
        doctorBasicInfo.social_security as doctorBasicInfo_social_security,
        doctorBasicInfo.profile_pic_url as doctorBasicInfo_profile_pic_url,
        doctorBasicInfo.apartment_suite as doctorBasicInfo_apartment_suite,

        medicalIdentifier.id as medicalIdentifier_id,
        medicalIdentifier.clinic_name as medicalIdentifier_clinic_name,

        billingTitles.id as billingTitles_id,
        billingTitles.name as billingTitles_name,
        billingTitles.description as billingTitles_description,

        facilityLocation.id as facilityLocation_id,
        facilityLocation.facility_id as facilityLocation_facility_id,
        facilityLocation.name as facilityLocation_name,
        facilityLocation.city as facilityLocation_city,
        facilityLocation.state as facilityLocation_state,
        facilityLocation.zip as facilityLocation_zip,
        facilityLocation.region_id as facilityLocation_region_id,
        facilityLocation.address as facilityLocation_address,
        facilityLocation.phone as facilityLocation_phone,
        facilityLocation.fax as facilityLocation_fax,
        facilityLocation.email as facilityLocation_email,
        facilityLocation.office_hours_start as facilityLocation_office_hours_start,
        facilityLocation.office_hours_end as facilityLocation_office_hours_end,
        facilityLocation.lat as facilityLocation_lat,
        facilityLocation.long as facilityLocation_long,
        facilityLocation.day_list as facilityLocation_day_list,
        facilityLocation.floor as facilityLocation_floor,
        facilityLocation.place_of_service_id as facilityLocation_place_of_service_id,
        facilityLocation.qualifier as facilityLocation_qualifier,
        facilityLocation.ext_no as facilityLocation_ext_no,
        facilityLocation.cell_no as facilityLocation_cell_no,
        facilityLocation.is_main as facilityLocation_is_main,
        facilityLocation.same_as_provider as facilityLocation_same_as_provider,
        facilityLocation.dean as facilityLocation_dean,

        facilities.created_at AS facilities_created_at,
        facilities.created_by AS facilities_created_by,
        facilities.deleted_at AS facilities_deleted_at,
        facilities.id AS facilities_id,
        facilities.name AS facilities_name,
        facilities.slug AS facilities_slug,
        facilities.qualifier AS facilities_qualifier,
        facilities.updated_at AS facilities_updated_at,
        facilities.updated_by AS facilities_updated_by,

        specialities.id as specialities_id,
        specialities.name as specialities_name,
        specialities.description as specialities_description,
        specialities.time_slot as specialities_time_slot,
        specialities.over_booking as specialities_over_booking,
        specialities.has_app as specialities_has_app,
        specialities.speciality_key as specialities_speciality_key,
        specialities.comments as specialities_comments,
        specialities.default_name as specialities_default_name,
        specialities.qualifier as specialities_qualifier,
        specialities.is_defualt as specialities_is_defualt,
        specialities.is_available as specialities_is_available,
        specialities.is_create_appointment as specialities_is_create_appointment,
        specialities.is_editable as specialities_is_editable,

        appointmentStatus.created_at AS appointmentStatus_created_at,
        appointmentStatus.created_by AS appointmentStatus_created_by,
        appointmentStatus.deleted_at AS appointmentStatus_deleted_at,
        appointmentStatus.id AS appointmentStatus_id,
        appointmentStatus.name AS appointmentStatus_name,
        appointmentStatus.slug AS appointmentStatus_slug,
        appointmentStatus.updated_at AS appointmentStatus_updated_at,
        appointmentStatus.updated_by AS appointmentStatus_updated_by,

        patientSessions.id AS patientSessions_id,
        patientSessions.key AS patientSessions_key,
        patientSessions.status_id AS patientSessions_status_id,
        patientSessions.case_id AS patientSessions_case_id,
        patientSessions.appointment_id AS patientSessions_appointment_id,
        patientSessions.date_of_check_in AS patientSessions_date_of_check_in,
        patientSessions.time_of_check_in AS patientSessions_time_of_check_in,
        patientSessions.date_of_check_out AS patientSessions_date_of_check_out,
        patientSessions.time_of_check_out AS patientSessions_time_of_check_out,
        patientSessions.created_by AS patientSessions_created_by,
        patientSessions.updated_by AS patientSessions_updated_by,
        patientSessions.created_at AS patientSessions_created_at,
        patientSessions.updated_at AS patientSessions_updated_at,
        patientSessions.deleted_at AS patientSessions_deleted_at,

        visitStatus.name AS visitStatus_name,
        visitStatus.id AS visitStatus_id,
        visitStatus.slug AS visitStatus_slug
        FROM sch_appointments AS appointments

        left join kiosk_case_types as caseType on caseType.id = appointments.case_type_id and caseType.deleted_at IS NULL
        ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
        left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
        left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
        left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
        left join medical_identifiers as medicalIdentifier on medicalIdentifier.user_id = doctor.id and medicalIdentifier.deleted_at IS NULL
        left join billing_titles as billingTitles on billingTitles.id = medicalIdentifier.billing_title_id and billingTitles.deleted_at IS NULL
        left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
        left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
        ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL
        left join sch_appointment_statuses AS appointmentStatus ON appointments.status_id = appointmentStatus.id AND appointmentStatus.deleted_at IS NULL
        left join kiosk_case_patient_session AS patientSessions ON patientSessions.appointment_id = appointments.id
        ${visitStatusJoin} join kiosk_case_patient_session_statuses AS visitStatus ON visitStatus.id = patientSessions.status_id AND visitStatus.deleted_at IS NULL

        ${finalWhereFilter}
        group BY appointments.id
        order BY appointments.updated_at DESC
        ${applyLimit})`;

        return raw2;

    }

    public rawQueryForGetAllPatientAppointmentsCount = (data: typings.OptimizedGetAllPatientReqBodyI): string => {

        const {
            page,
            perPage,
            paginate,
            patientId,
            isCancelledAppointments,
            appointmentStatusId,
            endDateString,
            startDateString,
            practiceLocationId,
            specialityId,
            caseId,
            visitStatusId,
        } = data;

        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `limit ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';
        let visitStatusJoin: string = 'left';

        if (isCancelledAppointments) {
            whereFilter.push(`appointments.cancelled = ${isCancelledAppointments}`);
        }

        if (startDateString && endDateString) {
            whereFilter.push(`appointments.scheduled_date_time between '${startDateString}' and '${endDateString}'`);
        }

        if (caseId) {
            whereFilter.push(`appointments.case_id = ${caseId}`);
        }

        if (appointmentStatusId) {
            whereFilter.push(`appointments.status_id = ${appointmentStatusId}`);
        }

        if (patientId) {
            whereFilter.push(`appointments.patient_id = ${patientId}`);
        }

        if (specialityId) {
            whereFilter.push(`specialities.id = ${String(specialityId)}`);
            whereFilter.push(`availableSpeciality.speciality_id = ${String(specialityId)}`);
            requiredCondition = 'inner';
        }

        if (practiceLocationId) {
            whereFilter.push(`availableSpeciality.facility_location_id = (${practiceLocationId})`);
        }

        if (visitStatusId) {
            whereFilter.push(`visitStatus.id = ${visitStatusId}`);
            visitStatusJoin = 'inner';
        }

        whereFilter.push(`appointments.deleted_at IS NULL`);
        whereFilter.push(`appointments.pushed_to_front_desk = false`);

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} and`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        const raw2: string = `(SELECT

            COUNT(DISTINCT appointments.id) as total_appointment
            FROM sch_appointments as appointments


            ${requiredCondition} join sch_available_specialities as availableSpeciality on availableSpeciality.id = appointments.available_speciality_id and availableSpeciality.deleted_at IS NULL
            left join sch_available_doctors as availableSpecialityDoctor on availableSpecialityDoctor.id = appointments.available_doctor_id and availableSpecialityDoctor.deleted_at IS NULL
            left join users as doctor on doctor.id = availableSpecialityDoctor.doctor_id and doctor.deleted_at IS NULL
            left join user_basic_info as doctorBasicInfo on doctorBasicInfo.user_id = doctor.id and doctorBasicInfo.deleted_at IS NULL
            left join facility_locations as facilityLocation on facilityLocation.id = availableSpeciality.facility_location_id and facilityLocation.deleted_at IS NULL
            left join facilities on facilities.id = facilityLocation.facility_id and facilities.deleted_at IS NULL
            ${requiredCondition} join specialities on specialities.id = availableSpeciality.speciality_id and specialities.deleted_at IS NULL
            left join kiosk_case_patient_session AS patientSessions ON patientSessions.appointment_id = appointments.id
            ${visitStatusJoin} join kiosk_case_patient_session_statuses AS visitStatus ON visitStatus.id = patientSessions.status_id AND visitStatus.deleted_at IS NULL

            ${finalWhereFilter}
            group BY appointments.id
            order BY appointments.updated_at DESC
            ${applyLimit})`;

        return raw2;

    }

    public generateWhereClauseForGenericAPI = (data: typings.GenericWhereClauseForAppointmentsI): typings.GenericWhereClauseForAppointmentsReturnObjectsI  => {

        const {
            patientStatusIds,
            facilityLocationIds,
            specialityIds,
            doctorIds,
            patientId,
            patientName,
            appointmentTypeIds,
            appointmentStatusIds,
            caseTypeIds,
            caseIds,
            startDate,
            endDate,
            appointmentListingType,
            comments,
            filterType,
            paginate,
            page,
            perPage,
            createdAt,
            updatedAt,
            createdByIds,
            updatedByIds
        } = data;
        
        let applyLimit: string = '';
        const whereFilter: string[] = [];

        if (paginate) {
            const offset: number = (page - 1) * perPage;
            applyLimit = `LIMIT ${offset} , ${perPage}`;
        }

        let requiredCondition: string = 'left';
        let requiredConditionForDoctor: string = 'left';

        if (specialityIds && specialityIds.length) {
            whereFilter.push(`sch_available_specialities.speciality_id in (${String(specialityIds)})`);
            // requiredCondition = 'inner';
        }

        if (patientStatusIds?.length) {
            whereFilter.push(`kiosk_case_patient_session.status_id in (${String(patientStatusIds)})`);
        }

        if (facilityLocationIds?.length && appointmentListingType !== 'RESCHEDULED') {
            whereFilter.push(`sch_available_specialities.facility_location_id in (${String(facilityLocationIds)})`);
        }

        if (doctorIds && doctorIds.length) {
            whereFilter.push(`sch_available_doctors.doctor_id in (${String(doctorIds)})`);
            // requiredConditionForDoctor = 'inner';
        }

        if (patientId) {
            whereFilter.push(`sch_appointments.patient_id in (${String(patientId)})`);
        }

        if (patientName) {
            const modifiedPatientName: string = patientName.replace(/\s+/g, ' ').trim();
            whereFilter.push(`(kiosk_patient.first_name LIKE '%${modifiedPatientName}%' or kiosk_patient.last_name LIKE '%${modifiedPatientName}%' or kiosk_patient.middle_name LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%'  or CONCAT(kiosk_patient.last_name, ' ', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.first_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%' or CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.last_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.middle_name, \' \', kiosk_patient.last_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.middle_name, \' \', kiosk_patient.first_name) LIKE '%${modifiedPatientName}%' or  CONCAT(kiosk_patient.last_name, \' \', kiosk_patient.first_name, \' \', kiosk_patient.middle_name) LIKE '%${modifiedPatientName}%')`);
        }

        if (appointmentTypeIds && appointmentTypeIds.length) {
            whereFilter.push(`sch_appointments.type_id in (${String(appointmentTypeIds)})`);
        }

        if (appointmentStatusIds && appointmentStatusIds.length) {
            whereFilter.push(`sch_appointments.status_id in (${String(appointmentStatusIds)})`);
        }

        if (caseTypeIds && caseTypeIds.length) {
            whereFilter.push(`sch_appointments.case_type_id in (${String(caseTypeIds)})`);
        }

        if (caseIds && caseIds.length) {
            whereFilter.push(`sch_appointments.case_id in (${String(caseIds)})`);
        }

        if (comments && comments.length) {
            whereFilter.push(`sch_appointments.comments LIKE '%${comments}%'`);
        }

        if (updatedByIds) {
            whereFilter.push(`sch_appointments.updated_by IN (${String(updatedByIds)})`);
        }

        if (createdByIds) {
            whereFilter.push(`sch_appointments.created_by IN (${String(createdByIds)})`);
        }

        if (updatedAt) {
            whereFilter.push(`sch_appointments.updated_at BETWEEN '${new Date(new Date(updatedAt).setUTCHours(0, 0, 0, 0)).toISOString()}' AND '${new Date(new Date(updatedAt).setUTCHours(23, 59, 59, 999)).toISOString()}'`);
        }

        if (createdAt) {
            whereFilter.push(`sch_appointments.created_at BETWEEN '${new Date(new Date(createdAt).setUTCHours(0, 0, 0, 0)).toISOString()}' AND '${new Date(new Date(createdAt).setUTCHours(23, 59, 59, 999)).toISOString()}'`);
        }

        if (appointmentListingType === 'CANCELLED' || appointmentListingType === 'RESCHEDULED') {
            if (startDate && endDate) {
                whereFilter.push(`sch_appointments.updated_at BETWEEN '${startDate}' AND '${endDate}'`);
            } else if (!startDate && endDate) {
                whereFilter.push(`sch_appointments.updated_at <= '${endDate}'`);
            } else if (startDate && !endDate) {
                whereFilter.push(`sch_appointments.updated_at >= '${startDate}'`);
            }
        }
        
        whereFilter.push(`sch_appointments.deleted_at IS NULL`);
        
        if (appointmentListingType == 'CANCELLED' ) {
            whereFilter.push(`sch_appointments.cancelled = true`);
            whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);

        } else if (appointmentListingType == 'RESCHEDULED') {
            whereFilter.push(`sch_appointments.pushed_to_front_desk = true`);
            whereFilter.push(`sch_appointments.cancelled = 0`);
            
            if (facilityLocationIds?.length) {
                whereFilter.push(`sch_appointments.target_facility_id in (${String(facilityLocationIds)})`);
            }

        } else if (appointmentListingType == 'SCHEDULED') {
            whereFilter.push(`sch_appointments.scheduled_date_time BETWEEN '${startDate}' AND '${endDate}'`);
            whereFilter.push(`sch_appointments.cancelled = 0`);
            whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);

        } else {
            whereFilter.push(`sch_appointments.cancelled = 0`);
            whereFilter.push(`sch_appointments.pushed_to_front_desk = 0`);
        }

        let index: number = 0;
        let finalWhereFilter: string = '';

        for (const str of whereFilter) {
            index = index + 1;
            if (index == 1) {
                finalWhereFilter = 'where';
            }
            if (index != whereFilter.length) {
                finalWhereFilter = `${finalWhereFilter} ${str} ${filterType}`;
            } else {
                finalWhereFilter = `${finalWhereFilter} ${str}`;
            }
        }

        return {
            whereClause: finalWhereFilter,
            requiredCondition,
            requiredConditionForDoctor,
            applyLimit
        }
    }

}
