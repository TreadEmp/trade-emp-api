import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import JobManagerRepository, {
    IFilterOptions,
} from "../../dal/jobManagerRepository";
import { JobDto } from "../../dto/jobs/jobDto";
import JobFilterDto, { SortOrder } from "../../dto/jobs/jobFilterDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    ERROR_CODES,
} from "../../utils/errorCodes";
import {
    FileUploadDto,
    FileUploadResponseDto,
} from "../../dto/common/fileUploadDto";
import { LatestJobDto } from "../../dto/jobs/latestJobDto";
import UserManagerRepository from "../../dal/userManagerRepository";
// const AWS = require('aws-sdk');

const getFilterOptions = (options: JobFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    status: options.status,
    category: options.category,
    title: options.title,
    location: options.location,
    employerId: options.employerId,
});

export default class UserService extends AbstractService {
    private userRepo: UserManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.userRepo = new UserManagerRepository();
        this.validator = new Validator();
    }

    public async getUserFullProfile(
        userId: string,
        userRole: string
    ): Promise<IActionResponse> {
        const user = await this.userRepo.getUserFullProfile(userId, userRole);
        return user === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17001])
            : { success: true, data: user[0] };
    }

    public async getUserForAdminJobFilter(): Promise<IActionResponse> {
        const users = await this.userRepo.getUserForAdminJobFilter();
        return users === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17001])
            : { success: true, data: users };
    }

    public async getSingleUserByAdmin(
        userId: string
    ): Promise<IActionResponse> {
        const user = await this.userRepo.getSingleUserByAdmin(userId);
        return user === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17001])
            : { success: true, data: user[0] };
    }
}
