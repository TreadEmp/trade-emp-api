import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { BidsDto } from "../dto/bids/bidsDto";
import { BidSchema } from "./models/bids";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            employeeId: filterOptions.employeeId
                ? { $regex: filterOptions.employeeId, $options: "i" }
                : null,
            jobId: filterOptions.jobId
                ? { $regex: filterOptions.jobId, $options: "i" }
                : null,
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
        })
    );

export default class BidManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = BidSchema;
    }

    public async createOrUpdateBids(bidsDto: BidsDto): Promise<BidsDto> {
        const bid = await this.model.findOneAndUpdate(
            {
                id: bidsDto.id,
            },
            {
                $set: bidsDto,
            },
            { new: true, safe: true, upsert: true }
        );

        let bidDto = new BidsDto();
        bidDto = plainToClassFromExist(bidDto, bid.toJSON(), {
            excludeExtraneousValues: true,
        });

        return bidDto;
    }

    public async getBidCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getBidList(filterOptions: IFilterOptions): Promise<BidsDto[]> {
        const constantFilters = getFilters(filterOptions);

        const bidList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: BidsDto[] = bidList.map((element) => {
            const bidsDto = plainToClass(BidsDto, element.toJSON(), {
                excludeExtraneousValues: true,
            });
            return bidsDto;
        });
        return formattedList;
    }

    public async getBidById(bidsDto: BidsDto): Promise<BidsDto> {
        const bid = await this.model.findOne({
            id: bidsDto.id,
        });

        if (bid) {
            const singleBid = plainToClassFromExist(
                new BidsDto(),
                bid.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleBid;
        } else {
            return null;
        }
    }

    public async deleteBid(bidsDto: BidsDto): Promise<any> {
        const bidToBeDeleted = await this.model.findOne({
            id: bidsDto.id,
        });
        if (bidToBeDeleted !== null) {
            let bid = bidToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: bid._id });
        } else {
            return null;
        }
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    employeeId: string;
    jobId: string;
    status: string;
}
export interface ISelectFilterOptions {
    employeeId: string;
    jobId: string;
    status: string;
}
