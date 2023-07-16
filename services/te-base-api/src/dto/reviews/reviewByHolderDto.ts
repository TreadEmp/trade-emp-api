import { IsString, ValidateNested, IsArray, IsNumber, Max } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { ReviewedByDto } from "./reviewedByDto";
export class ReviewByHolderDto {

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public holderId: string;

    @Expose()
    @IsNumber()
    public rating: number;

    @Expose()
    @IsString()
    public review: string;

    @Expose()
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];


    @Expose()
    @Type(() => ReviewedByDto)
    @ValidateNested()
    public reviewedBy: ReviewedByDto;

    @Expose()
    @IsString()
    public createdAt: string;

}