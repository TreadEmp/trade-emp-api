import { BaseRepository } from "./baseRepository";
import { UserSchema } from "./userModel";
import { UserRoleSchema } from "./userRole";
export default class RoleManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    userModel: any;

    constructor() {
        super();
        this.model = UserRoleSchema;
        this.userModel = UserSchema;
    }

    public async getUserRole(roleName: string) {
        const userRole = await this.model.findOne({
            roleName,
        });
        if (userRole) {
            return userRole;
        }
        return null;
    }

    public async getUserByEmail(email: string) {
        const user = await this.userModel.findOne({
            email: email,
        });
        if (user) {
            return user;
        }
        return null;
    }
}
export interface IFilterOptions {
    limit: number;
    skip: number;
}
