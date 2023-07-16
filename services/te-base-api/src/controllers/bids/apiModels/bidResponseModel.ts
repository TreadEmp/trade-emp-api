import { BidsDto } from "../../../dto/bids/bidsDto";
import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";

export class BidResponseModel {
    public pagination: PaginationInfoDto;
    public items: BidsDto[];
}
