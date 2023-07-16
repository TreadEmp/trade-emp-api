import {
    IsString,
    ValidateNested,
    IsArray,
    IsNumber,
    IsObject,
    IsDate,
} from "class-validator";
import { Type, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { ReviewedByDto } from "./reviewedByDto";
export class ReviewDto {
    @Expose()
    @IsString()
    public review: string;

    @Expose()
    @IsNumber()
    public rating: number;

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
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];

    @Expose()
    @Type(() => ReviewedByDto)
    @IsObject()
    @ValidateNested()
    public reviewer: ReviewedByDto;

    @Expose()
    @IsDate()
    public createdAt: Date;
}
