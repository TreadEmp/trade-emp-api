import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { AdminJobRequestListDto } from "../../../dto/jobRequests/adminJobRequestListDto";
import { JobRequestDto } from "../../../dto/jobRequests/jobRequestDto";
import { LatestJobRequestDto } from "../../../dto/jobRequests/latestJobRequestDto";

export class JobRequestResponseModel {
    public pagination: PaginationInfoDto;
    public items: JobRequestDto[];
}

export class RecentJobRequestResponseModel {
    public pagination: PaginationInfoDto;
    public items: LatestJobRequestDto[];
}

export class AdminJobRequestResponseModel {
    public pagination: PaginationInfoDto;
    public items: AdminJobRequestListDto[];
}


