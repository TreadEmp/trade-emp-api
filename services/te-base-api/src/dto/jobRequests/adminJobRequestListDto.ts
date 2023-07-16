import {
    IsNumber,
    IsString,
} from "class-validator";
import { Expose } from "class-transformer";
export class AdminJobRequestListDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public isActive: boolean;

    @Expose()
    @IsString()
    public title: string;

    @Expose()
    @IsString()
    public description: string;

    @Expose()
    @IsString()
    public image: string;

    @Expose()
    @IsString()
    public jobCategory: string;

    @Expose()
    @IsString()
    public employerFirstName: string;

    @Expose()
    @IsString()
    public employerLastName: string;

    @Expose()
    @IsString()
    public employerProfile: string;

    @Expose()
    @IsString()
    public employeeFirstName: string;

    @Expose()
    @IsString()
    public employeeLastName: string;

    @Expose()
    @IsString()
    public employeeProfile: string;

    @Expose()
    @IsNumber()
    public days: number;

    @Expose()
    @IsNumber()
    public distance: number;
}