import { IsString, ValidateNested, IsArray, IsBoolean, IsNumber } from "class-validator";
import { Type, Exclude, Expose } from "class-transformer";
import { AddressDto } from "./addressDto";
import { ContactsDto } from "./contactsDto";
import { EquipmentsDto } from "./equipmentsDto";
import { ExperiencesDto } from "./experiencesDto";
import { FileUploadResponseDto } from "../common/fileUploadDto";

export class SingleUserDto {
    @Exclude()
    @IsString()
    public _id: string;

    @Expose()
    @IsString()
    public userId: string;

    @Exclude()
    @IsString()
    public password: string;

    @Expose()
    @IsString()
    public firstName: string;

    @Expose()
    @IsString()
    public lastName: string;

    @Expose()
    @Type(() => FileUploadResponseDto)
    @ValidateNested()
    public profileImage: FileUploadResponseDto;

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
    @IsBoolean()
    public isAvailable: boolean;

    @Expose()
    @IsArray()
    @ValidateNested()
    public availability: string[];

    @Expose()
    @IsArray()
    @ValidateNested()
    public preferredJobCategories: string[];

    @Expose()
    @IsNumber()
    public disabled: number;

    @Expose()
    @Type(() => AddressDto)
    @ValidateNested()
    public address: AddressDto;

    @Expose()
    @Type(() => ContactsDto)
    @ValidateNested()
    public contacts: ContactsDto;

    @Expose()
    @Type(() => ExperiencesDto)
    @ValidateNested()
    public experiences: ExperiencesDto[];

    @Expose()
    @Type(() => EquipmentsDto)
    @IsArray()
    @ValidateNested()
    public equipments: EquipmentsDto[];
}
