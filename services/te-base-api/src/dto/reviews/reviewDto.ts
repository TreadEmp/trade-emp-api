import { IsString, ValidateNested, IsArray, IsNumber, Max } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
export class ReviewDto {
    @Exclude()
    @IsString()
    public _id: string;

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public jobType: string;

    @Expose()
    @IsString()
    public jobId: string;

    @Expose()
    @IsString()
    public holderId: string;

    @Expose()
    @IsString()
    public reviewedBy: string;

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
}