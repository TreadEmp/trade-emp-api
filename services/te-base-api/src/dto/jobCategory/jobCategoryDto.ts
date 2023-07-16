import { IsBoolean, IsString, ValidateNested } from "class-validator";
import { Exclude, Expose, Type } from "class-transformer";
import { JobCategoryImageDto } from "./jobCategoryImageDto";
export class JobCategoryDto {
    @Exclude()
    @IsString()
    public _id: string;

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public category: string;

    @Expose()
    @IsString()
    public description: string;

    @Expose()
    @Type(() => JobCategoryImageDto)
    @ValidateNested()
    public image: JobCategoryImageDto;

    @Expose()
    @IsBoolean()
    public isDisplayInApp: boolean;
}