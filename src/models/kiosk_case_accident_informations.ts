import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { kiosk_cases } from '.';


export interface kiosk_case_accident_informationsI {

    accident_time: Date;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    updated_at: Date;
    accident_date:Date;
    updated_by: number;
    case_id:number;
}

@Table({
    modelName: 'kiosk_case_accident_informations',
    tableName: 'kiosk_case_accident_informations',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_accident_informations extends Model<kiosk_case_accident_informationsI> {

    @Column
    public accident_time: Date;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;

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
    accident_date: Date;

    @Column
    public updated_by: number;

}
