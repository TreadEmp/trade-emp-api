
import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { UserListDto } from "../../../dto/user/userListDto";

export class UserResponseModel {
    public pagination: PaginationInfoDto;
    public users: UserListDto[];
}
