import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import * as models from '.';
export interface sch_unavailable_doctor_noticationsI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    details: string;
    doctor?: models.usersI;
    doctor_id: number;
    id: number;
    key: number;
    unavailable_doctor_id: number;
    unavailableDoctor?: models.sch_unavailable_doctorsI;
    updated_at: Date;
    updated_by: number;
    user?: models.usersI;
    user_id: number;
}

@Table({
    modelName: 'sch_unavailable_doctor_notications',
    tableName: 'sch_unavailable_doctor_notications',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_unavailable_doctor_notications extends Model<sch_unavailable_doctor_noticationsI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public details: string;

    @BelongsTo((): typeof models.users => models.users)
    public doctor: typeof models.users;

    @ForeignKey((): typeof models.users => models.users)
    @Column
    public doctor_id: number;

    @AutoIncrement
    @PrimaryKey
    @Column
    public id: number;

    @Column
    public key: number;

    @ForeignKey((): typeof models.sch_unavailable_doctors => models.sch_unavailable_doctors)
    @Column
    public unavailable_doctor_id: number;

    @BelongsTo((): typeof models.sch_unavailable_doctors => models.sch_unavailable_doctors)
    public unavailableDoctor: typeof models.sch_unavailable_doctors;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @BelongsTo((): typeof models.users => models.users)
    public user: typeof models.users;

    @ForeignKey((): typeof models.users => models.users)
    @Column
    public user_id: number;
}
