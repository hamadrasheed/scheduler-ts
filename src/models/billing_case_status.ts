import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface billing_case_statusI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    name: string;
    updated_at: Date;
    updated_by: number;
    description:string
    comments:string

}

@Table({
    modelName: 'billing_case_status',
    tableName: 'billing_case_status',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class billing_case_status extends Model<billing_case_statusI> {

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
    public updated_at: Date;

    @Column
    public updated_by: number;

}
