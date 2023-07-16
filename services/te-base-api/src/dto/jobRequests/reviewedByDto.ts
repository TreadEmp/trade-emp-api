import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class ReviewedByDto {
    @Expose()
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @IsString()
    public profileImage: string;

    @Expose()
    @IsString()
    public city: string;

    @Expose()
    @IsString()
    public country: string;
}
