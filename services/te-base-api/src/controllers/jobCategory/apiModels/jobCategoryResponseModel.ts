import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { JobCategoryDto } from "../../../dto/jobCategory/jobCategoryDto";

export class JobCategoryResponseModel {
    public pagination: PaginationInfoDto;
    public items: JobCategoryDto[];
}
