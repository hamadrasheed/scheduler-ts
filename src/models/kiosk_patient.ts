import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {} from '.';

enum GenderI {
    male,
    female,
    X
}

enum MeritialI {
    single,
    married,
    widowed
}

enum IsPregnentI {
    yes,
    no,
    not_sure
}

enum IsLawEnforcementAgentI {
    yes,
    no,
    skip
}

enum StatusI {
    open,
    closed
}

export interface kiosk_patientI {
    age: number;
    cell_phone: string;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    dob: Date;
    first_name: string;
    gender: GenderI;
    height_ft: number;
    height_in: number;
    home_phone: string;
    id: number;
    is_law_enforcement_agent: IsLawEnforcementAgentI;
    is_pregnant: IsPregnentI;
    key: number;
    language: string;
    last_name: string;
    meritial_status: MeritialI;
    middle_name: string;
    need_translator: number;
    notes: string;
    profile_avatar: string;
    ssn: string;
    status: StatusI;
    updated_at: Date;
    updated_by: number;
    weight_kg: number;
    weight_lbs: number;
    work_phone: string;
}

@Table({
    modelName: 'kiosk_patient',
    tableName: 'kiosk_patient',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_patient extends Model<kiosk_patientI> {

    @Column
    public age: number;

    @Column
    public cell_phone: string;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public dob: Date;

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
    public is_law_enforcement_agent: IsLawEnforcementAgentI;

    @Column
    public is_pregnant: IsPregnentI;

    @Column
    public key: number;

    @Column
    public language: string;

    @Column
    public last_name: string;

    @Column
    public meritial_status: MeritialI;

    @Column
    public middle_name: string;

    @Column
    public need_translator: number;

    @Column
    public notes: string;

    @Column
    public profile_avatar: string;

    @Column
    public ssn: string;

    @Column
    public status: StatusI;

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

}
