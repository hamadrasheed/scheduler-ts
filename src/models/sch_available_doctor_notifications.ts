import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { sch_available_doctors, users } from '.';

export interface sch_available_doctor_notificationsI {
    available_doctor_id: number;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    doctor_id: number;
    id: number;
    key: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'sch_available_doctor_notifications',
    tableName: 'sch_available_doctor_notifications',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_available_doctor_notifications extends Model<sch_available_doctor_notificationsI> {

    @ForeignKey((): typeof sch_available_doctors => sch_available_doctors)
    @Column
    public available_doctor_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public doctor_id: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
