import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { ToolCategoryDto } from "../../../dto/toolCategory/toolCategoryDto";

export class ToolCategoryResponseModel {
    public pagination: PaginationInfoDto;
    public items: ToolCategoryDto[];
}
