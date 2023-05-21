import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface kiosk_contact_person_typesI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    key: number;
    name: string;
    slug: string;
    updated_at: Date;
    updated_by: number;

}

@Table({
    modelName: 'kiosk_contact_person_types',
    tableName: 'kiosk_contact_person_types',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_contact_person_types extends Model<kiosk_contact_person_typesI> {

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
    public name: string;

    @Column
    public slug: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
