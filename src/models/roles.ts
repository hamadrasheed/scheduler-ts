import { AutoIncrement, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    model_has_roles,
    model_has_rolesI,
    users
} from '.';

export interface rolesI {
    comment: string;
    created_at: Date;
    created_by: number;
    default: number;
    deleted_at: Date;
    guard_name: string;
    id: number;
    medical_identifier: number;
    modelRoles: model_has_rolesI[];
    name: string;
    qualifier: string;
    slug: string;
    updated_at: Date;
    updated_by: number;
    has_supervisor: boolean;
}

@Table({
    modelName: 'roles',
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class roles extends Model<rolesI> {

    @Column
    public comment: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public default: number;

    @Column
    public deleted_at: Date;

    @Column
    public guard_name: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public medical_identifier: number;

    @HasMany((): typeof model_has_roles => model_has_roles)
    public modelRoles: typeof model_has_roles;

    @Column
    public name: string;

    @Column
    public qualifier: string;

    @Column
    public slug: string;

    @Column
    public updated_at: Date;

    @Column
    public has_supervisor: boolean;
    
    @Column
    public updated_by: number;

}
