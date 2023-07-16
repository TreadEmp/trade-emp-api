import { Expose } from "class-transformer";
import { IsString, IsNumber } from "class-validator";

export class FileUploadDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public name: string;

    @Expose()
    @IsString()
    public type: string;

    @Expose()
    public data: any;

    @Expose()
    @IsString()
    public uploadedAt: string;

    @Expose()
    @IsNumber()
    public size: number;

    @Expose()
    @IsString()
    public path: string;
}

export class FileUploadResponseDto {
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public name: string;

    @Expose()
    @IsString()
    public type: string;

    @Expose()
    @IsString()
    public url: string;

    @Expose()
    @IsNumber()
    public size: number;

    @Expose()
    @IsString()
    public uploadedAt: string;
}
