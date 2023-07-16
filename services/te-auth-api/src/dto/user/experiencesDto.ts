import { IsString } from "class-validator";
import { Expose } from "class-transformer";

export class ExperiencesDto {

    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public experience: string;

    @Expose()
    @IsString()
    public timePeriod: string;

}
