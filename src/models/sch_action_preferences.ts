import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { sch_action_preferences_types, sch_action_preferences_typesI, sch_action_preference_forward_facility_location, sch_action_preference_forward_facility_locationI } from '.';

export interface sch_action_preferencesI {
    actionPreferencesFacilityLocations: sch_action_preference_forward_facility_locationI[];
    actionPreferencesType: sch_action_preferences_typesI;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    facility_location_type: number;
    id: number;
    key: number;
    type_id: number;
    updated_at: Date;
    updated_by: number;
    user_id: number;
}

@Table({
    modelName: 'sch_action_preferences',
    tableName: 'sch_action_preferences',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_action_preferences extends Model<sch_action_preferencesI> {

    @HasMany((): typeof sch_action_preference_forward_facility_location => sch_action_preference_forward_facility_location)
    public actionPreferencesFacilityLocations: typeof sch_action_preference_forward_facility_location;

    @BelongsTo((): typeof sch_action_preferences_types => sch_action_preferences_types)
    public actionPreferencesType: typeof sch_action_preferences_types;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public facility_location_type: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public key: number;

    @ForeignKey((): typeof sch_action_preferences_types => sch_action_preferences_types)
    @Column
    public type_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

    @Column
    public user_id: number;
}
