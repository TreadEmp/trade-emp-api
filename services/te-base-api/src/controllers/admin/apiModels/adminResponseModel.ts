import { AcceptanceByJobRequestDto } from "../../../dto/admin/acceptanceByJobRequestDto";
import { BidsByJobDto } from "../../../dto/admin/bidsByJobDto";
import { BidsDto } from "../../../dto/bids/bidsDto";
import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";

export class BidResponseModel {
    public pagination: PaginationInfoDto;
    public items: BidsDto[];
}

export class BidsByJobResponseModel {
    public pagination: PaginationInfoDto;
    public items: BidsByJobDto[];
}

export class AcceptanceByJobRequestResponseModel {
    public pagination: PaginationInfoDto;
    public items: AcceptanceByJobRequestDto[];
}
