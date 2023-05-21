import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { sch_color_code_types, users } from '.';

export interface sch_color_codesI {
    code: string;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    object_id: number;
    type?: sch_color_code_types;
    type_id: number;
    updated_at: Date;
    updated_by: number;
    user?: users;
    user_id: number;
}

@Table({
    modelName: 'sch_color_codes',
    tableName: 'sch_color_codes',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_color_codes extends Model<sch_color_codesI> {

    @Column
    public code: string;

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
    public key: number;

    @Column
    public object_id: number;

    @BelongsTo((): typeof sch_color_code_types => sch_color_code_types)
    public type: typeof sch_color_code_types;

    @ForeignKey((): typeof sch_color_code_types => sch_color_code_types)
    @Column
    public type_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @BelongsTo((): typeof users => users)
    public user: typeof users;

    @ForeignKey((): typeof users => users)
    @Column
    public user_id: number;
}
