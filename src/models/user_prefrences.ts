import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    users
} from '.';

export interface user_prefrencesI {
    colorCode: string;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    preferences: string;
    updated_at: Date;
    updated_by: number;
    user_id: number;
}

@Table({
    modelName: 'user_prefrences',
    tableName: 'user_prefrences',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class user_prefrences extends Model<user_prefrencesI> {

    @Column
    public colorCode: string;

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
    public preferences: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @ForeignKey((): typeof users => users)
    @Column
    public user_id: number;

}
