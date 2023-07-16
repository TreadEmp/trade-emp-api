import { Request, Response, NextFunction } from "express";
import { validate, Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { VALIDATION_OPTIONS } from "../../shared/constant";
import { AcceptanceByJobRequestResponseModel, BidResponseModel, BidsByJobResponseModel } from "./apiModels/adminResponseModel";
import { BidsDto } from "../../dto/bids/bidsDto";
import { GET_ERROR_BY_ERROR_CODE, ERROR_CODES } from "../../utils/errorCodes";
import BidsService from "../../services/bids/bidsService";
import BidsFilterDto from "../../dto/admin/bidsFilterDto";
import AdminService from "../../services/admin/adminService";
import AcceptanceFilterDto from "../../dto/admin/acceptanceFilterDto";

const validator = new Validator();
const adminService = new AdminService();

export const getAdminDashboardDetails = async (req: Request, res: Response) => {
    try {
        const returnResult = await adminService.getDashboardDetails();
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
        return res.status(200).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred in getAdminDashboardDetails" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getUserBidsByAdmin = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const returnResult = await adminService.getUserBidsByAdmin(userId);
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }
        return res.status(200).json({ success: true, data: returnResult.data });
    } catch (error) {
        _logger.error("An Exception occurred in getUserBidsByAdmin" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getUserJobAcceptanceByAdmin = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.params.userId;
        const returnResult = await adminService.getUserJobAcceptanceByAdmin(
            userId
        );
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }
        return res.status(200).json({ success: true, data: returnResult.data });
    } catch (error) {
        _logger.error(
            "An Exception occurred in getUserJobAcceptanceByAdmin" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getUserJobsByAdmin = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const returnResult = await adminService.getUserJobsByAdmin(userId);
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }
        return res.status(200).json({ success: true, data: returnResult.data });
    } catch (error) {
        _logger.error("An Exception occurred in getUserJobsByAdmin" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getUserJobRequestsByAdmin = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.params.userId;
        const returnResult = await adminService.getUserJobRequestsByAdmin(
            userId
        );
        if (!returnResult.success) {
            return res.status(400).json({
                success: false,
                data: returnResult.data,
            });
        }
        return res.status(200).json({ success: true, data: returnResult.data });
    } catch (error) {
        _logger.error(
            "An Exception occurred in getUserJobRequestsByAdmin" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const adminGetAllBidsByJobId = async (req: Request, res: Response) => {
    try {
        const bidsFilterDto = new BidsFilterDto();
        const jobId = req.params.jobId;
        const bidsFilter = plainToClassFromExist(bidsFilterDto, req.query, {
            enableImplicitConversion: true,
        });
        bidsFilter.jobId = jobId;
        const errors = await validate(bidsFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new BidsByJobResponseModel();
        data.pagination = await adminService.adminGetAllBidsByJobIdPagination(
            bidsFilter
        );
        data.items = await adminService.adminGetAllBidsByJobId(bidsFilter);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error(
            "An Exception occurred in adminGetAllBidsByJobId" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const adminGetAllAcceptanceByJobRequestId = async (
    req: Request,
    res: Response
) => {
    try {
        const bidsFilterDto = new AcceptanceFilterDto();
        const jobRequestId = req.params.jobRequestId;
        const bidsFilter = plainToClassFromExist(bidsFilterDto, req.query, {
            enableImplicitConversion: true,
        });
        bidsFilter.jobRequestId = jobRequestId;
        const errors = await validate(bidsFilter, VALIDATION_OPTIONS);
        if (errors.length > 0) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18002]));
        }
        const data = new AcceptanceByJobRequestResponseModel();
        data.pagination =
            await adminService.adminGetAllAcceptanceByJobRequestIdPagination(
                bidsFilter
            );
        data.items = await adminService.adminGetAllAcceptanceByJobRequestId(
            bidsFilter
        );
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error(
            "An Exception occurred in adminGetAllAcceptanceByJobRequestId " +
                error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

