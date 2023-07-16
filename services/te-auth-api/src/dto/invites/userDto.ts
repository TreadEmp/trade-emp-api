import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class UserDTO {
    @Exclude()
    private _id: string;

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

    @Expose({ groups: ["signUp"] })
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

}
