import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    kiosk_case_types,
    sch_appointment_priorities,
    sch_appointment_types,
    sch_appointment_typesI,
    sch_available_doctorsI,
    sch_available_specialities,
    sch_available_specialitiesI,
    specialities,
    specialitiesI,
    users,
    usersI,
} from '.';
import { facility_locations,  } from './facility_locations';
import { sch_appointments } from './sch_appointments';
import { sch_appointment_statuses } from './sch_appointment_statuses';
import { sch_recurrence_date_lists } from './sch_recurrence_date_lists';
import { visit_session_states, visit_session_statesI } from './visit_session_states';

export interface visit_sessionsI {
    appointment_id?: number;
    appointment_type_id?: number;
    case_id?: number;
    cpt_codes_comment?: string;
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    doctor_id?: number;
    doctor_signature_id: number;
    document_uploaded?: boolean;
    facility_location_id?: number;
    icd_codes_comment?: string;
    id?: number;
    is_amended: boolean;
    last_uploaded_document_date?: Date;
    patient_id?: number;
    patient_signature_id: number;
    speciality?: specialitiesI;
    speciality_id?: number;
    template_id?: number;
    template_type?: string;
    updated_at?: Date;
    updated_by?: number;
    visit_date?: Date;
    visit_session_state_id?: number;
    visitState?: visit_session_statesI;
}

@Table({
    modelName: 'visit_sessions',
    tableName: 'visit_sessions',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class visit_sessions extends Model<visit_sessionsI> {

    @ForeignKey((): typeof sch_appointments => sch_appointments)
    @Column
    public appointment_id?: number;

    @Column
    public appointment_type_id?: number;

    @Column
    public case_id?: number;

    @Column
    public cpt_codes_comment?: string;

    @Column
    public created_at?: Date;

    @Column
    public created_by?: number;

    @Column
    public deleted_at?: Date;

    @Column
    public doctor_id?: number;

    @Column
    public doctor_signature_id: number;

    @Column
    public document_uploaded?: boolean;

    @Column
    public facility_location_id?: number;

    @Column
    public icd_codes_comment?: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id?: number;

    @Column
    public is_amended: boolean;

    @Column
    public last_uploaded_document_date?: Date;

    @Column
    public patient_id?: number;

    @Column
    public patient_signature_id: number;

    @BelongsTo((): typeof specialities => specialities)
    public speciality: typeof specialities;


    @ForeignKey((): typeof specialities => specialities)
    @Column
    public speciality_id?: number;

    @Column
    public template_id: number;

    @Column
    public template_type: string;

    @Column
    public updated_at?: Date;

    @Column
    public updated_by?: number;

    @Column
    public visit_date?: Date;

    @ForeignKey((): typeof visit_session_states => visit_session_states)
    @Column
    public visit_session_state_id?: number;
    @BelongsTo((): typeof visit_session_states => visit_session_states)
    public visitState: typeof visit_session_states;

}
