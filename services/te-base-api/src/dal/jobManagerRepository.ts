import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { JobSchema } from "./models/jobs";
import { JobDto } from "../dto/jobs/jobDto";
import { JobStatus, SearchType } from "../utils/enums";
import { LatestJobDto } from "../dto/jobs/latestJobDto";
import { AdminJobsListDto } from "../dto/jobs/adminJobsListDto";
import { AdminSingleJobDto } from "../dto/jobs/adminSingleJobDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
            title: filterOptions.title
                ? { $regex: filterOptions.title, $options: "i" }
                : null,
            location: filterOptions.location
                ? { $regex: filterOptions.location, $options: "i" }
                : null,
            employerId: filterOptions.employerId
                ? { $regex: filterOptions.employerId, $options: "i" }
                : null,
        })
    );

const getAdminFilters = (
    filterOptions: IAdminJobFilterOptions
): IAdminJobsSelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
            title: filterOptions.title
                ? { $regex: filterOptions.title, $options: "i" }
                : null,
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
            employerId: filterOptions.employerId
                ? { $regex: filterOptions.employerId, $options: "i" }
                : null,
        })
    );

export default class JobManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = JobSchema;
    }

    public async createOrUpdateJobs(job: JobDto): Promise<JobDto> {
        const jobToBeUpdated = await this.model.findOne({
            id: job.id,
        });
        if (jobToBeUpdated !== null) {
            const roleUpdated = await this.update(jobToBeUpdated._id, job);
            let jobObject = new JobDto();
            jobObject = plainToClassFromExist(jobObject, roleUpdated.toJSON(), {
                excludeExtraneousValues: true,
            });
            return jobObject;
        } else {
            const jobCreated = await this.insert(job);
            let jobObject = new JobDto();
            jobObject = plainToClassFromExist(jobObject, jobCreated.toJSON(), {
                excludeExtraneousValues: true,
            });
            return jobObject;
        }
    }

    public async getJobCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getJobList(filterOptions: IFilterOptions): Promise<JobDto[]> {
        const constantFilters = getFilters(filterOptions);

        const jobList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: JobDto[] = jobList.map((element) => {
            const jobDto = plainToClass(JobDto, element.toJSON(), {
                excludeExtraneousValues: true,
                groups: ["singleJob"],
            });
            return jobDto;
        });
        return formattedList;
    }

    public async getJobByJobId(jobDto: JobDto): Promise<JobDto> {
        const job = await this.model.findOne({
            id: jobDto.id,
        });

        if (job) {
            const singleJob = plainToClassFromExist(
                new JobDto(),
                job.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleJob;
        } else {
            return null;
        }
    }

    public async getSingleJobByAdmin(
        jobDto: JobDto
    ): Promise<AdminSingleJobDto> {
        const adminJobFilter: Object[] = [];
        adminJobFilter.push({
            $match: {
                id: jobDto.id,
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
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "bids",
                let: {
                    id: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$jobId", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            employeeId: 1,
                            jobId: 1,
                            price: 1,
                            status: 1,
                        },
                    },
                ],
                as: "bids",
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "users",
                localField: "bids.employeeId",
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
                bids: {
                    $map: {
                        input: "$bids",
                        in: {
                            $mergeObjects: [
                                "$$this",
                                {
                                    employeeDetails: {
                                        $arrayElemAt: [
                                            "$users",
                                            {
                                                $indexOfArray: [
                                                    "$users.userId",
                                                    "$$this.employeeId",
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
                    employerId: "$employerId",
                    jobId: "$id",
                    type: "job",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$reviewedBy", "$$employerId"],
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
                            let: {
                                userId: "$reviewedBy",
                            },
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
                employerFirstName: "$employerDetails.firstName",
                employerLastName: "$employerDetails.lastName",
                employerProfile: "$employerDetails.profileImage.url",
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
                employerFirstName: 1,
                employerLastName: 1,
                employerProfile: 1,
                employeeFirstName: 1,
                employeeLastName: 1,
                employeeProfile: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
                faqs: 1,
                bids: 1,
                reviews: 1,
            },
        });
        if (adminJobFilter.length > 0) {
            const singleJob = await this.model.aggregate(adminJobFilter);
            return singleJob[0];
        }
        return null;
    }

    public async deleteJob(jobDto: JobDto): Promise<any> {
        const jobToBeDeleted = await this.model.findOne({
            id: jobDto.id,
        });
        if (jobToBeDeleted !== null) {
            let job = jobToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: job._id });
        } else {
            return null;
        }
    }

    public async getJobCountForAdmin(filterOptions: IAdminJobFilterOptions) {
        const constantFilters = getAdminFilters(filterOptions);
        const jobFilter = await this.getAdminJobFilterQuery(
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

    public async getJobListForAdmin(
        filterOptions: IAdminJobFilterOptions
    ): Promise<AdminJobsListDto[]> {
        const constantFilters = getAdminFilters(filterOptions);
        const jobFilter = await this.getAdminJobFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.DATA
        );

        if (jobFilter.length > 0) {
            const LatestJobList = await this.model.aggregate(jobFilter);
            if (LatestJobList) {
                const formattedList: AdminJobsListDto[] = LatestJobList.map(
                    (job) => {
                        return plainToClassFromExist(
                            new AdminJobsListDto(),
                            job,
                            {
                                excludeExtraneousValues: true,
                            }
                        );
                    }
                );
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getAdminJobFilterQuery(
        filterOptions: IAdminJobFilterOptions,
        constantFilters: IAdminJobsSelectFilterOptions,
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
                status: 1,
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

    public async getLatestJobCount(filterOptions: ILatestJobFilterOptions) {
        const jobFilter = await this.getLatestJobFilterQuery(
            filterOptions,
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

    public async getLatestJobs(
        filterOptions: ILatestJobFilterOptions
    ): Promise<LatestJobDto[]> {
        const jobFilter = await this.getLatestJobFilterQuery(
            filterOptions,
            SearchType.DATA
        );

        if (jobFilter.length > 0) {
            const LatestJobList = await this.model.aggregate(jobFilter);
            if (LatestJobList) {
                const formattedList: LatestJobDto[] = LatestJobList.map(
                    (job) => {
                        return plainToClassFromExist(new LatestJobDto(), job, {
                            excludeExtraneousValues: true,
                        });
                    }
                );
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getLatestJobFilterQuery(
        filterOptions: ILatestJobFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const jobFilter: Object[] = [];
        jobFilter.push({
            $match: {
                status: JobStatus.PENDING,
            },
        });
        jobFilter.push({
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
                as: "userDetails",
            },
        });
        jobFilter.push({
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
        jobFilter.push({
            $lookup: {
                from: "bids",
                let: {
                    jobId: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$jobId", "$$jobId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                        },
                    },
                ],
                as: "bids",
            },
        });
        jobFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    employerId: "$employerId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$employerId"],
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
        jobFilter.push({
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        jobFilter.push({
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: false,
            },
        });
        jobFilter.push({
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
                activeBids: {
                    $size: "$bids",
                },
            },
        });
        // jobFilter.push({
        //     $sort: {
        //         updatedAt: -1,
        //     },
        // });
        // jobFilter.push({
        //     $limit: 20,
        // });
        jobFilter.push({
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
                activeBids: 1,
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
        jobFilter.push({
            $sort: {
                updatedAt: -1,
            },
        });

        if (searchType === SearchType.DATA) {
            jobFilter.push({
                $skip: filterOptions.skip,
            });
            jobFilter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            jobFilter.push({
                $count: "count",
            });
        }

        return jobFilter;
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    status: string;
    category: string;
    title: string;
    location: string;
    employerId: string;
}
export interface ISelectFilterOptions {
    status: string;
    category: string;
    location: string;
    title: string;
    employerId: string;
}

export interface ILatestJobFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
}
export interface IAdminJobFilterOptions {
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
export interface IAdminJobsSelectFilterOptions {
    status: string;
    category: string;
    title: string;
    longitude: string;
    latitude: string;
    radius: string;
    days: string;
    employerId: string;
}
