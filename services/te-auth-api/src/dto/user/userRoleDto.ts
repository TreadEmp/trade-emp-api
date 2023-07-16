import { IsString, IsObject, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

export class UserRoleDto {

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public roleName: string;

    @Expose()
    @IsOptional()
    public permissions: any[];
}
