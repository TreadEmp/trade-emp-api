import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
} from "class-validator";

enum Sort {
    firstName,
    LastName,
    email,
    role
}

export enum SortOrder {
    asc,
    desc
}
export default class UserFilterDto {
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
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    public email: string;

    @IsString()
    public role: string;
}
