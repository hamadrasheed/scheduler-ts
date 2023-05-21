import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { facility_locations } from '.';

export interface facility_timingsI {
    created_at: Date;
    created_by: number;
    day_id: number;
    deleted_at: Date;
    end_time: Date;
    end_time_isb: Date;
    facility_location_id: number;
    id: number;
    start_time: Date;
    start_time_isb: Date;
    time_zone: number;
    time_zone_string: string;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'facility_timings',
    tableName: 'facility_timings',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class facility_timings extends Model<facility_timingsI> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public day_id: number;

    @Column
    public deleted_at: Date;

    @Column
    public end_time: Date;

    @Column
    public end_time_isb: Date;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public facility_location_id: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public start_time: Date;

    @Column
    public start_time_isb: Date;

    @Column
    public time_zone: number;

    @Column
    public time_zone_string: string;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
