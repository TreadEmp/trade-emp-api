import { IsNumber, IsString } from "class-validator";
import { Exclude, Expose } from "class-transformer";
export class JobAcceptanceDto {
    @Exclude()
    @IsString()
    public _id: string;

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public employerId: string;

    @Expose()
    @IsString()
    public jobRequestId: string;

    @Expose()
    @IsString()
    public status: string;
}