import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import {ExperienceSchema} from "./models/experiences";
import { ExperienceDto } from "../dto/experiences/experienceDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
            name: filterOptions.name
                ? { $regex: filterOptions.name, $options: "i" }
                : null,
        })
    );

export default class ExperienceManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = ExperienceSchema;
    }

    public async createOrUpdateExperiences(
        experiencesDto: ExperienceDto
    ): Promise<ExperienceDto> {
        const experience = await this.model.findOneAndUpdate(
            {
                id: experiencesDto.id,
            },
            {
                $set: experiencesDto,
            },
            { new: true, safe: true, upsert: true }
        );

        let experienceDto = new ExperienceDto();
        experienceDto = plainToClassFromExist(
            experienceDto,
            experience.toJSON(),
            { excludeExtraneousValues: true }
        );

        return experienceDto;
    }

    public async getExperienceCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getExperienceList(
        filterOptions: IFilterOptions
    ): Promise<ExperienceDto[]> {
        const constantFilters = getFilters(filterOptions);

        const experienceList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: ExperienceDto[] = experienceList.map((element) => {
            const experiencesDto = plainToClass(
                ExperienceDto,
                element.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return experiencesDto;
        });
        return formattedList;
    }

    public async getExperienceById(
        experiencesDto: ExperienceDto
    ): Promise<ExperienceDto> {
        const experience = await this.model.findOne({
            id: experiencesDto.id,
        });

        if (experience) {
            const singleExperience = plainToClassFromExist(
                new ExperienceDto(),
                experience.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleExperience;
        } else {
            return null;
        }
    }

    public async deleteExperience(experiencesDto: ExperienceDto): Promise<any> {
        const experienceToBeDeleted = await this.model.findOne({
            id: experiencesDto.id,
        });
        if (experienceToBeDeleted !== null) {
            let experience = experienceToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: experience._id });
        } else {
            return null;
        }
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    name: string;
    category: string;
}
export interface ISelectFilterOptions {
    name: string;
    category: string;
}
