import { IsString } from "class-validator";
import { Expose } from "class-transformer";

export class AddressDto {

    @Expose()
    @IsString()
    public addressName: string;

    @Expose()
    @IsString()
    public addressLine1: string;

    @Expose()
    @IsString()
    public addressLine2: string;

    @Expose()
    @IsString()
    public suburb: string;

    @Expose()
    @IsString()
    public city: string;

    @Expose()
    @IsString()
    public state: string;

    @Expose()
    @IsString()
    public postalCode: string;

    @Expose()
    @IsString()
    public country: string;

    @Expose()
    @IsString()
    public latitude: string;

    @Expose()
    @IsString()
    public longitude: string;
}
