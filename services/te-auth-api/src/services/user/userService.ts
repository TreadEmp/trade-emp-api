import { Validator } from "class-validator";
const globalAny: any = global;
globalAny.fetch = require("node-fetch");
import {
    UserManagerRepository,
    IFilterOptions,
} from "../../dal/userManagerRepository";
import { UserLoginDTO } from "../../dto/user/userLogin";
import { UserDTO } from "../../dto/user/userDto";
import { EditUserDTO } from "../../dto/user/editUserDto";
import { AbstractService } from "../abstractService";
import { UserSignUpDto } from "../../dto/user/userSignUpDto";
import { SingleUserDto } from "../../dto/user/singleUserDto";
import { AddressDto } from "../../dto/user/addressDto";
import { ContactsDto } from "../../dto/user/contactsDto";
import {
    GET_ERROR_BY_ERROR_CODE,
    IActionResponse,
    AUTH_ERROR_CODES,
} from "../../utils/errorCodes";
import { UserListDto } from "../../dto/user/userListDto";
import UserFilterDto, { SortOrder } from "../../dto/user/userFilterDto";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import UserRolesManagerRepository from "../../dal/userRoleManagerRepository";
import {
    FileUploadResponseDto,
    FileUploadDto,
} from "../../dto/common/fileUploadDto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "./authService";
import { UserLogedinDTO } from "../../dto/user/userLogedinDto";
const cloudinary = require("cloudinary").v2;

const getFilterOptions = (options: UserFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    firstName: options.firstName,
    lastName: options.lastName,
    email: options.email,
    role: options.role,
});

export class UserService extends AbstractService {
    private userRepo: UserManagerRepository;
    private userRoleRepo: UserRolesManagerRepository;
    private validator: Validator;
    private authService: AuthService;
    constructor() {
        super();
        this.validator = new Validator();
        this.userRepo = new UserManagerRepository();
        this.userRoleRepo = new UserRolesManagerRepository();
        this.authService = new AuthService();
    }

    public async userSignUp(user: UserSignUpDto): Promise<IActionResponse> {
        const salt = await bcrypt.genSalt(Number(process.env.SALT_WORK_FACTOR));
        const existingUser = await this.userRepo.getUserByEmailAddress(
            user.email
        );
        if (existingUser) {
            return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1001]);
        }
        const singleUser = new SingleUserDto();
        singleUser.password = bcrypt.hashSync(user.password, salt),
        singleUser.firstName = user.firstName;
        singleUser.lastName = user.lastName;
        singleUser.userId = new Date().getTime().toString();
        singleUser.role = user.role;
        singleUser.email = user.email.toLowerCase();
        singleUser.activated = true;
        singleUser.isAvailable = false;
        singleUser.availability = [];
        singleUser.disabled = 1;
        singleUser.address = new AddressDto();
        singleUser.address.addressName = "";
        singleUser.address.addressLine1 = "";
        singleUser.address.addressLine2 = "";
        singleUser.address.suburb = "";
        singleUser.address.city = "";
        singleUser.address.state = "";
        singleUser.address.postalCode = "";
        singleUser.address.country = "";
        singleUser.address.latitude = "";
        singleUser.address.longitude = "";
        singleUser.contacts = new ContactsDto();
        singleUser.contacts.fax = "";
        singleUser.contacts.telephone = "";
        singleUser.contacts.mobile = "";
        singleUser.experiences = [];
        singleUser.equipments = [];

        const createdUser = await this.userRepo.createUser(singleUser);
        return { success: true, data: { user: createdUser} };
    }

    public async signIn(login: UserLoginDTO): Promise<IActionResponse> {
        const user = await this.userRepo.getUserByEmail(login.email);
        if (user && (await bcrypt.compare(login.password, user.password))) {
            const authTokens = await this.authService.generateTokens(user);
            const returnedData: UserLogedinDTO = {
                userId: user.userId,
                name: user.firstName + " " + user.lastName,
                email: user.email,
                roles: user.role,
                refreshToken: authTokens.data.refreshToken,
                accessToken: authTokens.data.accessToken,
                message: "Logged in sucessfully",
            };
            return { success: true, data: returnedData };
        } else {
            return {
                success: false,
                data: {
                    errorCode: 401,
                    errorMessage: "Invalid Credentials",
                },
            };
        }
    }

    public async getUserInfo(email: string): Promise<IActionResponse> {
        const userData: any = await this.userRepo.getUserByEmailAddress(email);
        if (userData) {
            return { success: true, data: userData };
        } else {
            return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1002]);
        }
    }

    public async getSingleUser(email: string): Promise<IActionResponse> {
        const userData = await this.userRepo.getSingleUser(email);
        if (userData) {
            return { success: true, data: userData };
        } else {
            return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1002]);
        }
    }

    public async getUsersList(options: UserFilterDto): Promise<UserListDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const users = await this.userRepo.getUsersList(filterOptions);

        return users;
    }

    public async getPaginationInfo(
        options: UserFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalUserCount = await this.userRepo.getUserCount(filterOptions);
        paginationInfo.pages = Math.ceil(totalUserCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalUserCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async updateUserInfo(
        singleUserDto: SingleUserDto
    ): Promise<IActionResponse> {
        const user: UserDTO = await this.userRepo.getUserByUserId(
            singleUserDto
        );
        if (!user) {
            return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1007]);
        }
        let editUserDto = new EditUserDTO();
        editUserDto.firstName = singleUserDto.firstName;
        editUserDto.lastName = singleUserDto.lastName;
        editUserDto.disabled = singleUserDto.disabled ? 1 : 0;
        editUserDto.role = singleUserDto.role;
        user.firstName = singleUserDto.firstName;
        user.lastName = singleUserDto.lastName;
        user.role = editUserDto.role;
        user.disabled = editUserDto.disabled;
        const updatedUser: SingleUserDto =
            await this.userRepo.updateUserByUserId(singleUserDto);
        return { success: true, data: updatedUser };
    }

    public async uploadProfileImage(
        files: FileUploadDto[],
        userId: string
    ): Promise<IActionResponse> {
        cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
        });

        let path = "";
        if (process.env.NODE_ENV === "dev") {
            path = `${process.env.TE_DEV_USER_PROFILE_IMAGE_PATH}`;
        } else {
            path = `${process.env.TE_LIVE_USER_PROFILE_IMAGE_PATH}`;
        }
        let response = new FileUploadResponseDto();

        let uploadImage = files.map(
            (element) =>
                new Promise((resolve, reject) => {
                    const options = {
                        use_filename: true,
                        unique_filename: false,
                        overwrite: true,
                    };
                    cloudinary.uploader.upload(
                        element.path,
                        {
                            upload_preset: `${process.env.TE_DEV_USER_PROFILE_IMAGE_UPLOAD_PRESET}`,
                        },
                        (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                response.id = element.id;
                                response.name = element.name;
                                response.type = "." + element.type;
                                response.uploadedAt = element.uploadedAt;
                                response.url = data.secure_url;
                                response.size = element.size;
                                resolve(response);
                            }
                        }
                    );
                })
        );
        return Promise.all([...uploadImage])
            .then(async (results: string[]) => {
                const user = await this.userRepo.updateUserProfilePicture(
                    userId,
                    response
                );
                if (user) {
                    return { success: true, data: user };
                }
                return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1012]);
            })
            .catch((e) => {
                console.error(e);
                return GET_ERROR_BY_ERROR_CODE(AUTH_ERROR_CODES[1007]);
            });
    }
}
