import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { ReviewSchema } from "./models/review";
import { ReviewDto } from "../dto/reviews/reviewDto";
import { ReviewByHolderDto } from "../dto/reviews/reviewByHolderDto";
import { ReviewSortTypes, SearchType } from "../utils/enums";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            jobId: filterOptions.jobId
                ? { $regex: filterOptions.jobId, $options: "i" }
                : null,
            holderId: filterOptions.holderId
                ? { $regex: filterOptions.holderId, $options: "i" }
                : null,
            reviewedBy: filterOptions.reviewedBy
                ? { $regex: filterOptions.reviewedBy, $options: "i" }
                : null,
        })
    );

const getReviewByHolderFilters = (
    filterOptions: IReviewByHolderFilterOptions
): IReviewByHolderSelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            holderId: filterOptions.holderId
                ? { $regex: filterOptions.holderId, $options: "i" }
                : null,
        })
    );

export default class ReviewManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = ReviewSchema;
    }

    public async createOrUpdateReviews(
        reviewDto: ReviewDto
    ): Promise<ReviewDto> {
        const review = await this.model.findOneAndUpdate(
            {
                id: reviewDto.id,
            },
            {
                $set: reviewDto,
            },
            { new: true, safe: true, upsert: true }
        );
        let reviewObject = new ReviewDto();
        reviewObject = plainToClassFromExist(reviewObject, review.toJSON(), {
            excludeExtraneousValues: true,
        });
        return reviewObject;
    }

    public async getReviewCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getReviewList(
        filterOptions: IFilterOptions
    ): Promise<ReviewDto[]> {
        const constantFilters = getFilters(filterOptions);

        const reviewList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: ReviewDto[] = reviewList.map((element) => {
            const reviewDto = plainToClass(ReviewDto, element.toJSON(), {
                excludeExtraneousValues: true,
            });
            return reviewDto;
        });
        return formattedList;
    }

    public async getReviewByReviewId(reviewDto: ReviewDto): Promise<ReviewDto> {
        const review = await this.model.findOne({
            id: reviewDto.id,
        });

        if (review) {
            const singleReview = plainToClassFromExist(
                new ReviewDto(),
                review.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleReview;
        } else {
            return null;
        }
    }

    public async deleteReview(reviewDto: ReviewDto): Promise<any> {
        const reviewToBeDeleted = await this.model.findOne({
            id: reviewDto.id,
        });
        if (reviewToBeDeleted !== null) {
            let review = reviewToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: review._id });
        } else {
            return null;
        }
    }

    public async getReviewCountByHolder(
        filterOptions: IReviewByHolderFilterOptions
    ) {
        const constantFilters = getReviewByHolderFilters(filterOptions);
        const filter = await this.getReviewByHolderFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.COUNT
        );

        if (filter.length > 0) {
            const result = await this.model.aggregate(filter);
            if (result.length > 0) {
                return result[0].count;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public async getReviewListByHolder(
        filterOptions: IReviewByHolderFilterOptions
    ): Promise<ReviewByHolderDto[]> {
        const constantFilters = getReviewByHolderFilters(filterOptions);
        const filter = await this.getReviewByHolderFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.DATA
        );

        if (filter.length > 0) {
            const result = await this.model.aggregate(filter);
            if (result) {
                const formattedList: ReviewByHolderDto[] = result.map(
                    (element) => {
                        const reviewDto = plainToClass(
                            ReviewByHolderDto,
                            element,
                            {
                                excludeExtraneousValues: true,
                            }
                        );
                        return reviewDto;
                    }
                );
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getReviewByHolderFilterQuery(
        filterOptions: IReviewByHolderFilterOptions,
        constantFilters: IReviewByHolderSelectFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const filter: Object[] = [];
        filter.push({
            $match: {
                holderId: filterOptions.holderId,
            },
        });

        filter.push({
            $lookup: {
                from: "users",
                let: { userId: "$reviewedBy" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$userId", "$$userId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            profileImage: "$profileImage.url",
                            firstName: 1,
                            lastName: 1,
                            city: "$address.city",
                            country: "$address.country",
                        },
                    },
                ],
                as: "userDetails",
            },
        });

        filter.push({
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        filter.push({
            $addFields: {
                overallRating: {
                    $divide: [
                        {
                            $add: [
                                "$communication",
                                "$completionOnTime",
                                "$recommend",
                                "$serviceAsDescribed",
                            ],
                        },
                        4,
                    ],
                },
            },
        });
        if (filterOptions.sortBy === ReviewSortTypes.MOST_COMPLIMENTARY) {
            filter.push({
                $sort: {
                    rating: -1,
                },
            });
        }
        if (filterOptions.sortBy === ReviewSortTypes.MOST_CRITICAL) {
            filter.push({
                $sort: {
                    rating: 1,
                },
            });
        }
        if (filterOptions.sortBy === ReviewSortTypes.MOST_RECENT) {
            filter.push({
                $sort: {
                    createdAt: -1,
                },
            });
        }
        if (filterOptions.sortBy === ReviewSortTypes.MOST_RELEVANT) {
            filter.push({
                $sort: {
                    overallRating: -1,
                },
            });
        }

        filter.push({
            $project: {
                _id: 0,
                id: 1,
                rating: 1,
                review: 1,
                holderId: 1,
                images: 1,
                reviewedBy: "$userDetails",
                createdAt: 1,
            },
        });

        if (searchType === SearchType.DATA) {
            filter.push({
                $skip: filterOptions.skip,
            });
            filter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            filter.push({
                $count: "count",
            });
        }

        return filter;
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    jobId: string;
    reviewedBy: string;
    holderId: string;
}
export interface ISelectFilterOptions {
    jobId: string;
    reviewedBy: string;
    holderId: string;
}

export interface IReviewByHolderFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    holderId: string;
}
export interface IReviewByHolderSelectFilterOptions {
    sortBy: string;
    holderId: string;
}
