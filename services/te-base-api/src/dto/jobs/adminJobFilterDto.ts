import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
} from "class-validator";

enum Sort {
    category,
    location,
    status,
}

export enum SortOrder {
    asc,
    desc,
}
export default class AdminJobFilterDto {
    @IsNotEmpty()
    @IsNumber()
    public page: number;

    @IsNotEmpty()
    @ValidateIf((o) => o.pageSize > 0)
    @IsNumber()
    public pageSize: number;

    @IsEnum(Sort)
    public sort: Sort;

    @IsEnum(SortOrder)
    public order: SortOrder;

    @IsString()
    public status: string;

    @IsString()
    public category: string;

    @IsString()
    public title: string;

    @IsString()
    public longitude: string;

    @IsString()
    public latitude: string;

    @IsString()
    public radius: string;

    @IsString()
    public employerId: string;

    @IsString()
    public days: string;
}
