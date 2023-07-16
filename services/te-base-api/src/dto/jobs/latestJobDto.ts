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
import { LocationDto } from "./locationDto";
import { ReviewDto } from "./reviewDto";
import { JobFaqDto } from "./jobDto";
export class LatestJobDto {
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
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @IsString()
    public status: string;

    @Expose()
    @IsString()
    public category: string;

    @Expose()
    @IsString()
    public title: string;

    @Expose()
    @IsString()
    public description: string;

    // @Expose()
    // @Type(() => LocationDto)
    // @IsObject()
    // @ValidateNested()
    // public location: LocationDto;

    @Expose()
    @Type(() => JobBidsDto)
    @IsArray()
    @ValidateNested()
    public bids: JobBidsDto[];

    @Expose()
    @IsNumber()
    public activeBids: number;

    @Expose()
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];

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
    @Type(() => ReviewDto)
    @IsArray()
    @ValidateNested()
    public reviews: ReviewDto[];

    @Expose()
    @Type(() => JobFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobFaqDto[];
}

export class JobBidsDto {
    // tslint:disable-next-line: variable-name
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public employeeId: string;

    @Expose()
    @IsNumber()
    public price: number;

    @Expose()
    @IsNumber()
    public requiredTime: number;
}
