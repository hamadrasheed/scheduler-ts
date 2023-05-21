import { sequelize } from '../config/database';

import { ANY } from './common';

export class Query {

    private temp: ANY

    public constructor(private readonly model: ANY) {
        this.temp = JSON.stringify(this.model);
    }

    public UpdateRecordWithUniqueClause = async (dataArray: ANY): Promise<ANY> => {

        const values = dataArray.map(row =>  `(${row.join(',')})`).join(',');

        // sequelize.query(`update ${this.model} as c set
        //     name = c2.name
        // from (values
        //     ${values}
        // ) as c2(id, name)
        // where c2.id = c.id`);

        sequelize.query(`update customers_table as c set slots = c2.no_of_slots from (values (?),(?)) as c2(id, name)
            where c2.id = c.id`, { replacements: values })
    }

}
