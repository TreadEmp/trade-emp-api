import { Request, Response } from "express";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { ERROR_CODES, GET_ERROR_BY_ERROR_CODE } from "../../utils/errorCodes";
import UserService from "../../services/users/userService";

const validator = new Validator();
const userService = new UserService();

export const getUserFullProfile = async (req: Request, res: Response) => {
    try {
        const userRole = req.query.userRole
            ? String(req.query.userRole)
            : undefined;
        const userId = req.query.userId ? String(req.query.userId) : undefined;

        if (validator.isEmpty(userRole)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17002]));
        }

        if (validator.isEmpty(userId)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17003]));
        }

        const result = await userService.getUserFullProfile(userId, userRole);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getUserFullProfile" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getUserForAdminJobFilter = async (req: Request, res: Response) => {
    try {
        const result = await userService.getUserForAdminJobFilter();

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error(
            "An exception occurred in getUserForAdminJobFilter" + error
        );
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};

export const getSingleUserByAdmin = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId
            ? String(req.params.userId)
            : undefined;

        if (validator.isEmpty(userId)) {
            return res
                .status(400)
                .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[17003]));
        }

        const result = await userService.getSingleUserByAdmin(userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data,
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("An exception occurred in getSingleUserByAdmin" + error);
        return res
            .status(500)
            .json(GET_ERROR_BY_ERROR_CODE(ERROR_CODES[18001]));
    }
};
