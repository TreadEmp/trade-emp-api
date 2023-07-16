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
    category,
    location,
    status,
}

export default class JobRequestFilterDto {
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
    public category: string;

    @IsString()
    public title: string;
    
    @IsString()
    public employeeId: string;

    @IsBoolean()
    public isActive: boolean;
}
