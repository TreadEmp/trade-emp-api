import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class JobFaqDto {
    // tslint:disable-next-line: variable-name
    @Expose()
    @IsString()
    public id: string;

    @Expose()
    @IsString()
    public question: string;

    @Expose()
    @IsString()
    public answer: string;

}