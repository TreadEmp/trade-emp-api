import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { ReviewByHolderDto } from "../../../dto/reviews/reviewByHolderDto";
import { ReviewDto } from "../../../dto/reviews/reviewDto";

export class ReviewResponseModel {
    public pagination: PaginationInfoDto;
    public items: ReviewDto[];
}

export class ReviewByHolderResponseModel {
    public pagination: PaginationInfoDto;
    public items: ReviewByHolderDto[];
}
