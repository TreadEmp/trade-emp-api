import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { JobRequestSchema } from "./models/jobRequests";
import { JobRequestDto } from "../dto/jobRequests/jobRequestDto";
import { SearchType } from "../utils/enums";
import { LatestJobRequestDto } from "../dto/jobRequests/latestJobRequestDto";
import { AdminJobRequestListDto } from "../dto/jobRequests/adminJobRequestListDto";
import { JOB_REQUEST_STATUS } from "../shared/enums";
import { AdminSingleJobRequestDto } from "../dto/jobRequests/adminSingleJobRequestDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            employeeId: filterOptions.employeeId
                ? { $regex: filterOptions.employeeId, $options: "i" }
                : null,
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
            title: filterOptions.title
                ? { $regex: filterOptions.title, $options: "i" }
                : null,
            isActive:
                filterOptions.isActive !== undefined
                    ? filterOptions.isActive
                    : null,
        })
    );

const getAdminFilters = (
    filterOptions: IAdminJobRequestFilterOptions
): IAdminJobRequestSelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            isActive: filterOptions.status
                ? filterOptions.status === JOB_REQUEST_STATUS.ACTIVE
                    ? true
                    : false
                : null,
            title: filterOptions.title
                ? { $regex: filterOptions.title, $options: "i" }
                : null,
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
            employeeId: filterOptions.employerId
                ? { $regex: filterOptions.employerId, $options: "i" }
                : null,
        })
    );

export default class JobRequestManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = JobRequestSchema;
    }

    public async createOrUpdateJobRequests(
        jobRequest: JobRequestDto
    ): Promise<JobRequestDto> {
        const jobRequestToBeUpdated = await this.model.findOne({
            id: jobRequest.id,
        });
        if (jobRequestToBeUpdated !== null) {
            const roleUpdated = await this.update(
                jobRequestToBeUpdated._id,
                jobRequest
            );
            let jobRequestObject = new JobRequestDto();
            jobRequestObject = plainToClassFromExist(
                jobRequestObject,
                roleUpdated.toJSON(),
                { excludeExtraneousValues: true }
            );
            return jobRequestObject;
        } else {
            const jobRequestCreated = await this.insert(jobRequest);
            let jobRequestObject = new JobRequestDto();
            jobRequestObject = plainToClassFromExist(
                jobRequestObject,
                jobRequestCreated.toJSON(),
                { excludeExtraneousValues: true }
            );
            return jobRequestObject;
        }
    }

    public async getJobRequestCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getJobRequestCountForAdmin(
        filterOptions: IAdminJobRequestFilterOptions
    ) {
        const constantFilters = getAdminFilters(filterOptions);
        const jobFilter = await this.getAdminJobRequestFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.COUNT
        );

        if (jobFilter.length > 0) {
            const result = await this.model.aggregate(jobFilter);
            if (result.length > 0) {
                return result[0].count;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public async getJobRequestList(
        filterOptions: IFilterOptions
    ): Promise<JobRequestDto[]> {
        const constantFilters = getFilters(filterOptions);

        const jobRequestList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: JobRequestDto[] = jobRequestList.map((element) => {
            const jobRequestDto = plainToClass(
                JobRequestDto,
                element.toJSON(),
                {
                    excludeExtraneousValues: true,
                    groups: ["singleJobRequest"],
                }
            );
            return jobRequestDto;
        });
        return formattedList;
    }

    public async getJobRequestListForAdmin(
        filterOptions: IAdminJobRequestFilterOptions
    ): Promise<AdminJobRequestListDto[]> {
        const constantFilters = getAdminFilters(filterOptions);
        const jobFilter = await this.getAdminJobRequestFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.DATA
        );

        if (jobFilter.length > 0) {
            const LatestJobList = await this.model.aggregate(jobFilter);
            if (LatestJobList) {
                const formattedList: AdminJobRequestListDto[] =
                    LatestJobList.map((job) => {
                        return plainToClassFromExist(
                            new AdminJobRequestListDto(),
                            job,
                            {
                                excludeExtraneousValues: true,
                            }
                        );
                    });
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getAdminJobRequestFilterQuery(
        filterOptions: IAdminJobRequestFilterOptions,
        constantFilters: IAdminJobRequestSelectFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const adminJobFilter: Object[] = [];
        const radius =
            filterOptions.radius?.trim().length > 0
                ? Number(filterOptions.radius?.trim())
                : 1000;
        const days =
            filterOptions.days?.trim().length > 0
                ? Number(filterOptions.days)
                : 3650;
        const longitude =
            filterOptions.longitude?.trim().length > 0
                ? Number(filterOptions.longitude?.trim())
                : 79.8541134; //Colombo longitude for now
        const latitude =
            filterOptions.latitude?.trim().length > 0
                ? Number(filterOptions.latitude?.trim())
                : 6.9387469; //Colombo latitude for now

        adminJobFilter.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                distanceField: "dist.calculated",
                maxDistance: Number(radius) * 1609.345, //convert to meter
                includeLocs: "dist.location",
                distanceMultiplier: 1 / 1000, //convert to kilo meter
                spherical: true,
            },
        });
        adminJobFilter.push({
            $match: {
                ...constantFilters,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "jobcategories",
                let: {
                    id: "$category",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$id", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            category: 1,
                        },
                    },
                ],
                as: "categoryDetails",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "users",
                let: {
                    userId: "$employeeId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$userId", "$$userId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            "profileImage.url": 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                ],
                as: "employeeDetails",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$employeeDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "users",
                let: {
                    userId: "$employerId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$userId", "$$userId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            "profileImage.url": 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                ],
                as: "employerDetails",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$employerDetails",
                preserveNullAndEmptyArrays: true,
            },
        });
        adminJobFilter.push({
            $addFields: {
                jobCategory: "$categoryDetails.category",
                employerFirstName: "$employerDetails.firstName",
                employerLastName: "$employerDetails.lastName",
                employerProfile: "$employerDetails.profileImage.url",
                employeeFirstName: "$employeeDetails.firstName",
                employeeLastName: "$employeeDetails.lastName",
                employeeProfile: "$employeeDetails.profileImage.url",
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
                distance: "$dist.calculated",
            },
        });
        adminJobFilter.push({
            $project: {
                _id: 0,
                isActive: 1,
                id: 1,
                title: 1,
                description: 1,
                image: { $arrayElemAt: ["$images.url", 0] },
                jobCategory: 1,
                employerFirstName: 1,
                employerLastName: 1,
                employerProfile: 1,
                employeeFirstName: 1,
                employeeLastName: 1,
                employeeProfile: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
                distance: 1,
            },
        });
        adminJobFilter.push({
            $match: {
                days: { $lte: days },
            },
        });
        adminJobFilter.push({
            $sort: {
                updatedAt: -1,
            },
        });

        if (searchType === SearchType.DATA) {
            adminJobFilter.push({
                $skip: filterOptions.skip,
            });
            adminJobFilter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            adminJobFilter.push({
                $count: "count",
            });
        }

        return adminJobFilter;
    }

    public async getJobRequestById(
        jobRequestDto: JobRequestDto
    ): Promise<JobRequestDto> {
        const jobRequest = await this.model.findOne({
            id: jobRequestDto.id,
        });

        if (jobRequest) {
            const singleJobRequest = plainToClassFromExist(
                new JobRequestDto(),
                jobRequest.toJSON()
            );
            return singleJobRequest;
        } else {
            return null;
        }
    }

    public async getSingleJobRequestByAdmin(
        jobRequestDto: JobRequestDto
    ): Promise<AdminSingleJobRequestDto> {
        const adminJobFilter: Object[] = [];
        adminJobFilter.push({
            $match: {
                id: jobRequestDto.id,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "jobcategories",
                let: {
                    id: "$category",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$id", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            category: 1,
                        },
                    },
                ],
                as: "categoryDetails",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "users",
                let: {
                    userId: "$employeeId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$userId", "$$userId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            "profileImage.url": 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                ],
                as: "employeeDetails",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$employeeDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "jobrequestacceptances",
                let: {
                    id: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$jobRequestId", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            employerId: 1,
                            jobRequestId: 1,
                            status: 1,
                        },
                    },
                ],
                as: "jobRequestAcceptances",
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "users",
                localField: "jobRequestAcceptances.employerId",
                foreignField: "userId",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            userId: 1,
                            "profileImage.url": 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                ],
                as: "users",
            },
        });
        adminJobFilter.push({
            $set: {
                jobRequestAcceptances: {
                    $map: {
                        input: "$jobRequestAcceptances",
                        in: {
                            $mergeObjects: [
                                "$$this",
                                {
                                    employerDetails: {
                                        $arrayElemAt: [
                                            "$users",
                                            {
                                                $indexOfArray: [
                                                    "$users.userId",
                                                    "$$this.employerId",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        });
        adminJobFilter.push({
            $unset: "users",
        });
        adminJobFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    employeeId: "$employeeId",
                    jobId: "$id",
                    type: "job-request",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$employeeId"],
                                    },
                                    {
                                        $eq: ["$jobId", "$$jobId"],
                                    },
                                    {
                                        $eq: ["$jobType", "$$type"],
                                    },
                                ],
                            },
                        },
                    },
                    {
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
                                    },
                                },
                            ],
                            as: "reviewer",
                        },
                    },
                    {
                        $unwind: "$reviewer",
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            review: 1,
                            rating: 1,
                            communication: 1,
                            serviceAsDescribed: 1,
                            recommend: 1,
                            completionOnTime: 1,
                            reviewer: 1,
                            "images.url": 1,
                            faqs: 1,
                            createdAt: 1,
                        },
                    },
                ],
                as: "reviews",
            },
        });
        adminJobFilter.push({
            $addFields: {
                jobCategory: "$categoryDetails.category",
                employeeFirstName: "$employeeDetails.firstName",
                employeeLastName: "$employeeDetails.lastName",
                employeeProfile: "$employeeDetails.profileImage.url",
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
                images: "$images.url",
            },
        });
        adminJobFilter.push({
            $project: {
                _id: 0,
                status: 1,
                id: 1,
                title: 1,
                description: 1,
                images: 1,
                jobCategory: 1,
                employeeFirstName: 1,
                employeeLastName: 1,
                employeeProfile: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
                faqs: 1,
                prices: 1,
                jobRequestAcceptances: 1,
                reviews: 1,
            },
        });
        if (adminJobFilter.length > 0) {
            const singleJob = await this.model.aggregate(adminJobFilter);
            return singleJob[0];
        }
        return null;
    }

    public async deleteJobRequest(jobRequestDto: JobRequestDto): Promise<any> {
        const jobRequestToBeDeleted = await this.model.findOne({
            id: jobRequestDto.id,
        });
        if (jobRequestToBeDeleted !== null) {
            let jobRequest = jobRequestToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: jobRequest._id });
        } else {
            return null;
        }
    }

    public async getLatestJobRequestsCount(
        filterOptions: ILatestJobRequestFilterOptions
    ) {
        const jobRequestFilter = await this.getLatestJobRequestsFilterQuery(
            filterOptions,
            SearchType.COUNT
        );

        if (jobRequestFilter.length > 0) {
            const result = await this.model.aggregate(jobRequestFilter);
            if (result.length > 0) {
                return result[0].count;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public async getLatestJobRequests(
        filterOptions: ILatestJobRequestFilterOptions
    ): Promise<LatestJobRequestDto[]> {
        const jobRequestFilter = await this.getLatestJobRequestsFilterQuery(
            filterOptions,
            SearchType.DATA
        );

        if (jobRequestFilter.length > 0) {
            const LatestJobRequestList = await this.model.aggregate(
                jobRequestFilter
            );
            if (LatestJobRequestList) {
                const formattedList: LatestJobRequestDto[] =
                    LatestJobRequestList.map((JobRequest) => {
                        return plainToClassFromExist(
                            new LatestJobRequestDto(),
                            JobRequest,
                            {
                                excludeExtraneousValues: true,
                            }
                        );
                    });
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getLatestJobRequestsFilterQuery(
        filterOptions: ILatestJobRequestFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const jobRequestFilter: Object[] = [];
        jobRequestFilter.push({
            $match: {
                isActive: true,
            },
        });
        jobRequestFilter.push({
            $lookup: {
                from: "users",
                let: {
                    userId: "$employeeId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$userId", "$$userId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            "profileImage.url": 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                ],
                as: "userDetails",
            },
        });
        jobRequestFilter.push({
            $lookup: {
                from: "jobcategories",
                let: {
                    id: "$category",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$id", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            category: 1,
                        },
                    },
                ],
                as: "categoryDetails",
            },
        });
        jobRequestFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    employeeId: "$employeeId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$employeeId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
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
                            as: "reviewer",
                        },
                    },
                    {
                        $unwind: "$reviewer",
                    },
                    {
                        $project: {
                            _id: 0,
                            review: 1,
                            rating: 1,
                            communication: 1,
                            serviceAsDescribed: 1,
                            recommend: 1,
                            completionOnTime: 1,
                            reviewer: 1,
                            images: 1,
                            faqs: 1,
                            createdAt: 1,
                        },
                    },
                ],
                as: "reviews",
            },
        });
        jobRequestFilter.push({
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        jobRequestFilter.push({
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        jobRequestFilter.push({
            $addFields: {
                totalRating: {
                    $sum: "$reviews.rating",
                },
                totalCommunication: {
                    $sum: "$reviews.communication",
                },
                totalServiceAsDescribed: {
                    $sum: "$reviews.serviceAsDescribed",
                },
                totalRecommend: {
                    $sum: "$reviews.recommend",
                },
                totalCompletionOnTime: {
                    $sum: "$reviews.completionOnTime",
                },
                totalNoOfReviews: {
                    $size: "$reviews",
                },
            },
        });

        jobRequestFilter.push({
            $project: {
                _id: 0,
                status: 1,
                employerId: 1,
                employeeId: 1,
                category: "$categoryDetails.category",
                title: 1,
                description: 1,
                bids: 1,
                images: 1,
                id: 1,
                faqs: 1,
                createdAt: 1,
                updatedAt: 1,
                location: 1,
                profileImage: "$userDetails.profileImage.url",
                firstName: "$userDetails.firstName",
                lastName: "$userDetails.lastName",
                reviews: 1,
                totalNoOfReviews: 1,
                overallRating: {
                    $cond: {
                        if: {
                            $eq: ["$totalNoOfReviews", 0],
                        },
                        then: 0,
                        else: {
                            $divide: ["$totalRating", "$totalNoOfReviews"],
                        },
                    },
                },
                communication: {
                    $cond: {
                        if: {
                            $eq: ["$totalNoOfReviews", 0],
                        },
                        then: 0,
                        else: {
                            $divide: [
                                "$totalCommunication",
                                "$totalNoOfReviews",
                            ],
                        },
                    },
                },
                serviceAsDescribed: {
                    $cond: {
                        if: {
                            $eq: ["$totalNoOfReviews", 0],
                        },
                        then: 0,
                        else: {
                            $divide: [
                                "$totalServiceAsDescribed",
                                "$totalNoOfReviews",
                            ],
                        },
                    },
                },
                recommend: {
                    $cond: {
                        if: {
                            $eq: ["$totalNoOfReviews", 0],
                        },
                        then: 0,
                        else: {
                            $divide: ["$totalRecommend", "$totalNoOfReviews"],
                        },
                    },
                },
                completionOnTime: {
                    $cond: {
                        if: {
                            $eq: ["$totalNoOfReviews", 0],
                        },
                        then: 0,
                        else: {
                            $divide: [
                                "$totalCompletionOnTime",
                                "$totalNoOfReviews",
                            ],
                        },
                    },
                },
            },
        });

        jobRequestFilter.push({
            $sort: {
                updatedAt: -1,
            },
        });

        if (searchType === SearchType.DATA) {
            jobRequestFilter.push({
                $skip: filterOptions.skip,
            });
            jobRequestFilter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            jobRequestFilter.push({
                $count: "count",
            });
        }

        return jobRequestFilter;
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    employeeId: string;
    category: string;
    title: string;
    isActive: boolean;
}
export interface ISelectFilterOptions {
    employeeId: string;
    category: string;
    title: string;
    isActive: boolean;
}

export interface ILatestJobRequestFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
}

export interface IAdminJobRequestFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    status: string;
    category: string;
    title: string;
    longitude: string;
    latitude: string;
    radius: string;
    days: string;
    employerId: string;
}
export interface IAdminJobRequestSelectFilterOptions {
    status: boolean;
    category: string;
    title: string;
    longitude: string;
    latitude: string;
    radius: string;
    days: string;
    employerId: string;
}
