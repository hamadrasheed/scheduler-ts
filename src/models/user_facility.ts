import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    specialities,
    specialitiesI,
    users,
    usersI
} from '.';
import { facility_locations, facility_locationsI } from './facility_locations';

export interface user_facilityI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    facility_location_id: number;
    facilityLocation?: facility_locationsI;
    id: number;
    is_manual_specialty: number;
    is_primary: number;
    speciality: specialitiesI;
    speciality_id: number;
    updated_at: Date;
    updated_by: number;
    user_id: number;
    users?: usersI;
}

@Table({
    modelName: 'user_facility',
    tableName: 'user_facility',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class user_facility extends Model<user_facilityI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public facility_location_id: number ;

    @BelongsTo((): typeof facility_locations => facility_locations)
    public facilityLocation: typeof facility_locations;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_manual_specialty: number;

    @Column
    public is_primary: number;

    @BelongsTo((): typeof specialities => specialities)
    public speciality: typeof specialities;

    @ForeignKey((): typeof specialities => specialities)
    @Column
    public speciality_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @ForeignKey((): typeof users => users)
    @Column
    public user_id: number;

    @BelongsTo((): typeof users => users)
    public users: typeof users;
}
