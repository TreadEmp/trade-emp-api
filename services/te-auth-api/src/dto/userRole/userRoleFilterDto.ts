import { IsNumber, IsString, IsNotEmpty, ValidateIf, IsEnum } from "class-validator";
import { Expose } from "class-transformer";

enum Sort {
    roleName,
}

export enum SortOrder {
    asc,
    desc,
}

export class UserRoleFilterDto {
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

    @Expose()
    @IsString()
    public roleName: string;
}
