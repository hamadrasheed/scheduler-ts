import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import * as models from './';

enum TypeI {
    mailing,
    residential
}

export interface kiosk_contact_person_addressI {
    apartment: string;
    city: string;
    contact_person_id: number;
    country: string;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    latitude: number;
    longitude: number;
    state: string;
    street: string;
    type: TypeI;
    updated_at: Date;
    updated_by: number;
    zip: string;
}

@Table({
    modelName: 'kiosk_contact_person_address',
    tableName: 'kiosk_contact_person_address',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_contact_person_address extends Model<kiosk_contact_person_addressI> {

    @Column
    public apartment: string;

    @Column
    public city: string;

    @ForeignKey((): typeof models.kiosk_contact_person => models.kiosk_contact_person)
    @Column
    public contact_person_id: number;

    @Column
    public country: string;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @AutoIncrement
    @PrimaryKey
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public latitude: number;

    @Column
    public longitude: number;

    @Column
    public state: string;

    @Column
    public street: string;

    @Column
    public type: TypeI;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @Column
    public zip: string;

}
