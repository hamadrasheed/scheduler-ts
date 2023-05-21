import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    users,
    user_facility,
    visit_sessions
} from '.';
import { speciality_visit_types, speciality_visit_typesI } from './speciality_visit_types';
import { user_facilityI } from './user_facility';

export interface specialitiesI {
    comments?: string;
    created_at?: Date;
    created_by?: number;
    default_name?: string;
    deleted_at?: Date;
    description?: string;
    qualifier?:string;
    has_app?: number;
    id?: number;
    is_available?: number;
    is_create_appointment?: number;
    is_defualt?: number;
    name?: string;
    over_booking?: number;
    speciality_key?: string;
    time_slot?: number;
    updated_at?: Date;
    updated_by?: number;
    userFacilty?: user_facilityI[];
    is_multiple_visit?: number;
    specialityVisitType?: speciality_visit_typesI

}

@Table({
    modelName: 'specialities',
    tableName: 'specialities',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class specialities extends Model<specialitiesI> {

    @Column
    public comments: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public default_name: string;

    @Column
    public deleted_at: Date;

    @Column
    public description: string;
    @Column
    public has_app: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_available: number;

    @Column
    public is_create_appointment: number;

    @Column
    public is_defualt: number;

    @Column
    public name: string;

    @Column
    public qualifier: string;


    @Column
    public over_booking: number;

    @Column
    public speciality_key: string;

    @Column
    public time_slot: number;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @Column
    public is_multiple_visit: number

    @HasMany((): typeof user_facility => user_facility)
    public userFacilty: typeof user_facility;

    @BelongsTo((): typeof users => users, 'created_by')
    public created_by_user: typeof users;

    @BelongsTo((): typeof users => users, 'updated_by')
    public updated_by_user: typeof users;

    @HasOne((): typeof visit_sessions => visit_sessions)
    public visitSessions: typeof visit_sessions;

    @HasMany((): typeof speciality_visit_types => speciality_visit_types)
    public specialityVisitType : typeof speciality_visit_types;

}
