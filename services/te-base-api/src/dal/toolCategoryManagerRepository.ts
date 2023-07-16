import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import { ToolCategoryDto } from "../dto/toolCategory/toolCategoryDto";
import { ToolCategorySchema } from "./models/toolCategory";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions =>
    _clearEmpties(
        _removeEmpty({
            category: filterOptions.category
                ? { $regex: filterOptions.category, $options: "i" }
                : null,
        })
    );

export default class ToolCategoryManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = ToolCategorySchema;
    }

    public async createOrUpdateToolCategory(
        toolCategoryDto: ToolCategoryDto
    ): Promise<ToolCategoryDto> {
        const toolCategory = await this.model.findOneAndUpdate(
            {
                id: toolCategoryDto.id,
            },
            {
                $set: toolCategoryDto,
            },
            { new: true, safe: true, upsert: true }
        );

        let toolCategoryObj = new ToolCategoryDto();
        toolCategoryObj = plainToClassFromExist(
            toolCategoryObj,
            toolCategory.toJSON(),
            { excludeExtraneousValues: true }
        );

        return toolCategoryObj;
    }

    public async getToolCategoryCount(filterOptions: IFilterOptions) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters,
        });
    }

    public async getToolCategoryList(
        filterOptions: IFilterOptions
    ): Promise<ToolCategoryDto[]> {
        const constantFilters = getFilters(filterOptions);

        const toolCategoryList = await this.model
            .find({
                ...constantFilters,
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: ToolCategoryDto[] = toolCategoryList.map(
            (element) => {
                const toolCategoryDto = plainToClass(
                    ToolCategoryDto,
                    element.toJSON(),
                    {
                        excludeExtraneousValues: true,
                    }
                );
                return toolCategoryDto;
            }
        );
        return formattedList;
    }

    public async getToolCategoryById(
        toolCategoryDto: ToolCategoryDto
    ): Promise<ToolCategoryDto> {
        const toolCategory = await this.model.findOne({
            id: toolCategoryDto.id,
        });

        if (toolCategory) {
            const singleToolCategory = plainToClassFromExist(
                new ToolCategoryDto(),
                toolCategory.toJSON(),
                {
                    excludeExtraneousValues: true,
                }
            );
            return singleToolCategory;
        } else {
            return null;
        }
    }

    public async deleteToolCategory(
        toolCategoryDto: ToolCategoryDto
    ): Promise<any> {
        const toolCategoryToBeDeleted = await this.model.findOne({
            id: toolCategoryDto.id,
        });
        if (toolCategoryToBeDeleted !== null) {
            let toolCategory = toolCategoryToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: toolCategory._id });
        } else {
            return null;
        }
    }
}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    category: string;
}
export interface ISelectFilterOptions {
    category: string;
}
