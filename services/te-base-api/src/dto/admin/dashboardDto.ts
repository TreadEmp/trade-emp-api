import { IsNumber } from "class-validator";
import { Expose } from "class-transformer";
export class DashboardDto {
    @Expose()
    @IsNumber()
    public users: number;

    @Expose()
    @IsNumber()
    public JobCategories: number;

    @Expose()
    @IsNumber()
    public toolCategories: number;

    @Expose()
    @IsNumber()
    public equipments: number;

    @Expose()
    @IsNumber()
    public experiences: number;

    @Expose()
    @IsNumber()
    public jobs: number;

    @Expose()
    @IsNumber()
    public jobRequests: number;

    @Expose()
    @IsNumber()
    public bids: number;
}