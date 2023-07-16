import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
} from "class-validator";

export default class ReviewByHolderFilterDto {
    @IsNotEmpty()
    @IsNumber()
    public page: number;

    @IsNotEmpty()
    @ValidateIf(o => o.pageSize > 0)
    @IsNumber()
    public pageSize: number;

    @IsString()
    public sortBy: string;

    @IsString()
    public holderId: string;
}
