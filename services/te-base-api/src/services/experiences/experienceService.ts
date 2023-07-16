import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import ExperienceFilterDto from "../../dto/experiences/experienceFilterDto";
import { ExperienceDto } from "../../dto/experiences/experienceDto";
import { SortOrder } from "../../utils/enums";
import ExperienceManagerRepository, { IFilterOptions } from "../../dal/experienceManagerRepository";

const getFilterOptions = (options: ExperienceFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    name: options.name,
    category: options.category,
})

export default class ExperienceService extends AbstractService {
    private experienceRepo: ExperienceManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.experienceRepo = new ExperienceManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateExperiences(experienceDto: ExperienceDto): Promise<IActionResponse> {
        if (experienceDto.id === undefined) {
            experienceDto.id = Date.now().toString();
        }
        const Experience = await this.experienceRepo.createOrUpdateExperiences(experienceDto);
        return Experience === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10001]) : { success: true, data: Experience };
    }

    public async getPaginationInfo(
        options: ExperienceFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalExperienceCount = await this.experienceRepo.getExperienceCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalExperienceCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalExperienceCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getExperienceList(
        options: ExperienceFilterDto
    ): Promise<ExperienceDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const Experiences = await this.experienceRepo.getExperienceList(
            filterOptions
        );
        return Experiences;
    }

    public async getExperienceById(experienceDto: ExperienceDto): Promise<IActionResponse> {
        const Experience = await this.experienceRepo.getExperienceById(experienceDto);
        return Experience === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[14002]) : { success: true, data: Experience };
    }

    public async deleteExperience(experienceDto: ExperienceDto): Promise<IActionResponse> {
        const result = await this.experienceRepo.deleteExperience(experienceDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                ERROR_CODES[14002]
            )
            : { success: true, data: result };
    }
}
