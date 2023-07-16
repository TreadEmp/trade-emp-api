import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";

export class UserLoginDTO {


    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public email: string;

    @IsNotEmpty()
    @IsString()
    @IsDefined()
    public password: string;

}
