import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { facility_locations, sch_available_specialities, users, usersI } from '.';

export interface sch_unavailable_doctorsI {
    approval_status?: number;
    approved_by?: number;
    approvedBy?: usersI;
    comments?: string;
    created_at?: Date;
    created_by?: number;
    createdBy?: usersI;
    deleted_at?: Date;
    description?: string;
    doctor?: usersI;
    doctor_id?: number;
    end_date?: Date;
    id?: number;
    key?: number;
    start_date?: Date;
    subject?: string;
    updated_at?: Date;
    updated_by?: number;
    updatedBy?: usersI;
}

@Table({
    modelName: 'sch_unavailable_doctors',
    tableName: 'sch_unavailable_doctors',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_unavailable_doctors extends Model<sch_unavailable_doctorsI> {

    @Column
    public approval_status: number;

    @ForeignKey((): typeof users => users)
    @Column
    public approved_by: number;

    @BelongsTo((): typeof users => users, 'approved_by')
    public approvedBy: typeof users;

    @Column
    public comments?: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @BelongsTo((): typeof users => users, 'created_by')
    public createdBy: typeof users;

    @Column
    public deleted_at: Date;

    @Column
    public description: string;

    @BelongsTo((): typeof users => users, 'doctor_id')
    public doctor: typeof users;


    @ForeignKey((): typeof users => users)
    @Column
    public doctor_id: number;

    @Column
    public end_date: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public start_date: Date;

    @Column
    public subject: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @BelongsTo((): typeof users => users, 'updated_by')
    public updatedBy: typeof users;
}
