import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { medical_identifiers, users } from '.';


export interface billing_insurancesI {

    id: number;
    insurance_name: string;
    insurance_code: string;
    is_verified: boolean;
    count: number;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'billing_insurances',
    tableName: 'billing_insurances',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
})
export class billing_insurances extends Model<billing_insurancesI> {

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public insurance_name: string;
    
    @Column
    public insurance_code: string;
    
    @Column
    public is_verified: boolean;
    
    @Column
    public count: number;
    
    @Column
    public created_at: Date;
    
    @Column
    public created_by: number;
    
    @Column
    public deleted_at: Date;
    
    @Column
    public updated_at: Date;
    
    @Column
    public updated_by: number;

}
