
import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { UserRoleDto } from "../../../dto/user/userRoleDto";

export class UserRoleResponseModel {
    public pagination: PaginationInfoDto;
    public items: UserRoleDto[];
}
