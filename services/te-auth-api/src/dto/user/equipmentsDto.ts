import { IsString } from "class-validator";
import { Expose } from "class-transformer";

export class EquipmentsDto {

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public equipmentName: string;

    @Expose()
    @IsString()
    public yearsOfUsing: string;
    
}
