import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class AuthenticatedUserDto {


    @Expose()
    @IsNotEmpty()
    @IsString()
    public firstName: string

    @IsNotEmpty()
    @IsString()
    public lastName: string

    @IsNotEmpty()
    @IsString()
    public role: string

    @IsNotEmpty()
    @IsString()
    public email: string

    @IsNotEmpty()
    @IsString()
    public settings: object




}
