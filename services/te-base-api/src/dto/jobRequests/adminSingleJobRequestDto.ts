import { IsString, ValidateNested, IsArray, IsNumber } from "class-validator";
import { Type, Expose } from "class-transformer";
import { JobRequestPriceDto } from "./jobRequestPriceDto";
import { JobRequestFaqDto } from "./jobRequestFaqDto";
export class AdminSingleJobRequestDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public status: string;

    @Expose()
    @IsString()
    public title: string;

    @Expose()
    @IsString()
    public description: string;

    @Expose()
    @IsString()
    public jobCategory: string;

    @Expose()
    @IsString()
    public employerFirstName: string;

    @Expose()
    @IsString()
    public employerLastName: string;

    @Expose()
    @IsString()
    public employerProfile: string;

    @Expose()
    @IsString()
    public employeeFirstName: string;

    @Expose()
    @IsString()
    public employeeLastName: string;

    @Expose()
    @IsString()
    public employeeProfile: string;

    @Expose()
    @IsNumber()
    public days: number;

    @Type(() => JobRequestPriceDto)
    @IsArray()
    @ValidateNested()
    public prices: JobRequestPriceDto[];

    @Type(() => JobRequestFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobRequestFaqDto[];

    @Expose()
    @IsArray()
    @ValidateNested()
    public images: string[];
}