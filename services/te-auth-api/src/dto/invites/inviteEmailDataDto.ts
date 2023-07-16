
import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class InviteEmailDataDto {


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
    @IsString()
    public org: string;

    @Expose()
    @IsString()
    public link: string;
}
