import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import JobRequestManagerRepository, {
    IAdminJobRequestFilterOptions,
    IFilterOptions,
    ILatestJobRequestFilterOptions,
} from "../../dal/jobRequestManagerRepository";
import { JobRequestDto } from "../../dto/jobRequests/jobRequestDto";
import JobRequestFilterDto from "../../dto/jobRequests/jobRequestFilterDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    ERROR_CODES,
} from "../../utils/errorCodes";
import {
    FileUploadDto,
    FileUploadResponseDto,
} from "../../dto/common/fileUploadDto";
import { LatestJobRequestDto } from "../../dto/jobRequests/latestJobRequestDto";
import LatestJobRequestFilterDto from "../../dto/jobRequests/latestJobRequestFilterDto";
import { SortOrder } from "../../utils/enums";
import AdminJobRequestFilterDto from "../../dto/jobRequests/adminJobRequestFilterDto";
import { AdminJobRequestListDto } from "../../dto/jobRequests/adminJobRequestListDto";
import { JOB_REQUEST_STATUS } from "../../shared/enums";
const cloudinary = require("cloudinary").v2;

const getFilterOptions = (options: JobRequestFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    employeeId: options.employeeId,
    category: options.category,
    title: options.title,
    isActive: options.isActive,
});

const getAdminFilterOptions = (
    options: AdminJobRequestFilterDto
): IAdminJobRequestFilterOptions => ({
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

const getLatestJobRequestFilterOptions = (
    options: LatestJobRequestFilterDto
): ILatestJobRequestFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
});

export default class JobRequestService extends AbstractService {
    private jobRequestRepo: JobRequestManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.jobRequestRepo = new JobRequestManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateJobRequests(
        jobRequestDto: JobRequestDto
    ): Promise<IActionResponse> {
        if (jobRequestDto.id === undefined) {
            jobRequestDto.id = Date.now().toString();
        }
        const jobRequest = await this.jobRequestRepo.createOrUpdateJobRequests(
            jobRequestDto
        );
        return jobRequest === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10001])
            : { success: true, data: jobRequest };
    }

    public async getPaginationInfo(
        options: JobRequestFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalJobRequestCount =
            await this.jobRequestRepo.getJobRequestCount(filterOptions);
        paginationInfo.pages = Math.ceil(
            totalJobRequestCount / options.pageSize
        );
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobRequestCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getPaginationInfoForAdmin(
        options: AdminJobRequestFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getAdminFilterOptions(options);

        const totalJobCount =
            await this.jobRequestRepo.getJobRequestCountForAdmin(filterOptions);
        paginationInfo.pages = Math.ceil(totalJobCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getJobRequestList(
        options: JobRequestFilterDto
    ): Promise<JobRequestDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobRequests = await this.jobRequestRepo.getJobRequestList(
            filterOptions
        );
        return jobRequests;
    }

    public async getJobRequestListForAdmin(
        options: AdminJobRequestFilterDto
    ): Promise<AdminJobRequestListDto[]> {
        const filterOptions = getAdminFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobs = await this.jobRequestRepo.getJobRequestListForAdmin(
            filterOptions
        );
        return jobs;
    }

    public async getJobRequestById(
        jobRequestDto: JobRequestDto
    ): Promise<IActionResponse> {
        const jobRequest = await this.jobRequestRepo.getJobRequestById(
            jobRequestDto
        );
        return jobRequest === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: jobRequest };
    }

    public async getSingleJobRequestByAdmin(
        jobRequestDto: JobRequestDto
    ): Promise<IActionResponse> {
        const jobRequest = await this.jobRequestRepo.getSingleJobRequestByAdmin(
            jobRequestDto
        );
        return jobRequest === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: jobRequest };
    }

    public async deleteJobRequest(
        jobRequestDto: JobRequestDto
    ): Promise<IActionResponse> {
        const result = await this.jobRequestRepo.deleteJobRequest(
            jobRequestDto
        );
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10002])
            : { success: true, data: result };
    }

    public async uploadJobRequestImages(
        files: FileUploadDto[]
    ): Promise<IActionResponse> {
        cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        });
        let path = "";
        if (process.env.NODE_ENV === "dev") {
            path = `${process.env.TRADE_EMP_JOB_REQUEST_IMAGE_PATH_DEV}`;
        } else {
            path = `${process.env.TRADE_EMP_JOB_REQUEST_IMAGE_PATH_LIVE}`;
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
                            upload_preset: `${process.env.TE_DEV_JOB_REQUEST_IMAGE_UPLOAD_PRESET}`,
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

    public async getLatestJobRequestsCount(
        options: LatestJobRequestFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getLatestJobRequestFilterOptions(options);

        const totalJobRequestCount =
            await this.jobRequestRepo.getLatestJobRequestsCount(filterOptions);
        paginationInfo.pages = Math.ceil(
            totalJobRequestCount / options.pageSize
        );
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalJobRequestCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getLatestJobRequests(
        options: LatestJobRequestFilterDto
    ): Promise<LatestJobRequestDto[]> {
        const filterOptions = getLatestJobRequestFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const jobRequests = await this.jobRequestRepo.getLatestJobRequests(
            filterOptions
        );
        return jobRequests;
    }
}
