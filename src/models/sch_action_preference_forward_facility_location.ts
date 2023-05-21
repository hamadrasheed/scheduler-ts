import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { sch_action_preferences } from './sch_action_preferences';

export interface sch_action_preference_forward_facility_locationI {
    action_preference_id: number;
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    id: number;
    origin_id: number;
    target_id: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'sch_action_preference_forward_facility_location',
    tableName: 'sch_action_preference_forward_facility_location',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
})
export class sch_action_preference_forward_facility_location extends Model<sch_action_preference_forward_facility_locationI> {

    @ForeignKey((): typeof sch_action_preferences => sch_action_preferences)
    @Column
    public action_preference_id: number;

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public origin_id: number;

    @Column
    public target_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;
}
