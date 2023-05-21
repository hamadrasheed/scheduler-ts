import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import * as models from '.';
export interface sch_doctor_instruction_for_facility_locationsI {
    created_at?: Date;
    created_by?: number;
    date?: Date;
    deleted_at?: Date;
    doctor_id?: number;
    facility_location_id?: number;
    id?: number;
    instruction?: string;
    key?: number;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'sch_doctor_instruction_for_facility_locations',
    tableName: 'sch_doctor_instruction_for_facility_locations',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_doctor_instruction_for_facility_locations extends Model<sch_doctor_instruction_for_facility_locationsI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public date: Date;

    @Column
    public deleted_at: Date;

    @BelongsTo((): typeof models.users => models.users)
    public doctor: typeof models.users;

    @ForeignKey((): typeof models.users => models.users)
    @Column
    public doctor_id: number;

    @Column
    public facility_location_id: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public instruction: string;

    @Column
    public key: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
