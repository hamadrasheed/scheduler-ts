import * as typings from './common';

export class TemplateGenerator {

    protected createAppointmentTemplate = (data: typings.ANY): string => {
        const tableView: string = this.getTableView(data);
        return `
        ${this.getFormatedEmailHeader(data.patientLastName)}<br>
        ${this.getAppointmentDescription(data.timeSlot, data.scheduledDateTime, data.endDateTime, data.reason)}<br>
        More Details :<br><br>
        <table>
            ${tableView}
        </table>`;
    }

    private readonly getAppointmentDescription = (timeSlot: number, scheduledDateTime: Date, endDateTime: Date, reason: string): string => `Your appointment of ${timeSlot} Minutes form '${scheduledDateTime.toLocaleString()}' to '${endDateTime.toLocaleString()}' has been ${reason}.`;

    private readonly getFormatedEmailHeader = (name: string): string => `Dear <b>${name}</b>`;

    private readonly getRowView = (data: typings.ANY): string => `<tr style='border:1px solid black'><td style='width:15%'> &nbsp; <b>${data.name}</b> </td><td style='width:30%'>${data.value} &nbsp; </td></tr>`;

    private readonly getTableView = (data: typings.ANY): string => {
        let rows: string = '';

        if (data.caseId) {
            rows = `${rows}<br>${this.getRowView({name: 'Case Id', value: data.caseId })}`;
        }

        if (data.caseType) {
            rows = `${rows}<br>${this.getRowView({name: 'Case Type', value: data.caseType })}`;
        }

        if (data.scheduledDateTime) {
            rows = `${rows}<br>${this.getRowView({name: 'New Appointment Time', value: data.scheduledDateTime })}`;
        }

        if (data.appointmentTitle) {
            rows = `${rows}<br>${this.getRowView({name: 'Title', value: data.appointmentTitle })}`;
        }

        if (data.speciality) {
            rows = `${rows}<br>${this.getRowView({name: 'Speciality', value: data.speciality })}`;
        }

        if (data.doctor) {
            rows = `${rows}<br>${this.getRowView({name: 'Provider', value: data.doctor })}`;
        }

        if (data.confirmationStatus) {
            rows = `${rows}<br>${this.getRowView({name: 'Confirmation Status', value: data.confirmationStatus })}`;
        }

        if (data.appointmentStatus) {
            rows = `${rows}<br>${this.getRowView({name: 'Appointment Status', value: data.appointmentStatus })}`;
        }

        if (data.appointmentId) {
            rows = `${rows}<br>${this.getRowView({name: 'Refrence Id', value: data.appointmentId })}`;
        }

        return rows;
    }
}
