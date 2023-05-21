import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { sch_available_doctors , sch_available_specialities, sch_day_lists } from '.';

export interface sch_recurrence_day_listsI {
    available_doctor_id?: number;
    available_speciality_id?: number;
    created_at?: Date;
    created_by?: number;
    day_id: number;
    deleted_at?: Date;
    id?: number;
    key?: number;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'sch_recurrence_day_lists',
    tableName: 'sch_recurrence_day_lists',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_recurrence_day_lists extends Model<sch_recurrence_day_listsI> {

    @ForeignKey((): typeof sch_available_doctors => sch_available_doctors)
    @Column
    public available_doctor_id?: number;

    @ForeignKey((): typeof sch_available_specialities => sch_available_specialities)
    @Column
    public available_speciality_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @ForeignKey((): typeof sch_day_lists => sch_day_lists)
    @Column
    public day_id: number;

    @Column
    public deleted_at: Date;

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
