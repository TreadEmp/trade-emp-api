import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger, getUserId } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import { JobCategoryResponseModel } from "./apiModels/jobCategoryResponseModel";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import JobCategoryService from "../../services/jobCategory/jobCategoryService";
import { JobCategoryDto } from "../../dto/jobCategory/jobCategoryDto";
import JobCategoryFilterDto from "../../dto/jobCategory/jobCategoryFilterDto";
import { FileUploadDto } from "../../dto/common/fileUploadDto";
import { readFileSync, unlinkSync } from "fs";

const validator = new Validator();
const jobCategoryService = new JobCategoryService();

export const createOrUpdateJobCategory = async (
    req: Request,
    res: Response
) => {
    try {
        const jobCategoryDto: JobCategoryDto = plainToClass(
            JobCategoryDto,
            req.body,
            {
                enableImplicitConversion: false,
            }
        );

        const errors = await validate(jobCategoryDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const result = await jobCategoryService.createOrUpdateJobCategory(
            jobCategoryDto
        );
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        const output = {
            success: true,
            data: result.data,
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in createOrUpdateJobCategory" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobCategoryList = async (req: Request, res: Response) => {
    try {
        const jobCategoryFilterDto = new JobCategoryFilterDto();
        const jobCategoryFilter = plainToClassFromExist(
            jobCategoryFilterDto,
            req.query,
            {
                enableImplicitConversion: true,
            }
        );

        const errors = await validate(jobCategoryFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new JobCategoryResponseModel();
        data.pagination = await jobCategoryService.getPaginationInfo(
            jobCategoryFilter
        );
        data.items = await jobCategoryService.getJobCategoryList(
            jobCategoryFilter
        );
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobCategoryList" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getJobCategoryById = async (req: Request, res: Response) => {
    try {
        const jobCategoryDto = new JobCategoryDto();
        jobCategoryDto.id = req.params.jobCategoryId;

        if (validator.isEmpty(jobCategoryDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12001]));
        }

        const errors = await validate(jobCategoryDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await jobCategoryService.getJobCategoryByJobCategoryId(
            jobCategoryDto
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
            "An exception occurred in getJobCategoryByJobCategoryId" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const deleteJobCategory = async (req: Request, res: Response) => {
    try {
        const jobCategoryId = req.query.jobCategoryId
            ? String(req.query.jobCategoryId)
            : undefined;
        const jobCategoryDto = new JobCategoryDto();
        jobCategoryDto.id = jobCategoryId;
        if (validator.isEmpty(jobCategoryDto.id)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[13001]));
        }

        const result = await jobCategoryService.deleteJobCategory(
            jobCategoryDto
        );
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
        _logger.error("exception in deleteJobCategory" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

/* upload job category image */
export const uploadJobCategoryImage = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        if (validator.isEmpty(req.file)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[13004]));
        }

        const file = req.file;
        let filesToBeUploaded: FileUploadDto[] = [];
        let fileObject = new FileUploadDto();
        let extension = file.originalname.substring(
            file.originalname.lastIndexOf(".") + 1
        );
        fileObject.type = extension;
        fileObject.name = file.originalname;
        fileObject.data = readFileSync(file.path);
        fileObject.uploadedAt = Date.now().toString();
        fileObject.id = Date.now().toString();
        fileObject.size = Number((file.size / 1024).toFixed(3));
        fileObject.path = file.path;
        filesToBeUploaded.push(fileObject);

        const result = await jobCategoryService.uploadJobCategoryImage(
            filesToBeUploaded
        );
        unlinkSync(file.path);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("exception in uploadJobCategoryImage" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};
