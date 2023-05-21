import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { medical_identifiers, users } from '.';


export interface billing_titlesI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    name: string;
    description: string;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'billing_titles',
    tableName: 'billing_titles',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
})
export class billing_titles extends Model<billing_titlesI> {

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
    public name: string;

    @Column
    public description: string;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    
    @HasOne((): typeof medical_identifiers => medical_identifiers)
    public medicalIdentifiers: typeof medical_identifiers;


}
