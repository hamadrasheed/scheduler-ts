import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { 
    billing_case_status,
    billing_case_statusI, 
    kiosk_case_insurances, 
    kiosk_case_insurancesI, 
    kiosk_case_accident_informations, 
    kiosk_case_accident_informationsI, 
    kiosk_case_categories, 
    kiosk_case_categoriesI, 
    kiosk_case_contact_persons, 
    kiosk_case_contact_personsI, 
    kiosk_case_employers, 
    kiosk_case_employersI, 
    kiosk_case_purpose_of_visit, 
    kiosk_case_purpose_of_visitI, 
    kiosk_case_types, 
    kiosk_case_typesI, 
    kiosk_patient, 
    kiosk_patientI,
} from '.';

export interface kiosk_casesI {
    case_type_id: kiosk_case_typesI;
    caseAccidentInformation: kiosk_case_accident_informationsI;
    caseContactPersons: kiosk_case_contact_personsI[];
    caseStatus: any;
    creation_source: number;
    casePurposeOfVisit?: kiosk_case_purpose_of_visitI;
    date_of_admission?: Date;
    caseEmployers?: kiosk_case_employersI[];
    caseInsurances?: kiosk_case_insurancesI[];
    category?: kiosk_case_categoriesI;
    caseType?: kiosk_case_typesI;
    category_id: number;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    is_active: boolean;
    is_transferring_case: boolean;
    key: number;
    patient_id: kiosk_patientI;
    purpose_of_visit_id: number;
    status_id: billing_case_statusI;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'kiosk_cases',
    tableName: 'kiosk_cases',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class kiosk_cases extends Model<kiosk_casesI> {

    @ForeignKey((): typeof kiosk_case_types => kiosk_case_types)
    @Column
    public case_type_id: number;

    @HasMany((): typeof kiosk_case_employers => kiosk_case_employers)
    public caseEmployers: typeof kiosk_case_employers;

    @HasMany((): typeof kiosk_case_insurances => kiosk_case_insurances)
    public caseInsurances: typeof kiosk_case_insurances;

    @BelongsTo((): typeof kiosk_case_types => kiosk_case_types)
    public caseType: typeof kiosk_case_types;

    @HasOne((): typeof kiosk_case_accident_informations => kiosk_case_accident_informations)
    public caseAccidentInformation: typeof kiosk_case_accident_informations;

    @HasMany((): typeof kiosk_case_contact_persons => kiosk_case_contact_persons)
    public caseContactPersons: typeof kiosk_case_contact_persons;

    @BelongsTo((): typeof kiosk_case_purpose_of_visit => kiosk_case_purpose_of_visit)
    public casePurposeOfVisit: typeof kiosk_case_purpose_of_visit;

    @BelongsTo((): typeof billing_case_status => billing_case_status)
    public caseStatus: typeof billing_case_status;

    @BelongsTo((): typeof kiosk_case_categories => kiosk_case_categories)
    public category: typeof kiosk_case_categories;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public date_of_admission?: Date;

    @ForeignKey((): typeof kiosk_case_categories => kiosk_case_categories)
    @Column
    public category_id: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_active: boolean;

    @Column
    creation_source: number;

    @Column
    public is_transferring_case: boolean;

    @Column
    public key: number;

    @BelongsTo((): typeof kiosk_patient => kiosk_patient)
    public patient: typeof kiosk_patient;

    @ForeignKey((): typeof kiosk_patient => kiosk_patient)
    @Column
    public patient_id: number;

    @ForeignKey((): typeof kiosk_case_purpose_of_visit => kiosk_case_purpose_of_visit)
    @Column
    public purpose_of_visit_id: number;

    @ForeignKey((): typeof billing_case_status => billing_case_status)
    @Column
    public status_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
