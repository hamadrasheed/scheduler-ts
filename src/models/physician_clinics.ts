

import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { clinics, clinicsI, clinic_locations, clinic_locationsI, physicianI, physicians, users } from '.';

export interface physician_clinicsI {
    clinic?: clinicsI;
    clinic_id?: number;
    clinic_locations_id: number;
    clinicLocation?: clinic_locationsI;
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    physician?: physicianI;
    physician_id: number;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'physician_clinics',
    tableName: 'physician_clinics',
    timestamps: false
})
export class physician_clinics extends Model<physician_clinicsI> {

    @BelongsTo((): typeof clinics => clinics)
    public clinic: typeof clinics;

    @ForeignKey((): typeof clinics => clinics)
    @Column
    public clinic_id: number;

    @ForeignKey((): typeof clinic_locations => clinic_locations)
    @Column
    public clinic_locations_id: number;

    @BelongsTo((): typeof clinic_locations => clinic_locations)
    public clinicLocation: typeof clinic_locations;

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

    @BelongsTo((): typeof physicians => physicians)
    public physician: physicians;

    @ForeignKey((): typeof physicians => physicians)
    @Column
    public physician_id: number;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;
}
