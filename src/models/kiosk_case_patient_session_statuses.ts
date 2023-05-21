import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {} from '.';

export interface kiosk_case_patient_session_statusesI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    name: string;
    slug: string;
    updated_at: Date;
    updated_by: number;

}

@Table({
    modelName: 'kiosk_case_patient_session_statuses',
    tableName: 'kiosk_case_patient_session_statuses',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_patient_session_statuses extends Model<kiosk_case_patient_session_statusesI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public name: string;

    @Column
    public slug: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
