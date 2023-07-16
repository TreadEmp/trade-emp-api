import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    ERROR_CODES,
} from "../../utils/errorCodes";
import BidsFilterDto from "../../dto/admin/bidsFilterDto";
import AdminManagerRepository, {
    IAcceptanceFilterOptions,
    IFilterOptions,
} from "../../dal/adminManagerRepository";
import { BidsByJobDto } from "../../dto/admin/bidsByJobDto";
import { SortOrder } from "../../utils/enums";
import AcceptanceFilterDto from "../../dto/admin/acceptanceFilterDto";
import { AcceptanceByJobRequestDto } from "../../dto/admin/acceptanceByJobRequestDto";

const getFilterOptions = (options: BidsFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    employeeId: options.employeeId,
    jobId: options.jobId,
    status: options.status,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice,
});

const getAcceptanceFilterOptions = (
    options: AcceptanceFilterDto
): IAcceptanceFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    employerId: options.employerId,
    jobRequestId: options.jobRequestId,
    status: options.status,
});

export default class AdminService extends AbstractService {
    private adminRepo: AdminManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.adminRepo = new AdminManagerRepository();
        this.validator = new Validator();
    }

    public async getDashboardDetails(): Promise<IActionResponse> {
        const data = await this.adminRepo.getDashboardDetails();
        if (data) {
            return {
                success: true,
                data,
            };
        } else {
            GET_ERROR_BY_ERROR_CODE(ERROR_CODES[20001]);
        }
    }

    public async getUserBidsByAdmin(userId: string): Promise<IActionResponse> {
        const data = await this.adminRepo.getUserBidsByAdmin(userId);
        if (data) {
            return {
                success: true,
                data,
            };
        } else {
            GET_ERROR_BY_ERROR_CODE(ERROR_CODES[20002]);
        }
    }

    public async getUserJobAcceptanceByAdmin(
        userId: string
    ): Promise<IActionResponse> {
        const data = await this.adminRepo.getUserJobAcceptanceByAdmin(userId);
        if (data) {
            return {
                success: true,
                data,
            };
        } else {
            GET_ERROR_BY_ERROR_CODE(ERROR_CODES[20003]);
        }
    }

    public async getUserJobsByAdmin(userId: string): Promise<IActionResponse> {
        const data = await this.adminRepo.getUserJobsByAdmin(userId);
        if (data) {
            return {
                success: true,
                data,
            };
        } else {
            GET_ERROR_BY_ERROR_CODE(ERROR_CODES[20004]);
        }
    }

    public async getUserJobRequestsByAdmin(
        userId: string
    ): Promise<IActionResponse> {
        const data = await this.adminRepo.getUserJobRequestsByAdmin(userId);
        if (data) {
            return {
                success: true,
                data,
            };
        } else {
            GET_ERROR_BY_ERROR_CODE(ERROR_CODES[20005]);
        }
    }

    public async adminGetAllBidsByJobIdPagination(
        options: BidsFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalBidCount = await this.adminRepo.adminGetAllBidsByJobIdCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalBidCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalBidCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async adminGetAllBidsByJobId(
        options: BidsFilterDto
    ): Promise<BidsByJobDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const bids = await this.adminRepo.adminGetAllBidsByJobId(filterOptions);
        return bids;
    }

    public async adminGetAllAcceptanceByJobRequestIdPagination(
        options: AcceptanceFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getAcceptanceFilterOptions(options);

        const totalBidCount =
            await this.adminRepo.adminGetAllAcceptanceByJobRequestIdCount(
                filterOptions
            );
        paginationInfo.pages = Math.ceil(totalBidCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalBidCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async adminGetAllAcceptanceByJobRequestId(
        options: AcceptanceFilterDto
    ): Promise<AcceptanceByJobRequestDto[]> {
        const filterOptions = getAcceptanceFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const bids = await this.adminRepo.adminGetAllAcceptanceByJobRequestId(
            filterOptions
        );
        return bids;
    }
}
