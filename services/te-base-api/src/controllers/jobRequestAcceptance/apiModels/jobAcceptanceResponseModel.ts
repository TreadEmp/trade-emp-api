import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { JobAcceptanceDto } from "../../../dto/jobRequestAcceptance/jobAcceptanceDto";

export class BidResponseModel {
    public pagination: PaginationInfoDto;
    public items: JobAcceptanceDto[];
}
