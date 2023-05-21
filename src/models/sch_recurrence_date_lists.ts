import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import * as models from '.';

export interface sch_recurrence_date_listsI {
    appointments?: models.sch_appointmentsI[];
    available_doctor_id?: number;
    available_speciality_id?: number;
    availableDoctor?: models.sch_available_doctorsI;
    availableSpeciality?: models.sch_available_specialitiesI;
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    doctor_method_id?: number;
    end_date?: Date;
    id?: number;
    key?: number;
    no_of_doctors?: number;
    no_of_slots?: number;
    start_date?: Date;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'sch_recurrence_date_lists',
    tableName: 'sch_recurrence_date_lists',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_recurrence_date_lists extends Model<sch_recurrence_date_listsI> {

    @HasMany((): typeof models.sch_appointments => models.sch_appointments)
    public appointments: typeof models.sch_appointments;

    @ForeignKey((): typeof models.sch_available_doctors => models.sch_available_doctors)
    @Column
    public available_doctor_id: number;

    @ForeignKey((): typeof models.sch_available_specialities => models.sch_available_specialities)
    @Column
    public available_speciality_id: number;

    @BelongsTo((): typeof models.sch_available_doctors => models.sch_available_doctors)
    public availableDoctor: typeof models.sch_available_doctors;

    @BelongsTo((): typeof models.sch_available_specialities => models.sch_available_specialities)
    public availableSpeciality: typeof models.sch_available_specialities;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @ForeignKey((): typeof models.sch_assign_provider_types => models.sch_assign_provider_types)
    @Column
    public doctor_method_id: number;

    @Column
    public end_date: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public no_of_doctors: number;

    @Column
    public no_of_slots: number;

    @Column
    public start_date: Date;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
