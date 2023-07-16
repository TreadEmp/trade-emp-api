import { IsString, IsNumber } from "class-validator";
import { Expose } from "class-transformer";
export class JobCategoryImageDto {

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public name: string;

    @Expose()
    @IsString()
    public type: string;

    @Expose()
    @IsString()
    public url: string;

    @Expose()
    @IsNumber()
    public size: number;

    @Expose()
    @IsString()
    public uploadedAt: string;

}