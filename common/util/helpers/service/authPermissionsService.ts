// import cache from '../cache'
import { _logger } from "../..";
import { connectToDb } from "./../connectionHandler";
import RoleManagerRepository from "../dal/roleManagerRepository";
const DEFAULT_AUTHORIZED_PATHS: object[] = [
    {
        label: "Get user profile",
        path: "/auth/user",
        method: "GET",
        allow: true,
    },
];

export class AuthService {
    private userRoleRepo: RoleManagerRepository;
    constructor() {
        this.userRoleRepo = new RoleManagerRepository();
    }

    public async isAuthorized(
        method: string,
        path: string,
        role: string
    ): Promise<any> {
        try {
            // here need to get the user role from cache
            await connectToDb();
            let userRole = await this.userRoleRepo.getUserRole(role);
            userRole = JSON.parse(userRole);
            if (userRole) {
                let rolePerm = userRole.find((rl) => {
                    return rl.roleName === role;
                });
                let rolePermissions = rolePerm.permissions;
                let allowedPaths: object[] = [];
                allowedPaths.push(
                    ...DEFAULT_AUTHORIZED_PATHS,
                    ...rolePermissions
                );
                let authorizedPaths = allowedPaths.find((url: any) => {
                    if (
                        url.method === method &&
                        path.includes(url.path) &&
                        url.allow
                    ) {
                        return true;
                    }
                    return false;
                });

                if (authorizedPaths) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    public async unAuthorize(): Promise<any> {
        try {
            return true;
        } catch (error) {
            return false;
        }
    }

    public async getUserByEmail(email: string): Promise<any> {
        try {
            await connectToDb();
            return await this.userRoleRepo.getUserByEmail(email);
        } catch (error) {
            return false; 
        }
    }
}
