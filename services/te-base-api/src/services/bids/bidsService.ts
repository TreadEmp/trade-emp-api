import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import BidsFilterDto from "../../dto/bids/bidsFilterDto";
import { BidsDto } from "../../dto/bids/bidsDto";
import { SortOrder } from "../../utils/enums";
import BidManagerRepository, { IFilterOptions } from "../../dal/bidManagerRepository";

const getFilterOptions = (options: BidsFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    employeeId: options.employeeId,
    jobId: options.jobId,
    status: options.status,
})

export default class BidsService extends AbstractService {
    private bidRepo: BidManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.bidRepo = new BidManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateBids(bidDto: BidsDto): Promise<IActionResponse> {
        if (bidDto.id === undefined) {
            bidDto.id = Date.now().toString();
        }
        const Bid = await this.bidRepo.createOrUpdateBids(bidDto);
        return Bid === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19003]) : { success: true, data: Bid };
    }

    public async getPaginationInfo(
        options: BidsFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalBidCount = await this.bidRepo.getBidCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalBidCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalBidCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getBidList(
        options: BidsFilterDto
    ): Promise<BidsDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const Bids = await this.bidRepo.getBidList(
            filterOptions
        );
        return Bids;
    }

    public async getBidById(bidsDto: BidsDto): Promise<IActionResponse> {
        const Bid = await this.bidRepo.getBidById(bidsDto);
        return Bid === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[19002]) : { success: true, data: Bid };
    }

    public async deleteBid(bidsDto: BidsDto): Promise<IActionResponse> {
        const result = await this.bidRepo.deleteBid(bidsDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                ERROR_CODES[19002]
            )
            : { success: true, data: result };
    }
}
