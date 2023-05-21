import * as models from '../models';
import { BaseRepository } from '../shared/base-repository';
import { ANY } from '../shared/common';

/**
 * Appointment Repository Class
 */
export class AppointmentRepository extends BaseRepository<models.sch_appointments> {

    private readonly joinClause: { [key: string]: ANY };

    /**
     * constructor
     * @param appointments
     */
    public constructor(protected appointments: typeof models.sch_appointments) {
        super(appointments);
        this.joinClause = {
            get_appointment_list_mandatory: [
                {
                    model: models.kiosk_case_types,
                    as: 'caseType',
                    required: false,
                    where: {
                        deleted_at: null
                    }
                },
                {
                    as: 'availableDoctor',
                    include: [
                        {
                            as: 'facilityLocations',
                            model: models.facility_locations,
                            required: false,
                        },
                    ],
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'patient',
                    model: models.kiosk_patient,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.physician_clinics,
                    as: 'physicianClinic',
                    attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                    required: false,
                    where: { deleted_at: null },
                    include: [
                        {
                            model: models.physicians,
                            as: 'physician',
                            attributes: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        {
                            model: models.clinics,
                            as: 'clinic',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        },
                        {
                            model: models.clinic_locations,
                            as: 'clinicLocation',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                },
                {
                    model: models.users,
                    as: 'technician',
                    required: false,
                    attributes: ['id','email'],
                    include: {
                        model: models.user_basic_info
                    },
                    where: { deleted_at: null }
                },
                {
                    model: models.users,
                    as: 'readingProvider',
                    required: false,
                    attributes: ['id', 'email'],
                    include: {
                        model: models.user_basic_info
                    },
                    deleted_at: null
                },
                {
                    model: models.sch_transportations,
                    as: 'transportations',
                    required: false,
                    where: { deleted_at: null }
                },
                {
                    model: models.sch_appointment_cpt_codes,
                    as: 'appointmentCptCodes',
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_codes,
                        as: 'billingCode',
                        required: false,
                        where: { deleted_at: null },
                    },
                }
            ],
            get_appointment_list_optional: {
                as: 'availableSpeciality',
                include: [
                    {
                        as: 'facilityLocation',
                        model: models.facility_locations,
                        required: false,
                        where: { deleted_at: null },
                    },
                    {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null },
                    }
                ],
                model: models.sch_available_specialities,
                required: false,
                where: {
                    deleted_at: null,
                }
            },
            get_appointment_mandatory: [
                {
                    as: 'case',
                    attributes:['id'],
                    model: models.kiosk_cases,
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_case_status,
                        as: 'caseStatus',
                        attributes: ['id', 'name']
                    }
                },
                {
                    as: 'patientSessions',
                    include: {
                        as: 'visitStatus',
                        attributes: ['name', 'slug'],
                        model: models.kiosk_case_patient_session_statuses,
                        required: true,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.kiosk_case_types,
                    as: 'caseType',
                    required: false,
                    where: {
                        deleted_at: null
                    }
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'patient',
                    model: models.kiosk_patient,
                    required: true,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.physician_clinics,
                    as: 'physicianClinic',
                    attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                    required: false,
                    where: { deleted_at: null },
                    include: [
                        {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        {
                            model: models.clinics,
                            as: 'clinic',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        },
                        {
                            model: models.clinic_locations,
                            as: 'clinicLocation',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                },
                {
                    model: models.users,
                    as: 'technician',
                    required: false,
                    attributes: ['id','email'],
                    include: {
                        model: models.user_basic_info
                    },
                    where: { deleted_at: null }
                },
                {
                    model: models.users,
                    as: 'readingProvider',
                    required: false,
                    attributes: ['id', 'email'],
                    include: {
                        model: models.user_basic_info
                    },
                    deleted_at: null
                },
                {
                    model: models.sch_transportations,
                    as: 'transportations',
                    required: false,
                    where: { deleted_at: null }
                },
                {
                    model: models.sch_appointment_cpt_codes,
                    as: 'appointmentCptCodes',
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_codes,
                        as: 'billingCode',
                        required: false,
                        where: { deleted_at: null },
                    },
                }
            ],
            get_doctor_appointments: [
                {
                    as: 'patient',
                    model: models.kiosk_patient,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'priority',
                    model: models.sch_appointment_priorities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentVisit',
                    include: {
                        as: 'visitState',
                        model: models.visit_session_states,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    model: models.visit_sessions,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            ],
            get_patient_appointments: [
                {
                    as: 'availableDoctor',
                    include: [
                        {
                            as: 'facilityLocations',
                            include: {
                                as: 'facility',
                                model: models.facilities,
                                required: false,
                                where: { deleted_at: null },
                            },
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include: [
                                {
                                    as: 'userBasicInfo',
                                    model: models.user_basic_info,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                                {
                                    as: 'userFacilities',
                                    include: {
                                        as: 'speciality',
                                        model: models.specialities,
                                        required: false,
                                        where: { deleted_at: null },
                                    },
                                    model: models.user_facility,
                                    required: false,
                                    where: { deleted_at: null },
                                },
                            ],
                            model: models.users,
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.sch_available_doctors,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'availableSpeciality',
                    include: [
                        {
                            as: 'speciality',
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        },
                        {
                            as: 'facilityLocation',
                            include: {
                                as: 'facility',
                                model: models.facilities,
                                required: false
                            },
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.sch_available_specialities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'priority',
                    model: models.sch_appointment_priorities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'patientSessions',
                    include: {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                }
            ],
            get_speciality_appointments: [
                {
                    as: 'patient',
                    model: models.kiosk_patient,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'priority',
                    model: models.sch_appointment_priorities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentType',
                    model: models.sch_appointment_types,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentStatus',
                    model: models.sch_appointment_statuses,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'availableSpeciality',
                    include: {
                        as: 'speciality',
                        model: models.specialities,
                        required: false,
                        where: { deleted_at: null },
                    },
                    model: models.sch_available_specialities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'appointmentVisit',
                    include: {
                        as: 'visitState',
                        model: models.visit_session_states,
                        required: false,
                        where: {
                            deleted_at: null,
                        }
                    },
                    model: models.visit_sessions,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.physician_clinics,
                    as: 'physicianClinic',
                    attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                    required: false,
                    where: { deleted_at: null },
                    include: [
                        {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        {
                            model: models.clinics,
                            as: 'clinic',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        },
                        {
                            model: models.clinic_locations,
                            as: 'clinicLocation',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                },
                {
                    model: models.users,
                    as: 'technician',
                    required: false,
                    attributes: ['id','email'],
                    include: {
                        model: models.user_basic_info
                    },
                    where: { deleted_at: null }
                },
                {
                    model: models.users,
                    as: 'readingProvider',
                    required: false,
                    attributes: ['id', 'email'],
                    include: {
                        model: models.user_basic_info
                    },
                    deleted_at: null
                },
                {
                    model: models.sch_transportations,
                    as: 'transportations',
                    required: false,
                    where: { deleted_at: null }
                },
                {
                    model: models.sch_appointment_cpt_codes,
                    as: 'appointmentCptCodes',
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_codes,
                        as: 'billingCode',
                        required: false,
                        where: { deleted_at: null },
                    },
                }
            ],
            get_patient_history_appointments: [
                {
                    model: models.kiosk_patient,
                    require: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'patientSessions',
                    include: {
                        as: 'visitStatus',
                        model: models.kiosk_case_patient_session_statuses,
                        required: false,
                        where: {
                            deleted_at: null,
                        },
                    },
                    model: models.kiosk_case_patient_session,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.sch_appointment_statuses,
                    required: false,
                    as: 'appointmentStatus',
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    model: models.sch_appointment_types,
                    required: false,
                    as: 'appointmentType',
                    where: {
                        deleted_at: null
                    }
                },
                {
                    model: models.kiosk_case_types,
                    as: 'caseType',
                    required: false,
                    where: {
                        deleted_at: null
                    }
                },
                {
                    model: models.sch_appointment_priorities,
                    as: 'priority',
                    required: false,
                    where: {
                        deleted_at: null
                    }
                },
                {
                    as: 'availableSpeciality',
                    include: [
                        {
                            as: 'facilityLocation',
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                            include: {
                                model: models.facilities,
                                as: 'facility',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        },
                        {
                            as: 'speciality',
                            model: models.specialities,
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.sch_available_specialities,
                    required: false,
                    where: {
                        deleted_at: null,
                    }
                },
                {
                    as: 'availableDoctor',
                    include: [
                        {
                            as: 'availableSpeciality',
                            include: {
                                as: 'speciality',
                                model: models.specialities,
                                required: false,
                                where: { deleted_at: null },
                            },
                            model: models.sch_available_specialities,
                            required: false,
                            where: {
                                deleted_at: null,
                            }
                        },
                        {
                            as: 'facilityLocations',
                            model: models.facility_locations,
                            required: false,
                            where: { deleted_at: null },
                            include: {
                                model: models.facilities,
                                as: 'facility',
                                required: false,
                                where: {
                                    deleted_at: null
                                }
                            }
                        },
                        {
                            as: 'doctor',
                            attributes: { exclude: ['password'] },
                            include: {
                                model: models.user_basic_info,
                                as: 'userBasicInfo',
                                required: false,
                                where: { deleted_at: null }
                            },
                            model: models.users,
                            required: false,
                            where: { deleted_at: null },
                        }
                    ],
                    model: models.sch_available_doctors,
                    required: false,
                    where: { deleted_at: null },
                },
                {
                    model: models.physician_clinics,
                    as: 'physicianClinic',
                    attributes: ['id', 'clinic_id', 'clinic_locations_id', 'physician_id'],
                    required: false,
                    where: { deleted_at: null },
                    include: [
                        {
                            model: models.physicians,
                            as: 'physician',
                            attribute: ['id', 'first_name', 'last_name', 'middle_name', 'cell_no', 'email', 'npi_no', 'license_no'],
                            required: false,
                            where: { deleted_at: null }
                        },
                        {
                            model: models.clinics,
                            as: 'clinic',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        },
                        {
                            model: models.clinic_locations,
                            as: 'clinicLocation',
                            required: false,
                            where: {
                                deleted_at: null
                            }
                        }
                    ]
                },
                {
                    model: models.users,
                    as: 'readingProvider',
                    required: false,
                    attributes: ['id', 'email'],
                    include: {
                        model: models.user_basic_info
                    },
                    deleted_at: null
                },
                {
                    model: models.sch_transportations,
                    required: false,
                    where: {
                        deleted_at: null
                    }
                },
                {
                    model: models.sch_appointment_cpt_codes,
                    as: 'appointmentCptCodes',
                    required: false,
                    where: { deleted_at: null },
                    include: {
                        model: models.billing_codes,
                        as: 'billingCode',
                        required: false,
                        where: { deleted_at: null },
                    }
                }
            ]
        };
    }

    /**
     *
     * @param arr
     * @param alias
     * @param __where
     */
    public appendWhereClause = (arr: ANY, alias: string, __where: ANY): { [key: string]: ANY } | ANY =>
        arr.map((i: ANY): ANY => {
            if (i.as === alias) {
                i.where = { ...__where };
            }
            return i;
        })

    /**
     *
     * @param apiName
     */
    public getJoinClause = (apiName: string): { [key: string]: ANY } | ANY =>
        this.joinClause[apiName]

}
