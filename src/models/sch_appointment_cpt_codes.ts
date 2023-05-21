import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    billing_codes,
    billing_codesI,
    sch_appointments,
    users
} from '.';

export interface sch_appointment_cpt_codesI {
    appointment_id: number;
    billing_code_id: number;
    billingCode?: billing_codesI;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    modelName: 'sch_appointment_cpt_codes',
    tableName: 'sch_appointment_cpt_codes',
    timestamps: false
})
export class sch_appointment_cpt_codes extends Model<sch_appointment_cpt_codesI> {

    @ForeignKey((): typeof sch_appointments => sch_appointments)
    @Column
    public appointment_id: number;

    @ForeignKey((): typeof billing_codes => billing_codes)
    @Column
    public billing_code_id: number;

    @BelongsTo((): typeof billing_codes => billing_codes)
    public billingCode: billing_codes;

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
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;
}
