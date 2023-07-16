import {
    IsString,
    ValidateNested,
    IsDefined,
    IsNotEmpty,
    IsArray,
    IsBoolean,
    IsNumber,
} from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class UserLogedinDTO {
    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public userId: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public name: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public email: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public roles: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public accessToken: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public refreshToken: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public message: string;
}
