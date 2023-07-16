import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class UserDTO {
    @Exclude()
    public _id: string;

    @Expose()
    @IsString()
    public userId: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public firstName: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public tenantId: string;

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

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public password: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public companyName: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public country: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public city: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public defaultCurrency: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    public phone: string;

    @Expose()
    @IsBoolean()
    public activated: boolean;

    @Expose()
    @IsString()
    public industry: string;

    @Expose()
    @IsString()
    public disabled: number;
}
