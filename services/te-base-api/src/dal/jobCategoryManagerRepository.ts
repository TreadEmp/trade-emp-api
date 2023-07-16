import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { JobCategoryDto } from "../dto/jobCategory/jobCategoryDto";
import { JobCategorySchema } from "./models/jobCategory";
import { FileUploadResponseDto } from "../dto/common/fileUploadDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
        })
    );

export default class JobCategoryManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = JobCategorySchema;
    }

    public async createOrUpdateJobCategory(
        jobCategoryDto: JobCategoryDto
    ): Promise<JobCategoryDto> {
        const jobCategory = await this.model.findOneAndUpdate(
            {
                id: jobCategoryDto.id,
            },
            {
                $set: jobCategoryDto,
            },
            { new: true, safe: true, upsert: true }
        );

        let jobCategoryObj = new JobCategoryDto();
        jobCategoryObj = plainToClassFromExist(
            jobCategoryObj,
            jobCategory.toJSON(),
            { excludeExtraneousValues: true }
        );

        return jobCategoryObj;
    }

    public async getJobCategoryCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getJobCategoryList(
        filterOptions: IFilterOptions
    ): Promise<JobCategoryDto[]> {
        const constantFilters = getFilters(filterOptions);

        const jobCategoryList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: JobCategoryDto[] = jobCategoryList.map(
            (element) => {
                const jobCategoryDto = plainToClass(
                    JobCategoryDto,
                    element.toJSON(),
                    {
                        excludeExtraneousValues: true,
                    }
                );
                return jobCategoryDto;
            }
        );
        return formattedList;
    }

    public async getJobCategoryById(
        jobCategoryDto: JobCategoryDto
    ): Promise<JobCategoryDto> {
        const jobCategory = await this.model.findOne({
            id: jobCategoryDto.id,
        });

        if (jobCategory) {
            const singleJobCategory = plainToClassFromExist(
                new JobCategoryDto(),
                jobCategory.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleJobCategory;
        } else {
            return null;
        }
    }

    public async deleteJobCategory(
        jobCategoryDto: JobCategoryDto
    ): Promise<any> {
        const jobCategoryToBeDeleted = await this.model.findOne({
            id: jobCategoryDto.id,
        });
        if (jobCategoryToBeDeleted !== null) {
            let jobCategory = jobCategoryToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: jobCategory._id });
        } else {
            return null;
        }
    }

    public async updateJobCategoryImage(
        jobCategoryId: string,
        jobCategoryImage: FileUploadResponseDto
    ): Promise<JobCategoryDto> {
        const jobCategory = await this.model.findOneAndUpdate(
            { id: jobCategoryId },
            {
                $set: {
                    "image.id": jobCategoryImage.id,
                    "image.name": jobCategoryImage.name,
                    "image.type": jobCategoryImage.type,
                    "image.url": jobCategoryImage.url,
                    "image.size": jobCategoryImage.size,
                    "image.uploadedAt": jobCategoryImage.uploadedAt,
                },
            },
            { new: true, safe: true, upsert: true }
        );
        if (jobCategory) {
            return jobCategory;
        }
        return null;
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    category: string;
}
export interface ISelectFilterOptions {
    category: string;
}
