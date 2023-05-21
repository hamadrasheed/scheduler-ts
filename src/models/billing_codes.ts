import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    sch_appointments,
    users
} from '.';

export interface billing_codesI {
    appointment_id: number;
    code_type_id?: number;
    comments?: string;
    created_by?: number;
    deleted_at?: Date;
    description?: string;
    id: number;
    long_description?: string;
    medium_description?: string;
    name?: string;
    short_description?: string;
    type?: string;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'billing_codes',
    tableName: 'billing_codes',
    timestamps: false
})
export class billing_codes extends Model<billing_codesI> {

    @Column
    public code_type_id: number;

    @Column
    public comments: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public description: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public long_description: string;

    @Column
    public medium_description: string;

    @Column
    public name: string;

    @Column
    public short_description: string;

    @Column
    public type: string;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;
}
