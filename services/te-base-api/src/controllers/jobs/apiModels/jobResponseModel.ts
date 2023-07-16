import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { AdminJobsListDto } from "../../../dto/jobs/adminJobsListDto";
import { JobDto } from "../../../dto/jobs/jobDto";
import { LatestJobDto } from "../../../dto/jobs/latestJobDto";

export class JobResponseModel {
    public pagination: PaginationInfoDto;
    public items: JobDto[];
}

export class RecentJobResponseModel {
    public pagination: PaginationInfoDto;
    public items: LatestJobDto[];
}

export class AdminJobResponseModel {
    public pagination: PaginationInfoDto;
    public items: AdminJobsListDto[];
}

