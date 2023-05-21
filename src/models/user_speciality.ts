import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    specialities,
    specialitiesI,
    users,
    usersI
} from '.';
import { facility_locations, facility_locationsI } from './facility_locations';

export interface user_specialityI {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    facility_location_id: number;
    facilityLocation?: facility_locationsI;
    id: number;
    speciality: specialitiesI;
    specialty_id: number;
    updated_at: Date;
    updated_by: number;
    user_id: number;
    users?: usersI;
}

@Table({
    modelName: 'user_specialties',
    tableName: 'user_specialties',
    timestamps: false
})
export class user_speciality extends Model<user_specialityI> {

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

    @BelongsTo((): typeof specialities => specialities)
    public speciality: typeof specialities;

    @ForeignKey((): typeof specialities => specialities)
    @Column
    public specialty_id: number;

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
