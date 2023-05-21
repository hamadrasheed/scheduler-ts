import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { users } from '.';

export interface physicianI {
    cell_no?: number;
    created_by?: number;
    deleted_at?: Date;
    email: string;
    first_name: string;
    id: number;
    last_name: string;
    license_no: number;
    middle_name?: string;
    npi_no?: number;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'physicians',
    tableName: 'physicians',
    timestamps: false
})
export class physicians extends Model<physicianI> {

    @Column
    public cell_no: number;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public email: string;

    @Column
    public first_name: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public last_name: string;

    @Column
    public license_no: number;

    @Column
    public middle_name: string;

    @Column
    public npi_no: number;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;
}
