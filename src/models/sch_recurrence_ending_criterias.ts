import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface sch_recurrence_ending_criteriasI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    name: string;
    slug: string;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'sch_recurrence_ending_criterias',
    tableName: 'sch_recurrence_ending_criterias',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_recurrence_ending_criterias extends Model<sch_recurrence_ending_criteriasI> {

    @Column
    public created_at: Date;

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
    public slug: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
