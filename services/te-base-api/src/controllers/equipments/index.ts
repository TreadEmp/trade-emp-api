import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import JobFilterDto from "../../dto/jobs/jobFilterDto";
import { EquipmentResponseModel } from "./apiModels/equipmentResponseModel";
import { EquipmentsDto } from "../../dto/equipments/equipmentsDto";
import { GET_ERROR_BY_ERROR_CODE, ERROR_CODES } from "../../utils/errorCodes";
import EquipmentsService from "../../services/equipments/equipmentsService";
import EquipmentsFilterDto from "../../dto/equipments/equipmentsFilterDto";

const validator = new Validator();
const equipmentsService = new EquipmentsService();


export const createOrUpdateEquipments = async (req: Request, res: Response) => {
    try {
        const equipmentsDto: EquipmentsDto = plainToClass(EquipmentsDto, req.body, {
            enableImplicitConversion: false
        });
        if (equipmentsDto.id === null || equipmentsDto.id === undefined) {
            equipmentsDto.id = Date.now().toString();
        }
        const errors = await validate(equipmentsDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }

        const returnResult = await equipmentsService.createOrUpdateEquipments(equipmentsDto);
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
            "An Exception occurred in createOrUpdateEquipments" + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getEquipmentList = async (req: Request, res: Response) => {
    try {
        const equipmentFilterDto = new EquipmentsFilterDto();
        const equipmentFilter = plainToClassFromExist(equipmentFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(equipmentFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new EquipmentResponseModel();
        data.pagination = await equipmentsService.getPaginationInfo(equipmentFilter);
        data.items = await equipmentsService.getEquipmentList(equipmentFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("An Exception occurred in getJobList" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getEquipmentById = async (req: Request, res: Response) => {
    try {
        const equipmentsDto = new EquipmentsDto();
        equipmentsDto.id = req.params.equipmentId;

        if (validator.isEmpty(equipmentsDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[11001]));
        }

        const errors = await validate(equipmentsDto, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const result = await equipmentsService.getEquipmentById(equipmentsDto);

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

export const deleteEquipment = async (
    req: Request,
    res: Response
) => {
    try {
        const equipmentId = req.query.equipmentId ? String(req.query.equipmentId) : undefined;
        const equipmentsDto = new EquipmentsDto();
        equipmentsDto.id = equipmentId;
        if (validator.isEmpty(equipmentsDto.id)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[11001]));
        }

        const result = await equipmentsService.deleteEquipment(equipmentsDto);
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