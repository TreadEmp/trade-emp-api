import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { JobRequestAcceptanceSchema } from "./models/jobRequestAcceptance";
import { JobAcceptanceDto } from "../dto/jobRequestAcceptance/jobAcceptanceDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            employeeId: filterOptions.employerId
                ? { $regex: filterOptions.employerId, $options: "i" }
                : null,
            jobRequestId: filterOptions.jobRequestId
                ? { $regex: filterOptions.jobRequestId, $options: "i" }
                : null,
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
        })
    );

export default class JobRequestAcceptanceManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = JobRequestAcceptanceSchema;
    }

    public async createOrUpdateJobAcceptance(
        jobAcceptanceDto: JobAcceptanceDto
    ): Promise<JobAcceptanceDto> {
        const jobAcceptance = await this.model.findOneAndUpdate(
            {
                id: jobAcceptanceDto.id,
            },
            {
                $set: jobAcceptanceDto,
            },
            { new: true, safe: true, upsert: true }
        );

        let createdJobAcceptance = new JobAcceptanceDto();
        createdJobAcceptance = plainToClassFromExist(
            createdJobAcceptance,
            jobAcceptance.toJSON(),
            {
                excludeExtraneousValues: true,
            }
        );

        return createdJobAcceptance;
    }

    // public async getBidCount(filterOptions: IFilterOptions) {
    //     const constantFilters = getFilters(filterOptions);

    //     return this.model.countDocuments({
    //         ...constantFilters,
    //     });
    // }

    // public async getBidList(filterOptions: IFilterOptions): Promise<BidsDto[]> {
    //     const constantFilters = getFilters(filterOptions);

    //     const bidList = await this.model
    //         .find({
    //             ...constantFilters,
    //         })
    //         .skip(filterOptions.skip)
    //         .limit(filterOptions.limit)
    //         .sort(filterOptions.sortBy);

    //     const formattedList: BidsDto[] = bidList.map((element) => {
    //         const bidsDto = plainToClass(BidsDto, element.toJSON(), {
    //             excludeExtraneousValues: true,
    //         });
    //         return bidsDto;
    //     });
    //     return formattedList;
    // }

    // public async getBidById(bidsDto: BidsDto): Promise<BidsDto> {
    //     const bid = await this.model.findOne({
    //         id: bidsDto.id,
    //     });

    //     if (bid) {
    //         const singleBid = plainToClassFromExist(
    //             new BidsDto(),
    //             bid.toJSON(),
    //             {
    //                 excludeExtraneousValues: true,
    //             }
    //         );
    //         return singleBid;
    //     } else {
    //         return null;
    //     }
    // }

    // public async deleteBid(bidsDto: BidsDto): Promise<any> {
    //     const bidToBeDeleted = await this.model.findOne({
    //         id: bidsDto.id,
    //     });
    //     if (bidToBeDeleted !== null) {
    //         let bid = bidToBeDeleted.toObject();
    //         return await this.model.deleteOne({ _id: bid._id });
    //     } else {
    //         return null;
    //     }
    // }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    employerId: string;
    jobRequestId: string;
    status: string;
}
export interface ISelectFilterOptions {
    employerId: string;
    jobRequestId: string;
    status: string;
}
