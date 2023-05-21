import { sch_appointment_cancellation_comments } from '../models/sch_appointment_cancellation_comments';
import {
    appointmentCancellationCommentRepository
} from '../repositories';
import { Frozen, Helper, Http } from '../shared';

@Frozen
export class AppointmentCancellationCommentService extends Helper {

    public __http: Http;

    /**
     *
     * @param __repo
     * @param http
     */
    public constructor(
        public __repo: typeof appointmentCancellationCommentRepository,
        public http: typeof Http
    ) {
        super();
        this.__http = new http();
    }

    /**
     *
     * @param data
     * @param _authorization
     */
    public getAll = async (_authorization: string): Promise<sch_appointment_cancellation_comments[]> =>
        this.__repo.findAll()

}
