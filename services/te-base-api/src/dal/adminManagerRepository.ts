import { BaseRepository } from "./baseRepository";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { BidSchema } from "./models/bids";
import { UserSchema } from "./models/user";
import { JobSchema } from "./models/jobs";
import { JobCategorySchema } from "./models/jobCategory";
import { EquipmentSchema } from "./models/equipments";
import { ExperienceSchema } from "./models/experiences";
import { ToolCategorySchema } from "./models/toolCategory";
import { JobRequestSchema } from "./models/jobRequests";
import { DashboardDto } from "../dto/admin/dashboardDto";
import { JobRequestAcceptanceSchema } from "./models/jobRequestAcceptance";
import { SearchType } from "../utils/enums";
import { BidsByJobDto } from "../dto/admin/bidsByJobDto";
import { plainToClassFromExist } from "class-transformer";
import { AcceptanceByJobRequestDto } from "../dto/admin/acceptanceByJobRequestDto";

const getAdminBidsByJobIdFilters = (
    filterOptions: IFilterOptions
): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            employeeId: filterOptions.employeeId
                ? { $regex: filterOptions.employeeId, $options: "i" }
                : null,
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
        })
    );

const getAdminAcceptanceByJobRequestIdFilters = (
    filterOptions: IAcceptanceFilterOptions
): IAcceptanceSelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            employerId: filterOptions.employerId
                ? { $regex: filterOptions.employerId, $options: "i" }
                : null,
            status: filterOptions.status
                ? { $regex: filterOptions.status, $options: "i" }
                : null,
        })
    );

export default class AdminManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    userModel: any;
    jobModel: any;
    jobCategoryModel: any;
    equipmentModel: any;
    experienceModel: any;
    toolCategoryModel: any;
    jobRequestModel: any;
    jobAcceptanceModel: any;
    constructor() {
        super();
        this.model = BidSchema;
        this.userModel = UserSchema;
        this.jobModel = JobSchema;
        this.jobCategoryModel = JobCategorySchema;
        this.equipmentModel = EquipmentSchema;
        this.experienceModel = ExperienceSchema;
        this.toolCategoryModel = ToolCategorySchema;
        this.jobRequestModel = JobRequestSchema;
        this.jobAcceptanceModel = JobRequestAcceptanceSchema;
    }

    public async getDashboardDetails() {
        const bids = await this.model.countDocuments();
        const users = await this.userModel.countDocuments({
            role: { $ne: "Super Admin" },
        });
        const jobs = await this.jobModel.countDocuments();
        const jobCategories = await this.jobCategoryModel.countDocuments();
        const equipments = await this.equipmentModel.countDocuments();
        const experiences = await this.experienceModel.countDocuments();
        const toolCategories = await this.toolCategoryModel.countDocuments();
        const jobRequests = await this.jobRequestModel.countDocuments();

        const dashboardDto = new DashboardDto();

        dashboardDto.bids = bids;
        dashboardDto.users = users;
        dashboardDto.jobs = jobs;
        dashboardDto.JobCategories = jobCategories;
        dashboardDto.equipments = equipments;
        dashboardDto.experiences = experiences;
        dashboardDto.toolCategories = toolCategories;
        dashboardDto.jobRequests = jobRequests;

        return dashboardDto;
    }

    public async getUserBidsByAdmin(userId: string) {
        const adminBidFilter: Object[] = [];
        adminBidFilter.push({
            $match: {
                employeeId: userId,
            },
        });
        adminBidFilter.push({
            $lookup: {
                from: "jobs",
                let: {
                    jobId: "$jobId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$id", "$$jobId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: {
                                employerId: "$employerId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$userId", "$$employerId"],
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
                            as: "employer",
                        },
                    },
                    {
                        $unwind: "$employer",
                    },
                    {
                        $lookup: {
                            from: "jobcategories",
                            let: {
                                category: "$category",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$id", "$$category"],
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
                            as: "jobCategory",
                        },
                    },
                    {
                        $unwind: "$jobCategory",
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            employer: 1,
                            category: "$jobCategory.category",
                            title: 1,
                            description: 1,
                            status: 1,
                        },
                    },
                ],
                as: "job",
            },
        });
        adminBidFilter.push({
            $unwind: {
                path: "$job",
                preserveNullAndEmptyArrays: true,
            },
        });
        adminBidFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminBidFilter.push({
            $project: {
                _id: 0,
                id: 1,
                job: 1,
                createdAt: 1,
                price: 1,
                status: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
            },
        });
        if (adminBidFilter.length > 0) {
            const data = await this.model.aggregate(adminBidFilter);
            return data;
        }
        return null;
    }

    public async getUserJobAcceptanceByAdmin(userId: string) {
        const adminJobRequestFilter: Object[] = [];
        adminJobRequestFilter.push({
            $match: {
                employerId: userId,
            },
        });
        adminJobRequestFilter.push({
            $lookup: {
                from: "jobrequests",
                let: {
                    jobRequestId: "$jobRequestId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$id", "$$jobRequestId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: {
                                employeeId: "$employeeId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$userId", "$$employeeId"],
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
                            as: "employee",
                        },
                    },
                    {
                        $unwind: "$employee",
                    },
                    {
                        $lookup: {
                            from: "jobcategories",
                            let: {
                                category: "$category",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$id", "$$category"],
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
                            as: "jobCategory",
                        },
                    },
                    {
                        $unwind: "$jobCategory",
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            employee: 1,
                            category: "$jobCategory.category",
                            title: 1,
                            description: 1,
                            isActive: 1,
                        },
                    },
                ],
                as: "jobRequest",
            },
        });
        adminJobRequestFilter.push({
            $unwind: {
                path: "$jobRequest",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobRequestFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminJobRequestFilter.push({
            $project: {
                _id: 0,
                id: 1,
                jobRequest: 1,
                createdAt: 1,
                price: 1,
                status: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
            },
        });
        if (adminJobRequestFilter.length > 0) {
            const data = await this.jobAcceptanceModel.aggregate(
                adminJobRequestFilter
            );
            return data;
        }
        return null;
    }

    public async getUserJobsByAdmin(userId: string) {
        const adminJobFilter: Object[] = [];
        adminJobFilter.push({
            $match: {
                employerId: userId,
            },
        });
        adminJobFilter.push({
            $lookup: {
                from: "jobcategories",
                let: {
                    categoryId: "$category",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$categoryId"],
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
                as: "jobCategory",
            },
        });
        adminJobFilter.push({
            $unwind: {
                path: "$jobCategory",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobFilter.push({
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
                        $lookup: {
                            from: "users",
                            let: {
                                employeeId: "$employeeId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$userId", "$$employeeId"],
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
                            as: "employee",
                        },
                    },
                    {
                        $unwind: "$employee",
                    },
                    {
                        $project: {
                            id: 1,
                            _id: 0,
                            price: 1,
                            createdAt: 1,
                            status: 1,
                            employee: 1,
                        },
                    },
                    { $limit: 10 },
                ],
                as: "bids",
            },
        });
        adminJobFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminJobFilter.push({
            $project: {
                _id: 0,
                id: 1,
                description: 1,
                createdAt: 1,
                title: 1,
                status: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
                jobCategory: "$jobCategory.category",
                bids: 1,
                images: "$images.url",
            },
        });
        if (adminJobFilter.length > 0) {
            const data = await this.jobModel.aggregate(adminJobFilter);
            return data;
        }
        return null;
    }

    public async getUserJobRequestsByAdmin(userId: string) {
        const adminJobRequestFilter: Object[] = [];
        adminJobRequestFilter.push({
            $match: {
                employeeId: userId,
            },
        });
        adminJobRequestFilter.push({
            $lookup: {
                from: "jobcategories",
                let: {
                    categoryId: "$category",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$id", "$$categoryId"],
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
                as: "jobCategory",
            },
        });
        adminJobRequestFilter.push({
            $unwind: {
                path: "$jobCategory",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminJobRequestFilter.push({
            $lookup: {
                from: "jobrequestacceptances",
                let: {
                    jobRequestId: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$jobRequestId",
                                            "$$jobRequestId",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: {
                                employerId: "$employerId",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$userId", "$$employerId"],
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
                            as: "employer",
                        },
                    },
                    {
                        $unwind: "$employer",
                    },
                    {
                        $project: {
                            id: 1,
                            _id: 0,
                            createdAt: 1,
                            status: 1,
                            employer: 1,
                        },
                    },
                    {
                        $limit: 10,
                    },
                ],
                as: "JobRequestAcceptance",
            },
        });
        adminJobRequestFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminJobRequestFilter.push({
            $project: {
                _id: 0,
                id: 1,
                description: 1,
                createdAt: 1,
                title: 1,
                isActive: 1,
                days: {
                    $divide: ["$diff_msecs", 1000 * 60 * 60 * 24],
                },
                jobCategory: "$jobCategory.category",
                JobRequestAcceptance: 1,
                images: "$images.url",
            },
        });
        if (adminJobRequestFilter.length > 0) {
            const data = await this.jobRequestModel.aggregate(
                adminJobRequestFilter
            );
            return data;
        }
        return null;
    }

    public async adminGetAllBidsByJobIdCount(filterOptions: IFilterOptions) {
        const constantFilters = getAdminBidsByJobIdFilters(filterOptions);
        const bidFilter = await this.getAdminBidsByJobIdFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.COUNT
        );

        if (bidFilter.length > 0) {
            const result = await this.model.aggregate(bidFilter);
            if (result.length > 0) {
                return result[0].count;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public async adminGetAllBidsByJobId(
        filterOptions: IFilterOptions
    ): Promise<BidsByJobDto[]> {
        const constantFilters = getAdminBidsByJobIdFilters(filterOptions);
        const bidFilter = await this.getAdminBidsByJobIdFilterQuery(
            filterOptions,
            constantFilters,
            SearchType.DATA
        );

        if (bidFilter.length > 0) {
            const bidList = await this.model.aggregate(bidFilter);
            if (bidList) {
                const formattedList: BidsByJobDto[] = bidList.map((bid) => {
                    return plainToClassFromExist(new BidsByJobDto(), bid, {
                        excludeExtraneousValues: true,
                    });
                });
                return formattedList;
            } else {
                return [];
            }
        }
        return [];
    }

    public async getAdminBidsByJobIdFilterQuery(
        filterOptions: IFilterOptions,
        constantFilters: ISelectFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const adminBidFilter: Object[] = [];
        // const radius =
        //     filterOptions.radius?.trim().length > 0
        //         ? Number(filterOptions.radius?.trim())
        //         : 1000;
        // const days =
        //     filterOptions.days?.trim().length > 0
        //         ? Number(filterOptions.days)
        //         : 3650;
        // const longitude =
        //     filterOptions.longitude?.trim().length > 0
        //         ? Number(filterOptions.longitude?.trim())
        //         : 79.8541134; //Colombo longitude for now
        // const latitude =
        //     filterOptions.latitude?.trim().length > 0
        //         ? Number(filterOptions.latitude?.trim())
        //         : 6.9387469; //Colombo latitude for now

        // adminJobFilter.push({
        //     $geoNear: {
        //         near: {
        //             type: "Point",
        //             coordinates: [longitude, latitude],
        //         },
        //         distanceField: "dist.calculated",
        //         maxDistance: Number(radius) * 1609.345, //convert to meter
        //         includeLocs: "dist.location",
        //         distanceMultiplier: 1 / 1000, //convert to kilo meter
        //         spherical: true,
        //     },
        // });

        adminBidFilter.push({
            $match: {
                jobId: filterOptions.jobId,
            },
        });
        adminBidFilter.push({
            $lookup: {
                from: "users",
                let: {
                    employeeId: "$employeeId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$userId", "$$employeeId"],
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
                as: "employee",
            },
        });
        adminBidFilter.push({
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminBidFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminBidFilter.push({
            $project: {
                _id: 0,
                id: 1,
                createdAt: 1,
                price: 1,
                status: 1,
                days: {
                    $divide: ["$diff_msecs", 86400000],
                },
                employee: 1,
                // employeeFirstName: "$employee.firstName",
                // employeeLastName: "$employee.lastName",
                // employeeProfile: "$employee.profileImage",
            },
        });
        // adminJobFilter.push({
        //     $match: {
        //         days: { $lte: days },
        //     },
        // });
        adminBidFilter.push({
            $sort: {
                createdAt: -1,
            },
        });

        if (searchType === SearchType.DATA) {
            adminBidFilter.push({
                $skip: filterOptions.skip,
            });
            adminBidFilter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            adminBidFilter.push({
                $count: "count",
            });
        }

        return adminBidFilter;
    }

    public async adminGetAllAcceptanceByJobRequestIdCount(
        filterOptions: IAcceptanceFilterOptions
    ) {
        const constantFilters =
            getAdminAcceptanceByJobRequestIdFilters(filterOptions);
        const bidFilter =
            await this.adminGetAllAcceptanceByJobRequestIdFilterQuery(
                filterOptions,
                constantFilters,
                SearchType.COUNT
            );

        if (bidFilter.length > 0) {
            const result = await this.jobAcceptanceModel.aggregate(bidFilter);
            if (result.length > 0) {
                return result[0].count;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public async adminGetAllAcceptanceByJobRequestId(
        filterOptions: IAcceptanceFilterOptions
    ): Promise<AcceptanceByJobRequestDto[]> {
        const constantFilters =
            getAdminAcceptanceByJobRequestIdFilters(filterOptions);
        const bidFilter =
            await this.adminGetAllAcceptanceByJobRequestIdFilterQuery(
                filterOptions,
                constantFilters,
                SearchType.DATA
            );

        if (bidFilter.length > 0) {
            const bidList = await this.jobAcceptanceModel.aggregate(bidFilter);
            if (bidList) {
                const formattedList: AcceptanceByJobRequestDto[] = bidList.map(
                    (bid) => {
                        return plainToClassFromExist(
                            new AcceptanceByJobRequestDto(),
                            bid,
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

    public async adminGetAllAcceptanceByJobRequestIdFilterQuery(
        filterOptions: IAcceptanceFilterOptions,
        constantFilters: IAcceptanceSelectFilterOptions,
        searchType: SearchType
    ): Promise<any> {
        const adminFilter: Object[] = [];
        // const radius =
        //     filterOptions.radius?.trim().length > 0
        //         ? Number(filterOptions.radius?.trim())
        //         : 1000;
        // const days =
        //     filterOptions.days?.trim().length > 0
        //         ? Number(filterOptions.days)
        //         : 3650;
        // const longitude =
        //     filterOptions.longitude?.trim().length > 0
        //         ? Number(filterOptions.longitude?.trim())
        //         : 79.8541134; //Colombo longitude for now
        // const latitude =
        //     filterOptions.latitude?.trim().length > 0
        //         ? Number(filterOptions.latitude?.trim())
        //         : 6.9387469; //Colombo latitude for now

        // adminJobFilter.push({
        //     $geoNear: {
        //         near: {
        //             type: "Point",
        //             coordinates: [longitude, latitude],
        //         },
        //         distanceField: "dist.calculated",
        //         maxDistance: Number(radius) * 1609.345, //convert to meter
        //         includeLocs: "dist.location",
        //         distanceMultiplier: 1 / 1000, //convert to kilo meter
        //         spherical: true,
        //     },
        // });

        adminFilter.push({
            $match: {
                jobRequestId: filterOptions.jobRequestId,
            },
        });
        adminFilter.push({
            $lookup: {
                from: "users",
                let: {
                    employerId: "$employerId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$userId", "$$employerId"],
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
                as: "employer",
            },
        });
        adminFilter.push({
            $unwind: {
                path: "$employer",
                preserveNullAndEmptyArrays: false,
            },
        });
        adminFilter.push({
            $addFields: {
                diff_msecs: {
                    $subtract: [new Date(new Date()), "$createdAt"],
                },
            },
        });
        adminFilter.push({
            $project: {
                _id: 0,
                id: 1,
                createdAt: 1,
                price: 1,
                status: 1,
                days: {
                    $divide: ["$diff_msecs", 86400000],
                },
                employer: 1,
                employerId: 1,
                jobRequestId: 1,
            },
        });
        // adminJobFilter.push({
        //     $match: {
        //         days: { $lte: days },
        //     },
        // });
        adminFilter.push({
            $sort: {
                createdAt: -1,
            },
        });

        if (searchType === SearchType.DATA) {
            adminFilter.push({
                $skip: filterOptions.skip,
            });
            adminFilter.push({
                $limit: filterOptions.limit,
            });
        }

        if (searchType === SearchType.COUNT) {
            adminFilter.push({
                $count: "count",
            });
        }

        return adminFilter;
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    employeeId: string;
    jobId: string;
    status: string;
    maxPrice: number;
    minPrice: number;
}
export interface ISelectFilterOptions {
    employeeId: string;
    status: string;
    maxPrice: number;
    minPrice: number;
}

export interface IAcceptanceFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    employerId: string;
    jobRequestId: string;
    status: string;
}
export interface IAcceptanceSelectFilterOptions {
    employerId: string;
    status: string;
}
