import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface sch_day_listsI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    slug: string;
    unit: string;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'sch_day_lists',
    tableName: 'sch_day_lists',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_day_lists extends Model<sch_day_listsI> {

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
    public slug: string;

    @Column
    public unit: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
