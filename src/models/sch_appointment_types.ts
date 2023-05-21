import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { speciality_visit_types, speciality_visit_typesI } from './speciality_visit_types';

export interface sch_appointment_typesI {
    avoid_checkedin:boolean;
    created_at: Date;
    created_by: number;
    qualifier: string;
    deleted_at: Date;
    description: string;
    enable_cpt_codes: boolean;
    id: number;
    is_all_cpt_codes: boolean;
    name: string;
    slug: string;
    updated_at: Date;
    updated_by: number;
    specialityVisitType: speciality_visit_typesI
}

@Table({
    modelName: 'sch_appointment_types',
    tableName: 'sch_appointment_types',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_appointment_types extends Model<sch_appointment_typesI> {

    @Column
    public avoid_checkedin: boolean;

    @Column
    public created_at: Date;

    @Column
    public qualifier: string;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public description: string;

    @Column
    public enable_cpt_codes: boolean;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_all_cpt_codes: boolean;

    @Column
    public name: string;

    @Column
    public slug: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    
    @HasMany((): typeof speciality_visit_types => speciality_visit_types)
    public specialityVisitType : typeof speciality_visit_types;

}
