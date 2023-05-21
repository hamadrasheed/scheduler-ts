import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface technician_supervisors {
    created_at: Date;
    created_by: number;
    deleted_at: Date;
    facility_location_id: number;
    id: number;
    supervisor_id: number;
    technician_id: number;
    updated_at: Date;
    updated_by: number;
}

@Table({
    modelName: 'technician_supervisors',
    tableName: 'technician_supervisors',
    timestamps: false
})
export class technician_supervisors extends Model<technician_supervisors> {

    @Column
    public created_at: Date;

    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @Column
    public facility_location_id: number;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public supervisor_id: number;

    @Column
    public technician_id: number;

    @Column
    public updated_at: Date;

    @Column
    public updated_by: number;

}
