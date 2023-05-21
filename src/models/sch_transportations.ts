import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';

import {
    sch_appointments,
    users
} from '.';

export interface sch_transportationI {
    appointment_id?: number;
    city?: string;
    comments?: string;
    created_by?: number;
    deleted_at?: Date;
    id: number;
    is_dropoff?: boolean;
    is_pickup?: boolean;
    phone?: string;
    state?: string;
    street_address?: string;
    suit?: string;
    type: string;
    updated_at?: Date;
    updated_by?: number;
    zip?: string;
}

@Table({
    modelName: 'sch_transportations',
    tableName: 'sch_transportations',
    timestamps: false
})
export class sch_transportations extends Model<sch_transportationI> {

    @Column
    public city: string;

    @Column
    public comments: string;

    @Column
    public created_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public created_by: number;

    @Column
    public deleted_at: Date;

    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @Column
    public is_pickup: boolean;

    @Column
    public is_dropoff: boolean;

    @Column
    public phone: string;

    @ForeignKey((): typeof sch_appointments => sch_appointments)
    @Column
    public appointment_id: number;

    @Column
    public state: string;

    @Column
    public street_address: string;

    @Column
    public suit: string;

    @Column
    public type: string;

    @Column
    public updated_at: Date;

    @ForeignKey((): typeof users => users)
    @Column
    public updated_by: number;

    @Column
    public zip: string;
}
