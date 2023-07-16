import { IsString, ValidateNested, IsDefined, IsNotEmpty, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { UserRoleDto } from "./userRoleDto";
import { FileUploadResponseDto } from "../common/fileUploadDto";

export class UserListDto {
    @Expose()
    public userId: string;

    @Expose()
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @IsString()
    public role: string;

    @Expose()
    @IsString()
    public email: string;

    @Expose()
    @IsBoolean()
    public activated: boolean;

    @Expose()
    @IsString()
    public disabled: number;

    @Expose()
    @Type(() => FileUploadResponseDto)
    @ValidateNested()
    public profileImage: FileUploadResponseDto;
}
