import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { kiosk_cases, billing_insurances, billing_insurancesI } from '.';


export interface kiosk_case_insurancesI {
    id: number;
    key: number;
    case_id: number;
    insurance?: billing_insurancesI;
    insurance_id: number;
    insurance_location_id: number;
    insurance_plan_name_id: number;
    adjustor_id: number;
    insured: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    dob: Date;
    ssn: string;
    claim_no: string;
    policy_no: string;
    wcb_no: string;
    contact_person_relation_id: number;
    member_id: string;
    group_no: string;
    type: string;
    other_relation_description: string;
    phone_no: string;
    confirmed_for_billing: boolean;
    prior_authorization_no: string;
    is_policy_holder: boolean;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_case_insurances',
    tableName: 'kiosk_case_insurances',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
})
export class kiosk_case_insurances extends Model<kiosk_case_insurancesI> {

    @BelongsTo((): typeof billing_insurances => billing_insurances)
    public insurance: typeof billing_insurances;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @ForeignKey((): typeof kiosk_cases => kiosk_cases)
    @Column
    public case_id: number;
    
    @ForeignKey((): typeof billing_insurances => billing_insurances)
    @Column
    public insurance_id: number;
    
    @Column
    public insurance_location_id: number;
    
    @Column
    public insurance_plan_name_id: number;
    
    @Column
    public adjustor_id: number;
    
    @Column
    public insured: string;
    
    @Column
    public first_name: string;
    
    @Column
    public middle_name: string;
    
    @Column
    public last_name: string;
    
    @Column
    public gender: string;
    
    @Column
    public dob: Date;
    
    @Column
    public ssn: string;
    
    @Column
    public claim_no: string;
    
    @Column
    public policy_no: string;
    
    @Column
    public wcb_no: string;
    
    @Column
    public contact_person_relation_id: number;
    
    @Column
    public member_id: string;
    
    @Column
    public group_no: string;
    
    @Column
    public type: string;
    
    @Column
    public other_relation_description: string;
    
    @Column
    public phone_no: string;
    
    @Column
    public confirmed_for_billing: boolean;
    
    @Column
    public prior_authorization_no: string;
    
    @Column
    public is_policy_holder: boolean;
    
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
