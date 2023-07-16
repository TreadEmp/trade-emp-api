import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class InviteUserDTO {
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
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public role: string;

    @Expose()
    @IsString()
    public tenantId: string;

    @Expose()
    @IsString()
    public inviteId: string;

    @Expose()
    @IsString()
    public activated: boolean;
}
