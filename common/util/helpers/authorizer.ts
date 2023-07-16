import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { _logger } from "..";
import { AuthService } from "./service/authPermissionsService";
import jwt from "jsonwebtoken";
import { decode } from "querystring";

const authService = new AuthService();
export const _authorize = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.header("access-token") == undefined) {
            logger.warn("Unauthorized user");
            return res.status(401).json({
                success: false,
                data: { errorCode: 400, errorMessage: "Unauthorized user" },
            });
        } else {
            const token = req.header("access-token");
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.ACCESS_TOKEN_PRIVATE_KEY
                );
                const currentUser = await authService.getUserByEmail(
                    decoded.email
                );
                const userType = currentUser.role;
                const userId = currentUser.userId;
                let disableState = currentUser.disabled;
                let auth = false;
                if (
                    !(
                        userType === "Super Admin" ||
                        userType === "Employer" ||
                        userType === "Employee"
                    )
                ) {
                    auth = await authService.isAuthorized(
                        req.method,
                        req.path,
                        userType
                    );
                } else {
                    auth = true;
                }
                if (disableState === 1) {
                    auth = false;
                }
                res.set("TE-User-Role", userType);
                res.set("TE-User-ID", userId);
                res.set("TE-User-Email", decoded.email);
                if (auth) {
                    next();
                } else {
                    return res.status(401).json({
                        success: false,
                        data: {
                            errorCode: 401,
                            errorMessage: "Unauthorized api path",
                        },
                    });
                }
            } catch (error) {
                logger.warn(error);
                return res.status(401).json({
                    success: false,
                    data: {
                        errorCode: 401,
                        errorMessage: error.message,
                    },
                });
            }
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            data: {
                errorCode: 401,
                errorMessage: error.message,
            },
        });
    }
};
export const _unAuthorize = () => {
    try {
        return authService.unAuthorize();
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const _getRole = (res: Response) => {
    return String(res.getHeader("TE-User-Role"));
};

export const _getUserId = (res: Response) => {
    return String(res.getHeader("TE-User-ID"));
};

export const _getUserEmail = (res: Response) => {
    return String(res.getHeader("TE-User-Email"));
};
