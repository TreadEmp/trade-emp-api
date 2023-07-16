import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import ToolCategoryManagerRepository, { IFilterOptions } from "../../dal/toolCategoryManagerRepository";
import { ToolCategoryDto } from "../../dto/toolCategory/toolCategoryDto";
import ToolCategoryFilterDto from "../../dto/toolCategory/toolCategoryFilterDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import { SortOrder } from "../../utils/enums";

const getFilterOptions = (options: ToolCategoryFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    category: options.category
})

export default class ToolCategoryService extends AbstractService {
    private toolCategoryRepo: ToolCategoryManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.toolCategoryRepo = new ToolCategoryManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateToolCategory(toolCategoryDto: ToolCategoryDto): Promise<IActionResponse> {
        if (toolCategoryDto.id === undefined) {
            toolCategoryDto.id = Date.now().toString();
        }
        const toolCategory = await this.toolCategoryRepo.createOrUpdateToolCategory(toolCategoryDto);
        return toolCategory === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12003]) : { success: true, data: toolCategory };
    }

    public async getPaginationInfo(
        options: ToolCategoryFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalToolCategoryCount = await this.toolCategoryRepo.getToolCategoryCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalToolCategoryCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalToolCategoryCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getToolCategoryList(
        options: ToolCategoryFilterDto
    ): Promise<ToolCategoryDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const toolCategory = await this.toolCategoryRepo.getToolCategoryList(
            filterOptions
        );
        return toolCategory;
    }

    public async getToolCategoryByToolCategoryId(toolCategoryDto: ToolCategoryDto): Promise<IActionResponse> {
        const toolCategory = await this.toolCategoryRepo.getToolCategoryById(toolCategoryDto);
        return toolCategory === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[12002]) : { success: true, data: toolCategory };
    }

    public async deleteToolCategory(toolCategoryDto: ToolCategoryDto): Promise<IActionResponse> {
        const result = await this.toolCategoryRepo.deleteToolCategory(toolCategoryDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                ERROR_CODES[12002]
            )
            : { success: true, data: result };
    }
}
