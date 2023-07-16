import { Request, Response } from "express";
import { validate, Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import { ExperienceResponseModel } from "./apiModels/experienceResponseModel";
import { ExperienceDto } from "../../dto/experiences/experienceDto";
import { GET_ERROR_BY_ERROR_CODE, ERROR_CODES } from "../../utils/errorCodes";
import ExperienceService from "../../services/experiences/experienceService";
import ExperienceFilterDto from "../../dto/experiences/experienceFilterDto";

const validator = new Validator();
const experiencesService = new ExperienceService();


export const createOrUpdateExperiences = async (req: Request, res: Response) => {
    try {
        const experienceDto: ExperienceDto = plainToClass(ExperienceDto, req.body, {
            enableImplicitConversion: false
        });
        if (experienceDto.id === null || experienceDto.id === undefined) {
            experienceDto.id = Date.now().toString();
        }
        const errors = await validate(experienceDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult = await experiencesService.createOrUpdateExperiences(experienceDto);
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data
            });
        }

        const output = {
            success: true,
            data: returnResult.data
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in createOrUpdateExperiences" + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getExperienceList = async (req: Request, res: Response) => {
    try {
        const experienceFilterDto = new ExperienceFilterDto();
        const experienceFilter = plainToClassFromExist(experienceFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(experienceFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new ExperienceResponseModel();
        data.pagination = await experiencesService.getPaginationInfo(experienceFilter);
        data.items = await experiencesService.getExperienceList(experienceFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getExperienceList" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getExperienceById = async (req: Request, res: Response) => {
    try {
        const experienceDto = new ExperienceDto();
        experienceDto.id = req.params.experienceId;

        if (validator.isEmpty(experienceDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[14001]));
        }

        const errors = await validate(experienceDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await experiencesService.getExperienceById(experienceDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getJobByJobId" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const deleteExperience = async (
    req: Request,
    res: Response
) => {
    try {
        const experienceId = req.query.experienceId ? String(req.query.experienceId) : undefined;
        const experienceDto = new ExperienceDto();
        experienceDto.id = experienceId;
        if (validator.isEmpty(experienceDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[14001]));
        }

        const result = await experiencesService.deleteExperience(experienceDto);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        const output = {
            success: true
        };

        return res.status(200).json(output);

    } catch (error) {
        console.log(error);
        _logger.error("exception in deleteJob" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};