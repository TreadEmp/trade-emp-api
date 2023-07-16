import { BaseRepository } from "./baseRepository";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { UserSchema } from "./models/user";
import { UserTokenSchema } from "./models/tokens";
import { UserDTO } from "../dto/user/userDto";
import { EditUserDTO } from "../dto/user/editUserDto";
import { SingleUserDto } from "../dto/user/singleUserDto";
import { _clearEmpties } from "../utils/filterValidator";
import { _removeEmpty } from "../utils/filterValidator";
import { UserListDto } from "../dto/user/userListDto";
import { USER_ROLES } from "../constants/constant";
import { UserRoleSchema } from "./models/userRole";
import { UserWithRoleDto } from "../dto/user/userWithRoleDto";
import { UserRoleDto } from "../dto/user/userRoleDto";
import { FileUploadResponseDto } from "../dto/common/fileUploadDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            firstName: filterOptions.firstName
                ? { $regex: filterOptions.firstName, $options: "i" }
                : null,
            lastName: filterOptions.lastName
                ? { $regex: filterOptions.lastName, $options: "i" }
                : null,
            email: filterOptions.email
                ? { $regex: filterOptions.email, $options: "i" }
                : null,
            role: filterOptions.role
                ? { $regex: filterOptions.role, $options: "i" }
                : null,
        })
    );

export class UserManagerRepository extends BaseRepository {
    model: any;
    roleModel: any;
    userTokenModel: any;

    constructor() {
        super();
        this.model = UserSchema;
        this.roleModel = UserRoleSchema;
        this.userTokenModel = UserTokenSchema;
    }

    public async getUserByEmailAddress(
        email: string
    ): Promise<UserWithRoleDto> {
        const user = await this.model.findOne({
            email,
        });
        if (user) {
            // const userRole = await this.roleModel.findOne({ roleName: user.role });
            // if (userRole) {

            // }
            // return null;
            let userWithRoleDto = new UserWithRoleDto();
            userWithRoleDto._id = user._id;
            userWithRoleDto.firstName = user.firstName;
            userWithRoleDto.lastName = user.lastName;
            userWithRoleDto.role = user.role;
            userWithRoleDto.email = user.email;
            userWithRoleDto.activated = user.activated;
            userWithRoleDto.isAvailable = user.isAvailable;
            userWithRoleDto.availability = user.availability;
            userWithRoleDto.disabled = user.disabled;
            userWithRoleDto.address = user.address;
            userWithRoleDto.contacts = user.contacts;
            userWithRoleDto.experiences = user.experiences;
            userWithRoleDto.equipments = user.equipments;
            userWithRoleDto.profileImage = user.profileImage;

            return userWithRoleDto;
        }
        return null;
    }

    public async getSingleUser(email: string): Promise<SingleUserDto> {
        const user = await this.model.findOne({
            email,
        });
        if (user) {
            let singleUserDto = new SingleUserDto();
            singleUserDto = plainToClassFromExist(
                singleUserDto,
                user.toJSON(),
                { excludeExtraneousValues: true }
            );

            return singleUserDto;
        }
        return null;
    }

    public async createUser(user: SingleUserDto): Promise<SingleUserDto> {
        const userDoc = await this.model.findOneAndUpdate(
            { email: user.email },
            { $set: user },
            {
                new: true,
                upsert: true,
            }
        );
        return userDoc;
    }
    public async getUserByEmail(email: string): Promise<UserDTO> {
        const user = await this.model.findOne({ email, activated: true });
        let userDoc = new UserDTO();
        if (user) {
            userDoc = plainToClassFromExist(userDoc, user.toJSON(), {
                excludeExtraneousValues: true,
            });

            return userDoc;
        }
        return null;
    }
    public async getAllUsersByTenantId(tenantId: string): Promise<UserDTO[]> {
        const users = await this.model.find({ tenantId, activated: true });
        if (users) {
            const usersList: UserDTO[] = users.map((user) => {
                let userDoc = new UserDTO();
                userDoc = plainToClassFromExist(userDoc, user.toJSON(), {
                    excludeExtraneousValues: true,
                });
                return userDoc;
            });
            return usersList;
        }
        return [];
    }

    public async getUserByUserId(
        singleUserDto: SingleUserDto
    ): Promise<UserDTO> {
        const user = await this.model.findOne({
            activated: true,
            userId: singleUserDto.email,
        });
        let userDoc = new UserDTO();
        if (user) {
            userDoc = plainToClassFromExist(userDoc, user.toJSON(), {
                excludeExtraneousValues: true,
            });

            return userDoc;
        }
        return null;
    }

    public async updateUserByUserId(
        user: SingleUserDto
    ): Promise<SingleUserDto> {
        const userDoc = await this.model.findOneAndUpdate(
            { userId: user.email },
            { $set: user },
            {
                new: true,
                upsert: true,
            }
        );
        let updatedUser = new SingleUserDto();
        if (userDoc) {
            updatedUser = plainToClassFromExist(updatedUser, userDoc.toJSON(), {
                excludeExtraneousValues: true,
            });

            return updatedUser;
        }
        return null;
    }

    public async getUserCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            role: { $ne: USER_ROLES.SUPER_ADMIN },
            ...constantFilters,
        });
    }

    public async getUsersList(
        filterOptions: IFilterOptions
    ): Promise<UserListDto[]> {
        const constantFilters = getFilters(filterOptions);
        const userList = await this.model
            .find({
                role: { $ne: USER_ROLES.SUPER_ADMIN },
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: UserListDto[] = userList.map((element) => {
            const userDto = plainToClass(UserListDto, element.toJSON(), {
                excludeExtraneousValues: true,
            });
            return userDto;
        });
        return formattedList;
    }

    public async updateUserProfilePicture(
        userId: string,
        userProfileImage: FileUploadResponseDto
    ): Promise<UserDTO> {
        const userDoc = await this.model.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    "profileImage.id": userProfileImage.id,
                    "profileImage.name": userProfileImage.name,
                    "profileImage.type": userProfileImage.type,
                    "profileImage.url": userProfileImage.url,
                    "profileImage.size": userProfileImage.size,
                    "profileImage.uploadedAt": userProfileImage.uploadedAt,
                },
            },
            { new: true, safe: true, upsert: true }
        );
        if (userDoc) {
            return userDoc;
        }
        return null;
    }

    public async saveRefreshToken(userId: string, refreshToken: string) {
        const userDoc = await this.userTokenModel.findOne({ userId: userId });
        if (userDoc)
            await this.userTokenModel.remove({ userId: userDoc.userId });

        let userToken = {
            userId: userId,
            token: refreshToken,
        };
        const data = await this.userTokenModel.findOneAndUpdate(
            { userId },
            { $set: userToken },
            {
                new: true,
                upsert: true,
            }
        );
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}
export interface ISelectFilterOptions {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}
