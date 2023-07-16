import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger, getUserId } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { JobRequestDto } from "../../dto/jobRequests/jobRequestDto";
import JobRequestService from "../../services/jobRequests/jobRequestService";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import JobRequestFilterDto from "../../dto/jobRequests/jobRequestFilterDto";
import {
    AdminJobRequestResponseModel,
    JobRequestResponseModel,
    RecentJobRequestResponseModel,
} from "./apiModels/jobRequestResponseModel";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import { FileUploadDto } from "../../dto/common/fileUploadDto";
import { readFileSync, unlinkSync } from "fs";
import LatestJobRequestFilterDto from "../../dto/jobRequests/latestJobRequestFilterDto";
import { BooleanTypes } from "../../utils/enums";
import AdminJobRequestFilterDto from "../../dto/jobRequests/adminJobRequestFilterDto";
import { LocationDto } from "../../dto/jobRequests/locationDto";

const validator = new Validator();
const jobRequestService = new JobRequestService();

export const createOrUpdateJobRequests = async (
    req: Request,
    res: Response
) => {
    try {
        const employeeId = getUserId(res);
        const jobRequest: JobRequestDto = plainToClass(
            JobRequestDto,
            req.body,
            {
                enableImplicitConversion: false
            }
        );
        jobRequest.employeeId = employeeId;
        jobRequest.employerId = "";
        jobRequest.location = new LocationDto();
        jobRequest.location.type = "Point";
        jobRequest.location.coordinates = [];
        jobRequest.location.coordinates.push(Number(req.body.longitude));
        jobRequest.location.coordinates.push(Number(req.body.latitude));

        let modifiedJobRequest = new JobRequestDto();
        modifiedJobRequest.id = jobRequest.id;
        modifiedJobRequest.employerId = jobRequest.employerId;
        modifiedJobRequest.employeeId = jobRequest.employeeId;
        modifiedJobRequest.isActive = jobRequest.isActive;
        modifiedJobRequest.category = jobRequest.category;
        modifiedJobRequest.title = jobRequest.title;
        modifiedJobRequest.description = jobRequest.description;
        modifiedJobRequest.location = jobRequest.location;
        modifiedJobRequest.images = jobRequest.images;
        modifiedJobRequest.faqs = jobRequest.faqs;
        modifiedJobRequest.prices = jobRequest.prices;

        const errors = await validate(
            modifiedJobRequest,
            VALIDATION_OPTIONS
        );
        if (errors.length > 0) {
            _logger.info(errors);
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult = await jobRequestService.createOrUpdateJobRequests(
            modifiedJobRequest
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
        _logger.error(
            "An Exception occurred in createOrUpdateJobRequests" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobRequestList = async (req: Request, res: Response) => {
    try {
        const jobRequestFilterDto = new JobRequestFilterDto();
        let isActive;
        if (req.query.isActive !== undefined) {
            if (req.query.isActive === BooleanTypes.FALSE) {
                isActive = false;
            }
            if (req.query.isActive === BooleanTypes.TRUE) {
                isActive = true;
            }
        }
        const jobRequestFilter = plainToClassFromExist(
            jobRequestFilterDto,
            req.query,
            {
                enableImplicitConversion: true,
            }
        );
        jobRequestFilter.isActive = isActive;
        const errors = await validate(jobRequestFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new JobRequestResponseModel();
        data.pagination = await jobRequestService.getPaginationInfo(
            jobRequestFilter
        );
        data.items = await jobRequestService.getJobRequestList(
            jobRequestFilter
        );
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobRequestList" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobRequestListForAdmin = async (req: Request, res: Response) => {
    try {
        const jobFilterDto = new AdminJobRequestFilterDto();
        const jobFilter = plainToClassFromExist(jobFilterDto, req.query, {
            enableImplicitConversion: true,
        });

        const errors = await validate(jobFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new AdminJobRequestResponseModel();
        data.pagination = await jobRequestService.getPaginationInfoForAdmin(
            jobFilter
        );
        data.items = await jobRequestService.getJobRequestListForAdmin(jobFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error(
            "An Exception occurred in getJobRequestListForAdmin" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobRequestById = async (req: Request, res: Response) => {
    try {
        const jobRequestDto = new JobRequestDto();
        jobRequestDto.id = req.params.jobRequestId;

        if (validator.isEmpty(jobRequestDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const errors = await validate(jobRequestDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await jobRequestService.getJobRequestById(jobRequestDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error(
            "An exception occurred in getJobRequestByJobRequestId" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getSingleJobRequestByAdmin = async (req: Request, res: Response) => {
    try {
        const jobDto = new JobRequestDto();
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
        const result = await jobRequestService.getSingleJobRequestByAdmin(
            jobDto
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error(
            "An exception occurred in getSingleJobRequestByAdmin" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};


export const deleteJobRequest = async (req: Request, res: Response) => {
    try {
        const jobRequestId = req.query.jobRequestId
            ? String(req.query.jobRequestId)
            : undefined;
        const jobRequestDto = new JobRequestDto();
        jobRequestDto.id = jobRequestId;
        if (validator.isEmpty(jobRequestDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10003]));
        }

        const result = await jobRequestService.deleteJobRequest(jobRequestDto);
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
        _logger.error("exception in deleteJobRequest" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const uploadJobRequestImages = async (
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

        const result = await jobRequestService.uploadJobRequestImages(
            filesToBeUploaded
        );
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

export const getLatestJobRequests = async (req: Request, res: Response) => {
    try {
        const jobRequestFilterDto = new LatestJobRequestFilterDto();
        const jobRequestFilter = plainToClassFromExist(
            jobRequestFilterDto,
            req.query,
            {
                enableImplicitConversion: true,
            }
        );

        const errors = await validate(jobRequestFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new RecentJobRequestResponseModel();
        data.pagination = await jobRequestService.getLatestJobRequestsCount(
            jobRequestFilter
        );
        data.items = await jobRequestService.getLatestJobRequests(
            jobRequestFilter
        );
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobRequestList" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};
