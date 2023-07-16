import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsBoolean,
} from "class-validator";
import { SortOrder } from "../../utils/enums";

enum Sort {
    category
}

export default class JobCategoryFilterDto {
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
    public category: string;

    @IsBoolean()
    public isDisplayInApp: boolean;
}
