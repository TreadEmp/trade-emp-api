import { BaseRepository } from "./baseRepository";
import {UserRoleSchema} from "./models/userRole";
import { UserRoleDto } from "../dto/userRole/userRoleDto";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { RolePermissionDto } from "../dto/userRole/rolePermissionDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions => _removeEmpty({
    roleName: filterOptions.roleName ? { $regex: filterOptions.roleName, $options: "i" } : null
});

export default class UserRolesManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = UserRoleSchema;
    }

    public async createUserRole(
        userRolesDto: UserRoleDto
    ) {
        const roleToBeUpdated = await this.model.findOne({
            id: userRolesDto.id,
        });
        if (roleToBeUpdated !== null) {
            const roleUpdated = await this.update(roleToBeUpdated._id, userRolesDto);
            let roleObject = new UserRoleDto();
            roleObject = plainToClassFromExist(roleObject, roleUpdated.toJSON(),
                { excludeExtraneousValues: true });
            return roleObject;
        } else {
            const roleCreated = await this.insert(userRolesDto);
            let roleObject = new UserRoleDto();
            roleObject = plainToClassFromExist(roleObject, roleCreated.toJSON(),
                { excludeExtraneousValues: true });
            return roleObject;
        }

        // if (roleToBeUpdated !== null) {
        //     const result = await this.model.findOneAndUpdate({ _id: userRolesDto._id },
        //         {
        //             $set: {
        //                 'userRoles.$.roleName': userRolesDto.roleName,
        //                 'userRoles.$.permissions': userRolesDto.permissions,
        //             }
        //         },
        //         { 'new': true, 'safe': true, 'upsert': true }
        //     );

        //     const userRoles = result.userRoles;
        //     return userRoles;
        // }
        // else{
        //     const result = await this.model.findOneAndUpdate({ tenantId: tenantId },
        //         {
        //             $push: { userRoles: userRolesDto }
        //         },
        //         { 'new': true, 'safe': true, 'upsert': true }
        //     );
        //     const userRoles = result.userRoles;
        //     return userRoles;
        // }
    }

    public async getUserRolesList(
        options: IFilterOptions
    ): Promise<UserRoleDto[]> {
        const constantFilters = getFilters(options);
        const roles = await this.model
            .find({
                ...constantFilters
            })
            .skip(options.skip)
            .limit(options.limit)
            .sort(options.sortBy);
        const formattedList: UserRoleDto[] = roles.map(
            element => {
                const userRolesDto = plainToClassFromExist(
                    new UserRoleDto(),
                    element.toJSON(),
                    {
                        excludeExtraneousValues: true
                    }
                );
                return userRolesDto;
            }
        );
        return formattedList;
    }

    public async getUserRolesCount(
        filterOptions: IFilterOptions
    ) {
        const constantFilters = getFilters(filterOptions);
        return this.model.count({
            ...constantFilters
        });
    }

    public async getUserRoleByRoleId(role: UserRoleDto)
        : Promise<UserRoleDto> {
        const userRole = await this.model.findOne({
            id: role.id
        })
        if (userRole != null) {
            const formattedRole = plainToClass(UserRoleDto, userRole.toJSON(),
                { excludeExtraneousValues: true });

            return formattedRole;
        }
        return null;
    }

    public async getUserRoleByRoleName(role: UserRoleDto)
        : Promise<UserRoleDto> {
        const userRole = await this.model.findOne({
            roleName: role.roleName
        })
        if (userRole != null) {
            const formattedRole = plainToClass(UserRoleDto, userRole.toJSON(),
                { excludeExtraneousValues: true });

            return formattedRole;
        }
        return null;
    }

    public async isUserRoleUnique(userRoleDto: UserRoleDto): Promise<boolean> {
        const userRole = await this.model.findOne({
            roleName: userRoleDto.roleName
        })
        if (userRole) {
            return false;
        }
        else {
            return true;
        }
    }

    // public async isRolesDelible(tenantId: string): Promise<any> {
    //     const settings = await this.model.findOne({
    //         tenantId,
    //     });
    //     return settings;
    // }

    // public async getAllUsersByTenantId(tenantId: string): Promise<UserDto[]> {
    //     const users = await this.userModel.find({ tenantId, activated: true });
    //     if (users) {
    //         const usersList: UserDto[] = users.map((user) => {
    //             let userDoc = new UserDto()
    //             userDoc = plainToClassFromExist(userDoc, user.toJSON(),
    //                 { excludeExtraneousValues: true });
    //             return userDoc;

    //         })
    //         return usersList;

    //     }
    //     return [];
    // }

    public async deleteUserRole(userRoleDto: UserRoleDto): Promise<any> {
        const roleToBeDeleted = await this.model.findOne({
            id: userRoleDto.id
        });
        if (roleToBeDeleted !== null) {
            await this.model.remove({ _id: roleToBeDeleted._id });
            return true;
        } else {
            return null;
        }
    }

    public async addPermissionToRole(
        rolePermissionDto: RolePermissionDto,
        roleId: string
    ) {
        const role = await this.model.findOneAndUpdate(
            { id: roleId },
            { $push: { permissions: rolePermissionDto } },
            { 'new': true, 'safe': true, 'upsert': true }
        );

        if (role !== null) {
            let roleObject = new UserRoleDto();
            roleObject = plainToClassFromExist(roleObject, role.toJSON(),
                { excludeExtraneousValues: true });
            return roleObject;

        } else {
            return null;
        }
    }

}
export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    roleName: string;
}
export interface ISelectFilterOptions {
    roleName: string;
}