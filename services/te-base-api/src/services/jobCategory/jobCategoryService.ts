import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import JobCategoryManagerRepository, {
    IFilterOptions,
} from "../../dal/jobCategoryManagerRepository";
import { JobCategoryDto } from "../../dto/jobCategory/jobCategoryDto";
import JobCategoryFilterDto from "../../dto/jobCategory/jobCategoryFilterDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    ERROR_CODES,
} from "../../utils/errorCodes";
import { SortOrder } from "../../utils/enums";
import {
    FileUploadResponseDto,
    FileUploadDto,
} from "../../dto/common/fileUploadDto";

const cloudinary = require("cloudinary").v2;

// const AWS = require('aws-sdk');

const getFilterOptions = (options: JobCategoryFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    category: options.category,
});

export default class JobCategoryService extends AbstractService {
    private jobCategoryRepo: JobCategoryManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.jobCategoryRepo = new JobCategoryManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateJobCategory(
        jobCategoryDto: JobCategoryDto
    ): Promise<IActionResponse> {
        if (jobCategoryDto.id === undefined) {
            jobCategoryDto.id = Date.now().toString();
        }
        const jobCategory =
            await this.jobCategoryRepo.createOrUpdateJobCategory(
                jobCategoryDto
            );
        return jobCategory === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12003])
            : { success: true, data: jobCategory };
    }

    public async getPaginationInfo(
        options: JobCategoryFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalJobCategoryCount =
            await this.jobCategoryRepo.getJobCategoryCount(filterOptions);
        paginationInfo.pages = Math.ceil(
            totalJobCategoryCount / options.pageSize
        );
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobCategoryCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getJobCategoryList(
        options: JobCategoryFilterDto
    ): Promise<JobCategoryDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobCategory = await this.jobCategoryRepo.getJobCategoryList(
            filterOptions
        );
        return jobCategory;
    }

    public async getJobCategoryByJobCategoryId(
        jobCategoryDto: JobCategoryDto
    ): Promise<IActionResponse> {
        const jobCategory = await this.jobCategoryRepo.getJobCategoryById(
            jobCategoryDto
        );
        return jobCategory === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12002])
            : { success: true, data: jobCategory };
    }

    public async deleteJobCategory(
        jobCategoryDto: JobCategoryDto
    ): Promise<IActionResponse> {
        const result = await this.jobCategoryRepo.deleteJobCategory(
            jobCategoryDto
        );
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12002])
            : { success: true, data: result };
    }

    public async uploadJobCategoryImage(
        files: FileUploadDto[],
    ): Promise<IActionResponse> {
        cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        });

        let path = "";
        if (process.env.NODE_ENV === "dev") {
            path = `${process.env.TRADE_EMP_JOB_CATEGORY_IMAGE_PATH_DEV}`;
        } else {
            path = `${process.env.TRADE_EMP_JOB_CATEGORY_IMAGE_PATH_LIVE}`;
        }
        let response = new FileUploadResponseDto();
        let uploadImage = files.map(
            (element) =>
                new Promise((resolve, reject) => {
                    const options = {
                        use_filename: true,
                        unique_filename: false,
                        overwrite: true,
                    };
                    cloudinary.uploader.upload(
                        element.path,
                        {
                            upload_preset: `${process.env.TE_DEV_JOB_CATEGORY_IMAGE_UPLOAD_PRESET}`,
                        },
                        (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                response.id = element.id;
                                response.name = element.name;
                                response.type = "." + element.type;
                                response.uploadedAt = element.uploadedAt;
                                response.url = data.secure_url;
                                response.size = element.size;
                                resolve(response);
                            }
                        }
                    );
                })
        );
        return Promise.all([...uploadImage])
            .then(async (results: string[]) => {
                return { success: true, data: results };
            })
            .catch((e) => {
                console.error(e);
                return GET_ERROR_BY_ERROR_CODE(ERROR_CODES[13007]);
            });
    }
}
