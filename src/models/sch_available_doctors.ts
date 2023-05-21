import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    facility_locations,
    facility_locationsI,
    sch_appointments,
    sch_appointmentsI,
    sch_available_specialities,
    sch_recurrence_date_lists,
    sch_recurrence_date_listsI,
    sch_recurrence_day_lists,
    users,
    usersI,
} from '.';
import { sch_available_specialitiesI } from './sch_available_specialities';

export interface sch_available_doctorsI {
    appointments?: sch_appointmentsI[];
    available_speciality_id?: number;
    availableSpeciality?: sch_available_specialitiesI;
    created_at?: Date;
    created_by?: number;
    dateList?: sch_recurrence_date_listsI[];
    deleted_at?: Date;
    doctor?: usersI;
    doctor_id?: number;
    end_date?: Date;
    facility_location_id?: number;
    facilityLocations?: facility_locationsI;
    id?: number;
    is_provider_assignment?: boolean;
    key?: number;
    no_of_slots?: number;
    start_date?: Date;
    supervisor_id?: number;
    updated_at?: Date;
    updated_by?: number;

}

@Table({
    modelName: 'sch_available_doctors',
    tableName: 'sch_available_doctors',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_available_doctors extends Model<sch_available_doctorsI> {

    @HasMany((): typeof sch_appointments => sch_appointments)
    public appointments: typeof sch_appointments;

    @ForeignKey((): typeof sch_available_specialities => sch_available_specialities)
    @Column
    public available_speciality_id: number;

    @BelongsTo((): typeof sch_available_specialities => sch_available_specialities)
    public availableSpeciality: typeof sch_available_specialities;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @HasMany((): typeof sch_recurrence_date_lists => sch_recurrence_date_lists)
    public dateList: typeof sch_recurrence_date_lists;

    @HasMany((): typeof sch_recurrence_day_lists => sch_recurrence_day_lists)
    public dayList: typeof sch_recurrence_day_lists;

    @Column
    public deleted_at: Date;

    @BelongsTo((): typeof users => users)
    public doctor: typeof users;

    @ForeignKey((): typeof users => users)
    @Column
    public doctor_id: number;

    @Column
    public end_date: Date;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public facility_location_id: number;

    @BelongsTo((): typeof facility_locations => facility_locations)
    public facilityLocations: typeof facility_locations;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    is_provider_assignment: boolean;

    @Column
    public key: number;

    @Column
    public no_of_slots: number;

    @Column
    public start_date: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public supervisor_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
