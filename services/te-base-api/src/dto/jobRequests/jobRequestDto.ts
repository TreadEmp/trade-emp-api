import { IsString, ValidateNested, IsNotEmpty, IsArray, IsBoolean, IsNumber, IsDate, IsObject } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { FileUploadResponseDto } from "../common/fileUploadDto";
import { JobRequestPriceDto } from "./jobRequestPriceDto";
import { JobRequestFaqDto } from "./jobRequestFaqDto";
import { LocationDto } from "./locationDto";
export class JobRequestDto {
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

    // @Expose({ groups: ["singleJobRequest"] })
    @Type(() => JobRequestPriceDto)
    @IsArray()
    @ValidateNested()
    public prices: JobRequestPriceDto[];

    // @Expose({ groups: ["singleJobRequest"] })
    @Type(() => JobRequestFaqDto)
    @IsArray()
    @ValidateNested()
    public faqs: JobRequestFaqDto[];

    // @Expose({ groups: ["singleJobRequest"] })
    @Type(() => FileUploadResponseDto)
    @IsArray()
    @ValidateNested()
    public images: FileUploadResponseDto[];

    @Expose()
    @Type(() => LocationDto)
    @IsObject()
    @ValidateNested()
    public location: LocationDto;
}



