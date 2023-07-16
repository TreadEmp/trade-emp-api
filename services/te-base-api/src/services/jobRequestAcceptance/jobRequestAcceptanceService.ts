import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import BidsFilterDto from "../../dto/bids/bidsFilterDto";
import { BidsDto } from "../../dto/bids/bidsDto";
import { SortOrder } from "../../utils/enums";
import JobRequestAcceptanceManagerRepository, {
    IFilterOptions,
} from "../../dal/jobRequestAcceptanceManagerRepository";
import { JobAcceptanceDto } from "../../dto/jobRequestAcceptance/jobAcceptanceDto";
import JobAcceptanceFilterDto from "../../dto/jobRequestAcceptance/jobAcceptanceFilterDto";

const getFilterOptions = (options: JobAcceptanceFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    employerId: options.employerId,
    jobRequestId: options.jobRequestId,
    status: options.status,
});

export default class JobRequestAcceptanceService extends AbstractService {
    private acceptanceRepo: JobRequestAcceptanceManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.acceptanceRepo = new JobRequestAcceptanceManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateJobAcceptance(
        jobAcceptanceDto: JobAcceptanceDto
    ): Promise<IActionResponse> {
        if (jobAcceptanceDto.id === undefined) {
            jobAcceptanceDto.id = Date.now().toString();
        }
        const jobAcceptance =
            await this.acceptanceRepo.createOrUpdateJobAcceptance(
                jobAcceptanceDto
            );
        return jobAcceptance === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19003])
            : { success: true, data: jobAcceptance };
    }

    // public async getPaginationInfo(
    //     options: BidsFilterDto
    // ): Promise<PaginationInfoDto> {
    //     const paginationInfo = new PaginationInfoDto();
    //     const filterOptions = getFilterOptions(options);

    //     const totalBidCount = await this.bidRepo.getBidCount(filterOptions);
    //     paginationInfo.pages = Math.ceil(totalBidCount / options.pageSize);
    //     paginationInfo.pageSize = options.pageSize;
    //     paginationInfo.items = totalBidCount;
    //     paginationInfo.currentPage = options.page;

    //     return paginationInfo;
    // }

    // public async getBidList(options: BidsFilterDto): Promise<BidsDto[]> {
    //     const filterOptions = getFilterOptions(options);

    //     if (!this.validator.isEmpty(options.sort)) {
    //         if (String(options.sort) === SortOrder[SortOrder.asc]) {
    //             filterOptions.sortBy += `${options.order}`;
    //         } else {
    //             filterOptions.sortBy += `-${options.order}`;
    //         }
    //     }

    //     const Bids = await this.bidRepo.getBidList(filterOptions);
    //     return Bids;
    // }

    // public async getBidById(bidsDto: BidsDto): Promise<IActionResponse> {
    //     const Bid = await this.bidRepo.getBidById(bidsDto);
    //     return Bid === null
    //         ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19002])
    //         : { success: true, data: Bid };
    // }

    // public async deleteBid(bidsDto: BidsDto): Promise<IActionResponse> {
    //     const result = await this.bidRepo.deleteBid(bidsDto);
    //     return result === null
    //         ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19002])
    //         : { success: true, data: result };
    // }
}
