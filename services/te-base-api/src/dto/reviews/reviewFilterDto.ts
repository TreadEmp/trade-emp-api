import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
} from "class-validator";

enum Sort {
    jobId,
    reviewedBy,
    holderId,
}

export enum SortOrder {
    asc,
    desc
}
export default class ReviewFilterDto {
    @IsNotEmpty()
    @IsNumber()
    public page: number;

    @IsNotEmpty()
    @ValidateIf(o => o.pageSize > 0)
    @IsNumber()
    public pageSize: number;

    @IsEnum(Sort)
    public sort: Sort;

    @IsEnum(SortOrder)
    public order: SortOrder;

    @IsString()
    public jobId: string;

    @IsString()
    public holderId: string;

    @IsString()
    public reviewedBy: string;
}
