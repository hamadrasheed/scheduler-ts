import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { kiosk_case_patient_session} from '.';

export interface kiosk_case_patient_session_not_seen_reasonsI {
    case_patient_session_id: number;
    created_at: Date;
    created_by: number;
    date: Date;
    deleted_at: Date;
    id: number;
    key: number;
    notes: string;
    provider_id: number;
    speciality_id: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_case_patient_session_not_seen_reasons',
    tableName: 'kiosk_case_patient_session_not_seen_reasons',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_patient_session_not_seen_reasons extends Model<kiosk_case_patient_session_not_seen_reasonsI> {

    @ForeignKey((): typeof kiosk_case_patient_session => kiosk_case_patient_session)
    @Column
    public case_patient_session_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public date: Date;

    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public notes: string;

    @Column
    public provider_id: number;

    @Column
    public speciality_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
