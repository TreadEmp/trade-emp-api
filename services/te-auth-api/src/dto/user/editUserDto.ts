import { IsString, IsDefined, IsNotEmpty, IsNumber } from "class-validator";
import { Expose } from "class-transformer";

export class EditUserDTO {


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
    @IsNumber() EditUserDTO
    @IsDefined()
    public disabled: number;

}
