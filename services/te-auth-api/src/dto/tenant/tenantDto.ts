import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class UserSignUpDto {

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public firstName: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public lastName: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public role: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public email: string;

    @Expose({ groups: ["signUp"] })
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public password: string;

    @Expose()
    @IsBoolean()
    public activated: boolean;
}
