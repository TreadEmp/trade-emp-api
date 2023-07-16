import { IsString, IsObject, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

export class RolePermissionDto {

    @Expose()
    @IsString()
    public category: string;

    @Expose()
    @IsBoolean()
    public default: boolean;

    @Expose()
    @IsString()
    public label: string;

    @Expose()
    @IsString()
    public path: string;

    @Expose()
    @IsString()
    public method: string;

    @Expose()
    @IsBoolean()
    public allow: boolean;
}
