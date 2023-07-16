import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
} from "class-validator";
import { SortOrder } from "../../utils/enums";

enum Sort {
    category,
    location,
    status,
}

export default class BidsFilterDto {
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
    public employeeId: string;

    @IsString()
    public jobId: string;

    @IsString()
    public status: string;
}
