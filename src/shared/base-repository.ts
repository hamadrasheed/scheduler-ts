import * as Sequelize from 'sequelize';

import { ANY, Filter, Options, SequelizeTransaction, Where } from './common';
import { Query } from './query';

const Op: Sequelize.OperatorsAliases = Sequelize.Op;

export interface BaseRepositoryI<T> {
    bulkCreate(data: T[]): Promise<T[]>;
    create(data: T): Promise<T>;
    destroy<K>(id?: number | null, where?: Where): Promise<K | null>;
    exists(identifier?: number | null, where?: Where): Promise<boolean>;
    findAll(filter?: Filter, options?: Options): Promise<T[] | null>;
    findById(identifier: number): Promise<T | null>;
    paginate<K>(options: Sequelize.FindOptions, currentPage: number, limitTo: number, optionsForCalculateTotal?: Sequelize.FindOptions): Promise<K | ANY>;
    update<K>(id: number, obj: K): Promise<K | null>;

}

export abstract class BaseRepository<T> implements BaseRepositoryI<T> {

    public raw: Query;
    // tslint:disable-next-line:no-any
    public constructor(private readonly model: any) {
        this.raw = new Query(this.model.name);
    }

    public async executeRawQuery<K>(sql): Promise<K | ANY> {
		return this.model.sequelize.query(sql);
    }

    public async getPaginate<K>(options: Sequelize.FindOptions, currentPage: number, limitTo: number, optionsForCalculateTotal?: Sequelize.FindOptions, include?: ANY): Promise<K | ANY> {

        const offset: number = (currentPage - 1) * limitTo;

        const results: any = await this.model.findAndCountAll({ ...options, offset, limit: limitTo, ...include });

        const lastPage: number = results?.count > 0 ? Math.ceil(results?.count / limitTo) : 0;

        const hasMorePages: boolean = currentPage < lastPage;

        return { no_of_pages: lastPage, total: results?.count, page_number: currentPage, is_last: !hasMorePages, docs: results?.rows };

    }

    public async appointmentpaginate<K>(options: Sequelize.FindOptions, currentPage: number, limitTo: number, optionsForCalculateTotal?: Sequelize.FindOptions, include?: ANY): Promise<K | ANY> {

        const offset: number = (currentPage - 1) * limitTo;

        const totalCount: Array<any> = await this.model.findAll({ ...options, ...include });

        const total: number = totalCount.filter(x=>x.toJSON().dateList?.availableDoctor || x.toJSON()?.dateList?.availableSpeciality).length;

        const results: Array<any> = await this.model.findAll({ ...options, offset, limit: limitTo, ...include });

        const tempResult:Array<any>=results.filter(x=>x.toJSON().dateList?.availableDoctor || x.toJSON()?.dateList?.availableSpeciality);

        const lastPage: number = total > 0 ? Math.ceil(total / limitTo) : 0;

        const hasMorePages: boolean = currentPage < lastPage;

        return { no_of_pages: lastPage, total, page_number: currentPage, is_last: !hasMorePages, docs: tempResult };

    }

    public async customAppointmentpaginate<K>(options: Sequelize.FindOptions, currentPage: number, limitTo: number, optionsForCalculateTotal?: Sequelize.FindOptions, include?: ANY): Promise<K | ANY> {

        const totalCount: Array<any> = JSON.parse(JSON.stringify(await this.model.findAll({ ...options, ...include })));

        const tempResult: Array<any> = totalCount.filter(x => x.dateList?.availableDoctor || x.dateList?.availableSpeciality);

        const total: number = tempResult.length;

        const paginatedResults =  tempResult.slice((currentPage - 1) * limitTo, currentPage * limitTo);

        const lastPage: number = total > 0 ? Math.ceil(total / limitTo) : 0;

        const hasMorePages: boolean = currentPage < lastPage;

        return { no_of_pages: lastPage, total, page_number: currentPage, is_last: !hasMorePages, docs: paginatedResults };

    }

    public async bulkCreate<K>(data: K[], transaction?: SequelizeTransaction): Promise<K[]> {
        return this.model.bulkCreate(data, { transaction });
    }

    public async bulkUpdate<K>(data: K[], transaction: SequelizeTransaction, fields: string[], updateOnDuplicate: string[]): Promise<K[]> {
        return this.model.bulkCreate(data, { fields, updateOnDuplicate, transaction });
    }

    public async count(column: ANY, where?: Where, include?: ANY): Promise<number> {
        return this.model.count({ col: column, where: {...where},  distinct: true , ...include});
    }

    public async create<K>(data: K, transaction?: SequelizeTransaction): Promise<K> {
        return this.model.create(data, { transaction });
    }

    public async destroy<K>(id?: number | null, _where?: Where, transaction?: SequelizeTransaction): Promise<K | null> {
        if (!id || !_where) {
            return null;
        }
        const where: Where = id ? { id } : _where;
        return this.model.destroy({ where, transaction });
    }

    public async exists(id?: number | null, _where?: Where): Promise<boolean> {
        if (id) {
            const task: T | null = await this.findById<T>(id);
            return (task && Object.keys(task).length) ? true : false;
        }

        const tasks: T[] | null = await this.findAll(_where);
        return tasks && tasks.length ? true : false;
    }

    public async findAll<K>(filter?: Filter, options?: Options, transaction?: SequelizeTransaction): Promise<K[] | null> {
        return this.model.findAll({ where: { ...filter }, ...options, transaction });
    }

    public async findById<K>(identifier: number, options?: Options, transaction?: SequelizeTransaction): Promise<K | null> {
        return this.model.findByPk(identifier, { ...options, transaction });
    }

    public async findOne<K>(projections: { [key: string]: number | string | null | ANY }, options?: Options, transaction?: SequelizeTransaction): Promise<K | null> {
        return this.model.findOne({ where: { ...projections }, ...options, transaction });
    }

    public async paginate<K>(options: Sequelize.FindOptions, currentPage: number, limitTo: number, optionsForCalculateTotal?: Sequelize.FindOptions, include?: ANY): Promise<K | ANY> {

        const offset: number = (currentPage - 1) * limitTo;
        // const resultsTotal: T[] = await this.model.findAll(optionsForCalculateTotal ?? options);
        const resultsTotal: T[] = await this.model.findAll({ ...options, offset, limit: limitTo, ...include });

        const total: number = resultsTotal.length;

        const results: T[] = await this.model.findAll({ ...options, offset, limit: limitTo, ...include });

        const lastPage: number = total > 0 ? Math.ceil(total / limitTo) : 0;

        const hasMorePages: boolean = currentPage < lastPage;

        return { no_of_pages: lastPage, total, page_number: currentPage, is_last: !hasMorePages, docs: results };

    }

    public async update<K>(id: number, obj: K, transaction?: SequelizeTransaction): Promise<K | null> {

        const [number] = await this.model.update({ ...obj }, { where: { id }, individualHooks: true, transaction });

        return (number) ? this.findById(id) : null;
    }

    public async updateByColumnMatched<K>(target: { [key: string]: number[] | unknown }, obj: { [key: string]: unknown }, transaction?: SequelizeTransaction): Promise<K[] | null> {

        const [number] = await this.model.update({ ...obj }, { where: { ...target }, individualHooks: true, transaction });

        return number;
    }

    public async updateByIds<K>(ids: number[], obj: { [key: string]: number | string | Date | null }, transaction?: SequelizeTransaction): Promise<K[] | null> {

        const [number] = await this.model.update({ ...obj }, { where: { id: { [Op.in]: ids } }, individualHooks: true, transaction });

        return (number) ? this.model.findAll({ where: {id: { [Op.in]: ids }} }) : null;

    }

    public async updateByReferenceIds<K>(ids: { [key: string]: number[] | unknown }, obj: { [key: string]: unknown }, transaction?: SequelizeTransaction): Promise<K[] | null>  {

        const [number] = await this.model.update({ ...obj }, { where: { ...ids }, individualHooks: true, transaction });

        return (number) ? this.model.findAll({ where: { ...ids } }) : null;

    }

}
