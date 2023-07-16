import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user/userService";
import { UserLoginDTO } from "../../dto/user/userLogin";
import { EditUserDTO } from "../../dto/user/editUserDto";
import { validate, Validator } from "class-validator";
import { _logger, getUserId } from "@tradeemp-api-common/util";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { UserSignUpDto } from "../../dto/tenant/tenantDto";
import { UserResponseModel } from "./apiModels/userResponseModel";
import UserFilterDto from "../../dto/user/userFilterDto";
import { AuthService } from "../../services/user/authService";
import { GET_ERROR_BY_ERROR_CODE, AUTH_ERROR_CODES } from "../../utils/errorCodes";
import { FileUploadDto } from "../../dto/common/fileUploadDto";
import { readFileSync, unlinkSync } from "fs";
import { SingleUserDto } from "../../dto/user/singleUserDto";

const validator = new Validator();
const userService = new UserService();
const authValidatorService = new AuthService();
const validationOptions = {
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: true
};

/* sign up user */
export const signUp = async (req: Request, res: Response) => {
    try {
        const validationOptions = {
            skipMissingProperties: true,
            whitelist: true,
            forbidNonWhitelisted: true
        };

        const userSignUpDto: UserSignUpDto = plainToClass(UserSignUpDto, req.body, {
            enableImplicitConversion: false,
            groups: ["signUp"]
        });
        const errors = await validate(userSignUpDto, validationOptions);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }
        const result = await userService.userSignUp(userSignUpDto)

        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({ success: false, data: result.data });
    } catch (error) {
        console.log(error);
        _logger.error("exception in sign up" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* sign in user */
export const signIn = async (req: Request, res: Response) => {
    try {


        const signInDto: UserLoginDTO = plainToClass(UserLoginDTO, req.body, {
            enableImplicitConversion: true
        });
        const errors = await validate(signInDto, validationOptions);
        if (errors.length > 0) {
            _logger.info(errors);
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }
        const result = await userService.signIn(signInDto)

        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({ success: false, data: result.data });
    } catch (error) {
        _logger.error("exception in sign up" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* get users profile */
export const profile = async (req: Request, res: Response) => {
    try {
        const email = req.query.email ? String(req.query.email) : undefined;
        if (validator.isEmpty(email)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1012]));
        }
        const result = await userService.getUserInfo(email)
        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({
            success: false,
            data: result.data
        });
    } catch (error) {
        _logger.error("exception in profile" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* get single user */
export const getSingleUser = async (req: Request, res: Response) => {
    try {
        const email = req.query.email ? String(req.query.email) : undefined;
        if (validator.isEmpty(email)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1012]));
        }
        const result = await userService.getSingleUser(email)
        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({
            success: false,
            data: result.data
        });
    } catch (error) {
        _logger.error("exception in profile" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* get users list */
export const getUsersList = async (req: Request, res: Response) => {
    try {
        const userFilterDto = new UserFilterDto();
        const userFilter = plainToClassFromExist(userFilterDto, req.query, {
            enableImplicitConversion: true
        });

        const errors = await validate(userFilter, validationOptions);
        if (errors.length > 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        }
        const data = new UserResponseModel();
        data.pagination = await userService.getPaginationInfo(userFilter);
        data.users = await userService.getUsersList(userFilter);
        res.set("X-Total-Count", data.users.length.toString());
        return res.status(200).json({ success: true, data });
    } catch (error) {
        _logger.error("Exception occurred in getUsersList." + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* edit users name,role,  */
export const editUserDetails = async (req: Request, res: Response) => {
    try {

        const singleUserDto: SingleUserDto = plainToClass(SingleUserDto, req.body, {
            enableImplicitConversion: true
        });
        // const errors = await validate(singleUserDto, validationOptions);
        // if (errors.length > 0) {
        //     return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18002]));
        // }
        const result = await userService.updateUserInfo(singleUserDto);
        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({
            success: false,
            data: result.data
        });
    } catch (error) {
        _logger.error("exception in editing user" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* get users by token */
export const validateIdToken = async (req: Request, res: Response) => {
    try {
        if (req.header("access-token") == undefined) {
            _logger.warn("Unauthorized user");
            return res
                .status(401)
                .json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1009]));
        }
        const token = req.header("access-token");
        const result = await authValidatorService.validateIdToken(token)
        if (result.success) {
            return res.status(200).json({ success: true, data: result.data });
        }
        return res.status(400).json({
            success: false,
            data: result.data
        });
    } catch (error) {
        _logger.error("exception in profile" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};

/* upload user profile */
export const uploadProfileImage = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = getUserId(res);
        if (req.files.length <= 0) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1011]));
        }
        if (validator.isEmpty(userId)) {
            return res.status(400).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1010]));
        }

        const files = req.files;
        let filesToBeUploaded: FileUploadDto[] = [];
        files.forEach((element, i) => {
            if (i === 0) {
                let fileObject = new FileUploadDto();
                let extension = element.originalname.substring(element.originalname.lastIndexOf('.') + 1);
                fileObject.type = extension;
                fileObject.name = element.originalname;
                fileObject.data = readFileSync(element.path);
                fileObject.uploadedAt = Date.now().toString();
                fileObject.id = Date.now().toString() + i;
                fileObject.size = Number(((element.size) / (1024)).toFixed(3));
                fileObject.path = element.path;
                filesToBeUploaded.push(fileObject);
            }
        });

        const result = await userService.uploadProfileImage(filesToBeUploaded, userId);
        files.forEach(element => {
            unlinkSync(element.path);
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                data: result.data
            });
        }

        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        _logger.error("exception in Upload Profile Image" + error);
        return res.status(500).json(GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[18001]));
    }
};




