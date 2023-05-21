import * as models from '../models';
import { generateMessages } from '../utils';

import * as typings from './common';
import { TemplateGenerator } from './template-generator';

export class Helper extends TemplateGenerator {

    private readonly templateMethod: { [key: string]: string } = {
        createAppointment: 'createAppointmentTemplate'
    };

    /**
     *
     * @param keys
     * @param obj
     */
    protected deleteAttributes = <K, T>(keys: K[], obj: T): T => {

        if (!obj || !Object.keys(obj).length) {
            return null;
        }

        if (keys.length) {
            for (const key of keys) {
                // tslint:disable-next-line: no-dynamic-delete
                delete obj[String(key)];
            }
            return obj;
        }

        // tslint:disable-next-line: no-dynamic-delete
        delete obj[String(keys)];
    }

    /**
     *
     * @param arr
     */
    protected filterNonEmpty = <T>(arr: T[]): T[] => arr.filter((value: T): boolean => JSON.stringify(value) !== '[]');

    /**
     *
     * @param arr
     */
    protected filterNonNull = <T>(arr: T[]): T[] => arr.filter((e: T): boolean => e !== null && e !== undefined);

    /**
     *
     * @param data
     */
    protected filterUnique = <T>(data: T[]): T[] => data.filter((v: T, i: number, a: T[]): boolean => a.indexOf(v) === i);

    /**
     *
     * @param type
     * @param data
     */
    protected getFormatedEmailBody = (type: string, data: typings.ANY): string => this[this.templateMethod[type]](data);

    /**
     *
     * @param assignment
     * @param appointments
     * @param overbooking
     * @param timeSlot
     * @param wantOverBooking
     * @param unavailability
     */
    protected getFreeSlotsForAutoResolveAppointment = (assignment: models.sch_recurrence_date_listsI, appointments: models.sch_appointmentsI[], overbooking?: number, timeSlot?: number, wantOverBooking?: boolean, unavailability?: models.sch_unavailable_doctorsI[]): typings.FreeSlotsI[][] => {

        const freeSlots: typings.FreeSlotsI[] = [];
        let finalFreeSlots: typings.FreeSlotsI[] = [];

        const assignmentStartDate: Date = new Date(assignment.start_date);
        const assignmentEndDate: Date = new Date(assignment.end_date);

        while (assignmentStartDate.getTime() !== assignmentEndDate.getTime() && !(assignmentStartDate.getTime() > assignmentEndDate.getTime())) {

            const slotEnd: Date = assignmentStartDate;
            slotEnd.setMinutes(slotEnd.getMinutes() + timeSlot);

            if (slotEnd.getTime() <= assignmentEndDate.getTime()) {
                freeSlots.push({ startDateTime: new Date(assignmentStartDate), count: overbooking });
            }

            assignmentStartDate.setMinutes(assignmentStartDate.getMinutes() + timeSlot);

        }

        if (appointments && appointments.length) {

            for (const appoint of appointments) {

                const appStart: Date = new Date(appoint?.scheduled_date_time);
                const appEnd: Date = new Date(appoint?.scheduled_date_time);

                appEnd.setMinutes(appEnd.getMinutes() + appoint?.time_slots);

                freeSlots.find((a: typings.FreeSlotsI, i: number): void => {
                    if (appStart.getTime() <= a.startDateTime.getTime() && a.startDateTime.getTime() < appEnd.getTime() && appoint?.deleted_at === null) {
                        freeSlots[i].count -= 1;
                    }
                });
            }

        }

        if (wantOverBooking) {

            finalFreeSlots = freeSlots.filter((d: typings.FreeSlotsI): Date => {
                if (d.count === overbooking) {

                    let availableSlot: models.sch_unavailable_doctorsI;
                    const slotEndTime: Date = new Date(d.startDateTime);
                    slotEndTime.setMinutes(slotEndTime.getMinutes() + timeSlot);

                    if (unavailability && unavailability.length) {

                        availableSlot = unavailability.find((s: models.sch_unavailable_doctorsI): models.sch_unavailable_doctorsI => {

                            // tslint:disable-next-line: max-line-length
                            if ((new Date(d.startDateTime).getTime() >= new Date(s.start_date).getTime() && new Date(d.startDateTime).getTime() < new Date(s.end_date).getTime()) || (new Date(slotEndTime).getTime() >= new Date(s.start_date).getTime() && new Date(slotEndTime).getTime() < new Date(s.end_date).getTime())) {
                                return s;
                            }

                        });
                    }

                    if (!availableSlot) {
                        return d.startDateTime;
                    }

                }
            });
        } else {

            finalFreeSlots = freeSlots.filter((d: typings.FreeSlotsI): Date => {
                if (d.count > 0) {
                    for (let k: number = 0; k < d.count; k += 1) {
                        let availableSlot: models.sch_unavailable_doctorsI;
                        const slotEndTime: Date = new Date(d.startDateTime);
                        slotEndTime.setMinutes(slotEndTime.getMinutes() + timeSlot);

                        if (unavailability && unavailability.length) {

                            availableSlot = unavailability.find((s: models.sch_unavailable_doctorsI): models.sch_unavailable_doctorsI => {
                                // tslint:disable-next-line: max-line-length
                                if ((new Date(d.startDateTime).getTime() >= new Date(s.start_date).getTime() && new Date(d.startDateTime).getTime() < new Date(s.end_date).getTime()) || (new Date(slotEndTime).getTime() >= new Date(s.start_date).getTime() && new Date(slotEndTime).getTime() < new Date(s.end_date).getTime())) {
                                    return s;
                                }
                            });
                        }

                        if (!availableSlot) {
                            return d.startDateTime;
                        }
                    }
                }
            });
        }

        return [finalFreeSlots, freeSlots];

    }

    /**
     *
     * @param data
     * @param field
     */
    protected groupByType = <T, Y>(data: T[], field: string): Y[] => data.reduce((acc: Y[], c: T): typings.ANY => {
            const type: string = c[`${field}`];
            acc[type] ? acc[type].push(c) : (acc[type] = [c]);
            return acc;
        },                                                                       {})

    /**
     *
     * @param array
     * @param page_size
     * @param page_number
     */
    protected paginate = <T, Y>(array: T[], page_size: number, page_number: number): T[] => array.slice((page_number - 1) * page_size, page_number * page_size);

    // tslint:disable-next-line: max-line-length
    protected sentAppointmentsToFD = async (appointmentIds: number[], userId: number, originClinicId: number, targetClinicId: number, __modelHasRolesRepo: typings.ANY, __userFacilityRepo: typings.ANY, __http: typings.ANY, __repo: typings.ANY, Op: typings.ANY, comments?: typings.ANY, _authorization?: string): Promise<typings.ForwardAppointmentsToFDResponseI> => {

        const facilityLocationIds: number[] = [];

        const clinicIds: number[] = [];

        if (originClinicId && targetClinicId) {
            clinicIds.push(originClinicId);
            // tslint:disable-next-line: no-unused-expression
            originClinicId !== targetClinicId && facilityLocationIds.push(targetClinicId);
        }

        const modelHasRoles: typings.ModelRoleI = this.shallowCopy(await __modelHasRolesRepo.findOne(
            {
                model_id: userId
            },
            {
                include: { model: models.roles, as: 'role', required: false, }
            }
        ));

        const { role: userRole, role: { slug } } = modelHasRoles;

        if (userRole && slug !== 'super_admin') {

            const userFacilities: models.user_facility[] = this.shallowCopy(await __userFacilityRepo.findAll({ facility_location_id: { [Op.in]: facilityLocationIds }, user_id: userId, deleted_at: null }, { logging: true }));

            if (userFacilities.length !== facilityLocationIds.length) {

                throw generateMessages('NO_SUPER_ADMIN');
            }
        }

        const config: typings.GenericHeadersI = {
            headers: { Authorization: _authorization },
        };

        const { status } = await __http.put(`${process.env.KIOSK_URL}case-patient-session/remove-patient-sessions`, { appointment_ids: appointmentIds }, config);

        if (status !== 200) {
            throw generateMessages('ERROR_FROM_KIOSK');
        }

        const updatedAppoitments: models.sch_appointmentsI[] = await __repo.updateByIds(appointmentIds, { origin_facility_id: originClinicId, target_facility_id: targetClinicId, pushed_to_front_desk: 1, comments, updated_by: userId, updated_at: new Date(), cancelled: 0 });

        // await __http.webhook(`${process.env.SOCKET_SERVER_URL}appointment/change-in-appointments`, {}, config);

        return updatedAppoitments;

    }

    protected getTimezoneOffset(date: Date, tz: string) {
        const a: any = date.toLocaleString("ja", {timeZone: tz}).split(/[/\s:]/);
        a[1]--;
        const t1 = Date.UTC.apply(null, a);
        const t2 = new Date(date).setMilliseconds(0);
        return (t2 - t1) / 60 / 1000;
      }
    
    /**
     *
     * @param data
     */
    protected shallowCopy = <T>(data: T): T => JSON.parse(JSON.stringify(data));

    /**
     *
     * @param items
     * @param attribute
     */
    protected sort = <T, Y>(items: T[], attribute: Y): T[] => items.sort((a: T, b: T): number =>  a[`${String(attribute)}`] - b[`${String(attribute)}`]);

}
