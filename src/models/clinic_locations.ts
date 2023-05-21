import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { clinics, physicianI, physicians,users } from '.';

export interface clinic_locationsI {
    city?: string;
    clinic_id: number;
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    email: string;
    extension?: string;
    fax?: string;
    floor?: string;
    id: number;
    is_primary?: number;
    name?: string;
    phone?: string;
    state?: string;
    status?: number;
    street_address?: string;
    updated_at?: Date;
    updated_by?: number;
    zip?: string;

}

@Table({
    modelName: 'clinic_locations',
    tableName: 'clinic_locations',
    timestamps: false
})

export class clinic_locations extends Model<clinic_locationsI> {

    @Column
    public city: string;

    @BelongsTo((): typeof clinics => clinics)
    public clinic: clinics;
    @ForeignKey((): typeof clinics => clinics)
    @Column
    public clinic_id: number;

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
    public extension: string;

    @Column
    public fax: string;

    @Column
    public floor: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_primary: number;

    @Column
    public phone: string;

    @Column
    public state: string;
    @Column
    public status: number;

    @Column
    public street_address: string;

    @Column
    public updated_at: Date;
    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @Column
    public zip: string;

}
