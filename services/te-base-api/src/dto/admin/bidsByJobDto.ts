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
export class EmployeeDto {
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
export class BidsByJobDto {
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
    @Type(() => EmployeeDto)
    @ValidateNested()
    public employee: EmployeeDto;

    @Expose()
    @IsNumber()
    public days: number;

    @Expose()
    @IsDate()
    public createdAt: Date;

    // @IsString()
    // public employeeFirstName: string;

    // @IsString()
    // public employeeLastName: string;

    // @IsString()
    // public employeeProfile: string;
}
