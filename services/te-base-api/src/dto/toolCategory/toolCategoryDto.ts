import { IsBoolean, IsString } from "class-validator";
import { Exclude, Expose } from "class-transformer";
export class ToolCategoryDto {
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
    @IsBoolean()
    public isDisplayInApp: boolean;
}