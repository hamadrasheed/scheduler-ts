import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { billing_titles, billing_titlesI, users } from '.';

export interface medical_identifiersI {
    billing_employment_type_id: number;
    billing_title_id: number;
    clinic_name: string;
    created_at: Date;
    billingTitle?:billing_titlesI;
    created_by: number;
    dea_expiration_date: Date;
    dea_issue_date: Date;
    dea_number: string;
    deleted_at: Date;
    doctor_id: number;
    hospital_privileges: string;
    billing_Title?:billing_titlesI;
    id: number;
    is_self: number;
    medical_credentials: number;
    nadean_number: string;
    npi: string;
    other_employment_type: string;
    rating: string;
    registration_expiration_date: Date;
    registration_number: string;
    updated_at: Date;
    updated_by: number;
    upin: string;
    user_id: number;
    wcb_auth: number;
    wcb_authorization: string;
    wcb_date_of_issue: Date;
    wcb_rating_code: string;


}

@Table({
    modelName: 'medical_identifiers',
    tableName: 'medical_identifiers',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class medical_identifiers extends Model<medical_identifiersI> {

    @Column
    public billing_employment_type_id: number;

    @ForeignKey((): typeof billing_titles => billing_titles)
    @Column
    public billing_title_id: number;

    @Column
    public clinic_name: string;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public dea_expiration_date: Date;

    @Column
    public dea_issue_date: Date;

    @Column
    public dea_number: string;

    @Column
    public deleted_at: Date;

    @Column
    public doctor_id: number;

    @Column
    public hospital_privileges: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_self: number;

    @Column
    public medical_credentials: number;

    @Column
    public nadean_number: string;

    @Column
    public npi: string;

    @Column
    public other_employment_type: string;

    @Column
    public rating: string;

    @Column
    public registration_expiration_date: Date;

    @Column
    public registration_number: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @Column
    public upin: string;

    @BelongsTo((): typeof users => users)
    public user: typeof users;

    @ForeignKey((): typeof users => users)
    @Column
    public user_id: number;


    @Column
    public wcb_auth: number;

    @Column
    public wcb_authorization: string;

    @Column
    public wcb_date_of_issue: Date;

    @Column
    public wcb_rating_code: string;

    @BelongsTo((): typeof billing_titles => billing_titles)
    public billingTitle: typeof billing_titles;

}
