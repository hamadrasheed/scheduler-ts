import { AutoIncrement, BelongsTo, Column, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    pt_session_diagnosis, pt_session_diagnosisI
} from '.';


export interface pt_sessionI {

    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    ptSessionDiagnosis?: pt_session_diagnosisI;
    updated_at?: Date;
    updated_by?: number;
}

@Table({
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    modelName: 'pt_session',
    paranoid: true,
    tableName: 'pt_session',
    timestamps: true,
    updatedAt: 'updated_at'
})
export class pt_session extends Model<pt_sessionI> {

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

    @HasOne((): typeof pt_session_diagnosis => pt_session_diagnosis)
    public ptSessionDiagnosis: typeof pt_session_diagnosis;

}
