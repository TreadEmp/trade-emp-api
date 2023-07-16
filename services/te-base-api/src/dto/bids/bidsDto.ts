import { IsNumber, IsString } from "class-validator";
import { Exclude, Expose } from "class-transformer";
export class BidsDto {

    @Exclude()
    @IsString()
    public _id: string;

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public employeeId: string;

    @Expose()
    @IsString()
    public jobId: string;

    @Expose()
    @IsNumber()
    public price: number;

    @Expose()
    @IsString()
    public status: string;

}