import { user_basic_info } from '../models';
import { BaseRepository } from '../shared/base-repository';

/**
 * User Repository Class
 */
export class UserBasicInfoRepository extends BaseRepository<user_basic_info> {
    /**
     * constructor
     * @param userBasicInfo
     */
    public constructor(protected userBasicInfo: typeof user_basic_info) {
        super(userBasicInfo);
    }

}
