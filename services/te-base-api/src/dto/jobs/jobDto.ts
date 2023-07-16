import { IsString, ValidateNested, IsNotEmpty, IsArray, IsBoolean, IsNumber, IsDate, IsObject } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { LocationDto } from "./locationDto";
export class JobDto {
    @Exclude()
    @IsString()
    public _id: string;

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

    @Expose()
    @Type(() => LocationDto)
    @IsObject()
    @ValidateNested()
    public location: LocationDto;

    @Expose()
    @Type(() => JobFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobFaqDto[];

    @Expose()
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];
}
export class JobFaqDto {
    // tslint:disable-next-line: variable-name
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public question: string;

    @Expose()
    @IsString()
    public answer: string;

}