import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    users,
    user_facility
} from '.';

export interface visit_session_statesI {
    comments: string;
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
    modelName: 'visit_session_states',
    tableName: 'visit_session_states',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class visit_session_states extends Model<visit_session_statesI> {

    @Column
    public comments: string;

    @Column
    public created_at: Date;

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
