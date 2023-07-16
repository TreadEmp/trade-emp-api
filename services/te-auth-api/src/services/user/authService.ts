import { _logger } from "@tradeemp-api-common/util";
import { AbstractService } from "../abstractService";
import { IActionResponse } from "../../utils/errorCodes";
import jwt from "jsonwebtoken";
import { SingleUserDto } from "../../dto/user/singleUserDto";
import { UserManagerRepository } from "../../dal/userManagerRepository";
import { UserDTO } from "../../dto/user/userDto";

export class AuthService extends AbstractService {
    private userRepo: UserManagerRepository;
    constructor() {
        super();
        this.userRepo = new UserManagerRepository();
    }

    public async validateIdToken(token: string): Promise<IActionResponse> {
        try {
            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_PRIVATE_KEY
            );
            // req.user = decoded;
            return {
                success: true,
                data: decoded,
            };
        } catch (error) {
            _logger.warn(error);
            return {
                success: false,
                data: {
                    errorCode: 401,
                    errorMessage: error.message,
                },
            };
        }
    }

    public async generateTokens(user: UserDTO): Promise<IActionResponse> {
        try {
            const payload = {
                userId: user.userId,
                email: user.email,
                role: user.role,
            };
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_PRIVATE_KEY,
                { expiresIn: "1d" }
            );
            const refreshToken = jwt.sign(
                payload,
                process.env.REFRESH_TOKEN_PRIVATE_KEY,
                { expiresIn: "3d" }
            );

            await this.userRepo.saveRefreshToken(payload.userId, refreshToken);
            return Promise.resolve({
                success: true,
                data: { accessToken, refreshToken },
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }
}
