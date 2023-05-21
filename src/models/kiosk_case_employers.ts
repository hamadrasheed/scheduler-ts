import { AutoIncrement, BelongsTo, HasOne, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { kiosk_case_employer_types, kiosk_cases } from './';

export interface kiosk_case_employersI {
    id: number;
    case_id: number;
    employer_id: number;
    employer_type_id: number;
    occupation: string;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_case_employers',
    tableName: 'kiosk_case_employers',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_employers extends Model<kiosk_case_employersI> {


    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;

    @Column
    public employer_id: number;

    @ForeignKey((): typeof kiosk_case_employer_types => kiosk_case_employer_types)
    @Column
    public employer_type_id: number;

    @BelongsTo((): typeof kiosk_case_employer_types => kiosk_case_employer_types)
    public caseEmployerType: typeof kiosk_case_employer_types;

    @Column
    public occupation: string;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
