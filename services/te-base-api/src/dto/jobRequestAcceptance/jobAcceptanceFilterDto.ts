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

export default class JobAcceptanceFilterDto {
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
    public employerId: string;

    @IsString()
    public jobRequestId: string;

    @IsString()
    public status: string;
}
