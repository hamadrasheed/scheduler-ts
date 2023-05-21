import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { kiosk_case_patient_session_statuses, kiosk_case_patient_session_statusesI, sch_appointments, kiosk_cases, kiosk_case_patient_session_not_seen_reasons } from '.';

export interface kiosk_case_patient_sessionI {
    appointment_id: number;
    case_id: number;
    created_at: Date;
    created_by: number;
    date_of_check_in: string;
    date_of_check_out: string;
    deleted_at: Date;
    id: number;
    key: number;
    status_id: number;
    time_of_check_in: Date;
    time_of_check_out: Date;
    updated_at: Date;
    updated_by: number;
    visitStatus?: kiosk_case_patient_session_statusesI;

}

@Table({
    modelName: 'kiosk_case_patient_session',
    tableName: 'kiosk_case_patient_session',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_patient_session extends Model<kiosk_case_patient_sessionI> {

    @ForeignKey((): typeof sch_appointments => sch_appointments)
    @Column
    public appointment_id: number;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public date_of_check_in: string;

    @Column
    public date_of_check_out: string;

    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @ForeignKey((): typeof kiosk_case_patient_session_statuses => kiosk_case_patient_session_statuses)
    @Column
    public status_id: number;

    @Column
    public time_of_check_in: Date;

    @Column
    public time_of_check_out: Date;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @BelongsTo((): typeof kiosk_case_patient_session_statuses => kiosk_case_patient_session_statuses)
    public visitStatus: typeof kiosk_case_patient_session_statuses;

    @BelongsTo((): typeof kiosk_cases => kiosk_cases)
    public case: typeof kiosk_cases;

    @HasOne((): typeof kiosk_case_patient_session_not_seen_reasons => kiosk_case_patient_session_not_seen_reasons)
    public sessionPatientNotSeenReason: typeof kiosk_case_patient_session_not_seen_reasons;

}
