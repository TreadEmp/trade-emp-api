import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import JobManagerRepository, {
    IAdminJobFilterOptions,
    IFilterOptions,
    ILatestJobFilterOptions,
} from "../../dal/jobManagerRepository";
import { JobDto } from "../../dto/jobs/jobDto";
import JobFilterDto from "../../dto/jobs/jobFilterDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    ERROR_CODES,
} from "../../utils/errorCodes";
import {
    FileUploadDto,
    FileUploadResponseDto,
} from "../../dto/common/fileUploadDto";
import { LatestJobDto } from "../../dto/jobs/latestJobDto";
import { SortOrder } from "../../utils/enums";
import LatestJobFilterDto from "../../dto/jobs/latestJobFilterDto";
import { AdminJobsListDto } from "../../dto/jobs/adminJobsListDto";
import AdminJobFilterDto from "../../dto/jobs/adminJobFilterDto";
const cloudinary = require("cloudinary").v2;

const getFilterOptions = (options: JobFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    status: options.status,
    category: options.category,
    title: options.title,
    location: options.location,
    employerId: options.employerId,
});

const getAdminFilterOptions = (
    options: AdminJobFilterDto
): IAdminJobFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    status: options.status,
    category: options.category,
    title: options.title,
    longitude: options.longitude,
    latitude: options.latitude,
    radius: options.radius,
    days: options.days,
    employerId: options.employerId,
});

const getLatestJobFilterOptions = (
    options: LatestJobFilterDto
): ILatestJobFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
});

export default class JobService extends AbstractService {
    private jobRepo: JobManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.jobRepo = new JobManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateJobs(jobDto: JobDto): Promise<IActionResponse> {
        if (jobDto.id === undefined) {
            jobDto.id = Date.now().toString();
        }
        const job = await this.jobRepo.createOrUpdateJobs(jobDto);
        return job === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10001])
            : { success: true, data: job };
    }

    public async getPaginationInfo(
        options: JobFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalJobCount = await this.jobRepo.getJobCount(filterOptions);
        paginationInfo.pages = Math.ceil(totalJobCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getPaginationInfoForAdmin(
        options: AdminJobFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getAdminFilterOptions(options);

        const totalJobCount = await this.jobRepo.getJobCountForAdmin(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalJobCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getJobList(options: JobFilterDto): Promise<JobDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobs = await this.jobRepo.getJobList(filterOptions);
        return jobs;
    }

    public async getJobListForAdmin(
        options: AdminJobFilterDto
    ): Promise<AdminJobsListDto[]> {
        const filterOptions = getAdminFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobs = await this.jobRepo.getJobListForAdmin(filterOptions);
        return jobs;
    }

    public async getJobByJobId(jobDto: JobDto): Promise<IActionResponse> {
        const job = await this.jobRepo.getJobByJobId(jobDto);
        return job === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: job };
    }

    public async getSingleJobByAdmin(jobDto: JobDto): Promise<IActionResponse> {
        const job = await this.jobRepo.getSingleJobByAdmin(jobDto);
        return job === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: job };
    }

    public async deleteJob(jobDto: JobDto): Promise<IActionResponse> {
        const result = await this.jobRepo.deleteJob(jobDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: result };
    }

    public async uploadJobImages(
        files: FileUploadDto[]
    ): Promise<IActionResponse> {
        cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        });
        let path = "";
        if (process.env.NODE_ENV === "dev") {
            path = `${process.env.TRADE_EMP_JOB_IMAGE_PATH_DEV}`;
        } else {
            path = `${process.env.TRADE_EMP_JOB_IMAGE_PATH_LIVE}`;
        }

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
                            upload_preset: `${process.env.TE_DEV_JOB_IMAGE_UPLOAD_PRESET}`,
                        },
                        (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                let response = new FileUploadResponseDto();
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
            .then((imageResults: any[]) => {
                if (imageResults.length === files.length) {
                    return { success: true, data: imageResults };
                }
                return GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10004]);
            })
            .catch((e) => {
                console.error(e);
                return GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10005]);
            });
    }

    public async getLatestJobsPaginationInfo(
        options: LatestJobFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getLatestJobFilterOptions(options);

        const totalJobCount = await this.jobRepo.getLatestJobCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalJobCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getLatestJobs(
        options: LatestJobFilterDto
    ): Promise<LatestJobDto[]> {
        const filterOptions = getLatestJobFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobs = await this.jobRepo.getLatestJobs(filterOptions);
        return jobs;
    }
}
