import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { getUserId, _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { JobDto } from "../../dto/jobs/jobDto";
import JobService from "../../services/jobs/jobService";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import JobFilterDto from "../../dto/jobs/jobFilterDto";
import {
    AdminJobResponseModel,
    JobResponseModel,
    RecentJobResponseModel,
} from "./apiModels/jobResponseModel";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import { FileUploadDto } from "../../dto/common/fileUploadDto";
import { readFileSync, unlinkSync } from "fs";
import { JobStatus } from "../../utils/enums";
import { LocationDto } from "../../dto/jobs/locationDto";
import LatestJobFilterDto from "../../dto/jobs/latestJobFilterDto";
import AdminJobFilterDto from "../../dto/jobs/adminJobFilterDto";

const validator = new Validator();
const jobService = new JobService();

export const createOrUpdateJobs = async (req: Request, res: Response) => {
    try {
        const employerId = getUserId(res);
        const jobDto: JobDto = plainToClass(JobDto, req.body, {
            enableImplicitConversion: false,
        });
        jobDto.employerId = employerId;
        jobDto.employeeId = "";
        jobDto.status = JobStatus.PENDING;
        jobDto.location = new LocationDto();
        // let locationDto = new LocationDto();
        jobDto.location.type = "Point";
        jobDto.location.coordinates = [];
        jobDto.location.coordinates.push(Number(req.body.longitude));
        jobDto.location.coordinates.push(Number(req.body.latitude));

        let modifiedJobDto = new JobDto();
        modifiedJobDto.id = jobDto.id;
        modifiedJobDto.employerId = jobDto.employerId;
        modifiedJobDto.employeeId = jobDto.employeeId;
        modifiedJobDto.status = jobDto.status;
        modifiedJobDto.category = jobDto.category;
        modifiedJobDto.title = jobDto.title;
        modifiedJobDto.description = jobDto.description;
        modifiedJobDto.location = jobDto.location;
        modifiedJobDto.images = jobDto.images;
        modifiedJobDto.faqs = jobDto.faqs;

        const errors = await validate(modifiedJobDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult = await jobService.createOrUpdateJobs(
            modifiedJobDto
        );
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }

        const output = {
            success: true,
            data: returnResult.data,
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error("An Exception occurred in createOrUpdateJobs" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobList = async (req: Request, res: Response) => {
    try {
        const jobFilterDto = new JobFilterDto();
        const jobFilter = plainToClassFromExist(jobFilterDto, req.query, {
            enableImplicitConversion: true,
        });

        const errors = await validate(jobFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new JobResponseModel();
        data.pagination = await jobService.getPaginationInfo(jobFilter);
        data.items = await jobService.getJobList(jobFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobList" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobListForAdmin = async (req: Request, res: Response) => {
    try {
        const jobFilterDto = new AdminJobFilterDto();
        const jobFilter = plainToClassFromExist(jobFilterDto, req.query, {
            enableImplicitConversion: true,
        });

        const errors = await validate(jobFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new AdminJobResponseModel();
        data.pagination = await jobService.getPaginationInfoForAdmin(jobFilter);
        data.items = await jobService.getJobListForAdmin(jobFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobListForAdmin" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobByJobId = async (req: Request, res: Response) => {
    try {
        const jobDto = new JobDto();
        jobDto.id = req.params.jobId;

        if (validator.isEmpty(jobDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const errors = await validate(jobDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await jobService.getJobByJobId(jobDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getJobByJobId" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getSingleJobByAdmin = async (req: Request, res: Response) => {
    try {
        const jobDto = new JobDto();
        jobDto.id = req.params.jobId;

        if (validator.isEmpty(jobDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const errors = await validate(jobDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await jobService.getSingleJobByAdmin(jobDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getSingleJobByAdmin" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const deleteJob = async (req: Request, res: Response) => {
    try {
        const jobId = req.query.jobId ? String(req.query.jobId) : undefined;
        const jobDto = new JobDto();
        jobDto.id = jobId;
        if (validator.isEmpty(jobDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const result = await jobService.deleteJob(jobDto);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        const output = {
            success: true,
        };

        return res.status(200).json(output);
    } catch (error) {
        _logger.error("exception in deleteJob" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const uploadJobImages = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        if (validator.isEmpty(req.files)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const files = req.files;
        let filesToBeUploaded: FileUploadDto[] = [];
        files.forEach((element, i) => {
            let fileObject = new FileUploadDto();
            let extension = element.originalname.substring(
                element.originalname.lastIndexOf(".") + 1
            );
            fileObject.type = extension;
            fileObject.name = element.originalname;
            fileObject.data = readFileSync(element.path);
            fileObject.uploadedAt = Date.now().toString();
            fileObject.id = Date.now().toString() + i;
            fileObject.size = Number((element.size / 1024).toFixed(3));
            fileObject.path = element.path;
            filesToBeUploaded.push(fileObject);
        });

        const result = await jobService.uploadJobImages(filesToBeUploaded);
        files.forEach((element) => {
            unlinkSync(element.path);
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res
            .status(200)
            .json({ success: result.success, data: result.data });
    } catch (error) {
        _logger.error("exception in uploadJobImages" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getLatestJobs = async (req: Request, res: Response) => {
    try {
        const jobFilterDto = new LatestJobFilterDto();
        const jobFilter = plainToClassFromExist(jobFilterDto, req.query, {
            enableImplicitConversion: true,
        });

        const errors = await validate(jobFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new RecentJobResponseModel();
        data.pagination = await jobService.getLatestJobsPaginationInfo(
            jobFilter
        );
        data.items = await jobService.getLatestJobs(jobFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobList" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};
