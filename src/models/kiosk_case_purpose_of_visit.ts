import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';


export interface kiosk_case_purpose_of_visitI {

    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_case_purpose_of_visit',
    tableName: 'kiosk_case_purpose_of_visit',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_purpose_of_visit extends Model<kiosk_case_purpose_of_visitI> {

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
    public updated_at: Date;

    @Column
    public updated_by: number;

}
