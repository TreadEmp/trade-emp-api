import { IsString, ValidateNested, IsNotEmpty, IsArray, IsBoolean, IsNumber, IsDate, IsObject } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { LocationDto } from "./locationDto";
import { JobFaqDto } from "./jobDto";
export class AdminSingleJobDto {
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

    @Expose()
    @Type(() => JobFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobFaqDto[];

    @Expose()
    @IsArray()
    @ValidateNested()
    public images: string[];
}