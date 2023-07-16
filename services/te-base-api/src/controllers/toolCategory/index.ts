import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import { ToolCategoryResponseModel } from "./apiModels/toolCategoryResponseModel";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import ToolCategoryService from "../../services/toolCategory/toolCategoryService";
import { ToolCategoryDto } from "../../dto/toolCategory/toolCategoryDto";
import ToolCategoryFilterDto from "../../dto/toolCategory/toolCategoryFilterDto";

const validator = new Validator();
const toolCategoryService = new ToolCategoryService();

export const createOrUpdateToolCategory = async (req: Request, res: Response) => {
    try {
        const toolCategoryDto: ToolCategoryDto = plainToClass(ToolCategoryDto, req.body, {
            enableImplicitConversion: false
        });

        const errors = await validate(toolCategoryDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const result = await toolCategoryService.createOrUpdateToolCategory(toolCategoryDto);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        const output = {
            success: true,
            data: result.data
        };

        if (req.method !== "POST") {
            return res.status(200).json(output);
        }
        return res.status(201).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in createOrUpdateToolCategory" + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getToolCategoryList = async (req: Request, res: Response) => {
    try {
        const toolCategoryFilterDto = new ToolCategoryFilterDto();
        const toolCategoryFilter = plainToClassFromExist(toolCategoryFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(toolCategoryFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new ToolCategoryResponseModel();
        data.pagination = await toolCategoryService.getPaginationInfo(toolCategoryFilter);
        data.items = await toolCategoryService.getToolCategoryList(toolCategoryFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getToolCategoryList" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getToolCategoryById = async (req: Request, res: Response) => {
    try {
        const toolCategoryDto = new ToolCategoryDto();
        toolCategoryDto.id = req.params.toolCategoryId;

        if (validator.isEmpty(toolCategoryDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12001]));
        }

        const errors = await validate(toolCategoryDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await toolCategoryService.getToolCategoryByToolCategoryId(toolCategoryDto);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getToolCategoryByToolCategoryId" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const deleteToolCategory = async (
    req: Request,
    res: Response
) => {
    try {
        const toolCategoryId = req.query.toolCategoryId ? String(req.query.toolCategoryId) : undefined;
        const toolCategoryDto = new ToolCategoryDto();
        toolCategoryDto.id = toolCategoryId;
        if (validator.isEmpty(toolCategoryDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12001]));
        }

        const result = await toolCategoryService.deleteToolCategory(toolCategoryDto);
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
        _logger.error("exception in deleteToolCategory" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};
