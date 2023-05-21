import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    sch_appointment_types,
    sch_appointment_typesI,
    specialities,
    specialitiesI,
} from '.';

export interface speciality_visit_typesI {
    id?: number;
    appointment_type_id?: number;
    speciality?: specialitiesI;
    schAppointmentTypes: sch_appointment_typesI
    speciality_id?: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: number;
    created_by?: number;
    deleted_at?: Date;
    position: number;
    is_required: boolean;
    is_multiple: boolean;
    is_editable: boolean;
    is_multiple_same_day: boolean;
    allow_multiple_cpt_codes: boolean;
}

@Table({
    modelName: 'speciality_visit_types',
    tableName: 'speciality_visit_types',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class speciality_visit_types extends Model<speciality_visit_typesI> {
    
    @PrimaryKey
    @AutoIncrement
    @Column
    public id?: number;

    @BelongsTo((): typeof sch_appointment_types => sch_appointment_types)
    public schAppointmentTypes: typeof sch_appointment_types;

    @ForeignKey((): typeof sch_appointment_types => sch_appointment_types)
    @Column
    public appointment_type_id?: number;

    @Column
    public created_at?: Date;

    @Column
    public created_by?: number;

    @Column
    public deleted_at?: Date;

    @BelongsTo((): typeof specialities => specialities)
    public speciality: typeof specialities;

    @ForeignKey((): typeof specialities => specialities)
    @Column
    public speciality_id?: number;

    @Column
    public updated_at?: Date;

    @Column
    public updated_by?: number;

    @Column
    public position?: number;

    @Column
    public is_required?: boolean;

    @Column
    public is_multiple?: boolean;

    @Column
    public is_editable?: boolean;

    @Column
    public is_multiple_same_day?: boolean;
    
    @Column
    public allow_multiple_cpt_codes?: boolean;





}
