import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { pt_session } from '.';

export interface pt_session_diagnosisI {

    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    precautions?: string;
    session_id: number;
    type?: string;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    modelName: 'pt_session_diagnosis',
    paranoid: true,
    tableName: 'pt_session_diagnosis',
    timestamps: true,
    updatedAt: 'updated_at',
})
export class pt_session_diagnosis extends Model<pt_session_diagnosis> {

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
    public precautions: string;

    @ForeignKey((): typeof pt_session => pt_session)
    @Column
    public session_id: number;

    @Column
    public updated_by: number;

}
