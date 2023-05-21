import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { physicianI, physicians, users } from '.';

export interface clinicsI {
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    name?: string;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'clinics',
    tableName: 'clinics',
    timestamps: false
})

export class clinics extends Model<clinicsI> {

    @Column
    public created_at: Date;
    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;
    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column
    public name: string;

    @Column
    public updated_at: Date;
    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

}
