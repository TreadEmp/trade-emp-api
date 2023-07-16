import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class SignUpFromInviteDTO {


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
    public email: string;

    @Expose()
    @IsString()
    public password: string;

    @Expose()
    @IsString()
    public tenantId: string;

    @Expose()
    @IsString()
    public role: string;
}
