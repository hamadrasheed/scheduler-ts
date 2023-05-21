import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    facilities,
    facilitiesI,
    facility_timings,
    facility_timingsI,
    users
} from '.';
import { user_facility, user_facilityI } from './user_facility';

export interface facility_locationsI {

    address: string;
    cell_no: string;
    city: string;
    created_at: Date;
    created_by: number;
    day_list: string;
    deleted_at: Date;
    email: string;
    ext_no: string;
    facility?: facilitiesI;
    facility_id: number;
    faciltyTiming: facility_timingsI[];
    fax: string;
    qualifier?: string;
    floor: string;
    id: number;
    is_main: number;
    lat: number;
    long: number;
    name: string;
    office_hours_end: Date;
    office_hours_start: Date;
    phone: string;
    place_of_service_id: number;
    region_id: string;
    same_as_provider: number;
    state: string;
    updated_at: Date;
    updated_by: number;
    userFacilities?: user_facilityI[];
    zip: string;

}

@Table({
    modelName: 'facility_locations',
    tableName: 'facility_locations',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class facility_locations extends Model<facility_locationsI> {

    @Column
    public address: string;

    @Column
    public cell_no: string;

    @Column
    public city: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public day_list: string;

    @Column
    public deleted_at: Date;

    @Column
    public email: string;

    @Column
    public ext_no: string;
    @Column
    public qualifier: string;

    @BelongsTo((): typeof facilities => facilities)
    public facility: typeof facilities;

    @ForeignKey((): typeof facilities => facilities)
    @Column
    public facility_id: number;

    @HasMany((): typeof facility_timings => facility_timings)
    public faciltyTiming: typeof facility_timings;

    @Column
    public fax: string;

    @Column
    public floor: string;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_main: number;

    @Column
    public lat: number;

    @Column
    public long: number;

    @Column
    public name: string;

    @Column
    public office_hours_end: Date;

    @Column
    public office_hours_start: Date;

    @Column
    public phone: string;

    @Column
    public place_of_service_id: number;

    @Column
    public region_id: string;

    @Column
    public same_as_provider: number;

    @Column
    public state: string;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @BelongsTo((): typeof users => users, 'created_by')
    public created_by_user: typeof users;

    @BelongsTo((): typeof users => users, 'updated_by')
    public updated_by_user: typeof users;

    @HasMany((): typeof user_facility => user_facility)
    public userFacilities: typeof user_facility;

    @Column
    public zip: string;

}
