import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    facility_locations,
    facility_locationsI,
    sch_appointments,
    sch_appointmentsI,
    sch_available_doctors,
    sch_available_doctorsI,
    sch_recurrence_date_lists,
    sch_recurrence_date_listsI,
    sch_recurrence_day_lists,
    sch_recurrence_day_listsI,
    sch_recurrence_ending_criterias,
    specialities,
    specialitiesI
} from '.';

export interface sch_available_specialitiesI {
    appointments?: sch_appointmentsI[];
    availableDoctors?: sch_available_doctorsI[];
    created_at?: Date;
    created_by?: number;
    dateList?: sch_recurrence_date_listsI[];
    dayList?: sch_recurrence_day_listsI[];
    deleted_at?: Date;
    end_after_occurences?: number;
    end_date?: Date;
    end_date_for_recurrence?: string;
    facility_location_id?: number;
    facilityLocation?: facility_locationsI;
    id?: number;
    key?: number;
    no_of_doctors?: number;
    no_of_slots?: number;
    number_of_entries?: number;
    recurrence_ending_criteria_id?: number;
    speciality?: specialitiesI;
    speciality_id?: number;
    start_date?: Date;
    updated_at?: Date;
    updated_by?: number;
    availableSpecialityDoctor?: sch_available_doctorsI;
}

@Table({
    modelName: 'sch_available_specialities',
    tableName: 'sch_available_specialities',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_available_specialities extends Model<sch_available_specialitiesI> {

    @HasMany((): typeof sch_appointments => sch_appointments)
    public appointments: typeof sch_appointments;

    @HasMany((): typeof sch_available_doctors => sch_available_doctors)
    public availableDoctors: typeof sch_available_doctors;

    @HasOne((): typeof sch_available_doctors => sch_available_doctors)
    public availableSpecialityDoctor: typeof sch_available_doctors;

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

    @Column
    public end_after_occurences: number;

    @Column
    public end_date: Date;

    @Column
    public end_date_for_recurrence: string;

    @ForeignKey((): typeof facility_locations => facility_locations)
    @Column
    public facility_location_id: number;

    @BelongsTo((): typeof facility_locations => facility_locations)
    public facilityLocation: typeof facility_locations;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @Column
    public no_of_doctors: number;

    @Column
    public no_of_slots: number;

    @Column
    public number_of_entries: number;

    @ForeignKey((): typeof sch_recurrence_ending_criterias => sch_recurrence_ending_criterias)
    @Column
    public recurrence_ending_criteria_id: number;

    @BelongsTo((): typeof specialities => specialities)
    public speciality: typeof specialities;

    @ForeignKey((): typeof specialities => specialities)
    @Column
    public speciality_id: number;

    @Column
    public start_date: Date;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
