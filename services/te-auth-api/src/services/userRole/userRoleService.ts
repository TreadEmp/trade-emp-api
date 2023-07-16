import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { UserRoleDto } from "../../dto/userRole/userRoleDto";
import UserRolesManagerRepository, { IFilterOptions } from "../../dal/userRoleManagerRepository";
import { UserRoleFilterDto, SortOrder } from "../../dto/userRole/userRoleFilterDto";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import { GET_ERROR_BY_ERROR_CODE, AUTH_ERROR_CODES, IActionResponse } from "../../utils/errorCodes";
import { RolePermissionDto } from "../../dto/userRole/rolePermissionDto";

const getFilterOptions = (options: UserRoleFilterDto) => {
    const filterOptions: IFilterOptions = {
        limit: options.pageSize,
        skip: ((options.page - 1) * options.pageSize),
        sortBy: "-updatedAt",
        roleName: options.roleName,
    };
    return filterOptions;
}

export default class UserRolesService extends AbstractService {
    private userRolesRepo: UserRolesManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.userRolesRepo = new UserRolesManagerRepository();
        this.validator = new Validator();
    }

    public async createUserRole(userRoleDto: UserRoleDto): Promise<IActionResponse> {

        if (userRoleDto.id === undefined) {
            userRoleDto.id = Date.now().toString();
        }
        const result = await this.userRolesRepo.createUserRole(
            userRoleDto
        );
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                AUTH_ERROR_CODES[2001]
            )
            : { success: true, data: result };
    }

    public async getPaginationInfo(
        options: UserRoleFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);
        const totalRolesCount = await this.userRolesRepo.getUserRolesCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalRolesCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalRolesCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getUserRoleList(
        options: UserRoleFilterDto
    ): Promise<UserRoleDto[]> {
        const filterOptions = getFilterOptions(options);
        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }
        const data = await this.userRolesRepo.getUserRolesList(
            filterOptions
        );
        return data;
    }

    public async getUserRoleByRoleId(role: UserRoleDto):
        Promise<UserRoleDto> {
        const data = await this.userRolesRepo.getUserRoleByRoleId(role);
        return data;
    }

    public async isUserRoleUnique(userRoleDto: UserRoleDto) {
        return await this.userRolesRepo.isUserRoleUnique(userRoleDto); 
    }

    // public async isRolesDelible(tenantId: string) {
    //     const settings = await this.userRolesRepo.isRolesDelible(tenantId);

    //     const users = await this.userRolesRepo.getAllUsersByTenantId(tenantId);

    //     let delibleArray: UserRoleDelibleDto[] = [];
    //     settings.userRoles.map(element => {
    //         let object = new UserRoleDelibleDto();
    //         object.roleName = element.roleName;
    //         object.isDelible = true;
    //         if (users.length > 0) {
    //             users.map(user => {
    //                 if (user.role === element.roleName) {
    //                     object.isDelible = false;
    //                 }
    //             })
    //         }

    //         delibleArray.push(object);
    //     });

    //     return delibleArray;
    // }

    public async deleteUserRole(userRoleDto: UserRoleDto): Promise<IActionResponse> {
        const result = await this.userRolesRepo.deleteUserRole(userRoleDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                AUTH_ERROR_CODES[2002]
            )
            : { success: true, data: result };
    }

    public async addPermissionToRole(rolePermissionDto: RolePermissionDto, roleId: string): Promise<IActionResponse> {

        const result = await this.userRolesRepo.addPermissionToRole(
            rolePermissionDto,
            roleId
        );
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                AUTH_ERROR_CODES[2003]
            )
            : { success: true, data: result };
    }

}
