import { Expose, Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
export class LocationDto {
    @Expose()
    @IsString()
    public type: string;

    @Expose()
    @IsArray()
    @ValidateNested()
    public coordinates: number[];
}
