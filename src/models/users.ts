import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    medical_identifiers,
    medical_identifiersI,
    model_has_roles,
    roles,
    rolesI,
    sch_color_codes,
    sch_color_codesI,
    user_basic_info,
    user_facility,
    user_facilityI,
    user_prefrences,
    user_prefrencesI,
    user_timings,
    user_timingsI,
} from '.';
import { model_has_rolesI } from './model_has_roles';

export interface usersI {
    allow_multiple_assignment: boolean;
    colorCodes: sch_color_codesI[];
    created_at?: Date;
    created_by?: number;
    deleted_at?: Date;
    email: string;
    id: number;
    is_loggedIn: number;
    password: string;
    remember_token?: string;
    reset_key: string;
    status: number;
    updated_at?: Date;
    updated_by?: number;
    userBasicInfo?: user_basic_info;
    userFacilities?: user_facilityI[];
    medicalIdentifiers?:medical_identifiersI;
    userRole?: model_has_rolesI;
    userTimings?: user_timingsI[];
}

@Table({
    modelName: 'users',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class users extends Model<usersI> {

    @Column
    public allow_multiple_assignment: boolean;

    @HasMany((): typeof sch_color_codes => sch_color_codes)
    public colorCodes: typeof sch_color_codes;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public email: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_loggedIn: number;

    @HasOne((): typeof medical_identifiers => medical_identifiers)
    public medicalIdentifiers: typeof medical_identifiers;

    @Column
    public password: string;

    @Column
    public remember_token: string;

    @Column
    public reset_key: string;

    @Column
    public status: number;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @HasOne((): typeof user_basic_info => user_basic_info)
    public userBasicInfo: typeof user_basic_info;

    @HasMany((): typeof user_facility => user_facility)
    public userFacilities: typeof user_facility;

    @HasOne((): typeof user_prefrences => user_prefrences)
    public userPrefrences: typeof user_prefrences;

    @HasOne((): typeof model_has_roles => model_has_roles)
    public userRole: typeof model_has_roles;

    @HasMany((): typeof user_timings => user_timings)
    public userTimings: typeof user_timings;

}
