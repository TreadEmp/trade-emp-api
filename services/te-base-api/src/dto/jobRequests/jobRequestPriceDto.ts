import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class JobRequestPriceDto {
    // tslint:disable-next-line: variable-name
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public unitsOfMeasure: string;

    @Expose()
    @IsNumber()
    public price: number;
}