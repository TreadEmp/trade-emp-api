import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { ExperienceDto } from "../../../dto/experiences/experienceDto";

export class ExperienceResponseModel {
    public pagination: PaginationInfoDto;
    public items: ExperienceDto[];
}
