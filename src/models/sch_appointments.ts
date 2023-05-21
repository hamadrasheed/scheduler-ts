import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    kiosk_cases,
    kiosk_casesI,
    kiosk_case_patient_session,
    kiosk_case_patient_sessionI,
    kiosk_case_types,
    kiosk_case_typesI,
    kiosk_patient,
    medical_identifiersI,
    physician_clinics,
    physician_clinicsI,
    sch_appointment_cpt_codes,
    sch_appointment_cpt_codesI,
    sch_appointment_priorities,
    sch_appointment_types,
    sch_appointment_typesI,
    sch_available_doctors,
    sch_available_doctorsI,
    sch_available_specialities,
    sch_available_specialitiesI,
    sch_transportationI,
    sch_transportations,
    users,
    usersI
} from '.';
import { facility_locations, facility_locationsI } from './facility_locations';
import { physicianI, physicians } from './physician';
import { sch_appointment_statuses, sch_appointment_statusesI } from './sch_appointment_statuses';
import { sch_recurrence_date_lists, sch_recurrence_date_listsI } from './sch_recurrence_date_lists';
import { visit_sessions, visit_sessionsI } from './visit_sessions';

export interface sch_appointmentsI {
    action_performed?: string;
    appointment_title?: string;
    appointmentCptCodes?: sch_appointment_cpt_codesI[];
    appointmentStatus?: sch_appointment_statusesI;
    appointmentType?: sch_appointment_typesI;
    appointmentVisit?: visit_sessionsI;
    appointmentVisitSession?: visit_sessionsI[];
    available_doctor_id?: number;
    available_speciality_id?: number;
    availableDoctor?: sch_available_doctorsI;
    availableSpeciality?: sch_available_specialitiesI;
    billable?: boolean;
    by_health_app?: boolean;
    cancelled?: boolean;
    cancelled_comments?: string;
    case?: kiosk_casesI;
    case_id?: number;
    case_type_id?: number;
    caseType?: kiosk_case_typesI;
    cd_image?: boolean;
    comments?: string;
    confirmation_status?: number | boolean;
    created_at?: Date;
    created_by?: number;
    date_list_id?: number;
    dateList?: sch_recurrence_date_listsI;
    deleted_at?: Date;
    dob?: Date;
    evaluation_date_time?: Date;
    id?: number;
    is_active?: boolean;
    is_redo?: boolean;
    is_soft_registered?: boolean;
    is_speciality_base?: boolean;
    is_transportation?: boolean;
    key?: number;
    kioskCasePatientSessions?: kiosk_case_patient_sessionI[];
    origin_facility_id?: number;
    originFacility?: facility_locationsI;
    patient?: kiosk_patient;
    patient_id?: number;
    patientSessions?: kiosk_case_patient_sessionI;
    physician_id?: number;
    physicianClinic?: physician_clinicsI;
    priority?: sch_appointment_priorities;
    priority_id?: number;
    pushed_to_front_desk?: boolean;
    pushed_to_front_desk_comments?: string;
    reading_provider_id?: number;
    readingProvider?: usersI;
    scheduled_date_time?: Date;
    status_id?: number;
    target_facility_id?: number;
    targetFacility?: facility_locationsI;
    technician?: usersI;
    technician_id?: number;
    time_slots?: number;
    transportations?: sch_transportationI[];
    type_id?: number;
    updated_at?: Date;
    updated_by?: number;
    updatedBy?: usersI;
    visitSessions?: visit_sessionsI;
}

@Table({
    modelName: 'sch_appointments',
    tableName: 'sch_appointments',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_appointments extends Model<sch_appointmentsI> {

    @Column
    public action_performed: string;

    @Column
    public appointment_title: string;

    @HasMany((): typeof sch_appointment_cpt_codes => sch_appointment_cpt_codes)
    public appointmentCptCodes: typeof sch_appointment_cpt_codes;

    @BelongsTo((): typeof sch_appointment_statuses => sch_appointment_statuses)
    public appointmentStatus: typeof sch_appointment_statuses;

    @BelongsTo((): typeof sch_appointment_types => sch_appointment_types)
    public appointmentType: typeof sch_appointment_types;

    @HasOne((): typeof visit_sessions => visit_sessions)
    public appointmentVisit: typeof visit_sessions;

    @HasMany((): typeof visit_sessions => visit_sessions)
    public appointmentVisitSession: typeof visit_sessions;

    @ForeignKey((): typeof sch_available_doctors => sch_available_doctors)
    @Column
    public available_doctor_id: number;

    @ForeignKey((): typeof sch_available_specialities => sch_available_specialities)
    @Column
    public available_speciality_id: number;

    @BelongsTo((): typeof sch_available_doctors => sch_available_doctors)
    public availableDoctor: typeof sch_available_doctors;

    @BelongsTo((): typeof sch_available_specialities => sch_available_specialities)
    public availableSpeciality: typeof sch_available_specialities;

    @Column
    public billable: boolean;

    @Column
    public by_health_app: boolean;

    @Column
    public cancelled: boolean;

    @Column
    public cancelled_comments: string;

    @BelongsTo((): typeof kiosk_cases => kiosk_cases)
    public case: typeof kiosk_cases;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;

    @ForeignKey((): typeof kiosk_case_types => kiosk_case_types)
    @Column
    public case_type_id: number;

    @BelongsTo((): typeof kiosk_case_types => kiosk_case_types)
    public caseType: typeof kiosk_case_types;

    @Column
    public cd_image: boolean;

    @Column
    public comments: string;

    @Column
    public confirmation_status: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @ForeignKey((): typeof sch_recurrence_date_lists => sch_recurrence_date_lists)
    @Column
    public date_list_id: number;

    @BelongsTo((): typeof sch_recurrence_date_lists => sch_recurrence_date_lists)
    public dateList: typeof sch_recurrence_date_lists;

    @Column
    public deleted_at: Date;

    @Column
    public evaluation_date_time: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_active?: boolean;

    @Column
    public is_redo: boolean;

    @Column
    public is_soft_registered?: boolean;

    @Column
    public is_speciality_base: boolean;

    @Column
    public is_transportation: boolean;

    @Column
    public key: number;
    @HasMany((): typeof kiosk_case_patient_session => kiosk_case_patient_session)
    public kioskCasePatientSessions: typeof kiosk_case_patient_session;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public origin_facility_id: number;

    @BelongsTo((): typeof facility_locations => facility_locations, 'origin_facility_id')
    public originFacility: typeof facility_locations;

    @BelongsTo((): typeof kiosk_patient => kiosk_patient)
    public patient: typeof kiosk_patient;

    @ForeignKey((): typeof kiosk_patient => kiosk_patient)
    @Column
    public patient_id: number;

    @HasOne((): typeof kiosk_case_patient_session => kiosk_case_patient_session)
    public patientSessions: typeof kiosk_case_patient_session;

    @BelongsTo((): typeof physician_clinics => physician_clinics)
    public physicianClinic: typeof physician_clinics;

    @ForeignKey((): typeof physician_clinics => physician_clinics)
    @Column
    public physician_id: number;

    @BelongsTo((): typeof sch_appointment_priorities => sch_appointment_priorities)
    public priority: typeof sch_appointment_priorities;

    @ForeignKey((): typeof sch_appointment_priorities => sch_appointment_priorities)
    @Column
    public priority_id: number;

    @Column
    public pushed_to_front_desk: boolean;

    @Column
    public pushed_to_front_desk_comments: boolean;

    @ForeignKey((): typeof users => users)
    @Column
    public reading_provider_id: number;

    @BelongsTo((): typeof users => users)
    public readingProvider: typeof users;

    @Column
    public scheduled_date_time: Date;

    @ForeignKey((): typeof sch_appointment_statuses => sch_appointment_statuses)
    @Column
    public status_id: number;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public target_facility_id: number;

    @BelongsTo((): typeof facility_locations => facility_locations, 'target_facility_id')
    public targetFacility: typeof facility_locations;

    @BelongsTo((): typeof users => users)
    public technician: typeof users;

    @ForeignKey((): typeof users => users)
    @Column
    public technician_id: number;

    @Column
    public time_slots: number;

    @HasMany((): typeof sch_transportations => sch_transportations)
    public transportations: typeof sch_transportations;

    @ForeignKey((): typeof sch_appointment_types => sch_appointment_types)
    @Column
    public type_id: number;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @BelongsTo((): typeof users => users, 'updated_by')
    public updatedBy: typeof users;

    @HasOne((): typeof visit_sessions => visit_sessions)
    public visitSessions: typeof visit_sessions;
}
