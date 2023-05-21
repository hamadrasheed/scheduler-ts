import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import * as models from './';

enum GenderI {
    male,
    female,
    x
}

enum FormFillerI {
    self,
    other,
    skip
}

enum IsEmergencyI {
    yes,
    no,
    skip
}

enum IsGuarantorI {
    yes,
    no,
    skip
}

export interface kiosk_contact_personI {
    age: number;
    case_id: number;
    cell_phone: string;
    contact_person_relation_id: number;
    contact_person_type_id: number;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    dob: Date;
    email: string;
    ext: string;
    fax: string;
    first_name: string;
    gender: GenderI;
    height_ft: number;
    height_in: number;
    home_phone: string;
    id: number;
    is_emergency: IsEmergencyI;
    is_form_filler: FormFillerI;
    is_guarantor: IsGuarantorI;
    is_resedential_same: boolean;
    key: number;
    last_name: string;
    marital_status: string;
    middle_name: string;
    object_id: number;
    other_relation_description: string;
    speciality_id: number;
    ssn: string;
    updated_at: Date;
    updated_by: number;
    weight_kg: number;
    weight_lbs: number;
    work_phone: string;
    workplace_name: string;

}

@Table({
    modelName: 'kiosk_contact_person',
    tableName: 'kiosk_contact_person',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_contact_person extends Model<kiosk_contact_personI> {

    @Column
    public age: number;

    @Column
    public case_id: number;

    @Column
    public cell_phone: string;

    @Column
    public contact_person_relation_id: number;

    @Column
    public contact_person_type_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public dob: Date;

    @Column
    public email: string;

    @Column
    public ext: string;

    @Column
    public fax: string;

    @Column
    public first_name: string;

    @Column
    public gender: GenderI;

    @Column
    public height_ft: number;

    @Column
    public height_in: number;

    @Column
    public home_phone: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_emergency: IsEmergencyI;

    @Column
    public is_form_filler: FormFillerI;

    @Column
    public is_guarantor: IsGuarantorI;

    @Column
    public is_resedential_same: boolean;

    @Column
    public key: number;

    @Column
    public last_name: string;

    @Column
    public marital_status: string;

    @Column
    public middle_name: string;

    @Column
    public object_id: number;

    @Column
    public other_relation_description: string;

    @HasMany((): typeof models.kiosk_contact_person_address => models.kiosk_contact_person_address)
    public patientAddress: typeof models.kiosk_contact_person_address;

    @Column
    public speciality_id: number;

    @Column
    public ssn: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @Column
    public weight_kg: number;

    @Column
    public weight_lbs: number;

    @Column
    public work_phone: string;

    @Column
    public workplace_name: string;

}
