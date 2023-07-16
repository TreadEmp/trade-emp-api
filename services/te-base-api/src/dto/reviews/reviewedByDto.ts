import { IsString, ValidateNested, IsArray, IsNumber, Max } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
export class ReviewedByDto {

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
    @IsString()
    public city: string;

    @Expose()
    @IsString()
    public country: string;

}