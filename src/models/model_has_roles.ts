import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    roles,
    rolesI,
    users,
    usersI
} from '.';

export interface model_has_rolesI {
    model_id: number;
    model_type: string;
    role: rolesI;
    role_id: number;
    user: usersI;

}

@Table({
    modelName: 'model_has_roles',
    tableName: 'model_has_roles',
    timestamps: false
})
export class model_has_roles extends Model<model_has_rolesI> {

    @PrimaryKey
    @ForeignKey((): typeof users => users)
    @Column
    public model_id: number;

    @Column
    public model_type: string;

    @BelongsTo((): typeof roles => roles)
    public role: typeof roles;

    @PrimaryKey
    @ForeignKey((): typeof roles => roles)
    @Column
    public role_id: number;

    @BelongsTo((): typeof users => users)
    public user: typeof users;

}
