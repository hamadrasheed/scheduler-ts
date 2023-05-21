import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { kiosk_cases, kiosk_casesI, kiosk_contact_person, kiosk_contact_personI } from '.';

export interface kiosk_case_contact_personsI {
    case_id: kiosk_casesI;
    contact_person_id: number;
    contactPerson: kiosk_contact_personI;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_case_contact_persons',
    tableName: 'kiosk_case_contact_persons',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_case_contact_persons extends Model<kiosk_case_contact_personsI> {

    @BelongsTo((): typeof kiosk_cases => kiosk_cases)
    public case: typeof kiosk_cases;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;

    @ForeignKey((): typeof kiosk_contact_person => kiosk_contact_person)
    @Column
    public contact_person_id: number;

    @BelongsTo((): typeof kiosk_contact_person => kiosk_contact_person)
    public contactPerson: typeof kiosk_contact_person;

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
    public updated_at: Date;

    @Column
    public updated_by: number;

}
