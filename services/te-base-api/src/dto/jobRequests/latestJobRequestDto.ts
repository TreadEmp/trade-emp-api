import {
    IsString,
    ValidateNested,
    IsNotEmpty,
    IsArray,
    IsBoolean,
    IsNumber,
    IsDate,
    IsObject,
} from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { JobRequestPriceDto } from "./jobRequestPriceDto";
import { JobRequestFaqDto } from "./jobRequestFaqDto";
import { ReviewDto } from "./reviewDto";
export class LatestJobRequestDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public employerId: string;

    @Expose()
    @IsString()
    public employeeId: string;

    @Expose()
    @IsBoolean()
    public isActive: boolean;

    @Expose()
    @IsString()
    public category: string;

    @Expose()
    @IsString()
    public title: string;

    @Expose()
    @IsString()
    public description: string;

    @Expose()
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];

    @Expose()
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @IsString()
    public profileImage: string;

    @Expose()
    @IsNumber()
    public totalNoOfReviews: number;

    @Expose()
    @IsNumber()
    public overallRating: number;

    @Expose()
    @IsNumber()
    public communication: number;

    @Expose()
    @IsNumber()
    public serviceAsDescribed: number;

    @Expose()
    @IsNumber()
    public recommend: number;

    @Expose()
    @IsNumber()
    public completionOnTime: number;

    @Expose()
    @Type(() => JobRequestPriceDto)
    @IsArray()
    @ValidateNested()
    public prices: JobRequestPriceDto[];

    @Expose()
    @Type(() => JobRequestFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobRequestFaqDto[];

    @Expose()
    @Type(() => ReviewDto)
    @IsArray()
    @ValidateNested()
    public reviews: ReviewDto[];
}
