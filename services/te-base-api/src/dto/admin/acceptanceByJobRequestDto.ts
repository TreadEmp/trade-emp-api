import {
    IsString,
    ValidateIf,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    ValidateNested,
    IsDate,
} from "class-validator";
import { BidStatus } from "../../utils/enums";
import { Expose, Type } from "class-transformer";
export class EmployerDto {
    @Expose()
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @IsString()
    public profileImage: string;
}
export class AcceptanceByJobRequestDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsNumber()
    public price: number;

    @Expose()
    @IsEnum(BidStatus)
    public status: BidStatus;

    @Expose()
    @Type(() => EmployerDto)
    @ValidateNested()
    public employer: EmployerDto;

    @Expose()
    @IsNumber()
    public days: number;

    @Expose()
    @IsDate()
    public createdAt: Date;

    @Expose()
    @IsString()
    public employerId: string;

    @Expose()
    @IsString()
    public jobRequestId: string;

}
