import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { JobSchema } from "./models/jobs";
import { JobDto } from "../dto/jobs/jobDto";
import { JobStatus, UserRoles } from "../utils/enums";
import {UserSchema} from "./models/user";
import { getUserId } from "@tradeemp-api-common/util";

export default class UserManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = UserSchema;
    }

    public async getUserFullProfile(
        userId: string,
        role: string
    ): Promise<any> {
        let filter;
        if (role === UserRoles.EMPLOYEE) {
            filter = this.getEmployeeFilter(userId, role);
        } else {
            filter = this.getEmployerFilter(userId, role);
        }
        const user = await this.model.aggregate(filter);
        if (user !== null) {
            return user;
        } else {
            return null;
        }
    }

    public getEmployeeFilter(userId: string, role: string) {
        const userFilter: Object[] = [];
        userFilter.push({
            $match: {
                userId,
                role,
            },
        });
        userFilter.push({
            $lookup: {
                from: "jobrequests",
                let: {
                    employeeId: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employeeId", "$$employeeId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            category: 1,
                            title: 1,
                            description: 1,
                            images: 1,
                            faqs: 1,
                            prices: 1,
                        },
                    },
                ],
                as: "jobRequests",
            },
        });
        userFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    holderId: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$holderId"],
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
        userFilter.push({
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
        userFilter.push({
            $project: {
                _id: 0,
                email: 1,
                address: 1,
                contacts: 1,
                createdAt: 1,
                firstName: 1,
                lastName: 1,
                role: 1,
                userId: 1,
                profileImage: "$profileImage.url",
                jobRequests: 1,
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
        return userFilter;
    }

    public getEmployerFilter(userId: string, role: string) {
        const userFilter: Object[] = [];
        userFilter.push({
            $match: {
                userId,
                role,
            },
        });
        userFilter.push({
            $lookup: {
                from: "jobs",
                let: {
                    employerId: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employerId", "$$employerId"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            id: 1,
                            category: 1,
                            title: 1,
                            description: 1,
                            images: 1,
                            faqs: 1,
                        },
                    },
                ],
                as: "jobs",
            },
        });
        userFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    holderId: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$holderId"],
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
        userFilter.push({
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
        userFilter.push({
            $project: {
                _id: 0,
                email: 1,
                address: 1,
                contacts: 1,
                createdAt: 1,
                firstName: 1,
                lastName: 1,
                role: 1,
                userId: 1,
                profileImage: "$profileImage.url",
                jobs: 1,
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
        return userFilter;
    }

    public async getSingleUserByAdmin(userId: string): Promise<any> {
        let filter = this.getSingleUserFilter(userId);
        const users = await this.model.aggregate(filter);
        if (users.length > 0) {
            return users;
        } else {
            return null;
        }
    }

    public getSingleUserFilter(userId: string) {
        const userFilter: Object[] = [];
        userFilter.push({
            $match: {
                userId: userId,
            },
        });
        userFilter.push({
            $lookup: {
                from: "bids",
                let: {
                    id: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employeeId", "$$id"],
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
        userFilter.push({
            $lookup: {
                from: "jobrequestacceptances",
                let: {
                    id: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employerId", "$$id"],
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
        userFilter.push({
            $lookup: {
                from: "jobrequests",
                let: {
                    id: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employeeId", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: "myJobRquests",
            },
        });
        userFilter.push({
            $lookup: {
                from: "jobs",
                let: {
                    id: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$employerId", "$$id"],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: "myJobs",
            },
        });
        userFilter.push({
            $lookup: {
                from: "reviews",
                let: {
                    holderId: "$userId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$holderId", "$$holderId"],
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
        userFilter.push({
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
        userFilter.push({
            $project: {
                _id: 0,
                email: 1,
                address: 1,
                contacts: 1,
                createdAt: 1,
                firstName: 1,
                lastName: 1,
                role: 1,
                userId: 1,
                availability: 1,
                equipments: 1,
                experiences: 1,
                isAvailable: 1,
                disabled: 1,
                profileImage: "$profileImage.url",
                jobRequests: 1,
                bids: 1,
                jobRequestAcceptances: 1,
                myJobRquests: 1,
                myJobs: 1,
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
        return userFilter;
    }

    public async getUserForAdminJobFilter(): Promise<any> {
        const filter = this.getUsersForAdminJobFilterQuery();
        const users = await this.model.aggregate(filter);
        if (users.length > 0) {
            return users;
        } else {
            return null;
        }
    }

    public getUsersForAdminJobFilterQuery() {
        const userFilter: Object[] = [];
        userFilter.push({
            $match: {
                role: { $ne: UserRoles.SUPPER_ADMIN },
                disabled: 0,
                activated: true,
            },
        });
        userFilter.push({
            $project: {
                _id: 0,
                userId: 1,
                name: { $concat: ["$firstName", " ", "$lastName"] },
            },
        });
        return userFilter;
    }
}
