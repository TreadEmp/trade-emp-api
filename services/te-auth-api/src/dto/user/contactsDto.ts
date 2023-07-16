import { IsString } from "class-validator";
import { Expose } from "class-transformer";

export class ContactsDto {

    @Expose()
    @IsString()
    public telephone: string;

    @Expose()
    @IsString()
    public fax: string;

    @Expose()
    @IsString()
    public mobile: string;
}
