import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface case_referralsI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    description: string;
    id: number;
    name: string;
    slug: string;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'case_referrals',
    tableName: 'case_referrals',
    timestamps: false
})
export class case_referrals extends Model<case_referralsI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public description: string;

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
