import { Request, Response } from "express";
import { Validator, validate } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import UserRolesService from "../../services/userRole/userRoleService";
import { UserRoleDto } from "../../dto/userRole/userRoleDto";
import { UserRoleFilterDto } from "../../dto/userRole/userRoleFilterDto";
import { UserRoleResponseModel } from "./apiModels/userRoleResponseModel";
import { RolePermissionDto } from "../../dto/userRole/rolePermissionDto";
import { GET_ERROR_BY_ERROR_CODE, AUTH_ERROR_CODES } from "../../utils/errorCodes";

const validator = new Validator();
const userRolesService = new UserRolesService();

const DEFAULT_VALIDATION_OPTIONS = {
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: true
};


export const createUserRole = async (
    req: Request,
    res: Response
) => {
    try {
        const userRoleDto: UserRoleDto = plainToClass(
            UserRoleDto,
            req.body,
            {
                enableImplicitConversion: false
            }
        );
        const errors = await validate(userRoleDto, DEFAULT_VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }

        const result = await userRolesService.createUserRole(userRoleDto);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }
        // unAuthorize(tenantId);

        const output = {
            success: true,
            data: result.data
        };
        return res.status(200).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred when Creating User Roles." + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

// export const updateRole = async (
//     req: Request,
//     res: Response
// ) => {
//     try {
//         const tenantId = getTenantId(res);
//         const userRoleDto: UserRoleDto = plainToClass(
//             UserRoleDto,
//             req.body,
//             {
//                 enableImplicitConversion: false
//             }
//         );
//         if (validator.isEmpty(userRoleDto.id)) {
//             return res.status(400).json({
//                 success: false,
//                 data: {
//                     errorCode: 400,
//                     errorMessage: "User role id not found"
//                 }
//             });
//         }
//         const errors = await validate(userRoleDto, DEFAULT_VALIDATION_OPTIONS);
//         if (errors.length > 0) {
//             _logger.info(errors);
//             return res.status(400).json({
//                 success: false,
//                 data: {
//                     errorCode: 400,
//                     errorMessage: "Bad Request, Please refer documentation"
//                 }
//             });
//         }

//         const result = await userRolesService.createRole(tenantId, userRoleDto);
//         if (!result.status) {
//             return res.status(400).json({
//                 success: false,
//                 data: result.data
//             });
//         }
//         unAuthorize(tenantId);
//         const output = {
//             success: true,
//             data: result.data
//         };
//         return res.status(200).json(output);
//     } catch (error) {
//         _logger.error(
//             "An Exception occurred when Updating User Roles." + error
//         );
//         return res.status(500).json({
//             success: false,
//             data: {
//                 errorCode: 500,
//                 errorMessage: "Internal Server Error"
//             }
//         });
//     }
// };

export const getUserRoleList = async (req: Request, res: Response) => {
    try {
        let userRoleFilterDto = new UserRoleFilterDto();
        userRoleFilterDto = plainToClassFromExist(userRoleFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const validationOptions = {
            skipMissingProperties: true,
            whitelist: true,
            forbidNonWhitelisted: true
        };

        const errors = await validate(userRoleFilterDto, validationOptions);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }

        const data = new UserRoleResponseModel();
        data.pagination = await userRolesService.getPaginationInfo(userRoleFilterDto);
        data.items = await await userRolesService.getUserRoleList(userRoleFilterDto);
        res.set("X-Total-Count", data.items.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error(
            "Exception occurred when getting User roles" + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

export const getUserRoleByRoleId = async (
    req: Request,
    res: Response
) => {
    try {
        const userRoleDto = new UserRoleDto();
        const roleId = req.params.id;
        userRoleDto.id = roleId;

        const errors = await validate(userRoleDto, DEFAULT_VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }

        const result = await userRolesService.getUserRoleByRoleId(userRoleDto);
        if (validator.isEmpty(result)) {
            return res.status(404).json({ success: true, data: {} });
        }
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        _logger.error(
            "An Exception occurred in getUserRoleByRoleId." + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

export const isUserRoleUnique = async (
    req: Request,
    res: Response
) => {
    try {
        const roleName = req.query.roleName ? String(req.query.roleName) : undefined;
        const userRoleDto = new UserRoleDto();
        if (validator.isEmpty(roleName)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[2004]));
        }
        userRoleDto.roleName = roleName;
        const result = await userRolesService.isUserRoleUnique(userRoleDto);
        return res.status(200).json({ isUnique: result });
    } catch (error) {
        _logger.error("exception in isRoleUnique" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

// export const isRolesDelible = async (req: Request, res: Response) => {
//     try {
//         const tenantId = getTenantId(res);

//         const result = await await userRolesService.isRolesDelible(tenantId);
//         return res.status(200).json({ success: true, data: result });
//     } catch (error) {
//         _logger.error(
//             "Exception occurred in isRolesDelible." + error
//         );
//         return res.status(500).json({
//             success: false,
//             data: {
//                 errorCode: 500,
//                 errorMessage: "Internal Server Error"
//             }
//         });
//     }
// };


export const deleteUserRole = async (
    req: Request,
    res: Response,
) => {
    try {
        const roleId = req.query.roleId ? String(req.query.roleId) : undefined;
        if (roleId === null || roleId === undefined) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }

        const userRoleDto = new UserRoleDto();
        userRoleDto.id = roleId;

        const result = await userRolesService.deleteUserRole(userRoleDto);
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
        _logger.error("exception in delete user role" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

export const addPermissionToRole = async (
    req: Request,
    res: Response
) => {
    try {
        const roleId = req.query.id ? String(req.query.id) : undefined;
        const rolePermissionDto: RolePermissionDto = plainToClass(
            RolePermissionDto,
            req.body,
            {
                enableImplicitConversion: false
            }
        );
        if (validator.isEmpty(roleId)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[2005]));
        }
        const errors = await validate(rolePermissionDto, DEFAULT_VALIDATION_OPTIONS);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }

        const result = await userRolesService.addPermissionToRole(rolePermissionDto,roleId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }
        // unAuthorize(tenantId);

        const output = {
            success: true,
            data: result.data
        };
        return res.status(200).json(output);
    } catch (error) {
        _logger.error(
            "An Exception occurred when Creating User Roles." + error
        );
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};
